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
				window.kouhai.continueCheck(media, dj);
			}
			else if(media.format == 2)
				SC.get('/tracks/'+media.cid+'.json', function(response)
				{
					if("errors" in response)
					{
						window.kouhai.checkResult({id:media.cid, b:0, u:1, r:_(response.errors[0].error_message), override: true, w:''});
					}
					window.kouhai.continueCheck(media, dj);
				});
		},
		continueCheck: function(media, dj)
		{
			$.getJSON('https://i.animemusic.me/animemusic/check.php?dj=' + dj.id + '&id=' + media.cid + '&source=kouhai', window.kouhai.checkResult);
		},
		checkResult: function(result)
		{
			if(!window.kouhai.enabled())
				return;
			if (result == false || result.id != API.getMedia().cid)
				return;
			verdict = window.senpai.getVerdict(result);
			var message = verdict.kouhai(result);
			if(!message)
				return;

			window.kouhai.showAlert(verdict.title(result), message);

			if(verdict.popup)
			{
				window.notify.show(message, 10);
				if(verdict.kouhaiPlay)
					window.soundbank.play(verdict.kouhaiPlay);
			}
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
