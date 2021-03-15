const sessions = require('../data/sessions');
const fUtil = require('../fileUtil');
const stuff = require('./info');

function toAttrString(table) {
	return typeof (table) == 'object' ? Object.keys(table).filter(key => table[key] !== null).map(key =>
		`${encodeURIComponent(key)}=${encodeURIComponent(table[key])}`).join('&') : table.replace(/"/g, "\\\"");
}
function toParamString(table) {
	return Object.keys(table).map(key =>
		`<param name="${key}" value="${toAttrString(table[key])}">`
	).join(' ');
}
function toObjectString(attrs, params) {
	return `<object id="obj" ${Object.keys(attrs).map(key =>
		`${key}="${attrs[key].replace(/"/g, "\\\"")}"`
	).join(' ')}>${toParamString(params)}</object>`;
}

module.exports = function (req, res, url) {
	if (req.method != 'GET') return;
	const query = url.query;

	var attrs, params, title;
	switch (url.pathname) {
		case '/cc': {
			title = 'Character Creator';
			attrs = {
				data: process.env.SWF_URL + '/cc.swf', // data: 'cc.swf',
				type: 'application/x-shockwave-flash', 
				id: 'char_creator', 
				width: '960', 
				height: '600', 
				style:'display:block;margin-left:auto;margin-right:auto;',
			};
			params = {
				flashvars: {
					'apiserver': '/', 'storePath': process.env.STORE_URL + '/<store>',
					'clientThemePath': process.env.CLIENT_URL + '/<client_theme>', 'original_asset_id': query['id'] || null,
					'themeId': 'business', 'ut': 60, 'bs': 'default', 'appCode': 'go', 'page': '', 'siteId': 'go',
					'm_mode': 'school', 'isLogin': 'Y', 'isEmbed': 1, 'ctc': 'go', 'tlang': 'en_US',
				},
				allowScriptAccess: 'always',
				movie: process.env.SWF_URL + '/cc.swf', // 'http://localhost/cc.swf'
			};
			break;
		}
		
		case "/cc_browser": {
			title = "CC Browser";
			attrs = {
				data: process.env.SWF_URL + "/cc_browser.swf", // data: 'cc_browser.swf',
				type: "application/x-shockwave-flash",
				id: "char_creator",
				width: '100%', 
				height: '600', 
				style:'display:block;margin-left:auto;margin-right:auto;',
			};
			params = {
				flashvars: {
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					original_asset_id: query["id"] || null,
					themeId: "family",
					ut: 60,
					appCode: "go",
					page: "",
					siteId: "go",
					m_mode: "school",
					isLogin: "Y",
                                        retut: 1,
                                        goteam_draft_only: 1,
					isEmbed: 1,
					ctc: "go",
					tlang: "en_US",
					lid: 13,
				},
				allowScriptAccess: "always",
				movie: process.env.SWF_URL + "/cc_browser.swf", // 'http://localhost/cc_browser.swf'
			};
			break;
		}

		case '/go_full': {
			let presave = query.movieId && query.movieId.startsWith('m') ? query.movieId :
				`m-${fUtil[query.noAutosave ? 'getNextFileId' : 'fillNextFileId']('movie-', '.xml')}`;
			title = 'Video Editor';
			attrs = {
				data: process.env.SWF_URL + '/go_full.swf',
				type: 'application/x-shockwave-flash', width: '100%', height: '100%',
			};
			params = {
				flashvars: {
					'apiserver': '/', 'storePath': process.env.STORE_URL + '/<store>', 'isEmbed': 1, 'ctc': 'go',
					'ut': 60, 'bs': 'default', 'appCode': 'go', 'page': '', 'siteId': 'go', 'lid': 13, 'isLogin': 'Y', 'retut': 1,
					'clientThemePath': process.env.CLIENT_URL + '/<client_theme>', 'themeId': 'business', 'tlang': 'en_US',
					'presaveId': presave, 'goteam_draft_only': 1, 'isWide': 1, 'nextUrl': '/pages/html/list.html',
				},
				allowScriptAccess: 'always',
			};
			sessions.set({ movieId: presave }, req);
			break;
		}

		case '/player': {
			title = 'Video Player';
			attrs = {
				data: process.env.SWF_URL + '/player.swf',
				type: 'application/x-shockwave-flash', width: '100%', height: '100%',
			};
			params = {
				flashvars: {
					'apiserver': '/', 'storePath': process.env.STORE_URL + '/<store>', 'ut': 60,
					'autostart': 1, 'isWide': 1, 'clientThemePath': process.env.CLIENT_URL + '/<client_theme>',
				},
				allowScriptAccess: 'always',
				allowFullScreen: 'true',
			};
			break;
		}

		default:
			return;
	}
	res.setHeader('Content-Type', 'text/html; charset=UTF-8');
	Object.assign(params.flashvars, query);
	res.end(`
	<head>
		<script>
			document.title='${title}',flashvars=${JSON.stringify(params.flashvars)}
		</script>
		<script>
			if(window.location.pathname == '/player') {
				function hideHeader() {
					document.getElementById("header").style.display = "none";
				}
			} else if(window.location.pathname == '/go_full') {
				function hideHeader() {
					document.getElementById("header").style.display = "none";
				}
			}
		</script>
		<link rel="stylesheet" type="text/css" href="/pages/css/global2011.css">
		<style>
			body {
				background: #eee;
			}
		</style>
	</head>
		<div id="header">
	<div class="header-bg"></div>
	<div class="header-inside">
		<a class="site-logo" href="http://web.archive.org/web/20130116083755/http://goanimate.com/" title="GoAnimate">
			<img alt="Make a Video Online with GoAnimate.com" src="https://goanimaterevival.herokuapp.com/pages/img/make-video-goanimate.png"/>
		</a>

        <div id="headertopnavmenu" class="globalnav">
	<ul id="top_nav" class="header_block">
		<li class="top_nav_item create">
			<a href="/go_full">Make a Video</a>
		</li>
		<li class="top_nav_item explore">
			<a href="http://web.archive.org/web/20130116083755/http://goanimate.com/videos">Explore</a>
			<ul class="top_nav_submenu">
				<li class="first"><div class="arrow"></div><a href="./list.html">Videos</a></li>
				<li><a href="http://web.archive.org/web/20130116083755/http://goanimate.com/mingle">Community</a></li>
				<li><a href="http://web.archive.org/web/20130116083755/http://goanimate.com/forums">Forums</a></li>
				<li><a href="http://web.archive.org/web/20130116083755/http://goanimate.com/video-maker-tips">Video Maker Tips</a></li>
				<li><a href="http://web.archive.org/web/20130116083755/http://goanimate.com/search">Search</a></li>
			</ul>
		</li>
		<li class="top_nav_item upgrade">
			<a href="http://web.archive.org/web/20130116083755/http://goanimate.com/plusfeatures/?hook=header_button.site">Upgrade <img class="upgrade-arrow" src="http://web.archive.org/web/20130116083755im_/http://lightspeed.goanimate.com/static/396/go/img/spacer.gif" alt=""/></a>
			<ul class="top_nav_submenu">
				<li><a href="http://goanimate4workgroups.herokuapp.com">GoAnimate for Business</a></li>
				<li><a href="http://goanimate4schools.herokuapp.com">GoAnimate for Schools</a></li>
			</ul>
		</li>
	</ul>

<!--[if lte IE 6]>
<script type="text/javascript">
jQuery('#top_nav li').bind('mouseover', function(e) {
	jQuery(this).addClass('hover');
});
jQuery('#top_nav li').bind('mouseout', function(e) {
	jQuery(this).removeClass('hover');
});
jQuery('.money').bind('mouseover', function(e) {
	jQuery(this).addClass('hover');
});
jQuery('.money').bind('mouseout', function(e) {
	jQuery(this).removeClass('hover');
});
</script>
<![endif]-->
        </div>
	</div>
</div>



<div class="container">

    <div id="feedback_block" style="display:none;">
	    <div id="feedback" align="center" class="info">
			    </div>
    </div>
	
	<body style="margin:0px" onload="hideHeader()">${toObjectString(attrs, params)
		}</body>${stuff.pages[url.pathname] || ''}`);
	return true;
}

