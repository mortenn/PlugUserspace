(function() {
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};

	var senpai = {
		colours: { information: 'aa74ff', softwarning: 'f3e115', warning: 'ffdd6f', error: 'c42e3b' },
		messages: {
			unknown: {
				brief: function(){ return _('Unknown song or alternate version.'); },
				title: function(){ return _('Unknown Song/Alternate Version'); },
				full: function()
				{
					return _('Your next song is not in our systems, please ensure it follows all the <a href="http://www.animemusic.me/rules" target="_blank">rules</a> and is not <a href="http://www.animemusic.me/overplayed" target="_blank">overplayed</a>.<br>'+
						'Other versions of the same song might be banned or have been <a href="http://www.animemusic.me/todays-songs" target="_blank">played today</a>.'
					);
				},
				kouhai: function(){ return false },
				kouhaiPlay: false,
				type: 'manual-only',
				popup: false,
				category: 'softwarning',
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
				category: 'warning',
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
			warning: {
				brief: function(r){ return _('Warning: {reason}').replace('{reason}',_(r.warning)); },
				title: function(){ return _('Warning'); },
				full: function(r)
				{
					return _('Your next song is potentiall against the rules ({reason}), please check.')
						.replace('{reason}',_(r.warning));
				},
				kouhai: function(){ return true; },
				kouhaiPlay: true,
				type: 'always',
				popup: true,
				category: 'softwarning',
				skip: false,
			},
			month: {
				brief: function(){ return _('Played within 30 days.'); },
				title: function(){ return _('Played within 30 days.'); },
				full: function(r){ return window.senpai.messages.ok.full(r); },
				kouhai: function(){ return false; },
				kouhaiPlay: false,
				type: 'manual-only',
				popup: false,
				category: 'softwarning',
				skip: false,
			},
			quarter: {
				brief: function(){ return _('Played within 90 days.'); },
				title: function(){ return _('Played within 90 days.'); },
				full: function(r){ return window.senpai.messages.ok.full(r); },
				kouhai: function(){ return false; },
				kouhaiPlay: false,
				type: 'manual-only',
				popup: false,
				category: 'softwarning',
				skip: false,
			},
			nightcore: {
				brief: function(){ return _('Likely nightcore, which is against rules!'); },
				title: function(){ return _('Nightcore'); },
				full: function(r)
				{
					return _('This version of your song has "nightcore" in the author/title.<br>'+
						'Nightcore is banned in this room.<br>'+
						'<a target="_new" href="http://AnimeMusic.me/guide">Please refer to our room guide.</a>');
				},
				kouhai: function() { return _('Nightcore in track name!'); },
				kouhaiPlay: true,
				type: 'always',
				popup: true,
				category: 'error',
				skip: true
			},
			fuli: {
				brief: function(){ return _('Likely looped, which is against rules!'); },
				title: function(){ return _('Fuli'); },
				full: function(r)
				{
					return _('This version of your song has "fuli" in the author/title.<br>'+
						'Looped songs are not allowed in this room.<br>'+
						'<a target="_new" href="http://AnimeMusic.me/guide">Please refer to our room guide.</a>');
				},
				kouhai: function() { return _('Fuli/Fulli in track name!'); },
				kouhaiPlay: true,
				type: 'always',
				popup: true,
				category: 'error',
				skip: true
			},
			ok: {
				brief: function(){ return _('Seems OK, but check rules.'); },
				title: function(){ return _('Looks good'); },
				full: function(r)
				{
					return _('This version of your song is not marked as banned or <a href="http://www.animemusic.me/overplayed" target="_blank">overplayed</a>, but please double check it.<br>'+
						'Other videos of the same song might be banned, or we might have missed linking it.<br>'+
						'<a target="_new" href="http://AnimeMusic.me/guide">Please refer to our room guide.</a>'+
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
			API.on(API.CHAT_COMMAND, function(e){ window.senpai.onChatCommand(e); });
			API.on(API.ADVANCE, function(e){ window.senpai.advance(e); });
			$('#app .dj-button--desktop').on('click','.dj-button.is-wait button', function() { window.senpai.onJoinWaitlist(); });
			$('.community__playlist--desktop').on('click', function() { window.senpai.onPlaylistChanged(); });
			$('#playlist-meta .bar-button').on('click', function(){ window.senpai.onPlaylistChanged(); });
			$('#playlist-menu .row').on('click', function(){ window.senpai.onPlaylistChanged(); });
			$('#playlist-menu .activate-button').on('click', function(){ window.senpai.onPlaylistActivate(); });
			$('#playlist-activate-button').on('click', function(){ window.senpai.onPlaylistActivate(); });
		},
		startup: function()
		{
			var defaults = window.senpai.config.values;
			window.freshy.waitFor('settings', function() { window.settings.setDefaults('senpai', defaults); });
			window.freshy.systemLoaded('senpai');
		},
		save: function()
		{
			window.settings.configuration.senpai = window.senpai.config.values;
			window.settings.saveConfiguration();
		},
		configure: function(data)
		{
			window.senpai.config.values = data;
		},
		config:
		{
			values: { strict: 'off' },
			get: function()
			{
				return [{
					title:'Senpaiscript',
					type:'right',
					options:[{
						type:'select', name:'strict', value: window.senpai.config.values.strict,
						options: [{value:'off', label:_('Warn for < 1 month')}, {value:'on', label:_('Warn for < 3 months')}]
					}]
				}];
			},
			set: function(config, value)
			{
				window.senpai.config.values[config.name] = value;
				window.senpai.save();
			}
		},
		onChatCommand: function(value)
		{
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
			if('multipass' in window)
				window.multipass.managePlaylistButton();

			var button = $('#playlist-check-button');
			if (button.length)
				button.remove();

			if(window.senpai.getActivePlaylist() == window.senpai.getCurrentPlaylist())
			{
				var tooltip = _('Check to see if your upcoming song is available and abides by the rules.');
				button = $('<div id="playlist-check-button" class="button" title="'+tooltip+'"><i class="fa fa-shield-check"></i></div>');
				$('#playlist-edit-button').before(button);
				button.click(function() { window.senpai.manualCheck(); });
				window.senpai.startTagPlaylist();
			}
			else
				window.senpai.stopTagPlaylist();

			window.senpai.tagNextMedia();
		},
		manualCheck: function()
		{
			if(!window.senpai.enabled()) return;
			var nextSong = API.getNextMedia();
			if(!nextSong)
			{
				var alert = window.chatalert.show('icon-volume-off', _('Make a playlist first'), _('You do not have a song lined up, so nothing to check!'), window.senpai.colours.information, 'senpai');
				setTimeout(function(){ alert.remove(); }, 60000);
				return;
			}
			songID = nextSong.media.cid;
			window.senpai.pos = undefined;
			window.senpai.startCheck(nextSong.media);
		},
		parseRestrictions: function(response)
		{
			if(!("items" in response) || response.items.length == 0 || !("regionRestriction" in response.items[0].contentDetails))
				return 0;

			var restrict = response.items[0].contentDetails.regionRestriction;
			var score = 0;
			var result = {};
			var default_allow = true;

			if("allowed" in restrict)
			{
				default_allow = false;
				for(var c = 0; c < restrict.allowed.length; ++c)
					if(restrict.allowed[c] in window.senpai.countryList)
						result[restrict.allowed[c]] = true;
			}
			if("blocked" in restrict)
			{
				for(var c = 0; c < restrict.blocked.length; ++c)
					if(restrict.blocked[c] in window.senpai.countryList)
						result[restrict.blocked[c]] = false;
			}
			for(var country in window.senpai.countryList)
				if(!(result[country] === undefined ? default_allow : result[country]))
					score += window.senpai.countryList[country];
			return score;
		},
		startCheck: function(media)
		{
			if(!window.senpai.enabled()) return;
			if(media.format == 1)
				$.getJSON(
					'https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails&id='+media.cid+'&key=AIzaSyD67usK9zHkAgG33z0bdoauSGrdXX8ByL8',
					function(response)
					{
						var warning = null;
						if('pageInfo' in response)
						{
							var bad = null;
							var item = response.items ? response.items[0] || {} : {};

							if(response.pageInfo.totalResults == 0 || response.items.length == 0)
								bad = 'Video not found';
							else if(item.status.uploadStatus == 'rejected')
								bad = 'Video removed (' + item.status.rejectionReason + ')';
							else if(!item.status.embeddable)
								bad = 'Video not embeddable';
							else if(item.contentDetails && item.contentDetails.contentRating && item.contentDetails.contentRating.ytRating)
								warning = item.contentDetails.contentRating.ytRating;

							if(bad)
							{
								window.senpai.checkResult({id:media.cid, b:0, u:1, r: bad, w: ''}, media);
								return;
							}
						}
						var score = window.senpai.parseRestrictions(response);
						if(score > 16)
						{
							window.senpai.checkResult({id:media.cid, b:0, u:1, r: 'Blocked in too many countries!', w: ''}, media);
							return;
						}
						window.senpai.continueCheck(media, warning);
					}
				).fail(function(e){ window.senpai.checkResult({id:media.cid, b:0, u:1, r: e.responseJSON.error.message}); }, media);
			else if(media.format == 2)
				SC.get('/tracks/'+media.cid).then(
					function(response) { window.senpai.continueCheck(media); }
				).catch(
					function(error)
					{
						window.senpai.checkResult({id:media.cid, b:0, u:1, r:error.message, w:''}, media);
					}
				);
			else
				console.log(media);
		},
		continueCheck: function(media, warning)
		{
			if(window.senpai.triggerCooldown())
				$.getJSON(
					'https://i.animemusic.me/animemusic/check.php?dj=' + API.getUser().id + '&id=' + media.cid + '&pos=' + API.getWaitListPosition() + '&source=senpai',
					function(result){
						if(warning)
							result.warning = warning;
						window.senpai.checkResult(result, media, warning);
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
		getVerdict: function(result, media)
		{
			if(!window.senpai.enabled()) return;

			if(!result || ('unknown' in result && result.unknown))
			{
				if(result && result.warning) return window.senpai.messages.warning;
				return window.senpai.messages.unknown;
			}
			if(result.u == 1) return window.senpai.messages.unavailable;
			if(result.b == 1) return window.senpai.messages.banned;
			if(result.rp > 0) return window.senpai.messages.toosoon;
			if(result.o > 0 && result.s == 0) return window.senpai.messages.overplayedgrace;
			if(result.o > 0) return window.senpai.messages.overplayed;
			if(result.t == 1) return window.senpai.messages.today;
			if(result.w == 1) return window.senpai.messages.week;
			if(result.m == 1) return window.senpai.messages.month;
			if(result.q == 1 && window.senpai.config.values.strict == 'on') return window.senpai.messages.quarter;
			if(result.warning) return window.senpai.messages.warning;

			if(media)
			{
				var nc = /nightcore/i;
				if(nc.test(media.author) || nc.test(media.title))
					return window.senpai.messages.nightcore;
				var fi = /full?i/i;
				if(fi.test(media.author) || fi.test(media.title))
					return window.senpai.messages.fuli;
				var rape = /rapei/i;
				if(rape.test(media.author) || rape.test(media.title))
					return window.senpai.messages.rape;
			}

			if(result.b != 1 && result.o < 1 && result.t == 0 && result.w != 1)
				return window.senpai.messages.ok;

			return window.senpai.messages.error;
		},
		parseResult: function(result, media)
		{
			if(!window.senpai.enabled()) return;

			var dj = API.getDJ();
			if(dj && dj.id == API.getUser().id && API.getMedia().cid == media.id)
				return;

			window.senpai.cache[media.id] = { checked: Date.now(), result: result, message: '', media: media };
			var verdict = window.senpai.getVerdict(result, media);
			window.senpai.cache[media.id].result = result;
			window.senpai.cache[media.id].verdict = verdict;
			window.senpai.cache[media.id].message = verdict.brief(result);

			$('span[senpai-media-id="'+media.id+'"]').remove();

			if(verdict.type == 'manual-only' && window.senpai.pos !== undefined)
				return;

			var icon = 'off';
			if(verdict.category == 'warning')
				icon = 'half';
			else if(verdict.category == 'error')
				icon = 'on';

			var alert = window.chatalert.show('icon-volume-'+icon, verdict.title(result), verdict.full(result), window.senpai.colours[verdict.category], 'senpai');
			setTimeout(function(){ alert.remove(); }, 60000);

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
					var match = /i.ytimg.com\/vi\/([^\/]+)\/h?q?default.jpg/.exec(icon.attr('src'));
					if(match)
					{
						var id = match[1];
						if(id in window.senpai.cache && window.senpai.cache[id].message)
							data = window.senpai.cache[id];
						else if("multipass" in window && window.senpai.getCurrentPlaylist() in window.multipass.checked)
							console.log('Data not loaded for youtube id ' + id);
					}
					else
						console.log('Unable to locate ID from '+icon.attr('src'));
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
					if(!data && "multipass" in window && window.senpai.getCurrentPlaylist() in window.multipass.checked)
						console.log('Unable to locate data for soundcloud track ' + author + ' - ' + title);
				}
				if(!data && "multipass" in window && window.senpai.getCurrentPlaylist() in window.multipass.checked)
					data = { message: '<em style="padding-right:5px;">'+_('Unknown status')+'</em>', result: { w: '' }, verdict: { skip: false, category: 'softwarning' } };

				var message = '';
				if(data)
				{
					message = '<span style="display:inline;position:static;color:#'+window.senpai.colours[data.verdict.category]+'">'+data.message+'</span>';
					if(data.verdict.skip)
						message = '<em style="padding-right:5px;color:red">'+message+'</em>';

					if('dup' in data.result)
						message += '<em style="padding-right:5px;color:'+window.senpai.colours.warning+'" title="'+data.result.dup.title+'">Duplicate!</em>';

					if('kouhai' in window && 'o2' in data.result && data.result.o2 > 0)
						message += ' (<a href="https://i.animemusic.me/animemusic/opcheck.php?media='+data.media.cid+'" target="_blank">OP='+data.result.o2+'</a>)';

					if('alt' in data.result && data.result.alt)
						message += ' <span style="display:inline;position:static;font-size:8px;color:#aaa !important">('+data.result.alt+' versions)</span>';

					if('w' in data.result && data.result.w.length > 8)
						message += ' <span style="display:inline;position:static;font-size:8px;color:#aaa !important">('+data.result.w+')</span>';
				}

				if(message)
					row.prepend($('<span class="senpai" senpai-media-id="'+id+'" style="top:0px">Senpai says: ' + message + '</span>'));
			}
		},
		tagNextMedia: function()
		{
			$('#your-next-media .senpai').remove();
			var nextMedia = API.getNextMedia();
			if(nextMedia && "media" in nextMedia)
			{
				if (window.senpai.cache[nextMedia.media.cid] && window.senpai.cache[nextMedia.media.cid].message)
				{
					if(window.senpai.cache[nextMedia.media.cid].verdict.skip)
						$('#your-next-media').prepend($('<span class="senpai" style="top:0px;font-size:0.6em;text-align:right;right:0px">'+_('Senpai says')+': <em style="color:red;">' + window.senpai.cache[nextMedia.media.cid].message + '</em></span>'));
					else
						$('#your-next-media').prepend($('<span class="senpai" style="top:0px;font-size:0.6em;text-align:right;right:0px">'+_('Senpai says')+': ' + window.senpai.cache[nextMedia.media.cid].message + '</span>'));
				}
			}
		},
		waitForPlaylistChange: function(callback)
		{
			var tries = 20;
			var spinFunction = function() {
				if (window.senpai.getCurrentPlaylist() == window.senpai.getSelectedPlaylist())
					callback();
				else if (tries-- > 0)
					setTimeout(spinFunction, 500);
			};
			setTimeout(spinFunction, 500);
		},
		advance: function(value)
		{
			if(!senpai.enabled()) return;
			window.senpai.pos = API.getWaitListPosition() + 1;
			var user = API.getUser();
			var currentdj = value.dj
			if(currentdj && currentdj.id == user.id)
			{
				window.senpai.showAlert(_("It's your turn!"), _('Make us proud!'));
				window.notify.show(_("It's your turn!"), 2);
				window.soundbank.play('にゃんぱすー');
				return;
			}
			if (window.senpai.pos < 1) return;

			if (window.senpai.pos < 6 || window.senpai.pos == 49 || window.senpai.pos % 10 == 1) {
				var nextSong = API.getNextMedia();
				window.senpai.startCheck(nextSong.media);
			}
		},
		showAlert: function(title, message)
		{
			var alert = window.chatalert.show('icon-volume-off', title, message, window.senpai.colours.information, 'senpai');
			setTimeout(function(){ alert.remove(); }, 60000);
		},
		getCurrentPlaylist: function() { return $('#media-panel .header .title span').text(); },
		getSelectedPlaylist: function() { return $('#playlist-menu .row.selected .name').text(); },
		getActivePlaylist: function() { return $('#playlist-menu .row .activate-button .active').parent().parent().children('.name').text(); },
		enabled: function() { if(/plug.dj\/(hummingbird-me|anime)(|#.*)$/.test(document.location)) return true; else { console.log('Senpai disabled in '+document.location); return false; } },
		cache: {},
		cooldown: false,
		pos: undefined,
		playlistUpdateInterval: false
	};
	if(!("senpai" in window))
	{
		window.freshy.waitFor('chatalert', function(){
			window.freshy.waitFor('babelfish', function(){
				window.freshy.waitFor('senpai', function(){
					if(window.senpai.enabled())
						window.senpai.showAlert(_('SenpaiScript loaded.'), _('Type /check to check your song!'));
				});
			});
		});
		senpai.setup();
	}
	else
		senpai.cache = window.senpai.cache;
	window.senpai = senpai;
	senpai.startup();
})();
