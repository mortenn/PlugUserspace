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
			if(command == '/organize')
			{
				window.multipass.organize();
			}
		},
		organize: function()
		{
			for(var i = 0; i < window.multipass.playlists.data.length; ++i)
				if(window.multipass.playlists.data[i].active)
					return window.multipass.organizePlaylist(window.multipass.playlists.data[i]);

			window.chatalert.showInformation(_('Unable to comply'), _('You need to complete /checkall first'));
		},
		organizePlaylist(playlist)
		{
			$.getJSON(
				'https://plug.dj/_/playlists/'+playlist.id+'/media',
				function(ml)
				{
					var bad = [];
					var ok = [];
					for(var i = 0; i < ml.data.length; ++i)
					{
						var media = ml.data[i];
						var state = window.multipass.mediaStatus[media.cid];
						var known = window.multipass.knownMedia[media.cid];
						var verdict = window.senpai.getVerdict(known.result);

						// Unknown status, leave media alone
						if(!state || !known)
							continue;

						known.media = media;
						if(verdict.skip)
						{
							bad.push(known);
							continue;
						}
						ok.push(known);
					}
					var playSorter = function(a, b)
					{
						if(a.w > b.w)
							return 1;
						if(b.w < a.w)
							return -1;
						return 0;
					};
					bad.sort(playSorter);
					ok.sort(playSorter);
					console.log(bad);
					console.log(ok);
				}
			);
		},
		checkAll: function()
		{
			if(!window.multipass.playlists)
				return window.multipass.loadPlaylists();

			for(var i = 0; i < window.multipass.playlists.data.length; ++i)
				if(window.multipass.playlists.data[i].active)
				{
					window.multipass.plEnqueue(window.multipass.playlists.data[i]);
					window.multipass.checked[window.multipass.playlists.data[i].name] = true;
					return;
				}
		},
		checkPlaylist: function(playlist)
		{
			$.getJSON('https://plug.dj/_/playlists/'+playlist.id+'/media', function(ml){ window.multipass.onPlaylistLoaded(playlist, ml); });
		},
		moveSongs: function(playlist, ids, before, next)
		{
			$.ajax(
				{
					type: 'PUT',
					url: 'https://plug.dj/_/playlists/'+playlist.id+'/media/move',
					contentType: 'application/json',
					dataType: 'application/json',
					data: JSON.stringify({ids:ids, beforeID:before}),
					success: next
				}
			);
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
				'https://j.animemusic.me/animemusic/check.php?dj=' + API.getUser().id,
				JSON.stringify(media),
				function(e){ window.multipass.onMediaChecked(e, mediamap, playlist); },
				'json'
			);
		},
		plQueue: [],
		plWorker: false,
		plEnqueue: function(playlist)
		{
			window.multipass.plQueue.push(playlist);
			if(!window.multipass.plWorker)
			{
				window.multipass.plWorker = setInterval(window.multipass.plCheckNext, 10000);
				window.multipass.plCheckNext();
			}
		},
		plCheckNext: function()
		{
			if(window.multipass.plQueue.length == 0)
			{
				clearInterval(window.multipass.plWorker);
				window.multipass.plWorker = false;
				return;
			}
			var next = window.multipass.plQueue.pop();
			window.multipass.checkPlaylist(next);
		},
		queue: [],
		checked: {},
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
				window.multipass.worker = false;
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
				'https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails&id='+media.cid+'&key=AIzaSyD67usK9zHkAgG33z0bdoauSGrdXX8ByL8',
				function(response)
				{
					var warning = null;
					window.multipass.mediaStatus[media.cid] = {};
					if('pageInfo' in response)
					{
						var bad = null;
						var item = response.items && response.items.length > 0 ? response.items[0] : {};
						if(response.pageInfo.totalResults == 0 || response.items.length == 0)
							bad = 'Video not found';
						else if(item.status.uploadStatus == 'rejected')
							bad = 'Video removed (' + item.status.rejectionReason + ')';
						else if(!item.status.embeddable)
							bad = 'Video not embeddable';
						else if(item.contentDetails && item.contentDetails.contentRating && item.contentDetails.contentRating.ytRating)
							warning = item.contentDetails.contentRating.ytRating;

						if(bad)
						{
							window.multipass.mediaStatus[media.cid] = {
								media: media,
								result: {id:media.cid, b:0, u:1, r: bad, w: '', override: true},
								verdict: window.senpai.messages.unavailable
							};
							window.multipass.statusLoaded(media.cid);
							return;
						}
					}
					var score = window.senpai.parseRestrictions(response);
					if(score > 16)
					{
						window.multipass.mediaStatus[media.cid] = {
							media: media,
							result: {id:media.cid, b:0, u:1, r: 'Blocked in too many countries!', w: '', override: true},
							verdict: window.senpai.messages.unavailable
						};
					}
					if(warning)
					{
						window.multipass.mediaStatus[media.cid] = {
							media: media,
							result: {id:media.cid, b:0, u:0, r: '', w: '', override: true, warning:warning},
							verdict: window.senpai.messages.warning
						};
					}
					window.multipass.statusLoaded(media.cid);
				}
			).fail(function(response)
			{
				window.multipass.mediaStatus[media.cid] = {
					media: media,
					result: {id:media.cid, b:0, u: 1, r:response.responseJSON.error.message, override: true, w:''},
					verdict: window.senpai.messages.unavailable
				};
				window.multipass.statusLoaded(media.cid);
			});
		},
		soundcloudCheck: function(media)
		{
			SC.get('/tracks/'+media.cid)
				.then(function(){
					window.multipass.mediaStatus[media.cid] = {};
					window.multipass.statusLoaded(media.cid);
				})
				.catch(function(error){
					window.multipass.mediaStatus[media.cid] = {
						media: media,
						result: {id:media.cid, b:0, u:1, r:error.message, override: true, w:''},
						verdict: window.senpai.messages.unavailable
					};
					window.multipass.statusLoaded(media.cid);
				});
		},
		onMediaChecked: function(playlist, mediamap, pl)
		{
			var duped = {};
			for(var i = 0; i < playlist.length; ++i)
			{
				if('title' in playlist[i] && playlist[i].title)
				{
					if(!(playlist[i].title in duped))
						duped[playlist[i].title] = playlist[i];
					else
						duped[playlist[i].title].dup = playlist[i].dup = duped[playlist[i].title];
				}
				if(playlist[i] && "id" in playlist[i])
				{
					window.multipass.knownMedia[playlist[i].id] = {
						media: mediamap[playlist[i].id],
						result: playlist[i]
					};
					window.multipass.statusLoaded(playlist[i].id);
				}
			}
			window.chatalert.show('icon-volume-off', _('Playlist checked'), _('{playlist} has been checked.').replace('{playlist}', pl.name), 'aa74ff', 'senpai');
		},
		statusLoaded: function(id)
		{
			var state = window.multipass.mediaStatus[id];
			var known = window.multipass.knownMedia[id];
			var verdict = null;
			if(known)
			{
				verdict = window.senpai.getVerdict(known.result);
				if(verdict.category != 'information')
					window.multipass.pushCache(known.media, known.result, verdict);
			}

			if(state && known)
			{
				if(state.result && state.result.override)
					window.multipass.pushCache(state.media, state.result, state.verdict);
				else if(verdict)
					window.multipass.pushCache(known.media, known.result, verdict);
				window.senpai.startTagPlaylist();
			}
		},
		pushCache: function(media, result, verdict)
		{
			var message = '';
			if(verdict)
				message = verdict.brief(result);
			window.senpai.cache[result.id] =
			{
				checked: Date.now(),
				verdict: verdict,
				result: result,
				message: message,
				media: media
			};
			$('span[senpai-media-id="'+result.id+'"]').remove();
		},
		playlists: false,
		idmap: {},
		mediaStatus: {},
		knownMedia: {}
	};

	if(!("multipass" in window) || !window.multipass.onChatCommand)
		multipass.setup();
	else if(window.multipass.playlists)
	{
		multipass.playlists = window.multipass.playlists;
		if(window.multipass.worker)
			clearInterval(window.multipass.worker);
		if(window.multipass.plWorker)
			clearInterval(window.multipass.plWorker);
	}
	window.multipass = multipass;
	window.multipass.startup();
})();
