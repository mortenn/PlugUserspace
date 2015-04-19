(function (){
	var freshy = {
		channels: {
			stable: 'i.animemusic.me',
			beta: 'plug.runsafe.no/beta'
		},
		channel: 'beta',
		//channel: 'stable',
		systems: {},
		loaded: {},
		waits: {},

		host: function() { return window.freshy.channels[window.freshy.channel]; },

		versionCheck: function() { $.getScript('https://'+window.freshy.host()+'/version.js'); },

		reload: function()
		{
			window.freshy.systems = { freshy: window.freshy.systems.freshy };
			window.freshy.versionCheck();
		},
		currentVersion: function(name, ver)
		{
			if(!(name in window.freshy.systems))
			{
				window.freshy.systems[name] = name == 'freshy' ? ver : 0;
				window.freshy.loaded[system] = false;
			}

			if(ver * 1 > window.freshy.systems[name])
			{
				window.freshy.systems[name] = ver;
				if("chatalert" in window)
					window.chatalert.showInformation(
						'Userspace script updated',
						'Loading ' + window.freshy.channel + ' version ' + ver + ' of ' + name + '.js'
					);
				$.getScript('https://'+window.freshy.host()+'/' + name + '.js');
			}
		},
		loadSettings: function()
		{
			if("localStorage" in window && window["localStorage"] != null)
			{
				var stored = window.localStorage['freshy.js-update-channel'];
				if(stored)
					freshy.channel = stored;
			}
		},
		onChatCommand: function(cmd)
		{
			if(cmd == '/update')
				window.freshy.versionCheck();
			if(cmd == '/reload')
			{
				window.freshy.systems = {};
				window.freshy.versionCheck();
			}
		},
		waitFor: function(system, callback)
		{
			if((system in window.freshy.loaded) && window.freshy.loaded[system])
				callback();
			else
			{
				if(system in window.freshy.waits)
					window.freshy.waits[system].push(callback);
				else
					window.freshy.waits[system] = [callback];
			}
		},
		systemLoaded: function(system)
		{
			if("chatalert" in window)
				window.chatalert.showInformation(
					'Userspace script ' + (window.freshy.loaded[system] ? 'updated' : 'loaded'),
					'Loaded ' + window.freshy.channel + ' version ' + window.freshy.systems[system] + ' of ' + system + '.js'
				);
			window.freshy.loaded[system] = true;
			if(system in window.freshy.waits)
			{
				for(var i = 0; i < window.freshy.waits[system].length; ++i)
					window.freshy.waits[system][i]();
				window.freshy.waits[system] = [];
			}
		}
	};

	freshy.loadSettings();
	if(!window.freshy)
	{
		API.on(API.CHAT_COMMAND, function(e){window.freshy.onChatCommand(e);});
		window.freshy = freshy;
		setInterval(function(){ window.freshy.versionCheck(); }, 60000);
		window.freshy.versionCheck();
	}
	else
	{
		for(var system in window.freshy.systems)
			freshy.systems = window.freshy.systems;
		freshy.waits = window.freshy.waits;
		window.freshy = freshy;
	}
	window.freshy.systemLoaded('freshy');

})();
