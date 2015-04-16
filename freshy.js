(function (){
	var freshy = {
		host: 'plug.runsafe.no/beta',
		systems: {},
		versionCheck: function()
		{
			$.getScript('https://'+window.freshy.host+'/version.js');
		},
		currentVersion: function(name, ver)
		{
			if(!(name in window.freshy.systems))
				window.freshy.systems[name] = name == 'freshy' ? ver : 0;

			if(ver * 1 > window.freshy.systems[name])
			{
				window.freshy.systems[name] = ver;
				if(window.console && window.console.log)
					window.console.log('Loading version ' + ver + ' of ' + name + '.js from ' + window.freshy.host);
				$.getScript('https://'+window.freshy.host+'/' + name + '.js');
			}
		}
	};

	if(!window.freshy)
		setInterval(function(){ window.freshy.versionCheck(); }, 60000);
	else
	{
		for(var system in window.freshy.systems)
			freshy.systems = window.freshy.systems;
	}

	window.freshy = freshy;
	window.freshy.versionCheck();
})();
