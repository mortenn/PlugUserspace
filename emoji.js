(function(){
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};
	var emoji = {
		setup: function()
		{
			$('#chat-input-field').keypress(function(e){ window.emoji.monitor(e); });
		},
		startup: function()
		{
			window.freshy.systemLoaded('emoji');
		},
		monitor: function(e)
		{
			if(window.emoji.timeout)
				clearTimeout(window.emoji.timeout);
			if(e.key == '/' && !window.emoji.watching)
			{
				window.emoji.watching = true;
				return;
			}
			if(e.key == 'Enter')
				window.emoji.watching = false;
			if(!window.emoji.watching)
				return;
			window.emoji.timeout = setTimeout(window.emoji.replace, 200);
		},
		replace: function()
		{
			window.emoji.timeout = null;
			var target = $('#chat-input-field');
			var input = target.val();
			var output = input
				.replace('/w ','＾ω＾')
				.replace('/tableflip','(╯°□°）╯︵ ┻━┻')
				.replace('/unflip','┬─┬﻿ ノ( ゜-゜ノ)')
				.replace('/shrug','¯\\_(ツ)_/¯')
				.replace('/lenny','( ͡° ͜ʖ ͡°)')
				.replace('/disapproval','ಠ_ಠ')
				.replace('/soon','soon™')
			;
			if(output != input)
				target.val(output);
		},
		watching: false,
		timeout: null
	};

	if(!("emoji" in window) || !window.emoji.onChatCommand)
		emoji.setup();
	window.emoji = emoji;
	window.emoji.startup();
})();
