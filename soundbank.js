(function (){
	var soundbank = {
		sounds: [],
		loadedSounds: {},
		hosts: [ 'https://i.animemusic.me/sounds/soundbank.js' ],
		install: function(sounds)
		{
			var newSounds = [];
			for(var i = 0; i < sounds.length; ++i)
				if(!window.soundbank.haveNoise(sounds[i]))
					newSounds.push(sounds[i]);
			for(var i = 0; i < newSounds.length; ++i)
			{
				window.soundbank.sounds.push(newSounds[i]);
				if(newSounds[i].preload)
					window.soundbank.loadSound(newSounds[i]);
			}
			window.soundbank.saveNoises();
		},
		haveNoise: function(noise)
		{
			for(var i = 0; i < window.soundbank.sounds.length; ++i)
				if(window.soundbank.sounds[i].name == noise.name)
					return true;
		},
		saveNoises: function()
		{
			if("localStorage" in window && window["localStorage"] != null)
			{
				window.localStorage['soundbank-sounds'] = JSON.stringify(window.soundbank.sounds);
				window.localStorage['soundbank-mute'] = window.soundbank.mute ? '1' : '0';
			}
		},
		loadNoises: function()
		{
			if("localStorage" in window && window["localStorage"] != null && window.localStorage['soundbank-sounds'])
			{
				var stored = JSON.parse(window.localStorage['soundbank-sounds']);
				if(stored)
				{
					window.soundbank.sounds = stored;
					for(var i = 0; i < window.soundbank.sounds.length; ++i)
						if(window.soundbank.sounds[i].preload)
							window.soundbank.loadSound(window.soundbank.sounds[i]);
				}
				if('soundbank-mute' in window.localStorage)
					window.soundbank.mute = window.localStorage['soundbank-mute'] == '1';
			}
			for(var i = 0; i < window.soundbank.hosts.length; ++i)
				$.getScript(window.soundbank.hosts[i]);
		},
		loadSound: function(sound)
		{
			window.soundbank.loadedSounds[sound.name] = new Audio(decodeURIComponent(sound.file));
			window.soundbank.loadedSounds[sound.name].volume = sound.volume / 100.0;
			return true;
		},
		play: function(name)
		{
			if(window.soundbank.mute)
				return;

			if(!window.soundbank.loadedSounds[name] && !window.soundbank.loadNamed(name))
				return;

			window.soundbank.loadedSounds[name].play();
		},
		loadNamed: function(name)
		{
			for(var i = 0; i < window.soundbank.sounds.length; ++i)
				if(window.soundbank.sounds[i].name == name)
					return window.soundbank.loadSound(window.soundbank.sounds[i]);
			return false;
		},
		config: 
		{
			get: function()
			{
				return [
					{
						title: 'Sound notifications',
						type: 'left',
						options: [
							{ type: 'select', name: 'enabled', value: window.soundbank.mute ? '0' : '1', options: [{value:'0', label:'Sounds disabled'},{value:'1', label:'Sounds enabled'}] },
							{ type: 'custom', content: window.soundbank.config.getSoundList() }
						]
					},
				]; 
			},
			set: function(config, value)
			{
				if(config.name == 'enabled')
				{
					window.soundbank.mute = (value == 0);
				}
				else if(config.name == 'volume')
				{
					var newValue = value * 1;
					if("sound" in config)
					{
						if(!isNaN(newValue))
							window.soundbank.sounds[config.sound].volume = Math.min(100,Math.max(0, newValue));
						value = window.soundbank.sounds[config.sound].volume;
					}
					else
					{
						if(!isNaN(newValue))
							window.soundbank.volume = Math.min(100,Math.max(0, newValue));
						value = window.soundbank.volume;
					}
					window.soundbank.applyVolume();
				}
				else if(config.name == 'preload')
				{
					window.soundbank.sounds[config.idx].preload = (value == '1');
					if(window.soundbank.sounds[config.idx].preload)
						window.soundbank.loadSound(window.soundbank.sounds[config.idx]);
				}
				window.soundbank.saveNoises();
				return value;
			},
			applyVolume: function()
			{
				for(var i = 0; i < window.soundbank.sounds.length; ++i)
				{
					var name = window.soundbank.sounds[i].name;
					if(name in window.soundbank.loadedSounds)
						window.soundbank.loadedSounds[name].volume = (window.soundbank.sounds[i].volume / 100.0) * (window.soundbank.volume / 100.0);
				}
			},
			getSoundList: function()
			{
				var list = $('<table><tr><th>Name</th><th>Volume</th><th>Preload</th></table>');
				for(var i = -1; i < window.soundbank.sounds.length; ++i)
					list.append(window.soundbank.config.getSoundConfigurator(i));
				return list;
			},
			getSoundConfigurator: function(idx)
			{
				if(idx < 0)
				{
					var item = $('<tr><td>Master channel</td></tr>');
					var volume = $('<input style="text-align:right"type="text" size="3"/>');
					volume.val(window.soundbank.volume);
						volume.keyup(function(){
						var validated = window.soundbank.config.set({name: 'volume'}, volume.val());
						if(validated != volume.val())
							volume.val(validated);
					});
					item.append($('<td></td>').append(volume));
					return item;
				}
				var sound = window.soundbank.sounds[idx];
				var item = $('<tr></tr>').append($('<td style="cursor:pointer">'+sound.name+'</td></tr>').click(function(){window.soundbank.play(sound.name);}));
				var volume = $('<input style="text-align:right"type="text" size="3"/>');
				volume.val(sound.volume);
				volume.keyup(function(){
					var validated = window.soundbank.config.set({name: 'volume', sound: idx }, volume.val());
					if(validated != volume.val())
						volume.val(validated);
				});
				item.append($('<td></td>').append(volume));
				item.append($('<td></td>').append(
					window.settings.buildOption(window.soundbank, 
					{
						type: 'select',
						name: 'preload',
						idx: idx,
						value: window.soundbank.sounds[idx].preload ? '1' : '0',
						options: [{value:'0',label:'No'},{value:'1',label:'Yes'}]
					})
				));
				return item;
			}
		},
		mute: false,
		volume: 100
	};

	window.soundbank = soundbank;
	window.soundbank.loadNoises();
})();
