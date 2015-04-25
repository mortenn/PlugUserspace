(function (){
	var freshy = {
		channels: {
			stable: 'i.animemusic.me/PlugUserspace',
			beta: 'plug.runsafe.no/beta'
		},
		channel: 'stable',
		systems: {},
		failure: {},
		loaded: {},
		waits: {},
		notify: 1,
		libraries: ['core'],

		host: function() { return window.freshy.channels[window.freshy.channel]; },

		versionCheck: function()
		{
			for(var i = 0; i < window.freshy.libraries.length; ++i)
				$.getScript('https://'+window.freshy.host()+'/'+window.freshy.libraries[i]+'.js');
		},

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
				window.freshy.failure[name] = ver;
				var fail = function()
				{
					if(window.freshy.notify > 0 && "chatalert" in window)
						window.chatalert.showError(
							'Userspace script not loaded',
							name + ' version ' + ver + ' did not finish loading within reasonable time.<br/>Please check the console for errors.'
						);
				};
				var timer = setTimeout(fail, 10000);
				window.freshy.waitFor(name, function(){ clearTimeout(timer); });
				$.getScript('https://'+window.freshy.host()+'/' + name + '.js')
			}
		},
		loadSettings: function()
		{
			if("localStorage" in window && window["localStorage"] != null)
			{
				var stored = window.localStorage['freshy.js-update-channel'];
				if(stored)
					freshy.channel = stored;
				var notify = window.localStorage['freshy.js-notify'] * 1;
				if(!isNaN(notify))
					freshy.notify = notify;
				try
				{
					var libraries = JSON.parse(window.localStorage['freshy.js-libraries']);
					if(libraries && libraries.length > 0 && libraries[0] == 'core')
						freshy.libraries = libraries;
				}
				catch(e)
				{
					console.log(e);
				}
			}
		},
		saveSettings: function()
		{
			if("localStorage" in window && window["localStorage"] != null)
			{
				window.localStorage['freshy.js-update-channel'] = window.freshy.channel;
				window.localStorage['freshy.js-notify'] = window.freshy.notify;
				window.localStorage['freshy.js-libraries'] = JSON.stringify(window.freshy.libraries);
			}
		},
		onChatCommand: function(cmd)
		{
			if(cmd == '/update')
				window.freshy.versionCheck();
			if(cmd == '/status')
				window.freshy.statusMessage();
			if(cmd == '/reload')
			{
				window.freshy.systems = {};
				window.freshy.versionCheck();
			}
			if(/^\/load +[^ ]+/.test(cmd))
			{
				var script = /^\/load +([^ ]+)/.exec(cmd);
				if(script)
				{
					window.freshy.libraries.push(script[1]);
					window.freshy.versionCheck();
				}
			}
		},
		statusMessage: function()
		{
			var message = 'Currently on the <em>' + window.freshy.channel + '</em> updates channel<br>';
			for(var system in window.freshy.systems)
			{
				message += system + ' version ' + window.freshy.systems[system] + ': ' +
					(system in window.freshy.failure && window.freshy.failure[system] ? '<em style="color:red">loading error</em>' : 
						(system in window ? '<em style="color:green">running</em>' : '<em style="color:red">not running</em>')) +
					'<br>';
			}
			window.chatalert.showInformation('Userspace addons', message);
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
			window.freshy.failure[system] = false;
			if(window.freshy.notify > 1 && "chatalert" in window)
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
		},
		config:
		{
			get: function()
			{
				var channels = [];
				for(var channel in window.freshy.channels)
					channels.push({value:channel, label:channel});
				return [
					{
						title: 'Userspace addon updater',
						type: 'left',
						options: [
							{ type: 'select', name: 'channel', value: window.freshy.channel, options: channels },
							{
								type: 'select',
								name: 'notify',
								value: window.freshy.notify,
								options: [
									{ value: 0, label: 'Show nothing' },
									{ value: 1, label: 'Show errors' },
									{ value: 2, label: 'Show everything' }
								]
							}
						]
					},
				];
			},
			set: function(config, value)
			{
				if(config.name == 'channel' && value != window.noisy.channel)
				{
					window.freshy.channel = value;
					window.freshy.reload();
				}
				if(config.name == 'notify')
				{
					window.freshy.notify = value;
				}
				window.freshy.saveSettings();
			}
		}
	};

	freshy.loadSettings();
	if(!window.freshy)
	{
		API.on(API.CHAT_COMMAND, function(e){window.freshy.onChatCommand(e);});
		window.freshy = freshy;
		setInterval(function(){ window.freshy.versionCheck(); }, 600000);
		window.freshy.versionCheck();
	}
	else
	{
		for(var system in window.freshy.systems)
			freshy.systems = window.freshy.systems;
		freshy.waits = window.freshy.waits;
		freshy.libraries = window.freshy.libraries;
		window.freshy = freshy;
	}
	window.freshy.systemLoaded('freshy');

	if("console" in window && window.console)
		window.console.log('Plug Userspace Addon manager by docpify loaded. Report issues to @docpify in hummingbird-me or by email: morten@runsafe.no');

})();
