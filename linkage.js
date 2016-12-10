(function(){
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};
	var linkage = {
		forceShow: false,
		media: null,
		enabled: function()
		{
			return "senpai" in window && window.senpai.enabled();
		},
		setup: function()
		{
			API.on(API.ADVANCE, function(value){ window.linkage.advance(value); });
		},
		startup: function()
		{
			window.freshy.systemLoaded('linkage');
		},
		advance: function(value)
		{
			if(!window.linkage.enabled())
				return;
			if(window.linkage.timeout)
				clearTimeout(window.linkage.timeout);
			window.linkage.timeout = setTimeout(window.linkage.startCheck, 5000);
		},
		startCheck: function()
		{
			if(!window.linkage.enabled())
				return;
			window.linkage.timeout = false;
			var media = API.getMedia();
			if(media.cid == window.linkage.media)
				return;
			window.linkage.media = media.cid;
			setTimeout(function(){ if(window.linkage.media == media.cid) window.linkage.media = null; }, 20000);
			var dj = API.getDJ();
			$.getJSON(
				'https://i.animemusic.me/animemusic/check.php?dj=' + dj.id + '&id=' + media.cid + '&source=linkage',
				function(r){ window.linkage.checkResult(r, media, dj); }
			);
		},
		checkResult: function(result, media, dj)
		{
			if(!window.linkage.enabled())
				return;
			if (result == false || result.id != API.getMedia().cid)
				return;
			if(!result.alt)
				window.chatalert.show(
					icon, 'Unlinked song', 
					'<a href="http://i.animemusic.me/animemusic/suggest.php?cid='+result.id+'" target="_new">Link this song now</a>',
					'00d2ff', 'linkage'
				);
		},
		timeout: false
	};

	if(!("linkage" in window))
	{
		window.linkage = linkage;
		window.linkage.setup();
		window.linkage.startup();
	}
	else
	{
		window.linkage = linkage;
		window.linkage.startup();
	}
})();
