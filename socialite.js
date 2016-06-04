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
			window.freshy.systemLoaded('socialite');
		},
		config: 
		{
			values: {  },
			get: function()
			{
				if($('#room-name .bar-value').text() != 'AnimeMusic.me and Japanese Music')
					return false;

				return [
					{
						title: '<span style="color:#fe77d5">Get Important Updates</span>',
						type: 'right',
						options: [
							{ type: 'custom', content: '<iframe src="https://i.animemusic.me/keepintouch" style="width:400px;height: 221px;border:0"></iframe>' },
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
