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
			var defaults = { extension: '' };
			window.freshy.waitFor('settings', function() { window.settings.setDefaults('cubicle', defaults); });
			window.freshy.systemLoaded('cubicle');
		},
		configure: function(config)
		{
			if(window.cubicle.config.values.extension != config.extension
				|| window.cubicle.config.values.extension == 'rcs')
			{
				window.cubicle.config.values = config;
				window.cubicle.activate();
			}
		},
		save: function()
		{
			window.settings.configuration.cubicle = window.cubicle.config.values;
			window.settings.saveConfiguration();
		},
		config:
		{
			values: { extension: '' },
			get: function()
			{
				return [
					{
						title: _('Load extension'),
						type: 'right',
						options: [
							{ type: 'select', name: 'extension', value: window.cubicle.config.values.extension, options: [{value:'', label:_('No')},{value:'p3', label:_('Plug³')}] },
						]
					}
				]; 
			},
			set: function(config, value)
			{
				console.log(config.name, value);
				if(window.cubicle.config.values[config.name] != value)
				{
					window.cubicle.config.values[config.name] = value;
					window.cubicle.activate();
					window.cubicle.save();
				}
				return value;
			}
		},
		activate: function()
		{
			if("rs" in window)
				setTimeout(function(){ window.rs.__close(); window.rs = { __close: function(){} }; }, 1);

			if(window.cubicle.config.values.extension != 'p3' && ("plugCubed" in window))
			{
				console.log('Deactive P3');
				setTimeout(function(){ window.plugCubed.close(); window.plugCubed = { close: function(){} }; }, 1);
			}

			if(window.cubicle.config.values.extension == 'p3')
			{
				console.log('Activate p3');
				$.getScript('https://d1rfegul30378.cloudfront.net/files/plugCubed.js');
			}
		}
	};

	if("cubicle" in window)
	{
		cubicle.config.values.extension = window.cubicle.config.values.extension;
	}
	window.cubicle = cubicle;
	window.cubicle.load();
})();
