(function (){
	var notify = {
		autoDismiss: 2000,
		active: false,
		setupNotification: function()
		{
			if("Notification" in window)
			{
				window.notify.active = false;
				if(Notification.permission === "granted")
				{
					window.notify.active = true;
				}
				else if(Notification.permission !== "denied")
				{
					Notification.requestPermission(function(permission){
						if(!('permission' in Notification))
							Notification.permission = permission;

						if(permission === 'granted')
						{
							window.notify.active = true;
						}
					});
				}
			}
			window.freshy.systemLoaded('notify');
		},
		show: function(message)
		{
			if(window.notify.active)
			{
				var notification = new Notification(message);
				setTimeout(function(){ notification.close(); }, window.notify.autoDismiss);
			}
		}
	};

	window.notify = notify;
	notify.setupNotification();
})();
