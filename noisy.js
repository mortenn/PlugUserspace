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
			if("notify" in window)
				window.notify.show(message);

			if("soundbank" in window && window.noisy.sound)
				window.soundbank.play(window.noisy.sound);
		},
		load: function()
		{
			if("localStorage" in window && window["localStorage"] != null)
			{
				window.noisy.noise = window.localStorage['noisy.js-nonoise'] != '1';
				window.noisy.popup = window.localStorage['noisy.js-nopopup'] != '1';
				var stored = window.localStorage['noisy.js-sound'];
				if(stored)
					window.noisy.sound = stored;
			}
			window.noisy.trigger('plug.dj chat notifications enabled');
		},
		save: function()
		{
			if("localStorage" in window && window["localStorage"] != null)
			{
				window.localStorage['noisy.js-nonoise'] = window.noisy.noise ? '0' : '1';
 				window.localStorage['noisy.js-nopopup'] = window.noisy.popup ? '0' : '1';
				window.localStorage['noisy.js-sound'] = window.noisy.sound;
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
						title: 'Chat mentions',
						type: 'right',
						options: [
							{ type: 'select', name: 'noise', value: window.noisy.noise ? '1' : '0', options: [{value:'0', label:'Sounds disabled'},{value:'1', label:'Sounds enabled'}] },
							{ type: 'select', name: 'popup', value: window.noisy.popup ? '1' : '0', options: [{value:'0', label:'Popup disabled'},{value:'1', label:'Popup enabled'}] },
							{ type: 'select', name: 'sound', value: window.noisy.sound, options: sounds }
						]
					},
				]; 
			},
			set: function(config, value)
			{
				if(config.name == 'noise')
					window.noisy.noise = value == '1';
				if(config.name == 'popup')
					window.noisy.popup = value == '1';
				if(config.name == 'sound')
				{
					window.noisy.sound = value;
					window.soundbank.play(value);
				}
				window.noisy.save();
			}
		},
		initialized: true, // Backwards compatibility
		sound: null,
		noise: true,
		popup: true
	};

	if(!window.noisy)
		API.on(API.CHAT, function(e){ window.noisy.analyseChat(e); });
	window.noisy = noisy;
	window.noisy.load();
})();
