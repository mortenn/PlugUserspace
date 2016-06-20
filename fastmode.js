(function (){
	var _ = function(m)
	{
		if("babelfish" in window)
			return window.babelfish.translate(m);
		return m;
	};
	var fastmode = {
		configure: function(data)
		{
		},
		apply: function(d,m,s,i)
		{
			for(i in d)
				if(d[i]&&d[i].imgRegex)
					return s=d[i].sendChat,d[i].sendChat=function(l)
					{
						if(/plug.dj\/hummingbird-me$/.test(document.location))
							Math.max=function(){return 0};
						try
						{
							return s.call(d[i],l);
						}
						finally
						{
							Math.max=m;
						}
					}
		},
		load: function()
		{
			fastmode.apply(require.s.contexts._.defined,Math.max);
			window.freshy.systemLoaded('fastmode');
		},
	};

	window.fastmode = fastmode;
	window.fastmode.load();
})();
