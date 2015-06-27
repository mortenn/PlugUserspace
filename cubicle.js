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
			if("plugCubed" in window || !config.autoload)
				return;

			if(config.autoload == 'p3')
				$.getScript('https://d1rfegul30378.cloudfront.net/files/plugCubed.js');
			else if(config.autoload == 'rcs')
				$.getScript('https://code.radiant.dj/rs.min.js');
		},
		save: function()
		{
			window.settings.configuration.cubicle = window.cubicle.config.values;
			window.settings.saveConfiguration();
		},
		config:
		{
			values: { autoload: 'rcs' },
			get: function()
			{
				return [
					{
						title: _('Load extension'),
						type: 'right',
						options: [
							{ type: 'select', name: 'autoload', value: window.cubicle.config.values.autoload, options: [{value:'', label:_('No')},{value:'p3', label:_('Plug³')},{value:'rcs', label:_('rcs')}] },
						]
					}
				]; 
			},
			set: function(config, value)
			{
				console.log(config, value);
				window.cubicle.config.values[config.name] = value;
				if(window.cubicle.config.values.autoload == 'rcs')
				{
					if(!("rs" in window))
						$.getScript('https://code.radiant.dj/rs.min.js');
				}
				else if("rs" in window)
				{
					window.cubicle.save();
					window.location = window.location.href;
				}

				if(window.cubicle.config.values.autoload == 'p3')
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
