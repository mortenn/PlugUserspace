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
				window.multipass.activatePlaylist();
				window.multipass.checkAll();
			}
			if(command == '/organize')
			{
				window.multipass.activatePlaylist();
				window.multipass.organize();
			}
		},
		managePlaylistButton: function()
		{
			window.multipass.manageOrganizeButton();
			window.multipass.manageCheckAllButton();
		},
		manageOrganizeButton: function()
		{
			if(!window.senpai.enabled()) return;
			var button = $('#playlist-organize-button');
			if (button.length)
				button.remove();
			if(window.senpai.getActivePlaylist() != window.senpai.getCurrentPlaylist())
				return;
			var tooltip = _('Places songs that have been played recently, are banned or that are unavailable to the bottom of your playlist.');
			button = $('<div id="playlist-organize-button" class="button" title="'+tooltip+'"><i class="fa fa-sort-amount-down"></i></div>');
			$('#playlist-edit-button').before(button);
			button.click(
				function()
				{
					button.children('span').text('0%');
					window.multipass.activatePlaylist();
					window.multipass.checkAll(true);
				}
			);
		},
		manageCheckAllButton: function()
		{
			if(!window.senpai.enabled()) return;
			var button = $('#playlist-checkall-button');
			if (button.length)
				button.remove();
			if(window.senpai.getActivePlaylist() != window.senpai.getCurrentPlaylist())
				return;
			var tooltip = _('Check all of your playlist to ensure they are available and abide by the rules.');
			button = $('<div id="playlist-checkall-button" class="button" title="'+tooltip+'"><i class="fa fa-tasks"></i></div>');
			$('#playlist-edit-button').before(button);
			button.click(
				function()
				{
					window.multipass.activatePlaylist();
					window.multipass.checkAll();
				}
			);
		},
		activatePlaylist: function()
		{
			if(!window.multipass.playlists)
				return;
			var active = window.senpai.getActivePlaylist();
			for(var i = 0; i < window.multipass.playlists.data.length; ++i)
				window.multipass.playlists.data[i].active = window.multipass.playlists.data[i].name == active;
		},
		organize: function()
		{
			if(window.multipass.organizing)
				return;

			if(window.multipass.playlists.data)
				for(var i = 0; i < window.multipass.playlists.data.length; ++i)
					if(window.multipass.playlists.data[i].active)
						return window.multipass.organizePlaylist(window.multipass.playlists.data[i]);

			window.multipass.checkAll(true);
		},
		organizePlaylist(playlist)
		{
			window.multipass.orgQueue[playlist.id] = false;
			window.multipass.organizing = true;
			$.getJSON(
				'https://plug.dj/_/playlists/'+playlist.id+'/media',
				function(ml)
				{
					var bad = [], r_7 = [], r_30 = [], r_90 = [], ok = [];
					for(var i = 0; i < ml.data.length; ++i)
					{
						var media = ml.data[i];
						var state = window.multipass.mediaStatus[media.cid];
						var known = window.multipass.knownMedia[media.cid];

						// Media not available
						if(media.id && state && state.verdict && state.verdict.skip)
						{
							bad.push(media.id);
							continue;
						}

						// Unknown status, leave media alone
						if(!state || !known || !media.id)
						{
							continue;
						}
						known.media = media;
						var verdict = window.senpai.getVerdict(known.result);
						if(verdict.skip || state.verdict && state.verdict.skip)
						{
							bad.push(media.id);
							continue;
						}
						if(known.result.w == '1') { r_7.push(media.id); continue; }
						if(known.result.m == '1') { r_30.push(media.id); continue; }
						if(known.result.q == '1') { r_90.push(media.id); continue; }
						ok.push(known);
					}
					ok.sort(function(a, b) {
						return a.result.w == b.result.w ? 0 :
						 	(a.result.w > b.result.w ? 1 : -1);
					});
					var ids = ok.map(function(i){ return [i.media.id]; });
					if(r_90.length > 0) ids.push(r_90);
					if(r_30.length > 0) ids.push(r_30);
					if(r_7.length > 0) ids.push(r_7);
					if(bad.length > 0) ids.push(bad);
					if(ids.length == 0)
					{
						window.chatalert.showInformation(_("Nothing to do"), '¯\\_(ツ)_/¯');
						return;
					}
					var total = ids.length;
					var working = window.multipass.plAlert[playlist.name] = window.chatalert.show(
						'icon-volume-off',
						_("Reorganizing playlist {playlist}")
							.replace('{playlist}', playlist.name),
						_("Please stand by, this will take at least {time} seconds.")
							.replace('{time}', ids.length),
						'aa74ff',
						'senpai'
					);
					var next = function()
					{
						var button = $('#playlist-organize-button');
						if(button.length > 0 && ids.length > 0)
							button.children('span').text(Math.floor(100 - 100 * ids.length / total) + '%')
						if(ids.length == 0)
						{
							if(button.length > 0)
								button.children('span').text(_('Organize'));
							window.multipass.organizing = false;
							working.remove();
							window.chatalert.show(
								'icon-volume-off',
								_("Done!"),
								_("Playlist {playlist} has been organized, please switch playlists to see results.")
									.replace('{playlist}', playlist.name),
								'aa74ff',
								'senpai'
							);
							return;
						}
						var move = ids.shift();
						window.multipass.moveSongsToEnd(playlist, move, next);
					}
					next();
				}
			);
		},
		checkAll: function(organize)
		{
			if(window.multipass.checking)
				return;
			if(!window.multipass.playlists)
				return window.multipass.loadPlaylists(organize);

			for(var i = 0; i < window.multipass.playlists.data.length; ++i)
			{
				var pl = window.multipass.playlists.data[i];
				if(pl.active)
				{
					window.multipass.checking = true;
					if(organize)
						window.multipass.orgQueue[pl.id] = true;
					window.multipass.plEnqueue(pl);
					window.multipass.checked[pl.name] = true;
					return;
				}
			}
		},
		checkPlaylist: function(playlist)
		{
			$.getJSON('https://plug.dj/_/playlists/'+playlist.id+'/media', function(ml){ window.multipass.onPlaylistLoaded(playlist, ml); });
		},
		moveSongsToEnd: function(playlist, ids, next)
		{
			window.multipass.backoff++;
			setTimeout(function(){ window.multipass.backoff--; }, 60000);
			var backoff = function()
			{
				if(window.multipass.backoff > 28)
					return setTimeout(backoff, 1000);
				return setTimeout(next, 100);
			};
			var request = {
				type: 'PUT',
				url: 'https://plug.dj/_/playlists/'+playlist.id+'/media/move',
				dataType: 'json',
				contentType: 'application/json',
				processData: false,
				data: JSON.stringify({ids: ids, beforeID: -1}),
				success: backoff,
				error: function(xhr)
				{
					if(xhr.status == 429)
						setTimeout(
							function()
							{
								window.multipass.moveSongsToEnd(playlist, ids, next);
							},
							2000
						);
					else
						console.log(arguments);
				}
			};
			$.ajax(request);
		},
		loadPlaylists: function(organize)
		{
			$.getJSON('https://plug.dj/_/playlists', function(pl) { window.multipass.onPlaylistsLoaded(pl, organize); });
		},
		onPlaylistsLoaded: function(playlists, organize)
		{
			window.multipass.playlists = playlists;
			window.multipass.checkAll(organize);
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
				function(e){ window.multipass.onMediaChecked(e, mediamap, playlist); },
				'json'
			);
		},
		backoff: 0,
		checking: false,
		organizing: false,
		orgQueue: [],
		plQueue: [],
		plWorker: false,
		plAlert: {},
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
			if(next.name in window.multipass.plAlert)
				window.multipass.plAlert[next.name].remove();
			window.multipass.plAlert[next.name] = window.chatalert.show(
				'icon-volume-off',
				_('Checking playlist'),
				_('{playlist} is being checked.').replace('{playlist}', next.name),
				'aa74ff',
				'senpai'
			);
			window.multipass.checkPlaylist(next);
		},
		queue: [],
		checked: {},
		worker: false,
		enqueue: function(media)
		{
			window.multipass.queue.push(media);
			if(!window.multipass.worker)
				window.multipass.worker = setTimeout(window.multipass.checkNext, 100);
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
		youtubeCheck: function(media)
		{
			$.getJSON(
				'https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails&id='+media.cid+'&key=AIzaSyD67usK9zHkAgG33z0bdoauSGrdXX8ByL8',
				function(response){ window.multipass.youtubeChecked(media, response); }
			).fail(function(error){ window.multipass.youtubeError(media, error); });
		},
		youtubeChecked: function(media, response)
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
		},
		youtubeError: function(media, response)
		{
			window.multipass.mediaStatus[media.cid] = {
				media: media,
				result: {id:media.cid, b:0, u: 1, r:response.responseJSON.error.message, override: true, w:''},
				verdict: window.senpai.messages.unavailable
			};
			window.multipass.statusLoaded(media.cid);
		},
		soundcloudCheck: function(media)
		{
			SC.get('/tracks/'+media.cid)
				.then(function(){ window.multipass.soundcloudChecked(media); })
				.catch(function(error){ window.multipass.soundcloudError(media, error); });
		},
		soundcloudChecked: function(media)
		{
			window.multipass.mediaStatus[media.cid] = {};
			window.multipass.statusLoaded(media.cid);
		},
		soundcloudError: function(media, error)
		{
			window.multipass.mediaStatus[media.cid] = {
				media: media,
				result: {id:media.cid, b:0, u:1, r:error.message, override: true, w:''},
				verdict: window.senpai.messages.unavailable
			};
			window.multipass.statusLoaded(media.cid);
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
			var working = setInterval(
				function()
				{
					var done = playlist.reduce(
						function(a, v)
						{
							return (v.id in window.multipass.mediaStatus) && a;
						},
						true
					);
					if(!done)
						return;
					clearInterval(working);
					window.multipass.checking = false;
					window.multipass.plAlert[pl.name].remove();
					window.multipass.plAlert[pl.name] = window.chatalert.show(
						'icon-volume-off',
						_('Playlist checked'),
						_('{playlist} has been checked.').replace('{playlist}', pl.name),
						'aa74ff',
						'senpai'
					);
					if(pl.id in window.multipass.orgQueue && window.multipass.orgQueue[pl.id])
						window.multipass.organizePlaylist(pl);
				},
				1000
			);
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
			window.multipass.worker = setTimeout(window.multipass.checkNext, 100);
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
		multipass.mediaStatus = window.multipass.mediaStatus;
		multipass.knownMedia = window.multipass.knownMedia;
		multipass.idmap = window.multipass.idmap;
		if(window.multipass.worker)
			clearInterval(window.multipass.worker);
		if(window.multipass.plWorker)
			clearInterval(window.multipass.plWorker);
	}
	window.multipass = multipass;
	window.multipass.startup();
})();
