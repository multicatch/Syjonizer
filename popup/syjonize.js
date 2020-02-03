const SYJONPAGE = {active: true, currentWindow: true, url: "*://moria.umcs.lublin.pl/*"};
const SYJON_ADDRESS = "://moria.umcs.lublin.pl/";

let PAGE_TITLE = "Plan_zajec_UMCS";

//
var webext = typeof chrome !== 'undefined' ? chrome : browser;

// toggles
var toolbar = document.getElementById("toolbar");
var rollup  = document.getElementById("rollup");
var extend  = document.getElementById("extend");
var lbgroup = document.getElementById("lbgroup");
var kwgroup = document.getElementById("kwgroup");
var saveb   = document.getElementById("savebutt");
var manual  = document.getElementById("manual");
var info    = document.getElementById("manual-pr");
var erebor  = document.getElementById("erebor");

//
// Save all settings
//
function saveSettings() {
  webext.storage.local.set({
    bar: toolbar.checked,
    roll: rollup.checked,
    ex: extend.checked,
    lb: lbgroup.value,
    kw: kwgroup.value,
    manual: manual.checked,
    info: info.checked,
    saved: true
  });
}

//
// Restore all settings
//
function restoreSettings() {
  function onGot(items) {
    
    if(!items.saved) {
      return;
    }
    
    toolbar.checked = items.bar;
    rollup.checked = items.roll;
    extend.checked = items.ex;
    lbgroup.value = parseInt(items.lb);
    kwgroup.value = parseInt(items.kw);
    manual.checked = items.manual;
    info.checked = items.info;
    
    toggleCSS(toolbar.checked, "toolbar");
    toggleCSS(rollup.checked, "rollup");
    toggleCSS(extend.checked, "extended");
    toggleManual();
  }
  
  var itemGetter = webext.storage.local.get(null, (items) => { onGot(items); });
}

//
// Execute script, inject arguments
// 
function execScript(file, params) {
  var args = [ file, params ];
  
  var activeTabSeeker = webext.tabs.query(SYJONPAGE, (tabs) => {
    webext.tabs.sendMessage(tabs[0].id, {arg: args});
  }); 
}

//
// Insert and remove CSS on condition
//
function toggleCSS(condition, css) {
  if(condition) {
    execScript("injectCSS", css);
  } else {
    execScript("removeCSS", css);
  }
  
  saveSettings();
};


//
// Execute group toggler script
//
function toggleGroup() {
  if(!manual.checked) {
    execScript("groups", [ lbgroup.value, kwgroup.value ]);
  }
  
  saveSettings();
};

//
// Manual composition toggler
//
function toggleManual() {
  if(manual.checked) {
    execScript("groups", [ 0, 0 ]);
  }
  
  info.disabled = !manual.checked;
  toggleCSS(manual.checked, "pinned");
  toggleGroup();
  toggleAnnouncement();
}

//
// Announcement visibility toggler
//
function toggleAnnouncement() {
  toggleCSS(info.checked && !info.disabled, "announcement");
  
  saveSettings();
}

//
// =================
//
//    TOGGLES
// 
// =================
//

//
// Group togglers
//
lbgroup.addEventListener( 'change', (e) => {
  toggleGroup();
});

kwgroup.addEventListener( 'change', (e) => {
  toggleGroup();
});

manual.addEventListener( 'change', (e) => {
  toggleManual();
});

info.addEventListener( 'change', (e) => {
  toggleAnnouncement();
});

//
// Toolbar and rollup toggles
//
toolbar.addEventListener( 'change', (e) => {
  toggleCSS(toolbar.checked, "toolbar");
});

rollup.addEventListener( 'change', (e) => {
  toggleCSS(rollup.checked, "rollup");
});

extend.addEventListener( 'change', (e) => {
  toggleCSS(extend.checked, "extended");
});

//
// Tools triggers
//
saveb.addEventListener( 'click', (e) => {
  
  var capturing = webext.tabs.captureVisibleTab(null, {format : "png"}, (img) => {
    var link = document.createElement("a");
    link.href = img;
    link.download = PAGE_TITLE.replace(/[^a-zA-Z0-9]/g, "_") + ".png";
    
    var evt = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    !link.dispatchEvent(evt);
    
  });
});

erebor.addEventListener('click', (e) => {
    webext.tabs.query({}, (tabs) => {
      for (let tab of tabs) {
        if(tab.url.includes(SYJON_ADDRESS)) {
          let suffix = '';
          if (tab.url.includes('students')) {
            const studentGroup = tab.url.substring(tab.url.lastIndexOf('/') + 1)
            suffix = '#!s/' + studentGroup
          }
          webext.tabs.create({url: 'https://erebor.vpcloud.eu' + suffix})
        }
      }
    });
})


//
// Update
//
restoreSettings();

webext.tabs.query({ active:true, currentWindow:true },function(tabs){
  PAGE_TITLE = tabs[0].title.replace("Plan zajęć - ", "");
});