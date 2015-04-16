(function (){
	var soundbank = {
		sounds: [],
		loadedSounds: {},
		//hosts: [ 'https://i.animemusic.me/sounds/soundbank.js' ],
		hosts: [ 'https://plug.runsafe.no/beta/default-sounds.js' ],
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
				window.localStorage['soundbank-sounds'] = JSON.stringify(window.soundbank.sounds);
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
			if(!window.soundbank.loadedSounds[name])
				if(!window.soundbank.loadNamed(name))
					return;
			
			window.soundbank.loadedSounds[name].play();
		},
		loadNamed: function(name)
		{
			for(var i = 0; i < window.soundbank.sounds.length; ++i)
				if(window.soundbank.sounds[i].name == name)
					return window.soundbank.loadSound(window.soundbank.sounds[i]);
			return false;
		}
	};

	window.soundbank = soundbank;
	window.soundbank.loadNoises();
})();
