(function() {

	// Client running old senpai, abort.
	if("senpai" in window && "initialized" in window.senpai)
	{
		API.chatLog('Make sure you are not running additional versions of SenpaiScript! This is the corrent version https://i.animemusic.me/PlugUserspace/freshy.js');
		return;
	}

	var senpai = {
		messages: {
			unknown: {
				brief: function(){ return 'Unknown song or alternate version.'; },
				title: function(){ return 'Unknown Song/Alternate Version'; },
				full: function(){ return 'Your next song is not in our systems, please ensure it follows all rules and is not overplayed.<br>Other videos of the same song might be banned.<br><a target="_new" href="http://s.AnimeMusic.me/plug-guide">Please refer to our room guide.</a>'; },
				kouhai: function(){ return false },
				type: 'manual-only',
				popup: false,
				category: 'information',
				skip: false
			},
			banned: {
				brief: function(r){ return 'Banned: '+r.r; },
				title: function(){ return 'Banned'; },
				full: function(r){ return 'Your next song is banned!<br>The reason given was:<br><br>&nbsp;&nbsp;&nbsp;&nbsp;'+r.r+'<br><br>Please choose a different song,<br>or you will get skipped.' },
				kouhai: function(r){ return 'This song has been banned for "'+r.r+'"!' },
				type: 'always',
				popup: true,
				category: 'error',
				skip: true
			},
			toosoon: {
				brief: function(){ return 'Already played in your last 6 turns.'; },
				title: function(){ return 'Replay'; },
				full: function(){ return 'You have played that song within your past 6 dj turns, please choose a different song.'; },
				kouhai: function(){ return 'This song was one of the last 6 played by this user!'; },
				kouhai: function(r){ return 'Out of the last 6 turns, ' + API.getDJ().username + ' played "' + API.getMedia().title + '" ' + r.rp + ' of them.'; },
				type: 'always',
				popup: true,
				category: 'error',
				skip: true
			},
			overplayed: {
				brief: function(){ return 'Overplayed.'; },
				title: function(){ return 'Overplayed'; },
				full: function(){ return 'Your next song is overplayed, please choose a different song.'; },
				kouhai: function(){ return 'This song is overplayed -_-;'; },
				type: 'always',
				popup: true,
				category: 'error',
				skip: true
			},
			today: {
				brief: function(){ return 'Played today.'; },
				title: function(){ return 'Replay'; },
				full: function(){ return 'Your next song has already been played in the last 24 hours, please choose a different song.'; },
				kouhai: function(){ return false; },
				type: 'always',
				popup: true,
				category: 'error',
				skip: true
			},
			week: {
				brief: function(){ return 'Played this week.'; },
				title: function(){ return 'Replay'; },
				full: function(){ return 'Your next song has already been played this week, please choose a different song.'; },
				kouhai: function(){ return false; },
				type: 'always',
				popup: true,
				category: 'warning',
				skip: false
			},
			ok: {
				brief: function(){ return 'Seems OK, but check rules.'; },
				title: function(){ return 'Looks good'; },
				full: function(r){ return 'This version of your song is not marked as banned or overplayed, but please double check it.<br>Other videos of the same song might be banned.<br><a target="_new" href="http://s.AnimeMusic.me/plug-guide">Please refer to our room guide.</a><br>Last played: '+r.w; },
				kouhai: function(){ return false; },
				type: 'manual-only',
				popup: false,
				category: 'information',
				skip: false
			},
			error: {
				brief: function(){ return 'Error! Notify Uricorn.'; },
				title: function(){ return 'Oops!'; },
				full: function(r){ return 'Error: Please send this to Uricorn: '+r.id; },
				kouhai: function(r){ return 'Error: Please send this to Uricorn: '+r.id; },
				type: 'always',
				popup: false,
				category: 'error',
				skip: false
			}
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
				button = $('<div id="playlist-check-button" class="button" style="right:350px;"><span>Check</span></div>');
				$('#playlist-edit-button').before(button);
				button.click(function() { window.senpai.manualCheck(); });
				window.senpai.tagPlaylist();
			}

			window.senpai.tagPlaylist();
			window.senpai.tagNextMedia();
		},
		manualCheck: function() {
			if(!window.senpai.enabled()) return;
			var nextSong = API.getNextMedia();
			songID = nextSong.media.cid;
			window.senpai.pos = undefined;
			window.senpai.startCheck(songID);
		},
		startCheck: function(songID) {
			if(!window.senpai.enabled()) return;
			if(window.senpai.triggerCooldown())
				$.getJSON(
					'https://i.animemusic.me/animemusic/check.php?dj=' + API.getUser().id + '&id=' + songID + '&pos=' + API.getWaitListPosition() + '&source=senpai',
					window.senpai.checkResult
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
		checkResult: function(result)
		{
			if(!window.senpai.enabled()) return;
			window.senpai.cache[result.id] = { checked: Date.now(), result: result, message: '' };
			window.senpai.parseResult(result);
			window.senpai.tagNextMedia();
			window.senpai.tagPlaylist();
		},
		getVerdict: function(result)
		{
			if(!window.senpai.enabled()) return;

			if(!result) return window.senpai.messages.unknown;

			if(result.b == 1) return window.senpai.messages.banned;
			if(result.rp > 0) return window.senpai.messages.toosoon;
			if(result.o == 1) return window.senpai.messages.overplayed;
			if(result.t == 1) return window.senpai.messages.today;
			if(result.w == 1) return window.senpai.messages.week;

			if(result.b !== 1 && result.o == 0 && result.t == 0 && result.w != 1)
				return window.senpai.messages.ok;

			return window.senpai.messages.error;
		},
		parseResult: function(result)
		{
			if(!window.senpai.enabled()) return;
			var verdict = window.senpai.getVerdict(result);
			window.senpai.cache[result.id].result = result;
			window.senpai.cache[result.id].verdict = verdict;
			window.senpai.cache[result.id].message = verdict.brief(result);

			if(verdict.type == 'manual-only' && window.senpai.pos !== undefined)
				return;

			if(verdict.category == 'information')
				window.chatalert.show('icon-volume-off', verdict.title(result), verdict.full(result), 'aa74ff', 'senpai');

			else if(verdict.category == 'warning')
				window.chatalert.show('icon-volume-half', verdict.title(result), verdict.full(result), 'aa74ff', 'senpai');

			else if(verdict.category == 'error')
				window.chatalert.show('icon-volume-on', verdict.title(result), verdict.full(result), 'c42e3b', 'senpai');

			if(verdict.popup && window.senpai.pos < 5)
			{
				window.notify.show(verdict.full(result), 5);
				window.soundbank.play('Mo, baka!');
			}

		},
		tagPlaylist: function()
		{
			$('#media-panel .meta .senpai').remove();
			for (var id in window.senpai.cache) {
				if (window.senpai.cache[id] && window.senpai.cache[id].message)
				{
					if(window.senpai.cache[id].verdict.skip)
						$('#media-panel img[src*="/' + id + '/"]').parent().children('.meta').prepend($('<span class="senpai" style="top:0px">Senpai says: <em style="color:red;">' + window.senpai.cache[id].message + '</em></span>'));
					else
						$('#media-panel img[src*="/' + id + '/"]').parent().children('.meta').prepend($('<span class="senpai" style="top:0px">Senpai says: ' + window.senpai.cache[id].message + '</span>'));
				}
			}
		},
		tagNextMedia: function()
		{
			$('#your-next-media .senpai').remove();
			var nextMedia = API.getNextMedia().media;
			if (window.senpai.cache[nextMedia.cid] && window.senpai.cache[nextMedia.cid].message)
			{
				if(window.senpai.cache[nextMedia.cid].verdict.skip)
					$('#your-next-media').prepend($('<span class="senpai" style="top:0px;font-size:0.6em;text-align:right;right:0px">Senpai says: <em style="color:red;">' + window.senpai.cache[nextMedia.cid].message + '</em></span>'));
				else
					$('#your-next-media').prepend($('<span class="senpai" style="top:0px;font-size:0.6em;text-align:right;right:0px">Senpai says: ' + window.senpai.cache[nextMedia.cid].message + '</span>'));
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
				window.senpai.show("It's your turn!", 'Make us proud!');
				window.notify.show("It's your turn.", 2);
				window.soundbank.play('にゃんぱすー');
			}
			if (window.senpai.pos < 1) return;

			if (window.senpai.pos < 6 || window.senpai.pos == 49 || window.senpai.pos % 10 == 1) {
				var nextSong = API.getNextMedia();
				songID = nextSong.media.cid;
				window.senpai.startCheck(songID);
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
		pos: undefined
	};
	if(!("senpai" in window))
	{
		window.freshy.waitFor('chatalert', function(){
			if(senpai.enabled())
				senpai.showAlert('SenpaiScript loaded.', 'Type /check to check your song!');
		});
		senpai.setup();
	}
	senpai.startup();
	window.senpai = senpai;
})();
