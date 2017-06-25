(function (){
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};
	var linkify = {
		configure: function(data)
		{
		},
		apply: function()
		{
			var modules, moduleIDs, m, roomInternal, _$context;
			function bypass(){
				if(/plug.dj\/(hummingbird-me|anime)(|#.*)$/.test(document.location))
				{
					var now_;
					now_ = Date.now;
					Date.now = function(){ return 0; };
					roomInternal.trigger('change:joinTime');
					Date.now = now_;
					console.log("disabled link timeout");
				}
			}

			modules = require.s.contexts._.defined;
			moduleIDs = Object.keys(modules);
			for(var i = 0, l = moduleIDs.length; i < l; i++)
			{
				var m = modules[moduleIDs[i]];
				if (m && m.attributes && 'hostID' in m.attributes)
				{
					console.log("got internal room object", m);
					roomInternal = m;
					bypass();
				}
				else if (m && m._events && m._events['chat:receive'])
				{
					console.log("got internal events object", m);
					_$context = m;
					_$context.on('ws:reconnected', bypass);
				}
				else
					continue;

				if (roomInternal && _$context)
				{
					console.log("got both roomInternal and _$context; done!");
					break;
				}
			}
		},
		load: function()
		{
			window.linkify.apply();
			window.freshy.systemLoaded('linkify');
		}
	};

	window.linkify = linkify;
	window.linkify.load();
})();
