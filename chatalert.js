(function(){
	var chatalert = {
		showInformation: function(title, body, play)
		{
			var alert = window.chatalert.show('icon-volume-off', title, body, 'a5dc42');
			if(play != undefined)
				window.soundbank.play(play);
			return alert;
		},
		showWarning: function(title, body, play)
		{
			var alert = window.chatalert.show('icon-volume-half', title, body, 'dca542');
			if(play != undefined)
				window.soundbank.play(play);
			else
				window.soundbank.play('Mo, Baka!');
			return alert;
		},
		showError: function(title, body, play)
		{
			var alert = window.chatalert.show('icon-volume-on', title, body, 'a54242');
			if(play != undefined)
				window.soundbank.play(play);
			else
				window.soundbank.play('Tsukki');
			return alert;
		},
		show: function(icon, title, body, color, userClass)
		{
			var chatLog = $('#chat-messages');
			var now = new Date();
			var hour = now.getHours();
			var minute = now.getMinutes();
			var timestamp = null;
			var settings = JSON.parse(window.localStorage.settings);
			var user = API.getUser().id;
			for(var i in settings)
				if(user in settings[i])
				{
					timestamp = settings[i][user].chatTimestamps * 1;
					break;
				}
			if(minute < 10)
				minute = '0' + minute;
			if(timestamp==12)
			{
				if(hour >= 12)
					minute = minute+' pm';
				else
					minute = minute+' am';
				if(hour > 12)
					hour -= 12;
			}
			var alert = $(
'<div class="cm userspace-chatalert'+(userClass ? ' '+userClass : '')+'" style="margin:4px;box-shadow: inset 0 0 0 1px #'+color+';background:#282c35;clear:both">'+
	'<div class="badge-box"><i class="icon '+icon+'"></i></div>'+
	'<div class="msg">'+
		'<div class="from">'+
			'<span class="un" style="color:#'+color+'">'+title+'</span>'+
			'<span class="timestamp" style="display:inline;color:#'+color+';">'+hour+':'+minute+'</span>'+
		'</div>'+
		'<div class="text cid-undefined">'+body+'</div>'+
	'</div>'+
'</div>'
			);
			chatLog.append(alert);
			chatLog.scrollTop(chatLog.prop('scrollHeight'));
			return alert;
		}
	};

	window.chatalert = chatalert;
	window.freshy.waitFor('babelfish', function(){ window.freshy.systemLoaded('chatalert'); });
})();
