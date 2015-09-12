(function(){
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};
	var kouhai = {
		enabled: function()
		{
			return "senpai" in window && window.senpai.enabled() && API.getUser().role >= 2;
		},
		setup: function()
		{
			API.on(API.ADVANCE, function(value){ window.kouhai.advance(value); });
			window.freshy.waitFor('chatalert', function(){
				window.kouhai.showAlert(_('Kouhai on alert.'), _('Keeping an eye out for you, senpai!'));
			});
		},
		startup: function()
		{
			window.freshy.systemLoaded('kouhai');
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
			window.kouhai.youtubeCheck(API.getMedia(), API.getDJ());
		},
		youtubeCheck: function(media, dj)
		{
			if(media.format == 1)
			{
				$.getJSON(
					'https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id='+media.cid+'&key=AIzaSyD67usK9zHkAgG33z0bdoauSGrdXX8ByL8',
					function(response)
					{
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
			if(message)
				report += '<br><br><span style="color:red">'+message+'</span>';

			window.chatalert.show('icon-volume-off', 'Kouhai DJ report', report, '00d2ff', 'kouhai');

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
		timeout: false
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
