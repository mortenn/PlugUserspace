(function(){
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};
	var kouhai = {
		badWords: /ful+i/,
		forceShow: false,
		enabled: function()
		{
			return "senpai" in window && window.senpai.enabled() && API.getUser().role >= 2;
		},
		setup: function()
		{
			API.on(API.ADVANCE, function(value){ window.kouhai.advance(value); });
			API.on(API.CHAT_COMMAND, function(e){ window.kouhai.onChatCommand(e); });
			window.freshy.waitFor('chatalert', function(){
				window.kouhai.showAlert(_('Kouhai on alert.'), _('Keeping an eye out for you, senpai!'));
			});
		},
		startup: function()
		{
			var defaults = window.kouhai.config.values;
			window.freshy.waitFor('settings', function() { window.settings.setDefaults('kouhai', defaults); });
			window.freshy.systemLoaded('kouhai');
		},
		save: function()
		{
			window.settings.configuration.kouhai = window.kouhai.config.values;
			window.settings.saveConfiguration();
		},
		advance: function(value)
		{
			if(!window.kouhai.enabled())
				return;
			if(window.kouhai.timeout)
				clearTimeout(window.kouhai.timeout);
			window.kouhai.timeout = setTimeout(window.kouhai.startCheck, 5000);
		},
		startCheck: function()
		{
			if(!window.kouhai.enabled())
				return;
			window.kouhai.timeout = false;
			var media = API.getMedia();
			if(window.kouhai.badWords.test(media.author) || window.kouhai.badWords.test(media.title))
				window.chatalert.show('icon-volume-half', 'Possible bad song', 'This title has a banned word in it.', 'ffd200', 'kouhai');
			window.kouhai.youtubeCheck(media, API.getDJ());
		},
		youtubeCheck: function(media, dj)
		{
			if(media.format == 1)
			{
				$.getJSON(
					'https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails&id='+media.cid+'&key=AIzaSyD67usK9zHkAgG33z0bdoauSGrdXX8ByL8',
					function(response)
					{
						if('pageInfo' in response)
						{
							var bad = null;
							if(response.pageInfo.totalResults == 0)
								bad = 'Video not found';
							else if(response.items[0].status.uploadStatus == 'rejected')
								bad = 'Video removed (' + response.items[0].status.rejectionReason + ')';

							if(bad)
							{
								window.kouhai.checkResult({id:media.cid, b:0, u:1, r: _(bad), w: ''}, media, dj);
								return;
							}
						}
						var score = window.senpai.parseRestrictions(response);
						if(score > 16)
						{
							window.kouhai.checkResult({id:media.cid, b:0, u:1, r: _('Blocked in too many countries!'), w: ''}, media, dj);
							return;
						}
						window.kouhai.continueCheck(media, dj);
					}
				).fail(function(e){ window.kouhai.checkResult({id:media.cid, b:0, u:1, r: e.responseJSON.error.message}); }, media, dj);
			}
			else if(media.format == 2)
				SC.get('/tracks/'+media.cid+'.json', function(response)
				{
					if("errors" in response)
					{
						window.kouhai.checkResult({id:media.cid, b:0, u:1, r:_(response.errors[0].error_message), override: true, w:''}, media, dj);
					}
					window.kouhai.continueCheck(media, dj);
				});
		},
		continueCheck: function(media, dj)
		{
			$.getJSON('https://i.animemusic.me/animemusic/check.php?dj=' + dj.id + '&id=' + media.cid + '&source=kouhai', function(r){ window.kouhai.checkResult(r, media, dj); });
		},
		checkResult: function(result, media, dj)
		{
			if(!window.kouhai.enabled())
				return;
			if (result == false || result.id != API.getMedia().cid)
				return;
			var showReport = true;
			if(window.kouhai.config.values.mode == 'off')
				showReport = false;
			if(window.kouhai.config.values.mode == 'link' && result.alt < 1)
				showReport = false;
			if(window.kouhai.config.values.mode == 'new' && result.alt >= 1)
				showReport = false;

			var report = result.title ? result.title : media.title;
			report += '<br>' + (result.ln == 0 ? 'This is the first time!' : 'Played '+result.ln+' times.');
			report += '<br>DJ: '+dj.username;
			report += (result.n == 0 ? ' is playing for the first time!' : (result.s == 0 ? ' did not play the last month.' : ' has played ' + result.n + ' songs.'));
			if(result.alt)
				report += '<br><a href="http://i.animemusic.me/animemusic/alts.php?id=' + result.a + '" target="_new">' + result.alt + ' known versions</a>';
			else
				report += '<br><a href="http://i.animemusic.me/animemusic/link.php?f[]=' + encodeURIComponent(media.author) + '&f[]='+encodeURIComponent(media.title) + '" target="_new">Link this song now</a>';
			if(result.o2 > -1)
				report += '<br>Overplayed2 score: ' + result.o2;
			if(result.oa1 > 0)
				report += '<br>' + result.oa1 + ' known versions on op list!';
			if(result.ls)
			{
				report += '<br>' + (result.oa1 > 1 ? 'Known version last played' : 'Last played') + ' ';
				report += result.lr ? '<span style="color:red">'+result.ls+'</span>' : result.ls;
			}

			var verdict = window.senpai.getVerdict(result);
			var message = verdict.kouhai(result);
			var icon = 'icon-volume-off';
			if(message)
			{
				report += '<br><br><span style="color:red">'+message+'</span>';
				showReport = true;
				icon = 'icon-volume-on';
			}
			if(window.kouhai.forceShow)
			{
				window.kouhai.forceShow = false;
				showReport = true;
			}

			if(showReport)
				window.chatalert.show(icon, 'Kouhai DJ report', report, '00d2ff', 'kouhai');

			if((verdict.popup && verdict.kouhaiPlay) || (result.oa1 > 0 && result.n > 0 && result.s > 0))
				window.soundbank.play('Master');

			if(verdict.popup && message)
				window.notify.show(message, 10);
		},
		showAlert: function(title, message)
		{
			if(!window.kouhai.enabled())
				return;
			window.chatalert.show('icon-volume-off', title, message, '00d2ff', 'kouhai');
		},
		timeout: false,
		configure: function(data)
		{
			window.kouhai.config.values = data;
		},
		config: 
		{
			values: { mode: 'on' },
			get: function()
			{
				return [
					{
						title: 'Kouhai DJ Reports',
						type: 'right',
						options: [
							{ type: 'select', name: 'mode', value: window.kouhai.config.values.mode,
								options: [
									{value:'on', label:'Show always'},
									{value:'off', label:'Show never'},
									{value:'link', label:'Show for linked only'},
									{value:'new', label:'Show for unlinked only'}
								]
							}
						]
					}
				]; 
			},
			set: function(config, value)
			{
				window.kouhai.config.values[config.name] = value;
				window.kouhai.save();
			}
		},
		onChatCommand: function(value) {
			if(!window.kouhai.enabled()) return;
			if(value == "/report")
			{
				window.kouhai.forceShow = true;
				if(window.kouhai.timeout)
					clearTimeout(window.kouhai.timeout);
				window.kouhai.startCheck();
			}
		},
	};

	if(!("kouhai" in window))
	{
		window.kouhai = kouhai;
		window.kouhai.setup();
		window.kouhai.startup();
	}
	else
	{
		window.kouhai = kouhai;
		window.kouhai.startup();
	}
})();
