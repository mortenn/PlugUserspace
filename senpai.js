(function() {
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};

	// Client running old senpai, abort.
	if("senpai" in window && "initialized" in window.senpai)
	{
		API.chatLog('Make sure you are not running additional versions of SenpaiScript! The current version can be found here http://AnimeMusic.me/SenpaiScript');
		return;
	}

	var senpai = {
		messages: {
			unknown: {
				brief: function(){ return _('Unknown song or alternate version.'); },
				title: function(){ return _('Unknown Song/Alternate Version'); },
				full: function()
				{
					return _('Your next song is not in our systems, please ensure it follows all rules and is not overplayed.<br>'+
						'Other videos of the same song might be banned.<br>'+
						'<a target="_new" href="http://s.AnimeMusic.me/plug-guide">Please refer to our room guide.</a>');
				},
				kouhai: function(){ return false },
				kouhaiPlay: false,
				type: 'manual-only',
				popup: false,
				category: 'information',
				skip: false,
				play: false
			},
			banned: {
				brief: function(r){ return _('Banned')+': '+_(r.r); },
				title: function(){ return _('Banned'); },
				full: function(r)
				{
					return _('Your next song is banned!<br>'+
						'The reason given was:<br><br>'+
						'&nbsp;&nbsp;&nbsp;&nbsp;{reason}<br><br>'+
						'Please choose a different song,'+
						'<br>or you will get skipped.')
						.replace('{reason}',_(r.r));
				},
				kouhai: function(r){ return _('This song has been banned for "{reason}"!').replace('{reason}', _(r.r)); },
				kouhaiPlay: 'Master',
				type: 'always',
				popup: true,
				category: 'error',
				skip: true,
				play: 'Ongaku asobi janai!'//Hidoi'
			},
			unavailable: {
				brief: function(r){ return _('Unavailable')+': '+_(r.r); },
				title: function(){ return _('Unavailable'); },
				full: function(r)
				{
					return _('Your next song is unavailable!<br>'+
						'The reason given was:<br><br>'+
						'&nbsp;&nbsp;&nbsp;&nbsp;{reason}<br><br>'+
						'Please choose a different song,'+
						'<br>or you will get skipped.')
						.replace('{reason}',_(r.r));
				},
				kouhai: function(r){ return _('This song is unavailable due to "{reason}"!').replace('{reason}',_(r.r)); },
				kouhaiPlay: 'Master',
				type: 'always',
				popup: true,
				category: 'error',
				skip: true,
				play: 'Ongaku asobi janai!'//Hidoi'
			},
			toosoon: {
				brief: function(){ return _('Already played in your last 6 turns.'); },
				title: function(){ return _('Replay'); },
				full: function(){ return _('You have played that song within your past 6 dj turns, please choose a different song.'); },
				kouhai: function(r)
				{
					return _('Out of the last 6 turns, {username} played "{title}" {number} of them.')
						.replace('{username}',API.getDJ().username)
						.replace('{title}',API.getMedia().title)
						.replace('{number}',r.rp);
				},
				kouhaiPlay: 'Master',
				type: 'always',
				popup: true,
				category: 'error',
				skip: true,
				play: 'Ongaku asobi janai!'//Hidoi'
			},
			overplayedgrace: {
				brief: function(){ return _('Overplayed')+'.'; },
				title: function(){ return _('Overplayed'); },
				full: function(){ return _('Your next song is overplayed, please choose a different song.'); },
				kouhai: function(){ return false; },
				kouhaiPlay: false,
				type: 'always',
				popup: true,
				category: 'error',
				skip: true,
				play: 'Ongaku asobi janai!'
			},
			overplayed: {
				brief: function(){ return _('Overplayed')+'.'; },
				title: function(){ return _('Overplayed'); },
				full: function(){ return _('Your next song is overplayed, please choose a different song.'); },
				kouhai: function(){ return _('This song is overplayed -_-;'); },
				kouhaiPlay: false,
				type: 'always',
				popup: true,
				category: 'error',
				skip: true,
				play: 'Ongaku asobi janai!'
			},
			today: {
				brief: function(){ return _('Played today.'); },
				title: function(){ return _('Replay'); },
				full: function(){ return _('Your next song has already been played in the last 24 hours, please choose a different song.'); },
				kouhai: function(){ return false; },
				kouhaiPlay: 'Master',
				type: 'always',
				popup: true,
				category: 'error',
				skip: true,
				play: 'Ongaku asobi janai!'//Hidoi'
			},
			week: {
				brief: function(){ return _('Played this week.'); },
				title: function(){ return _('Replay'); },
				full: function(){ return _('Your next song has already been played this week, please choose a different song.'); },
				kouhai: function(){ return false; },
				kouhaiPlay: false,
				type: 'always',
				popup: true,
				category: 'warning',
				skip: false,
				play: 'Ongaku asobi janai!'
			},
			ok: {
				brief: function(){ return _('Seems OK, but check rules.'); },
				title: function(){ return _('Looks good'); },
				full: function(r)
				{
					return _('This version of your song is not marked as banned or overplayed, but please double check it.<br>'+
						'Other videos of the same song might be banned.<br>'+
						'<a target="_new" href="http://s.AnimeMusic.me/plug-guide">Please refer to our room guide.</a>'+
						'<br>Last played: {timestamp}').replace('{timestamp}',r.w);
				},
				kouhai: function(){ return false; },
				kouhaiPlay: false,
				type: 'manual-only',
				popup: false,
				category: 'information',
				skip: false
			},
			error: {
				brief: function(){ return _('Error! Notify Uricorn.'); },
				title: function(){ return _('Oops!'); },
				full: function(r){ return _('Error: Please send this to Uricorn: {id}').replace('{id}',r.id); },
				kouhai: function(r){ return _('Error: Please send this to Uricorn: {id}').replace('{id}',r.id); },
				kouhaiPlay: false,
				type: 'always',
				popup: false,
				category: 'error',
				skip: false
			}
		},
		countryList: {
			US: 10,

			BR: 7, CA: 7, FR: 7, GB: 7,

			AU: 3, CZ: 3, LT: 3,

			ES: 2, MY: 2, NO: 2, RU: 2, SE: 2, SG: 2, TH: 2,

			AE: 1, AR: 1, BE: 1, BG: 1, CH: 1, CL: 1, DK: 1, EE: 1, FI: 1, GR: 1, HK: 1,
			HR: 1, HU: 1, ID: 1, IE: 1, IN: 1, IS: 1, IT: 1, LV: 1, MX: 1, NL: 1, NZ: 1,
			PE: 1, PH: 1, PL: 1, PT: 1, RO: 1, RS: 1, SK: 1, SK: 1, TR: 1, TW: 1, UA: 1,
			VN: 1,

			DE: 0, JP: 0 // Sorry..
		},
		setup: function()
		{
			if(!senpai.enabled()) return;
			API.on(API.CHAT_COMMAND, function(e){ window.senpai.onChatCommand(e); });
			API.on(API.ADVANCE, function(e){ window.senpai.advance(e); });
			$('#room').delegate('#dj-button.is-wait', 'click', function() { window.senpai.onJoinWaitlist(); });
			$('#playlist-button').on('click', function() { window.senpai.onPlaylistChanged(); });
			$('#playlist-meta .bar-button').on('click', function(){ window.senpai.onPlaylistChanged(); });
			$('#playlist-menu .row').on('click', function(){ window.senpai.onPlaylistChanged(); });
			$('#playlist-menu .activate-button').on('click', function(){ window.senpai.onPlaylistActivate(); });
			$('#playlist-activate-button').on('click', function(){ window.senpai.onPlaylistActivate(); });
		},
		startup: function()
		{
			window.freshy.systemLoaded('senpai');
		},
		onChatCommand: function(value) {
			if(!window.senpai.enabled()) return;
			if (value != "/check")
				return;
			window.senpai.manualCheck();
		},
		onJoinWaitlist: function()
		{
			if(!window.senpai.enabled()) return;
			window.senpai.manualCheck();
		},
		onPlaylistChanged: function()
		{
			if(!window.senpai.enabled()) return;
			window.senpai.waitForPlaylistChange(function() {
				 window.senpai.manageCheckButton();
			});
		},
		onPlaylistActivate: function()
		{
			if(!window.senpai.enabled()) return;
			window.senpai.waitForPlaylistChange(function() {
				window.senpai.manageCheckButton();
				window.senpai.manualCheck();
			});
		},
		manageCheckButton: function()
		{
			if(!window.senpai.enabled()) return;
			var button = $('#playlist-check-button');
			if (button.length)
				button.remove();

			if(window.senpai.getActivePlaylist() == window.senpai.getCurrentPlaylist())
			{
				button = $('<div id="playlist-check-button" class="button" style="right:350px;"><span>'+_('Check')+'</span></div>');
				$('#playlist-edit-button').before(button);
				button.click(function() { window.senpai.manualCheck(); });
				window.senpai.startTagPlaylist();
			}
			else
				window.senpai.stopTagPlaylist();

			window.senpai.tagNextMedia();
		},
		manualCheck: function() {
			if(!window.senpai.enabled()) return;
			var nextSong = API.getNextMedia();
			songID = nextSong.media.cid;
			window.senpai.pos = undefined;
			window.senpai.startCheck(nextSong.media);
		},
		startCheck: function(media) {
			if(!window.senpai.enabled()) return;
			if(media.format == 1)
				$.getJSON(
					'https://gdata.youtube.com/feeds/api/videos/'+media.cid+'?v=2&alt=jsonc',
					function(response)
					{
						if("restrictions" in response.data)
						{
							var score = 0;
							var allowed = 0;
							var blocked = 0;
							for(var i = 0; i < response.data.restrictions.length; ++i)
							{
								if(response.data.restrictions[i].type == 'country')
								{
									var list = response.data.restrictions[i].countries.split(' ');
									if(response.data.restrictions[i].relationship == 'allow')
									{
										allowed += list.length;
										/*if(list.length < 20)
											window.chatalert.show('icon-volume-on', 'Country restrictions!', 'This video is only allowed in ' + list.length + ' countries!', 'c42e3b', 'senpai');
										else
											window.chatalert.show('icon-volume-on', 'Country restrictions!', 'This video is only allowed in these countries: ' + response.data.restrictions[i].countries, 'c42e3b', 'senpai');*/
									}
									if(response.data.restrictions[i].relationship == 'deny')
									{
										blocked += list.length;
										for(var c = 0; c < list.length; ++c)
											if(list[c] in window.senpai.countryList)
												score += window.senpai.countryList[list[c]];
										/*if(list.length > 5)
											window.chatalert.show('icon-volume-on', 'Country restrictions!', 'This video is blocked in ' + list.length + ' countries!', 'c42e3b', 'senpai');
										else
											window.chatalert.show('icon-volume-on', 'Country restrictions!', 'This video is blocked in these countries: ' + response.data.restrictions[i].countries, 'c42e3b', 'senpai');*/
									}
								}
							}
							if(score > 16 || (blocked == 0 && allowed < 20))
							{
								window.senpai.checkResult({id:media.cid, b:0, u:1, r: _('Blocked in too many countries!'), w: ''}, media);
								return;
							}
						}
						window.senpai.continueCheck(media);
					}
				).fail(function(e){ window.senpai.checkResult({id:media.cid, b:0, u:1, r: e.responseJSON.error.message}); }, media);
			else if(media.format == 2)
				SC.get('/tracks/'+media.cid+'.json', function(response)
				{
					if("errors" in response)
						window.senpai.checkResult({id:media.cid, b:0, u:1, r:response.errors[0].error_message, w:''}, media);
					else
						window.senpai.continueCheck(media);
				});
			else
				console.log(media);
		},
		continueCheck: function(media)
		{
			if(window.senpai.triggerCooldown())
				$.getJSON(
					'https://i.animemusic.me/animemusic/check.php?dj=' + API.getUser().id + '&id=' + media.cid + '&pos=' + API.getWaitListPosition() + '&source=senpai',
					function(result){
						window.senpai.checkResult(result, media);
					}
				);
		},
		triggerCooldown: function()
		{
			if(!window.senpai.enabled()) return;
			if(window.senpai.cooldown)
				return false;
			window.senpai.cooldown = true;
			setTimeout(function() { window.senpai.cooldown = false; }, 3000);
			return true;
		},
		checkResult: function(result, media)
		{
			if(!window.senpai.enabled()) return;
			window.senpai.parseResult(result, media);
			window.senpai.tagNextMedia();
		},
		getVerdict: function(result)
		{
			if(!window.senpai.enabled()) return;

			if(!result) return window.senpai.messages.unknown;

			if(result.u == 1) return window.senpai.messages.unavailable;
			if(result.b == 1) return window.senpai.messages.banned;
			if(result.rp > 0) return window.senpai.messages.toosoon;
			if(result.o == 1 && result.s == 0) return window.senpai.messages.overplayedgrace;
			if(result.o == 1) return window.senpai.messages.overplayed;
			if(result.t == 1) return window.senpai.messages.today;
			if(result.w == 1) return window.senpai.messages.week;

			if(result.b !== 1 && result.o == 0 && result.t == 0 && result.w != 1)
				return window.senpai.messages.ok;

			return window.senpai.messages.error;
		},
		parseResult: function(result, media)
		{
			if(!window.senpai.enabled()) return;
			window.senpai.cache[media.id] = { checked: Date.now(), result: result, message: '', media: media };
			var verdict = window.senpai.getVerdict(result);
			window.senpai.cache[media.id].result = result;
			window.senpai.cache[media.id].verdict = verdict;
			window.senpai.cache[media.id].message = verdict.brief(result);
			$('span[senpai-media-id="'+media.id+'"]').remove();

			if(verdict.type == 'manual-only' && window.senpai.pos !== undefined)
				return;

			if(verdict.category == 'information')
				window.chatalert.show('icon-volume-off', verdict.title(result), verdict.full(result), 'aa74ff', 'senpai');

			else if(verdict.category == 'warning')
				window.chatalert.show('icon-volume-half', verdict.title(result), verdict.full(result), 'aa74ff', 'senpai');

			else if(verdict.category == 'error')
				window.chatalert.show('icon-volume-on', verdict.title(result), verdict.full(result), 'c42e3b', 'senpai');

			if(verdict.play && window.senpai.pos < 5)
				window.soundbank.play(verdict.play);

			if(verdict.popup && window.senpai.pos < 5)
				window.notify.show(verdict.full(result), 5);
		},
		startTagPlaylist: function()
		{
			if(!window.senpai.playlistUpdateInterval)
				window.senpai.playlistUpdateInterval = setInterval(function(){ window.senpai.tagPlaylist(); }, 500);
		},
		stopTagPlaylist: function()
		{
			if(window.senpai.playlistUpdateInterval)
			{
				clearInterval(window.senpai.playlistUpdateInterval);
				window.senpai.playlistUpdateInterval = false;
			}
		},
		tagPlaylist: function()
		{
			if($('#playlist-panel').css('display') == 'none')
			{
				window.senpai.stopTagPlaylist();
				return;
			}
			if(window.senpai.getActivePlaylist() != window.senpai.getCurrentPlaylist())
				return;
			var targets = $('#media-panel .media-list .row .meta:not(#media-panel .media-list .row .meta:has(.senpai))');
			if(!targets || targets.length == 0)
				return;
			for(var i = 0; i < targets.length; ++i)
			{
				var data = false;
				var row = $(targets[i]);
				var icon = row.parent().children('img[src*="i.ytimg.com/vi/"]');
				if(icon.length == 1)
				{
					var id = /i.ytimg.com\/vi\/([^\/]+)\/default.jpg/.exec(icon.attr('src'))[1];
					if(id in window.senpai.cache && window.senpai.cache[id].message)
						data = window.senpai.cache[id];
					else
						console.log('Data not loaded for youtube id ' + id);
				}
				else
				{
					var author = row.children('.author').text();
					var title = row.children('.title').text();
					for(var id in window.senpai.cache)
						if('media' in window.senpai.cache[id])
						{
							if(window.senpai.cache[id].media.author != author)
								continue;
							if(window.senpai.cache[id].media.title != title)
								continue;

							data = window.senpai.cache[id];
							break;
						}
					if(!data)
						console.log('Unable to locate data for soundcloud track ' + author + ' - ' + title);
				}
				if(!data)
					data = { message: '<em style="padding-right:5px;color:orange">'+_('Unknown status')+'</em>', result: { w: '' }, verdict: { skip: false } };

				var message = data.message;
				if(data.verdict.skip)
					message = '<em style="padding-right:5px;color:red">'+message+'</em>';

				if(data.result.w.length > 8)
					message += ' <span style="display:inline;position:static;font-size:8px;color:#aaa !important">('+data.result.w+')</span>';
				
				row.prepend($('<span class="senpai" senpai-media-id="'+id+'" style="top:0px">Senpai says: ' + message + '</span>'));
			}
		},
		tagNextMedia: function()
		{
			$('#your-next-media .senpai').remove();
			var nextMedia = API.getNextMedia().media;
			if (window.senpai.cache[nextMedia.cid] && window.senpai.cache[nextMedia.cid].message)
			{
				if(window.senpai.cache[nextMedia.cid].verdict.skip)
					$('#your-next-media').prepend($('<span class="senpai" style="top:0px;font-size:0.6em;text-align:right;right:0px">'+_('Senpai says')+': <em style="color:red;">' + window.senpai.cache[nextMedia.cid].message + '</em></span>'));
				else
					$('#your-next-media').prepend($('<span class="senpai" style="top:0px;font-size:0.6em;text-align:right;right:0px">'+_('Senpai says')+': ' + window.senpai.cache[nextMedia.cid].message + '</span>'));
			}
		},
		waitForPlaylistChange: function(callback) {
			var tries = 20;
			var spinFunction = function() {
				if (window.senpai.getCurrentPlaylist() == window.senpai.getSelectedPlaylist())
					callback();
				else if (tries-- > 0)
					setTimeout(spinFunction, 500);
			};
			setTimeout(spinFunction, 500);
		},
		advance: function(value) {
			window.senpai.pos = API.getWaitListPosition() + 1;
			var user = API.getUser();
			var currentdj = value.dj
			if(currentdj.id == user.id)
			{
				window.senpai.showAlert(_("It's your turn!"), _('Make us proud!'));
				window.notify.show(_("It's your turn!"), 2);
				window.soundbank.play('にゃんぱすー');
			}
			if (window.senpai.pos < 1) return;

			if (window.senpai.pos < 6 || window.senpai.pos == 49 || window.senpai.pos % 10 == 1) {
				var nextSong = API.getNextMedia();
				window.senpai.startCheck(nextSong.media);
			}
		},
		showAlert: function(title, message)
		{
			window.chatalert.show('icon-volume-off', title, message, 'aa74ff', 'senpai');
		},
		getCurrentPlaylist: function() { return $('#media-panel .header .title span').text(); },
		getSelectedPlaylist: function() { return $('#playlist-menu .selected .name').text(); },
		getActivePlaylist: function() { return $('#playlist-menu .icon-check-purple').parent().parent().children('.name').text(); },
		enabled: function() { return /plug.dj\/hummingbird-me$/.test(document.location); },
		cache: {},
		cooldown: false,
		pos: undefined,
		playlistUpdateInterval: false
	};
	if(!("senpai" in window))
	{
		window.freshy.waitFor('chatalert', function(){
			window.freshy.waitFor('babelfish', function(){
				if(senpai.enabled())
					senpai.showAlert(_('SenpaiScript loaded.'), _('Type /check to check your song!'));
			});
		});
		senpai.setup();
	}
	else
		senpai.cache = window.senpai.cache;
	senpai.startup();
	window.senpai = senpai;
})();
