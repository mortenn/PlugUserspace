(function (){
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};
	var freshy = {
		channels: {
			stable: 'i.animemusic.me/PlugUserspace',
			beta: 'plug.runsafe.no/beta'
		},
		channel: 'stable',
		systems: { freshy: 63 },
		failure: {},
		loaded: {},
		waits: {},
		notify: 1,
		modules: ['core'],
		errors: {},

		host: function() { return window.freshy.channels[window.freshy.channel]; },

		loadScript: function(script)
		{
			$.ajax(
				{ url: 'https://'+window.freshy.host()+'/'+script+'.js', dataType: 'script', timeout: 2000 }
			).fail(
				function()
				{
					if(window.freshy.channel == 'beta')
					{
						window.freshy.channel = 'stable';
						window.freshy.loadScript(script);
						return;
					}
					if(!(script in window.freshy.errors))
						window.freshy.errors[script] = 0;
					window.freshy.errors[script]++;
					if(window.freshy.errors[script] > 4)
					{
						window.chatalert.showError(
							_('Userspace script not loaded'),
							script + ' '+ _('did not finish loading within reasonable time.')+'<br/>'+_('Please check the console for errors.')
						);
						return;
					}
					setTimeout(function(){ window.freshy.loadScript(script); }, 500);
				}
			);
		},

		versionCheck: function()
		{
			for(var i = 0; i < window.freshy.modules.length; ++i)
				window.freshy.loadScript(window.freshy.modules[i]);
		},

		reload: function()
		{
			window.freshy.systems = { freshy: window.freshy.systems.freshy };
			window.freshy.versionCheck();
		},
		currentVersion: function(name, ver, role)
		{
			if(role > API.getUser().role)
				return;

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
							_('Userspace script not loaded'),
							name + ' ' + ver + ' '+ _('did not finish loading within reasonable time.')+'<br/>'+_('Please check the console for errors.')
						);
				};
				var timer = setTimeout(fail, 10000);
				window.freshy.waitFor(name, function(){ clearTimeout(timer); });
				window.freshy.loadScript(name);
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
					var modules = JSON.parse(window.localStorage['freshy.js-modules']);
					if(modules && modules.length > 0 && modules[0] == 'core')
						freshy.modules = modules;
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
				window.localStorage['freshy.js-modules'] = JSON.stringify(window.freshy.modules);
			}
		},
		onChatCommand: function(cmd)
		{
			if(cmd == '/update')
				window.freshy.versionCheck();
			if(cmd == '/status' || cmd == '/status ')
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
					for(var i = 0; i < window.freshy.modules.length; ++i)
						if(window.freshy.modules[i] == script[1])
							return;

					window.freshy.modules.push(script[1]);
					window.freshy.versionCheck();
					window.freshy.saveSettings();
					window.chatalert.showInformation(_('Library loaded'), _('The {library} library will be loaded each time you restart the page.').replace('{library}', script[1]));
				}
			}
			if(/^\/unload +[^ ]+/.test(cmd))
			{
				var script = /^\/unload +([^ ]+)/.exec(cmd);
				if(script)
				{
					var modules = [];
					var removed = false;
					for(var i = 0; i < window.freshy.modules.length; ++i)
						if(window.freshy.modules[i] != script[1])
							modules.push(window.freshy.modules[i]);
						else
							removed = true;

					if(removed)
					{
						window.freshy.modules = modules;
						window.freshy.versionCheck();
						window.freshy.saveSettings();
						window.chatalert.showInformation(_('Library unloaded'), _('The {library} library will not be loaded the next time you restart the page.').replace('{library}', script[1]));
					}
				}
			}
		},
		statusMessage: function()
		{
			var message = _('Currently on the <em>{channel}</em> updates channel').replace('{channel}', _(window.freshy.channel));
			message += '<br>'+_('Libraries')+': <em style="color: green">';
			for(var i = 0; i < window.freshy.modules.length; ++i)
				message += (i > 0 ? '</em>, <em style="color:green">' : '') + window.freshy.modules[i];
			message += '</em><br>';
			for(var system in window.freshy.systems)
			{
				message += _('{system} version {version}:').replace('{system}',system).replace('{version}', window.freshy.systems[system]) +
					' ' +
					(system in window.freshy.failure && window.freshy.failure[system] ? '<em style="color:red">'+_('loading error')+'</em>' :
						(system in window ? '<em style="color:green">'+_('running')+'</em>' : '<em style="color:red">'+_('not running')+'</em>')) +
					'<br>';
			}
			window.chatalert.showInformation(_('Userspace addons'), message);
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
			if(window.freshy.notify > 1)
				window.freshy.waitFor('babelfish', function(){
					window.freshy.waitFor('chatalert', function(){
						window.chatalert.showInformation(
							_('Userspace script ' + (window.freshy.loaded[system] ? 'updated' : 'loaded')),
							_('Loaded {channel} version {version} of <span style="color:#00d2ff">{system}.js</span>')
								.replace('{channel}', window.freshy.channel)
								.replace('{version}', window.freshy.systems[system])
								.replace('{system}', system)
						);
					});
				});
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
					channels.push({value:channel, label:_(channel)});
				return [
					{
						title: _('Userspace addon updater'),
						type: 'left',
						options: [
							{ type: 'select', name: 'channel', value: window.freshy.channel, options: channels },
							{
								type: 'select',
								name: 'notify',
								value: window.freshy.notify,
								options: [
									{ value: 0, label: _('Show nothing') },
									{ value: 1, label: _('Show errors') },
									{ value: 2, label: _('Show everything') }
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
			if(system != 'freshy')
				freshy.systems[system] = window.freshy.systems[system];
		freshy.waits = window.freshy.waits;
		freshy.modules = window.freshy.modules;
		window.freshy = freshy;
	}
	window.freshy.systemLoaded('freshy');

	if("console" in window && window.console)
		window.console.log('Plug Userspace Addon manager by docpify loaded. Report issues to @docpify in hummingbird-me or by email: morten@runsafe.no');

})();
