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
			return "senpai" in window && window.senpai.enabled() && API.getUser().role >= 2;
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
			if(media.cid == window.kouhai.media)
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
			{
				$.getJSON(
					'https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails,statistics&id='+media.cid+'&key=AIzaSyD67usK9zHkAgG33z0bdoauSGrdXX8ByL8',
					function(response)
					{
						var counter = -1;
						if('pageInfo' in response)
						{
							var bad = null;
							if(response.pageInfo.totalResults == 0)
								bad = 'Video not found';
							else if(response.items[0].status.uploadStatus == 'rejected')
								bad = 'Video removed (' + response.items[0].status.rejectionReason + ')';
							else if(!response.items[0].status.embeddable)
								bad = 'Video not embeddable';
							else if('contentRating' in response.items[0].contentDetails && 'ytRating' in response.items[0].contentDetails.contentRating)
								bad = response.items[0].contentDatils.contentRating.ytRating;

							if(bad)
							{
								window.kouhai.checkResult({id:media.cid, b:0, u:1, r: bad, w: ''}, media, dj);
								return;
							}

							if('statistics' in response.items[0])
								counter = response.items[0].statistics.viewCount;
						}
						var score = window.senpai.parseRestrictions(response);
						if(score > 16)
						{
							window.kouhai.checkResult({id:media.cid, b:0, u:1, r: 'Blocked in too many countries!', w: ''}, media, dj);
							return;
						}
						window.kouhai.continueCheck(media, dj, counter);
					}
				).fail(function(e){ window.kouhai.checkResult({id:media.cid, b:0, u:1, r: e.responseJSON.error.message}); }, media, dj);
			}
			else if(media.format == 2)
				SC.get('/tracks/'+media.cid+'.json')
				.then(
					function(response)
					{
						var counter = (response && 'playback_count' in response) ? response.playback_count : -1;
						window.kouhai.continueCheck(media, dj, counter);
					}
				).catch(
					function(error)
					{
						window.kouhai.checkResult({id:media.cid, b:0, u:1, r:error.message, override: true, w:''}, media, dj);
					}
				);
		},
		continueCheck: function(media, dj, counter)
		{
			$.getJSON(
				'https://j.animemusic.me/animemusic/check.php?dj=' + dj.id + '&id=' + media.cid + '&source=kouhai',
				function(r)
				{
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
			report += '<br>DJ: '+dj.username;
			report += (result.n == 0 ? ' is playing for the first time!' : (result.s == 0 ? ' did not play the last month.' : ' has played ' + result.n + ' songs.'));
			if(result.alt)
				report += '<br><a href="http://j.animemusic.me/animemusic/alts.php?id=' + result.a + '" target="_new">' + result.alt + ' known versions</a>';
			else
				report += '<br><a href="http://j.animemusic.me/animemusic/suggest.php?cid='+result.id+'" target="_new">Link this song now</a>';
			if(result.o2 > -1)
				report += '<br><a href="http://j.animemusic.me/animemusic/opcheck.php?media='+result.id+'" target="_blank">Overplayed2 score: ' + result.o2 + '</a>'; 
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
			if(!result.alt && counter >= 1000000)
			{
				report += '<br>'+counter+' playbacks!';
				softwarn = true;
				showReport = true;
			}

			if(showReport)
				window.chatalert.show(icon, 'Kouhai DJ report', report, '00d2ff', 'kouhai');

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
		senpaiReport: function(user) {
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
				window.chatalert.show('', 'Unknown user', 'I was not able to find a user named "'+user+'"', '00d2ff', 'kouhai');
				return;
			}
			$.getJSON(
				'https://j.animemusic.me/animemusic/check.php?dj=' + userid + '&source=kouhai&report=senpai',
				function(r)
				{
					if(!r || !r.firstCheck)
						report = user + ' has never used senpaiscript.';
					else
					{
						report = user + ' has used senpaiscript!<br>First: ' + r.firstCheck + '<br>Last: ' + r.lastCheck;
					}
					window.chatalert.show('', 'Senpai usage report', report, '00d2ff', 'kouhai');
				}
			);
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
			if(value.startsWith('/ssc ') || value.startsWith('/sscheck '))
			{
				var user = /ssc(heck|) @?(.*)/.exec(value)[2].trim();
				window.kouhai.senpaiReport(user);
			}
		},
		onWaitlist: function() {
			if(!window.kouhai.enabled()) return;
			setTimeout(window.kouhai.pollWaitlist, 1000);
		},
		pollWaitlist: function() {
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
				'https://j.animemusic.me/animemusic/check.php?dj=' + user.attr('data-uid') + '&source=kouhai&report=senpai',
				function(r)
				{
					var position = user.find('.position');
					position.addClass('kouhai');
					var ok = r && r.lastCheck;
					position.css('color', r.ok?'green' : (ok?'yellow':'red'));
					position.attr('title', ok ? r.lastCheck : 'n/a');
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
