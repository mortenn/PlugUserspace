(function(){
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};
	var babelfish = {
		configure: function(configuration)
		{
			if(configuration.language != window.babelfish.config.values.language)
				window.babelfish.loadLanguageFile(configuration.language);
			else
				window.freshy.systemLoaded('babelfish');
		},
		messages: {},
		translate: function(message)
		{
			if(window.babelfish.config.values.language == 'en')
				return message;

			if(message in window.babelfish.messages)
				return window.babelfish.messages[message];
			console.log(_('Missing translation:') + ' "' + message + '" '+_('in language')+' '+window.babelfish.config.values.language);
			return message;
		},
		setup: function()
		{
			API.on(API.CHAT_COMMAND, function(e){ window.babelfish.onChatCommand(e); });
		},
		load: function()
		{
			var defaults = { language: window.babelfish.validateLanguage(API.getUser().language) };
			window.freshy.waitFor('settings', function() { window.settings.setDefaults('babelfish', defaults); });
		},
		validateLanguage: function(language)
		{
			for(var i=0; i < window.babelfish.config.translations.length; ++i)
				if(window.babelfish.config.translations[i].value == language)
					return language;
			return 'en';
		},
		save: function()
		{
			window.settings.configuration.babelfish = window.babelfish.config.values;
			window.settings.saveConfiguration();
		},
		loadLanguageFile: function(language)
		{
			if(language == 'en')
			{
				window.babelfish.messages = {};
				window.babelfish.config.values.language = language;
				window.babelfish.save();
				return;
			}
			$.getJSON(
				'https://'+window.freshy.host()+'/lang/'+language+'.js?_='+(new Date().getTime()),
				function(messages)
				{
					window.babelfish.messages = messages;
					window.babelfish.config.values.language = language;
					window.settings.cleanup();
					window.babelfish.save();
					window.freshy.systemLoaded('babelfish');
				}
			).fail(function(e,a,b)
			{
				console.log(a,b);
				window.freshy.systemLoaded('babelfish');
			});
		},
		config:
		{
			translations: [
				{ value: 'en', label: 'English' },
				{ value: 'fr', label: 'Français' },
				{ value: 'nb', label: 'Norsk (bokmål)' },
			],
			values: { language: 'en' },
			get: function()
			{
				return [{
					title: _('Translate userspace addons'),
					type: 'right',
					options: [
						{
							type: 'select',
							name: 'language',
							value: window.babelfish.config.values.language,
							options: window.babelfish.config.translations
						}
					]
				}];
			},
			set: function(config, value)
			{
				if(config.name == 'language')
				{
					window.babelfish.loadLanguageFile(value);
					window.settings.cleanup();
				}
			}
		},
		onChatCommand: function(command)
		{
			if(/\/tr ([a-z]+)/.test(command))
			{
				var translate = /\/tr ([a-z]+)/.exec(command);
				window.babelfish.config.set({name: 'language'}, translate[1]);
			}
		}
	};

	if(!("babelfish" in window))
		babelfish.setup();
	else
	{
		babelfish.config.values = window.babelfish.config.values;
		babelfish.messages = window.babelfish.messages;
	}
	window.babelfish = babelfish;
	window.babelfish.load();
})();
