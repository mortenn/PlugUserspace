(function(){
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

			if(!("autoload" in config))
			{
				window.cubicle.config.values.autoload = false;
				window.settings.open();
			}
			else if(config.autoload)
				$.getScript('https://d1rfegul30378.cloudfront.net/files/plugCubed.js');
		},
		config:
		{
			values: { },
			get: function()
			{
				return [
					{
						title: 'Run Plug³ on startup',
						type: 'right',
						options: [
							{ type: 'select', name: 'autoload', value: window.cubicle.config.values.autoload ? '1' : '0', options: [{value:'0', label:'No'},{value:'1', label:'Yes'}] },
						]
					}
				]; 
			},
			set: function(config, value)
			{
				window.noisy.config.values[config.name] = value == '1';
				if(window.noisy.config.values.autoload && !("plugCubed" in window))
					$.getScript('https://d1rfegul30378.cloudfront.net/files/plugCubed.js');
				return value;
			}
		}
	};

	window.cubicle = cubicle;
	window.cubicle.load();
})();
