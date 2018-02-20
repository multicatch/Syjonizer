const TITLE_APPLY   = "Syjonizer";
const SYJON_ADDRESS = "://moria.umcs.lublin.pl/";

// JS defaults
const content_scripts = [
  "groups",
  "injectCSS",
  "removeCSS"
];

//
var webext = typeof chrome !== 'undefined' ? chrome : browser;

//
// check if we're on a correct page
//
function isApplicable(url) {
  return url.includes(SYJON_ADDRESS);
}

//
// Restore all settings
//
function initSettings() {
  function sendMsg(file, params) {
    var args = [ file, params ];

    var activeTabSeeker = webext.tabs.query({active: true, currentWindow: true, url: "*://moria.umcs.lublin.pl/*"}, (tabs) => {
      tabs.forEach((tab) => {
        webext.tabs.sendMessage(tab.id, {arg: args});
      });
    }); 
  }
  
  function toggleCSS(condition, css) {
    if(condition) {
      sendMsg("injectCSS", css);
    } else {
      sendMsg("removeCSS", css);
    }
  };

  function restoreSettings() {
    var itemGetter = webext.storage.local.get(null, (items) => {

      if(!items.saved)
        return;

      toggleCSS(!items.bar, "toolbar");
      toggleCSS(items.roll, "rollup");
      toggleCSS(items.ex, "extended");
      sendMsg("groups", [items.lb, items.kw]);

    });
  };
  
  // Run scripts
  for(var i = 0; i < content_scripts.length; i++) {
    webext.tabs.executeScript(null, {file: "/content_scripts/" + content_scripts[i] + ".js"}, () => { restoreSettings() });
  }
}

//
// init our magical button
//
function initPageAction(tab) {
  if(isApplicable(tab.url)) {
    webext.pageAction.setIcon({tabId: tab.id, path: "icons/syjonizer-32.png"});
    webext.pageAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
    webext.pageAction.show(tab.id);
    
    webext.tabs.insertCSS({file: "/popup/syjon_style/default.css"});
    webext.tabs.executeScript(null, {file: "/content_scripts/init.js"});
    initSettings();
    
    document.addEventListener('DOMContentLoaded', () => {
      webext.tabs.insertCSS({file: "/popup/syjon_style/default.css"});
      webext.tabs.executeScript(null, {file: "/content_scripts/init.js"});
      initSettings();
    });
  } else {
    webext.pageAction.hide(tab.id);
  }
}

//
// init on all tabs
//
var gettingAllTabs = webext.tabs.query({}, (tabs) => {
  for (let tab of tabs) {
    if(tab.url.includes(SYJON_ADDRESS)) {
      initPageAction(tab);
    }
  }
});

//
// init when tabs update
//
webext.tabs.onUpdated.addListener((id, info, tab) => {
  if(info.status === 'complete') {
    if(tab.url.includes(SYJON_ADDRESS)) {
      initPageAction(tab);
    }
  }
});


