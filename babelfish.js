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
			configuration.language = API.getUser().language;
			if(configuration.language != window.babelfish.config.values.language)
				window.babelfish.loadLanguageFile(configuration.language);
			else
				window.freshy.systemLoaded('babelfish');
		},
		messages: {},
		strings: {},
		translate: function(message)
		{
			if(window.babelfish.reportTimeout)
				clearTimeout(window.babelfish.reportTimeout);
			window.babelfish.reportTimeout = setTimeout(window.babelfish.report, 10000);
			if(!(message in window.babelfish.strings))
				window.babelfish.strings[message] = 1;
			else
				window.babelfish.strings[message]++;

			if(window.babelfish.config.values.language == 'en')
				return message;

			if(message in window.babelfish.messages)
				return window.babelfish.messages[message];
			return message;
		},
		setup: function()
		{
			API.on(API.CHAT_COMMAND, function(e){ window.babelfish.onChatCommand(e); });
		},
		load: function()
		{
			var defaults = { language: null };
			window.freshy.waitFor('settings', function() { window.settings.setDefaults('babelfish', defaults); });
			$.getJSON(
				'https://i.animemusic.me/animemusic/tr.php?load=languages',
				function(languages)
				{
					window.babelfish.config.translations = languages;
				}
			);
			$.getJSON(
				'https://i.animemusic.me/animemusic/tr.php?load=strings',
				function(strings)
				{
					for(var i in strings)
						window.babelfish.strings[strings[i]] = 0;
				}
			);
		},
		report: function()
		{
			window.babelfish.reportTimeout = false;
			var report = [];
			for(var string in window.babelfish.strings)
				if(window.babelfish.strings[string] > 0)
				{
					window.babelfish.strings[string] -= 100;
					report.push(string);
				}
			$.post(
				'https://i.animemusic.me/animemusic/tr.php',
				JSON.stringify(report),
				function(){},
				'json'
			);
		},
		reportTimeout: false,
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
			console.log('Got request to load language file '+language);
			$.getJSON(
				'https://i.animemusic.me/animemusic/tr.php?load=lang&lang='+language+'&_='+(new Date().getTime()),
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
			translations: [],
			values: { language: null },
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
