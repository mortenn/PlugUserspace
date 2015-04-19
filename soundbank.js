(function (){
	var soundbank = {
		sounds: [],
		loadedSounds: {},
		hosts: [ 'https://i.animemusic.me/sounds/soundbank.js' ],
		configure: function(data)
		{
			window.soundbank.hosts = data.hosts;
			window.soundbank.sounds = data.sounds;
			window.soundbank.mute = data.mute;
			window.soundbank.volume = data.volume;
			for(var i = 0; i < window.soundbank.sounds.length; ++i)
				if(window.soundbank.sounds[i].preload)
					window.soundbank.loadSound(window.soundbank.sounds[i]);
			window.soundbank.getHostedNoises();
		},
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
			window.soundbank.save();
		},
		installCustom: function(name, file, volume, preload)
		{
			if(file.val().trim() == '')
			{
				file.focus();
				return;
			}
			if(name.val().trim() == '' || window.soundbank.haveNoise(name.val().trim()))
			{
				name.focus();
				return;
			}
			window.soundbank.install(
				[{ file: file.val().trim(), name: name.val().trim(), volume: volume.val() * 1, preload: preload.val() == 1 }]
			);
			window.settings.open();
		},
		haveNoise: function(noise)
		{
			for(var i = 0; i < window.soundbank.sounds.length; ++i)
				if(window.soundbank.sounds[i].name == noise.name)
					return true;
		},
		save: function()
		{
			window.settings.configuration.soundbank = {
				sounds: window.soundbank.sounds,
				volume: window.soundbank.volume,
				hosts: window.soundbank.hosts,
				mute: window.soundbank.mute
			};
			window.settings.saveConfiguration();
		},
		load: function()
		{
			window.freshy.systemLoaded('soundbank');
			window.freshy.waitFor('settings', function()
			{
				window.settings.setDefaults('soundbank', { hosts: [ 'https://i.animemusic.me/sounds/soundbank.js' ], sounds: [], mute: 0, volume: 100 });
			});
		},
		getHostedNoises: function()
		{
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
							{ type: 'select', name: 'reset', value: 0, options: [{value: 0, label:'Reset'},{value: 1, label:'Reload from host'}] },
							{ type: 'custom', content: window.soundbank.config.getSoundList() }
						]
					},
					{
						title: 'Add custom notification sound',
						type: 'left',
						options: [
							{ type: 'custom', content: window.soundbank.config.getCustomForm() }
						]
					}
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
					window.soundbank.config.applyVolume();
				}
				else if(config.name == 'preload')
				{
					window.soundbank.sounds[config.idx].preload = (value == '1');
					if(window.soundbank.sounds[config.idx].preload)
						window.soundbank.loadSound(window.soundbank.sounds[config.idx]);
				}
				else if(config.name == 'reset' && value == 1)
				{
					window.soundbank.sounds = [];
					window.soundbank.loadedSounds = {};
					window.soundbank.getHostedNoises();
					window.settings.cleanup();
					return 0;
				}
				window.soundbank.save();
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
			getCustomForm: function()
			{
				var name = $('<input type="text" size="15" />');
				var file = $('<input type="text" size="28" />');
				var volume = $('<input type="text" size="3" value="100" />%');
				var preload = $('<select><option value="0">No</option><option value="1">Yes</option></select>');
				preload.val(1);
				var submit = $('<button><i class="icon icon-check-purple" /></button>');
				submit.click(function(){ window.soundbank.installCustom(name, file, volume, preload); });
				volume.keyup(function()
				{
					var newValue = volume.val() * 1;
					if(isNaN(newValue) || newValue < 0 || newValue > 100)
						return false;
					return true;
				});
				return $('<table></table>')
					.append($('<tr><th>Name</th><th>Volume</th><th>Preload</th></tr>'))
					.append($('<tr></tr>').append(name).append($('<td></td').append(name), $('<td></td>').append(volume), $('<td></td>').append(preload)))
					.append($('<tr><th colspan="3">Soundfile (must use https://)</th></tr>'))
					.append($('<tr></tr>').append($('<td colspan="3"></td>').append(file)))
					.append($('<tr></tr>').append($('<td colspan="3"></td>').append(submit)));
			},
			getSoundList: function()
			{
				var list = $('<table style="position:relative"><tr><th style="width:15px;">&nbsp</th><th>Name</th><th>Volume</th><th>Preload</th></table>');
				for(var i = -1; i < window.soundbank.sounds.length; ++i)
					list.append(window.soundbank.config.getSoundConfigurator(i));
				return list;
			},
			getSoundConfigurator: function(idx)
			{
				if(idx < 0)
				{
					var item = $('<tr><td>&nbsp;</td><td>Master channel</td></tr>');
					var volume = $('<input style="text-align:right"type="text" size="3"/>');
					volume.val(window.soundbank.volume);
						volume.keyup(function(){
						var validated = window.soundbank.config.set({name: 'volume'}, volume.val());
						if(validated != volume.val())
							volume.val(validated);
					});
					item.append($('<td></td>').append(volume).append('%'));
					return item;
				}
				var sound = window.soundbank.sounds[idx];

				var volume = $('<input style="text-align:right"type="text" size="3"/>');
				volume.val(sound.volume);
				volume.keyup(function(){
					var validated = window.soundbank.config.set({name: 'volume', sound: idx }, volume.val());
					if(validated != volume.val())
						volume.val(validated);
				});
				return $('<tr></tr>')
					.append($('<td style="cursor:pointer"><i class="icon icon-chat-admin" />&nbsp;</td>').click(function(){window.soundbank.play(sound.name);}))
					.append($('<td>'+sound.name+'</td>'))
					.append($('<td></td>').append(volume).append('%'))
					.append($('<td></td>').append(
						window.settings.buildOption(window.soundbank, 
						{
							type: 'select',
							name: 'preload',
							idx: idx,
							value: window.soundbank.sounds[idx].preload ? '1' : '0',
							options: [{value:'0',label:'No'},{value:'1',label:'Yes'}]
						}
					)
				));
			}
		},
		mute: false,
		volume: 100
	};

	window.soundbank = soundbank;
	window.soundbank.load();
})();
