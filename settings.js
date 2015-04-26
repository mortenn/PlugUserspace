(function(){
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};
	var settings = {
		configuration: {},
		defaults: {},
		hook: function()
		{
			var button = $(
'<div class="item addons" data-value="addons">'+
	'<i class="icon icon-import" />'+
	'<span class="label">'+_('Userspace addons')+'</span>'+
'</div>'
			);
			button.click(function(){ window.settings.open(); });

			$('#user-menu div.addons').remove();
			$('#user-menu').append(button);
			window.freshy.systemLoaded('settings');
		},
		loadConfiguration: function()
		{
			if("localStorage" in window && window.localStorage != null)
			{
				if('Userspace-Config' in window.localStorage && window.localStorage['Userspace-Config'])
					try
					{
						window.settings.configuration = JSON.parse(window.localStorage['Userspace-Config']);
					}
					catch(e)
					{
						console.log(e);
						window.settings.configuration = {};
					}
				for(system in window.settings.defaults)
					if(!(system in window.settings.configuration))
						window.settings.configuration = JSON.parse(JSON.stringify(window.settings.defaults[system]));
			}
			else
				window.freshy.waitFor('chatalert', function(){
					window.chatAlert.showError(
					 	_('Configuration unavailable'), 
						_('Your browser does not support local storage, unable to support persistent configuration!')
					);
				});
		},
		pushConfiguration: function(system)
		{
			window[system].configure(window.settings.configuration[system]);
		},
		saveConfiguration: function()
		{
			if("localStorage" in window && window.localStorage != null)
				window.localStorage['Userspace-Config'] = JSON.stringify(window.settings.configuration);
		},
		setDefaults: function(system, defaults)
		{
			window.settings.defaults[system] = defaults;
			if(!(system in window.settings.configuration))
				window.settings.configuration[system] = JSON.parse(JSON.stringify(defaults));
			window.settings.pushConfiguration(system);
		},
		open: function()
		{
			for(var plugin in window.freshy.systems)
			{
				var n = 0;
				if(!(plugin in window))
				{
					n++;
					freshy.waitFor(plugin, function(){ n--; if(n == 0) window.settings.open(); });
				}
				if(n > 0)
					return;
			}
			window.settings.cleanup();
			var sections = $('<div class="container" style="height:85%;margin:2% 0 0 0;overflow:auto"></div>');
			var side = {
				left: $('<div style="float:left;width:49%;padding:1px"></div>'),
				right: $('<div style="float:right;width:49%;padding:1px"></div>')
			};
			for(var plugin in window.freshy.systems)
				if(plugin in window && "config" in window[plugin])
				{
					var config = window[plugin].config.get();
					if(config && config.length > 0)
						for(var i = 0; i < config.length; ++i)
							side[config[i].type].append(window.settings.buildBlock(window[plugin], config[i]));
				}

			var view = $(
'<div id="the-user-addons" class="user-content" style="position:absolute;z-index: 20000; left:250px; right: 375px; top: 72px; bottom: 72px; background:rgba(0,0,0,0.8);">'+
	'<div class="application section" style="height:100%">'+
		'<div style="width:30px;height:30px;float:right;cursor:pointer" class="close-button"><i class="icon icon-x-white" /></div>'+
		'<h1>'+_('Userspace addon settings')+'</h1>'+
	'</div>'+
'</div>'
			);
			view.children('.section').append(sections.append(side.left, side.right));
			$('body').append(view);
			$('#the-user-addons .close-button').click(function(){window.settings.cleanup();});
		},
		buildBlock: function(plugin, config)
		{
			
			var block = $(
'<div style="padding:1px">'+
	'<div class="header" style="margin:5px 0;"><span>'+config.title+'</span></div>'+
'</div>'
			);

			for(var i = 0; i < config.options.length; ++i)
				block.append(window.settings.buildOption(plugin, config.options[i]));

			return block;
		},
		buildOption: function(plugin, config)
		{
			if(config.type == 'select')
			{
				var select = $('<select>');
				select.change(function(){ window.settings.optionChanged(this); });
				select.data('plugin', plugin);
				select.data('config', config);

				for(var i = 0; i < config.options.length; ++i)
					select.append($('<option value="'+config.options[i].value+'">'+config.options[i].label+'</option>'));

				select.val(config.value);
				return select;
			}
			if(config.type == 'custom')
				return config.content;
			if(config.type == 'numberbox')
			{
				var box = $('<input style="text-align:right" type="text" size="'+config.size+'" />');
				box.keyup(function(){ window.settings.textChanged(this); });
				box.data('plugin', plugin);
				box.data('config', config);
				box.val(config.value);
				if("legend" in config)
					return $('<span>'+config.legend+'</span>').prepend(box);
				return box;
			}
			if(config.type == 'textbox')
			{
				var box = $('<input type="text" size="'+config.size+'" />');
				box.keyup(function(){ window.settings.textChanged(this); });
				box.data('plugin', plugin);
				box.data('config', config);
				box.val(config.value);
				if("legend" in config)
					return $('<span>'+config.legend+'</span>').prepend(box);
				return box;
			}
		},
		textChanged: function(element)
		{
			var box = $(element);
			box.val(box.data('plugin').config.set(box.data('config'), box.val()));
		},
		optionChanged: function(element)
		{
			var select = $(element);
			select.data('plugin').config.set(select.data('config'), select.val());
		},
		cleanup: function()
		{
			$('#the-user-addons').remove();
		},
		onChatCommand: function(command)
		{
			if(command == '/conf')
				window.settings.open();
		}
	};

	if("settings" in window)
		window.settings.cleanup();
	else
	{
		API.on(API.CHAT_COMMAND, function(e){window.settings.onChatCommand(e);});
		window.freshy.waitFor('chatalert', function(){
			window.freshy.waitFor('babelfish', function(){
				window.chatalert.showInformation(
					_('Userspace addons loaded'),
					_('Type /conf to access user addon settings')
				);
			});
		});
		$('#user-menu .item').click(function(){window.settings.cleanup();});
	}

	window.settings = settings;
	window.settings.loadConfiguration();
	window.settings.hook();
})();
