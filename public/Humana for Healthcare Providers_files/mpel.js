var cnt = false;
var MpElD = document.getElementById('mpelid').src;
MpElD = MpElD.substring(MpElD.indexOf('//'));
var basePath = MpElD.substring(0, MpElD.length - 7);
MpElD = MpElD.substring(0, MpElD.substring(2).indexOf('/') + 2);
var userPref;
if (typeof JSON === 'object' && typeof JSON.parse === 'function') {
}else{var s = document.createElement('script');
s.type = 'text/javascript';
s.async = true;
s.src = "https:" + MpElD + "/mpel/js/json2.min.js";
var x = document.getElementsByTagName('script')[0];
x.parentNode.insertBefore(s, x);
}
var MpStorage = {
	callback: null,
	iframe: null,
	fetch: function(cb) {
		callback = cb;
		MpStorage.portal();
	},
	store: function(cb, pref) {
		callback = cb;
		portal(pref);
	},
	listener: function(event) {
		if( document.getElementById("mpel_init")){
		if ((event.origin.indexOf(MpElD) < 0)) return;
		var msgData = event.data;
		if (msgData == "close" || msgData == "continue" || msgData == "none" || msgData == "cancel") return;
		msgData = JSON.parse(msgData);
		callback(msgData);
	}
	},
	hashlistener: function(data) {
		callback(JSON.parse(data));
	},
  setCookie : function (name, value, path, domain) {
     var cookie = name + '=' + encodeURIComponent(value);
     if (path) cookie += '; path=' + path;
     if (domain) cookie += '; domain=' + domain;
     var now = new Date();
     now.setTime(now.getTime() + 1000 * 60 * 60 * 24 * 365);
     cookie += '; expires=' + now.toUTCString();
     document.cookie = cookie;
 },
	portal: function(pref) {
		
		if (window.addEventListener) {
			addEventListener("message", MpStorage.listener, false);
		} else {
			attachEvent("onmessage", MpStorage.listener);
		}
		iframe = document.createElement('iframe');
		iframe.id = 'mpel_init';
		iframe.src = "https:" + MpElD + "/mpel/mpel_storage.html?cmd=getpref&href=" + encodeURIComponent(location.href);
		iframe.setAttribute("sandbox", "allow-same-origin allow-top-navigation allow-forms allow-scripts");
		iframe.scrolling = 'no';
		iframe.frameBorder = '0';
		iframe.style.height = '0px';
		iframe.style.width = '0px';
		iframe.style.display = 'none';
		var body = document.getElementsByTagName('body')[0];
		body.parentNode.insertBefore(iframe,body);
	},
	remove: function(name) {
		var frame = document.getElementById(name);
		if (frame) frame.parentNode.removeChild(frame);
	},
	updatePref: function(url, pref) {
		try{
		MpStorage.remove('lightbox_pop');
		MpStorage.remove('lightbox_overlay');
		iframe = document.createElement('iframe');
		iframe.src = "https:" + MpElD + "/mpel/mpel_storage.html?cmd=storePref&href=" + encodeURIComponent(location.href) + "&siteurl=" + url + "&lang=" + pref.substr(0, 2) + "&country=" + pref.substr(2, 2) + "&sitelist=" + userPref.sitelist + "&region=" + pref.substr(7, 2) + "&currency=" + pref.substr(4, 3) + "&nonMP=false&mode="+ pref.substr(9) ;
		iframe.setAttribute("sandbox", "allow-same-origin allow-top-navigation allow-forms allow-scripts");
		iframe.scrolling = 'no';
		iframe.frameBorder = '0';
		iframe.style.height = '0px';
		iframe.style.width = '0px';
		iframe.style.display = 'none';
		var body = document.getElementsByTagName('body')[0];
		body.parentNode.insertBefore(iframe,body);	
	}catch(e){}
	}
};

var param = function(name) {
	if (document.location.search != '') {
		var idx = document.location.search.indexOf(name);
		if (idx > -1) {
			var s = document.location.search.substring(idx + name.length + 1);
			if (s.indexOf('&') > 0) {
				return s.substring(0, s.indexOf('&'));
			}
			return s;
		}
	}
	return '';
};
var MpEasyLink = {
	start: function() {
		MpStorage.fetch(MpEasyLink.startcb);
	},
	domain : (function (a) {
	    var b = a.match("[^.]+.(([^.]{2,3}.)?[^.]{2}|[^.]{3,})$");
	    return b == null ? a : b[0]
	})(location.host),
	startcb: function(pref) {
		if(pref && pref.mode)
		{
		MpStorage.setCookie('MPEL',pref.mode,'/',MpEasyLink.domain);}
		MpStorage.remove("mpel_init");
		if (pref == 'none') {} else {
			userPref = pref;
			if (cnt == false) {
				if (!MpEasyLink.onPreferredSite(pref, location.href)) {
					var script = document.createElement('script');
					script.type = 'text/javascript';
					if (pref) {;}
					else {
						pref = "";
						pref.lang = null;
						pref.country = "";
						pref.curr = "";
					}
					if (pref.hasOwnProperty("lang")) {
						   var MPr=document.referrer;if(pref.siteurl.indexOf("/")<0){MPr=MPr.replace(/https?:\/\//g,"").split("/")[0];}else{var newurl=pref.siteurl;newurl=newurl.split("/");var nR="";var newMpr=MPr.split("/");for(i=0;i<=newurl.length-2;i++){nR=nR+"/"+newMpr[i+3];};
						   MPr=MPr.replace(/https?:\/\//g,"").split("/")[0];MPr=MPr+nR;};
						   if(MpEasyLink.onPreferredSite(pref,MPr)){MpStorage.updatePref(MP.oSite, MP.SrcLang);}
						   else{
						script.src = "https:" + MpElD + "/mpel/mpel?href=" + encodeURIComponent(location.href) + '&ref=' + encodeURIComponent(document.referrer) + '&lang=' + pref.lang + '&country=' + pref.country + '&curr=' + pref.curr;
						   }
					}
					else {
						script.src = "https:" + MpElD + "/mpel/mpel?href=" + encodeURIComponent(location.href) + '&ref=' + encodeURIComponent(document.referrer) + '&lang=&country=' + pref.country + '&curr=' + pref.curr;
					}
					var target = document.getElementsByTagName('script')[0];
					target.parentNode.insertBefore(script, target);
				}
				cnt = true;
			}
			else {}
		}
	},

	onPreferredSite: function(pref, href) {
		if (typeof(pref) != 'undefined' && pref && pref != null) {
			var modhref = href.replace(/https?:\/\//g, "");
			var thelongest = "";
			var thesite = "";
			if (!pref.sitelist) {
				return;
			}
			var sitelists = pref.sitelist.split(";");
			for (var i = 0; i < sitelists.length; i++) {
				var sites = sitelists[i].split(",");
				var canonsite = sites[0];
				for (var j = 0; j < sites.length; j++) {
					if ((modhref.indexOf(sites[j]) == 0) && (sites[j].length > thesite.length)) {
						thelongest = sites[j];
						thesite = canonsite;
					}
				}
			}
			return (thesite == pref.siteurl);
		}
		return false;
	}
};
MpEasyLink.start();