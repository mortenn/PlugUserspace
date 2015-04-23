(function (){
	var noisy = {
		configure: function(data)
		{
			window.noisy.config.values = data;
			$('#noisy-sound-button .icon').css('background-position', (window.noisy.config.values.noise?'0px 0px':'-30px 0px'));
			if(data.noise && !data.sound)
				window.settings.open();
		},
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
				//$('#chat .msg.cid-'+cid).css('background','rgba(32,32,0,0.8)');
				return window.noisy.trigger(username + ': ' + message);
			}

			if(message.match("@bouncers") && rank >= 2)
			{
				//$('#chat .msg.cid-'+cid).css('background','rgba(32,32,0,0.8)');
				return window.noisy.trigger(username + ': ' + message);
			}

			if(message.match("@managers") && rank >= 3)
			{
				//$('#chat .msg.cid-'+cid).css('background','rgba(32,32,0,0.8)');
				return window.noisy.trigger(username + ': ' + message);
			}

			if(message.match("@hosts") && rank >= 4)
			{
				//$('#chat .msg.cid-'+cid).css('background','rgba(32,32,0,0.8)');
				return window.noisy.trigger(username + ': ' + message);
			}
		},
		trigger: function(message)
		{
			if(window.noisy.config.values.popup)
				window.notify.show($('<span>'+message+'</span>').text(), window.noisy.config.values.delay * 1000);

			if(window.noisy.config.values.sound && window.noisy.config.values.noise)
				window.soundbank.play(window.noisy.config.values.sound);
		},
		load: function()
		{
			var defaults = window.noisy.config.values;
			window.freshy.waitFor('settings', function() { window.settings.setDefaults('noisy', defaults); });
			window.freshy.systemLoaded('noisy');
			var chatSound = $('#chat-sound-button');
			var muteSound = chatSound.children('.icon-chat-sound-on');
			if(muteSound.length == 1)
				muteSound.click();
			chatSound.hide();
			var noisyMute = $('#noisy-sound-button');
			noisyMute.remove();
			noisyMute = $('<div id="noisy-sound-button" class="chat-header-button" style="margin-left:13px"><i class="icon" style="background:url(https://'+window.freshy.host()+'/sprites.png);" /></div>');
			chatSound.after(noisyMute);
			noisyMute.click(function(){window.noisy.toggleMute();});
			$('#chat-emoji-button').css('margin-left', '0px');
		},
		save: function()
		{
			window.settings.configuration.noisy = window.noisy.config.values;
			window.settings.saveConfiguration();
		},
		toggleMute: function()
		{
			window.noisy.config.values.noise = !window.noisy.config.values.noise;
			$('#noisy-sound-button .icon').css('background-position', (window.noisy.config.values.noise?'0px 0px':'-30px 0px'));
		},
		config: 
		{
			values: { noise: true, popup: true, delay: 2, sound: undefined },
			get: function()
			{
				var sounds = window.noisy.config.values.sound ? [] : [{value: '', label: ''}];
				for(var i = 0; i < window.soundbank.config.values.sounds.length; ++i)
				{
					var sound = window.soundbank.config.values.sounds[i];
					if(!sound.hidden)
						sounds.push({value: sound.name, label: sound.name});
				}
				return [
					{
						title: 'Chat mention desktop notifications',
						type: 'right',
						options: [
							{ type: 'select', name: 'popup', value: window.noisy.config.values.popup ? '1' : '0', options: [{value:'0', label:'Off'},{value:'1', label:'On'}] },
							{ type: 'numberbox', size: 4, name: 'delay', value: window.noisy.config.values.delay, legend: ' seconds (-1 = infinite)' }
						]
					},
					{
						title: 'Chat mention sound notifications',
						type: 'right',
						options: [
							{ type: 'select', name: 'noise', value: window.noisy.config.values.noise ? '1' : '0', options: [{value:'0', label:'Off'},{value:'1', label:'On'}] },
							{ type: 'select', name: 'sound', value: window.noisy.config.values.sound, options: sounds }
						]
					}
				]; 
			},
			set: function(config, value)
			{
				var newValue = undefined;
				if(config.name == 'noise')
					window.noisy.config.values.noise = value == '1';
				if(config.name == 'popup')
					window.noisy.config.values.popup = value == '1';
				if(config.name == 'sound')
				{
					window.noisy.config.values.sound = value;
					window.soundbank.play(value);
				}
				if(config.name == 'delay')
				{
					var newValue = value * 1;
					if(!isNaN(newValue))
						window.noisy.config.values.delay = Math.min(9999, Math.max(-1, newValue));
					newValue = window.noisy.config.values.delay;
				}
				window.noisy.save();
				return newValue;
			}
		},
		initialized: true, // Backwards compatibility
		reloaded: false
	};

	if(!window.noisy)
		API.on(API.CHAT, function(e){ window.noisy.analyseChat(e); });
	else
		noisy.reloaded = true;
	window.noisy = noisy;
	window.noisy.load();
})();
