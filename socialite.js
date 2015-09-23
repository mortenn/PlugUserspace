(function (){
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};
	var socialite = {
		configure: function(data)
		{
		},
		load: function()
		{
			window.freshy.waitFor('settings', function() { 
				setTimeout(function(){ window.settings.open(); }, 2000);
			});
			window.freshy.systemLoaded('socialite');
		},
		config: 
		{
			values: {  },
			get: function()
			{
				return [
					{
						title: '<span style="color:#f55">Important notice</span>',
						type: 'right',
						options: [
							{ type: 'custom', content: '<iframe src="https://i.animemusic.me/keepintouch" style="width:400px;height: 170px;border:0"></iframe>' },
						]
					},
				]; 
			},
			set: function(config, value)
			{
				return value;
			}
		}
	};

	window.socialite = socialite;
	window.socialite.load();
})();
