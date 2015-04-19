(function(){
	var settings = {
		hook: function()
		{
			var button = $(
'<div class="item addons" data-value="addons">'+
	'<i class="icon icon-import" />'+
	'<span class="label">Userspace addons</span>'+
'</div>'
			);
			button.click(function(){ window.settings.open(); });

			$('#user-menu div.addons').remove();
			$('#user-menu').append(button);
			window.freshy.systemLoaded('settings');
		},
		open: function()
		{
			window.settings.cleanup();
			var sections = $('<div class="container" style="height:85%;margin:2% 0 0 0;overflow:auto"></div>');
			for(var plugin in window.freshy.systems)
				if("config" in window[plugin])
					sections.append(window.settings.build(window[plugin]));

			var view = $(
'<div id="the-user-addons" class="user-content" style="position:absolute;z-index: 20000; left:250px; right: 375px; top: 72px; bottom: 72px; background:rgba(0,0,0,0.8);">'+
	'<div class="application section" style="height:100%">'+
		'<div style="width:30px;height:30px;float:right;cursor:pointer" class="close-button"><i class="icon icon-x-white" /></div>'+
		'<h1>Userspace addon settings</h1>'+
	'</div>'+
'</div>'
			);
			view.children('.section').append(sections);
			$('body').append(view);
			$('#the-user-addons .close-button').click(function(){window.settings.cleanup();});
		},
		build: function(plugin)
		{
			var config = plugin.config.get();
			if(!config || config.length == 0)
				return [];

			var block = $('<div></div>');
			for(var i = 0; i < config.length; ++i)
				block.append(window.settings.buildBlock(plugin, config[i]));

			return block;
		},
		buildBlock: function(plugin, config)
		{
			
			var block = $(
'<div style="' + (config.type == 'full' ? 'clear:both;' : 'width:49%;float:'+config.type+';')+'padding:1px">'+
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
		API.chatLog('Type /conf to access user addon settings');
		$('#user-menu .item').click(function(){window.settings.cleanup();});
	}

	window.settings = settings;
	window.settings.hook();
})();
