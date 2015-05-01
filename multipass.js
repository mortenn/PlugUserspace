(function(){
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};
	var multipass = {
		setup: function()
		{
			API.on(API.CHAT_COMMAND, function(e){ window.multipass.onChatCommand(e); });
		},
		startup: function()
		{
			window.freshy.systemLoaded('multipass');
		},
		onChatCommand: function(command)
		{
			if(command == '/checkall')
			{
				window.multipass.playlists = false;
				window.multipass.checkAll();
			}
		},
		checkAll: function()
		{
			if(!window.multipass.playlists)
				return window.multipass.loadPlaylists();

			for(var i = 0; i < window.multipass.playlists.data.length; ++i)
				if(window.multipass.playlists.data[i].active)
					return window.multipass.checkPlaylist(window.multipass.playlists.data[i]);
		},
		checkPlaylist: function(playlist)
		{
			$.getJSON('https://plug.dj/_/playlists/'+playlist.id+'/media', function(ml){ window.multipass.onPlaylistLoaded(playlist, ml); });
		},
		loadPlaylists: function()
		{
			$.getJSON('https://plug.dj/_/playlists', function(pl) { window.multipass.onPlaylistsLoaded(pl); });
		},
		onPlaylistsLoaded: function(playlists)
		{
			window.multipass.playlists = playlists;
			window.multipass.checkAll();
		},
		onPlaylistLoaded: function(playlist, medialist)
		{
			var media = [];
			var mediamap = {};
			for(var i = 0; i < medialist.data.length; ++i)
			{
				media.push(medialist.data[i]);
				mediamap[medialist.data[i].cid] = medialist.data[i];
				window.multipass.enqueue(medialist.data[i]);
			}
			$.post(
				'https://i.animemusic.me/animemusic/check.php?dj=' + API.getUser().id,
				JSON.stringify(media),
				function(e){ window.multipass.onMediaChecked(e, mediamap); },
				'json'
			);
		},
		queue: [],
		worker: false,
		enqueue: function(media)
		{
			window.multipass.queue.push(media);
			if(!window.multipass.worker)
				window.multipass.worker = setInterval(window.multipass.checkNext, 100);
		},
		checkNext: function()
		{
			if(window.multipass.queue.length == 0)
			{
				clearInterval(window.multipass.worker);
				return;
			}
			var next = window.multipass.queue.pop();
			if(next.format == 1)
				window.multipass.youtubeCheck(next);
			else if(next.format == 2)
				window.multipass.soundcloudCheck(next);
		},
		youtubeCheck: function(media) {
				$.getJSON(
					'https://gdata.youtube.com/feeds/api/videos/'+media.cid+'?v=2&alt=jsonc',
					function(response)
					{
						if("restrictions" in response.data)
						{
							for(var i = 0; i < response.data.restrictions.length; ++i)
							{
								if(response.data.restrictions[i].type == 'country')
								{
									var list = response.data.restrictions[i].countries.split(' ');
									var reason = false;
									if(response.data.restrictions[i].relationship == 'allow' && list.length < 20)
										reason = 'Blocked in too many countries!';

									if(response.data.restrictions[i].relationship == 'deny' && list.length > 5)
										reason = 'Blocked in too many countries!';

									if(reason)
										window.multipass.pushCache(
											media,
											{id:media.cid, b:0, u:1, r:reason, w: '', override: true },
											window.senpai.messages.unavailable
										);
								}
							}
						}
					}
				).fail(function(response){
					window.multipass.pushCache(
						media,
						{id:media.cid, b:0, u: 1, r:response.responseJSON.error.message, override: true, w:''},
						window.senpai.messages.unavailable
					);
				});
		},
		soundcloudCheck: function(media)
		{
			SC.get('/tracks/'+media.cid+'.json', function(response)
			{
				if("errors" in response)
					window.multipass.pushCache(
						media,
						{id:media.cid, b:0, u:1, r:_(response.errors[0].error_message), override: true, w:''},
						window.senpai.messages.unavailable
					);
			});
		},
		onMediaChecked: function(playlist, mediamap)
		{
			for(var i = 0; i <= playlist.length; ++i)
			{
				var verdict = window.senpai.getVerdict(playlist[i]);
				if(playlist[i] && "id" in playlist[i])
					window.multipass.pushCache(mediamap[playlist[i].id], playlist[i], verdict, mediamap[playlist[i].id]);
				$('#media-panel .row .senpai').remove();
			}
		},
		pushCache: function(media, result, verdict)
		{
			if(result.id in window.senpai.cache && window.senpai.cache[result.id].result.override && !result.override)
				return;
			window.senpai.cache[result.id] =
			{
				checked: Date.now(),
				verdict: verdict,
				result: result,
				message: verdict.brief(result),
				media: media
			};
			$('span[senpai-media-id="'+result.id+'"]').remove();
		},
		playlists: false,
		idmap: {}
	};

	if(!("multipass" in window) || !window.multipass.onChatCommand)
		multipass.setup();
	else if(window.multipass.playlists)
	{
		multipass.playlists = window.multipass.playlists;
		if(window.multipass.worker)
			clearInterval(window.multipass.worker);
	}
	window.multipass = multipass;
	window.multipass.startup();
})();
