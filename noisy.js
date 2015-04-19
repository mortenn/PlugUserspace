(function (){
	var noisy = {
		analyseChat: function (chat)
		{
			var message = chat.message;
			if(!message.match("@"))
				return;

			var me = API.getUser().username;
			var rank = API.getUser().role;
			var username = chat.un;
			var cid = chat.cid;

			if(message.match("@" + me))
			{
				$('#chat .msg.cid-'+cid).css('background','rgba(32,32,0,0.8)');
				return window.noisy.trigger(username + ': ' + message);
			}

			if(message.match("@bouncers") && rank >= 2)
			{
				$('#chat .msg.cid-'+cid).css('background','rgba(32,32,0,0.8)');
				return window.noisy.trigger(username + ': ' + message);
			}

			if(message.match("@managers") && rank >= 3)
			{
				$('#chat .msg.cid-'+cid).css('background','rgba(32,32,0,0.8)');
				return window.noisy.trigger(username + ': ' + message);
			}

			if(message.match("@hosts") && rank >= 4)
			{
				$('#chat .msg.cid-'+cid).css('background','rgba(32,32,0,0.8)');
				return window.noisy.trigger(username + ': ' + message);
			}
		},
		trigger: function(message)
		{
			window.notify.show(message, window.noisy.delay * 1000);

			if(window.noisy.sound)
				window.soundbank.play(window.noisy.sound);
		},
		load: function()
		{
			if(!window.noisy.reloaded)
				window.freshy.waitFor('notify', function(){
					window.freshy.waitFor('soundbank', function(){
						window.noisy.trigger('plug.dj chat notifications enabled');
					})
				});

			if("localStorage" in window && window["localStorage"] != null)
			{
				window.noisy.noise = window.localStorage['noisy.js-nonoise'] != '1';
				window.noisy.popup = window.localStorage['noisy.js-nopopup'] != '1';
				window.noisy.delay = window.localStorage['noisy.js-delay'] * 1;
				if(isNaN(window.noisy.delay))
					window.noisy.delay = 2;
				var stored = window.localStorage['noisy.js-sound'];
				if(stored)
					window.noisy.sound = stored;
				else
					window.freshy.waitFor('settings', function(){ window.settings.open(); });

				window.freshy.systemLoaded('noisy');
			}
		},
		save: function()
		{
			if("localStorage" in window && window["localStorage"] != null)
			{
				window.localStorage['noisy.js-nonoise'] = window.noisy.noise ? '0' : '1';
 				window.localStorage['noisy.js-nopopup'] = window.noisy.popup ? '0' : '1';
				window.localStorage['noisy.js-sound'] = window.noisy.sound;
				window.localStorage['noisy.js-delay'] = window.noisy.delay;
			}
		},
		config: 
		{
			get: function()
			{
				var sounds = [];
				for(var i = 0; i < window.soundbank.sounds.length; ++i)
				{
					var sound = window.soundbank.sounds[i];
					sounds.push({value: sound.name, label: sound.name});
				}
				return [
					{
						title: 'Chat mention desktop notifications',
						type: 'right',
						options: [
							{ type: 'select', name: 'popup', value: window.noisy.popup ? '1' : '0', options: [{value:'0', label:'Off'},{value:'1', label:'On'}] },
							{ type: 'numberbox', size: 4, name: 'delay', value: window.noisy.delay, legend: ' seconds (-1 = infinite)' }
						]
					},
					{
						title: 'Chat mention sound notifications',
						type: 'right',
						options: [
							{ type: 'select', name: 'noise', value: window.noisy.noise ? '1' : '0', options: [{value:'0', label:'Off'},{value:'1', label:'On'}] },
							{ type: 'select', name: 'sound', value: window.noisy.sound, options: sounds }
						]
					}
				]; 
			},
			set: function(config, value)
			{
				var newValue = undefined;
				if(config.name == 'noise')
					window.noisy.noise = value == '1';
				if(config.name == 'popup')
					window.noisy.popup = value == '1';
				if(config.name == 'sound')
				{
					window.noisy.sound = value;
					window.soundbank.play(value);
				}
				if(config.name == 'delay')
				{
					var newValue = value * 1;
					if(!isNaN(newValue))
						window.noisy.delay = Math.min(9999, Math.max(-1, newValue));
					newValue = window.noisy.delay;
				}
				window.noisy.save();
				return newValue;
			}
		},
		initialized: true, // Backwards compatibility
		sound: null,
		noise: true,
		popup: true,
		delay: 2,
		reloaded: false
	};

	if(!window.noisy)
		API.on(API.CHAT, function(e){ window.noisy.analyseChat(e); });
	else
		noisy.reloaded = true;
	window.noisy = noisy;
	window.noisy.load();
})();
