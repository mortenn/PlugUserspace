(function(){
	var chatalert = {
		showInformation: function(title, body)
		{
			window.chatalert.show('icon-volume-off', title, body, 'a5dc42');
		},
		showWarning: function(title, body)
		{
			window.chatalert.show('icon-volume-half', title, body, 'dca542');
		},
		showError: function(title, body)
		{
			window.chatalert.show('icon-volume-on', title, body, 'a54242');
		},
		show: function(icon, title, body, color)
		{
			var chatLog = $('#chat-messages');
			var now = new Date();
			var hour = now.getHours();
			var minute = now.getMinutes();
			if(minute < 10)
				minute = '0' + minute;
			chatLog.append($(
'<div class="cm" style="margin:4px;box-shadow: inset 0 0 0 1px #'+color+';background:#282c35">'+
	'<div class="badge-box"><i class="icon '+icon+'"></i></div>'+
	'<div class="msg">'+
		'<div class="from">'+
			'<span class="un" style="color:#'+color+'">'+title+'</span>'+
			'<span class="timestamp" style="display:inline;color:#'+color+'">'+hour+':'+minute+'</span>'+
		'</div>'+
		'<div class="text cid-undefined">'+body+'</div>'+
	'</div>'+
'</div>'
			));
			chatLog.scrollTop(chatLog.prop('scrollHeight'));
		}
	};

	if(!window.chatalert)
		setTimeout(
			function(){
				chatalert.showInformation('Extension loaded', 'This is a test message to let you know freshy successfully loaded chatalert.js!');
			}, 10
		);

	window.chatalert = chatalert;
})();
