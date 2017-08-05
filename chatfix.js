(function(){
	var chatfix = {
		botid: '23146932',
		emojis: {
			slightly_smiling_face: ':)',
			smile: ':D',
			disappointed: ':(',
			anguished: 'D:',
			confused: ':/',
			stuck_out_tongue: ':p',
			wink: ';)',
			stuck_out_tongue_winking_eye: ';p',
			heart: '<3',
			'<3': '<3',
			broken_heart: '</3',
			laughing: 'xD',
			dango: '🍡',
			ok_hand: '👌',
			point_right: '👉',
			point_left: '👈',
			point_down: '👇',
			point_up: '☝️',
			point_up_2: '👆',
			open_mouth: ':O',
			crying_cat_face: '=T_T=',
			smile_cat: '=^_^=',
			smiley_cat: '=^_^=',
			cat2: '🐈',
			sob: 'T_T',
			scream: '😱',
			sparkles: '✨',
			'+1': '👍'
		},
		setup: function()
		{
			API.on(API.CHAT, function(data){ window.chatfix.runfix(data); });
		},
		runfix: function(data)
		{
			if(data.uid == window.chatfix.botid || /:\S+:/.test(data.message))
				setTimeout(function(){window.chatfix.applyfix(data.cid);}, 10);
		},
		emojifix: function(message)
		{
			if($('#chat-emoji-button .icon-emoji-off').length == 0)
				return message;

			var n = 0;
			var pattern = /:([<0-9a-z_]*):/g;
			var match = pattern.exec(message, n);
			var out = message;
			while(match)
			{
				var fixed = (match[1] in window.chatfix.emojis) ?  window.chatfix.emojis[match[1]] : '<span style="color:red">:'+match[1]+':</span>';
				out = out.replace(':'+match[1]+':', fixed);
				var match = pattern.exec(message, match.index);
				if(match == null) break;
			}
			return out;
		},
		applyfix: function(cid)
		{
			$('.text.cid-'+cid).each(
				function()
				{
					var msg = $(this);
					var html = msg.html();
					if(cid.startsWith(window.chatfix.botid+'-'))
						html = html.replace(
							/^([^<][^:]*):/,
							'<span class="discordUser">$1</span>'
						);
					html = window.chatfix.emojifix(html);
					msg.html(html);
				}
			);
		}
	};

	if(!("chatfix" in window))
		chatfix.setup();
	window.chatfix = chatfix;
	window.freshy.systemLoaded('chatfix');
})();
