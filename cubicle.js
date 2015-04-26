(function(){
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};
	var cubicle = {
		load: function()
		{
			var defaults = window.cubicle.config.values;
			window.freshy.waitFor('settings', function() { window.settings.setDefaults('cubicle', defaults); });
			window.freshy.systemLoaded('cubicle');
		},
		configure: function(config)
		{
			window.cubicle.config.values = config;
			if("plugCubed" in window)
				return;

			else if(config.autoload)
				$.getScript('https://d1rfegul30378.cloudfront.net/files/plugCubed.js');
		},
		save: function()
		{
			window.settings.configuration.cubicle = window.cubicle.config.values;
			window.settings.saveConfiguration();
		},
		config:
		{
			values: { autoload: true },
			get: function()
			{
				return [
					{
						title: _('Run Plug³ on startup'),
						type: 'right',
						options: [
							{ type: 'select', name: 'autoload', value: window.cubicle.config.values.autoload ? '1' : '0', options: [{value:'0', label:_('No')},{value:'1', label:_('Yes')}] },
						]
					}
				]; 
			},
			set: function(config, value)
			{
				window.cubicle.config.values[config.name] = value == '1';
				if(window.cubicle.config.values.autoload)
				{
					if(!("plugCubed" in window))
						$.getScript('https://d1rfegul30378.cloudfront.net/files/plugCubed.js');
				}
				else if("plugCubed" in window)
					plugCubed.close();

				window.cubicle.save();
				return value;
			}
		}
	};

	window.cubicle = cubicle;
	window.cubicle.load();
})();
