(function(){
	var chatfix = {
		botid: '23146932',
		setup: function()
		{
			API.on(API.CHAT, function(data){ window.chatfix.runfix(data); });
		},
		runfix: function(data)
		{
			if(data.uid == window.chatfix.botid)
				setTimeout(function(){window.chatfix.applyfix(data.cid);}, 10);
		},
		applyfix: function(cid)
		{
			$('.text.cid-'+cid).each(
				function()
				{
					var msg = $(this);
					msg.html(msg.html().replace(
						/^([^<][^:]*):/,
						'<span class="discordUser">$1</span>'
					));
				}
			);
		}
	};

	if(!("chatfix" in window))
		chatfix.setup();
	window.chatfix = chatfix;
	window.freshy.systemLoaded('chatfix');
})();
