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
			if("plugCubed" in window || !config.extension)
				return;

			if(config.extension == 'p3')
				$.getScript('https://d1rfegul30378.cloudfront.net/files/plugCubed.js');
			else if(config.extension == 'rcs')
				$.getScript('https://code.radiant.dj/rs.min.js');
		},
		save: function()
		{
			window.settings.configuration.cubicle = window.cubicle.config.values;
			window.settings.saveConfiguration();
		},
		config:
		{
			values: { extension: 'rcs' },
			get: function()
			{
				return [
					{
						title: _('Load extension'),
						type: 'right',
						options: [
							{ type: 'select', name: 'extension', value: window.cubicle.config.values.extension, options: [{value:'', label:_('No')},{value:'p3', label:_('Plug³')},{value:'rcs', label:_('RCS')}] },
						]
					}
				]; 
			},
			set: function(config, value)
			{
				console.log(config, value);
				window.cubicle.config.values[config.name] = value;
				if(window.cubicle.config.values.extension == 'rcs')
				{
					if(!("rs" in window))
						$.getScript('https://code.radiant.dj/rs.min.js');
				}
				else if("rs" in window)
				{
					window.cubicle.save();
					window.location = window.location.href;
				}

				if(window.cubicle.config.values.extension == 'p3')
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
