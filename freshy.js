(function (){
	var freshy = {
		host: 'plug.runsafe.no/beta',
		systems: {
			freshy: { file: 'freshy.js', name: 'freshy', version: 1 },
			soundbank: { file: 'soundbank.js', name: 'soundbank', version: 0 }
		},
		versionCheck: function()
		{
			for(var name in window.freshy.systems)
				$.getScript('https://'+window.freshy.host+'/version.'+window.freshy.systems[name].file);
		},
		currentVersion: function(name, ver)
		{
			if(ver * 1 > window.freshy.systems[name].version)
			{
				window.freshy.systems[name].version = ver;
				if(window.console && window.console.log)
					window.console.log('Loading version ' + ver + ' of ' + window.freshy.systems[name].file + ' from ' + window.freshy.host);
				$.getScript('https://'+window.freshy.host+'/' + window.freshy.systems[name].file);
			}
		}
	};

	if(!window.freshy)
		setInterval(function(){ window.freshy.versionCheck(); }, 900000);

	window.freshy = freshy;
	window.freshy.versionCheck();
})();
