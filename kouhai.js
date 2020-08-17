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
		media: null,
		enabled: function()
		{
			return "senpai" in window && window.senpai.enabled() && API.getUser().role >= API.ROLE.BOUNCER;
		},
		setup: function()
		{
			API.on(API.ADVANCE, function(value){ window.kouhai.advance(value); });
			API.on(API.CHAT_COMMAND, function(e){ window.kouhai.onChatCommand(e); });
			$('#waitlist-button').on('click', window.kouhai.onWaitlist);
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
			if(!media || media.cid == window.kouhai.media)
				return;
			window.kouhai.media = media.cid;
			setTimeout(function(){ if(window.kouhai.media == media.cid) window.kouhai.media = null; }, 20000);
			if(window.kouhai.badWords.test(media.author) || window.kouhai.badWords.test(media.title))
				window.chatalert.show('icon-volume-half', 'Possible bad song', 'This title has a banned word in it.', 'ffd200', 'kouhai');
			window.kouhai.youtubeCheck(media, API.getDJ());
		},
		youtubeCheck: function(media, dj)
		{
			if(media.format == 1)
				window.kouhai.continueCheck(media, dj, 0, null);
			else if(media.format == 2)
				SC.get('/tracks/'+media.cid+'.json')
				.then(
					function(response)
					{
						var counter = (response && 'playback_count' in response) ? response.playback_count : -1;
						window.kouhai.continueCheck(media, dj, counter, null);
					}
				).catch(
					function(error)
					{
						window.kouhai.checkResult({id:media.cid, b:0, u:1, r:error.message, override: true, w:''}, media, dj);
					}
				);
		},
		continueCheck: function(media, dj, counter, warning)
		{
			$.getJSON(
				'https://i.animemusic.me/animemusic/check.php?dj=' + dj.id + '&id=' + media.cid + '&source=kouhai',
				function(r)
				{
					if(warning)
						r.warning = warning;
					window.kouhai.checkResult(r, media, dj, counter);
				}
			);
		},
		checkResult: function(result, media, dj, counter)
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
			if(window.kouhai.config.values.hipster == 1 && (result.ln > window.kouhai.config.values.hipster_limit))
			{
				var vol_button = $('#volume .button');
				var vol_icon = vol_button.find('i.icon');
				if(vol_icon.hasClass('icon-volume-half') || vol_icon.hasClass('icon-volume-on'))
				{
					vol_button.click();
					vol_button.click();
				}
			}
			if(counter > 0)
			{
				var counter_formatted;

				if(counter < 1000)
					counter_formatted = counter;
				else if(counter < 1000000)
					counter_formatted = Math.floor(counter / 1000) + 'k';
				else if(counter < 1000000000)
					counter_formatted = Math.floor(counter / 1000000) + 'M';
				else
					counter_formatted = Math.floor(counter / 1000000000) + 'B';

				if(media.format == 1)
					report += '<br>Views on YouTube: ' + counter_formatted;

				else if(media.format == 2)
					report += '<br>Plays on SoundCloud: ' + counter_formatted;
			}
			report += '<br>DJ: '+dj.username;
			report += (result.n == 0 ? ' is playing for the first time!' : (result.s == 0 ? ' did not play the last month.' : ' has played ' + result.n + ' songs.'));
			if(result.alt)
				report += '<br><a href="https://i.animemusic.me/animemusic/alts.php?id=' + result.a + '" target="_new">' + result.alt + ' known versions</a>';
			else
				report += '<br><a href="https://i.animemusic.me/animemusic/suggest.php?cid='+result.id+'" target="_new">Link this song now</a>';
			if(result.o2 > -1)
				report += '<br><a href="https://i.animemusic.me/animemusic/opcheck.php?media='+result.id+'" target="_blank">Overplayed score: ' + result.o2 + '</a>';
			if(result.oa1 > 0)
				report += '<br>' + result.oa1 + ' known versions on op list!';
			if(result.ls)
			{
				report += '<br>' + (result.oa1 > 1 ? 'Known version last played' : 'Last played') + ' ';
				report += result.lr ? '<span style="color:red">'+result.ls+'</span>' : result.ls;
			}
			if(result.lc)
				report += '<br>Used senpai ' + result.lc;
			else
				report += '<br>Not used senpai';

			var verdict = window.senpai.getVerdict(result, media);
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

			var softwarn = false;
			if(!result.alt && counter >= 1000000 && result.ln <= 1)
			{
				report += '<br>Popular song, check rules!';
				softwarn = true;
				showReport = true;
			}

			if(showReport)
			{
				var alert = window.chatalert.show(icon, 'Kouhai DJ report', report, '00d2ff', 'kouhai');
				if(window.kouhai.config.values.dismiss)
					setTimeout(function(){ alert.remove(); }, 600000);
			}

			if(softwarn || (verdict.popup && verdict.kouhaiPlay) || (result.oa1 > 0 && result.n > 0 && result.s > 0))
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
			values: { mode: 'on', hipster: 0, dismiss: 1, hipster_limit: 15 },
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
					},
					{
						title: 'Hipster mode',
						type: 'right',
						options: [
							{ type: 'select', name: 'hipster', value: window.kouhai.config.values.hipster,
								options: [
									{value:0, label:'Off'},
									{value:1, label:'On'}
								]
							},
							{ type: 'textbox', name: 'hipster_limit', value: window.kouhai.config.values.hipster_limit }
						]
					},
					{
						title: 'Dismiss kouhai',
						type: 'right',
						options: [
							{ type: 'select', name: 'dismiss', value: window.kouhai.config.values.dismiss,
								options: [
									{value:0, label:'No'},
									{value:1, label:'Yes'}
								]
							}
						]
					}
				];
			},
			set: function(config, value)
			{
				if(config.name == 'hipster' || config.name == 'hipster_limit' || config.name == 'dismiss')
					value = value * 1;
				window.kouhai.config.values[config.name] = value;
				window.kouhai.save();
				return value;
			}
		},
		senpaiReport: function(user)
		{
			var users = API.getUsers();
			var userid = false;
			for(var i = 0; i < users.length; ++i)
			{
				if(users[i].username == user)
				{
					userid = users[i].id;
					break;
				}
			}
			if(!userid)
			{
				var alert = window.chatalert.show('', 'Unknown user', 'I was not able to find a user named "'+user+'"', '00d2ff', 'kouhai');
				if(window.kouhai.config.values.dismiss)
					setTimeout(function(){ alert.remove(); }, 60000);
				return;
			}
			$.getJSON(
				'https://i.animemusic.me/animemusic/check.php?dj=' + userid + '&source=kouhai&report=senpai',
				function(r)
				{
					if(!r || !r.firstCheck)
						report = user + ' has never used senpaiscript.';
					else
					{
						report = user + ' has used senpaiscript!<br>First: ' + r.firstCheck + '<br>Last: ' + r.lastCheck;
					}
					var alert = window.chatalert.show('', 'Senpai usage report', report, '00d2ff', 'kouhai');
					if(window.kouhai.config.values.dismiss)
						setTimeout(function(){ alert.remove(); }, 60000);
				}
			);
		},
		onChatCommand: function(value)
		{
			if(!window.kouhai.enabled()) return;
			if(value == "/report")
			{
				window.kouhai.forceShow = true;
				if(window.kouhai.timeout)
					clearTimeout(window.kouhai.timeout);
				window.kouhai.startCheck();
			}
			if(value.startsWith('/ssc ') || value.startsWith('/sscheck '))
			{
				var user = /ssc(heck|) @?(.*)/.exec(value)[2].trim();
				window.kouhai.senpaiReport(user);
			}
		},
		onWaitlist: function()
		{
			if(!window.kouhai.enabled()) return;
			setTimeout(window.kouhai.pollWaitlist, 1000);
		},
		pollWaitlist: function()
		{
			var users = $('#waitlist div.user');
			if(users.length == 0)
				return;
			if(users.find('.kouhai').length < users.length)
				for(var i = 0; i < users.length; ++i)
					window.kouhai.checkWaitlistUser($(users[i]));
			setTimeout(window.kouhai.pollWaitlist, 1000);
		},
		checkWaitlistUser: function(user)
		{
			$.getJSON(
				'https://i.animemusic.me/animemusic/check.php?dj=' + user.attr('data-uid') + '&source=kouhai&report=senpai',
				function(r)
				{
					var position = user.find('.position');
					position.addClass('kouhai');
					var color = '#a5dc42';
					if(!r)
						color = '#c42e3b';
					else if(!r.ok)
					{
						if(r.lastChecked)
							color = '#ffdd6f';
						else if (r.plays > 10)
							color = '#00d2ff';
						else
							color = '#c42e3b';
					}
					position.css('color', color);
					position.attr('title', r && r.lastCheck ? r.lastCheck : 'n/a');
				}
			);
		}
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
