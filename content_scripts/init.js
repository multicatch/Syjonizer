const PINNED_CLASS = "_syjon_pinned_block";
const INFO_CLASS = "_syjon_announcement";
const CHECKBOX_CLASS = "_syjon_activity_checkbox";
const SCHEDULE_CLASS = "plancontainer";
const DAYS = [
    "poniedziałek",
    "wtorek",
    "środa",
    "czwartek",
    "piątek",
    "sobota",
    "niedziela"
];
//let webext = typeof chrome !== 'undefined' ? chrome : browser;
let schedule_wrapper = document.getElementsByClassName(SCHEDULE_CLASS)[0];
let settings = {};

//
// Get DOM property
//
function property(e, prop) {
  return window.getComputedStyle(e, null).getPropertyValue(prop);
}

//
// Calculate day of week based on position
//
function getDay(left, width) {
  let result  = 0;
  let percent = left * 100 / parseFloat(property(schedule_wrapper, "width"));
  
  for(;percent >= Math.floor(width); percent -= width) {
    result++;
  }
  
  if(left < 0) {
    return "ignore";
  }
  
  return result;
}

//
// Add class to DOM element
//
function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}

//
// Assign days of week
//
function assignDays(days = 7) {
  schedule_wrapper = document.getElementsByClassName(SCHEDULE_CLASS)[0];
  
  const blocks = document.getElementsByClassName("activity_block");
  
  // prevent redundancy
  if(blocks.length > 0 && blocks[0].classList.contains("_syjon"))
    return;
  
  for(let i = 0; i < blocks.length; i++) {
    addClass(blocks[i], "_syjon");

    const day = blocks[i].dataset.weekdaytext;
    const dayNumber = DAYS.indexOf(day);
    let blockClass = "_syjon_day_"
    if (days === 7) {
      blockClass += "whole_";
    }

    if (days === 5) {
      blockClass += "working_"
    }

    if (days === 2) {
      blockClass += "weekend_";
    }

    if (days === 1) {
      blockClass += "single_";
    }

    addClass(blocks[i], blockClass + dayNumber);
  }
}

//
// Mark information in block
//
function markBlockInfo() {
  schedule_wrapper = document.getElementsByClassName(SCHEDULE_CLASS)[0];

  const blocks = document.getElementsByClassName("activity_block");

  for(let i = 0; i < blocks.length; i++) {
    const list = blocks[i].getElementsByClassName("itemlist")[0].getElementsByTagName("ul")[0];

    // schedule time
    if(!list.classList.contains("_syjon_itemlist")) {
      const elements = list.getElementsByTagName("li");

      for (let j = 0; j < elements.length; j++) {
        if (j === 0) {
          addClass(elements[j], "_syjon_item_lecturer");
        } else {
          addClass(elements[j], "_syjon_item_studies")
        }
      }

      addClass(list, "_syjon_itemlist");
    }
  }
}

//
// Add room background gradient
//
function makeRoomGradient() {
  schedule_wrapper = document.getElementsByClassName(SCHEDULE_CLASS)[0];

  const blocks = document.getElementsByClassName("activity_block");

  for(let i = 0; i < blocks.length; i++) {
    const backgroundColor = blocks[i].style.backgroundColor;
    const room = blocks[i].getElementsByClassName("room")[0];
    room.style.background = "linear-gradient(transparent 0%, " + backgroundColor + " 70%)";
  }
}

//
// Assign time schedule
//
function assignTime() {
  schedule_wrapper = document.getElementsByClassName(SCHEDULE_CLASS)[0];
  
  const blocks = document.getElementsByClassName("activity_block");

  for(let i = 0; i < blocks.length; i++) {
    const top    = parseFloat(property(blocks[i], "top"));
    const height = parseFloat(property(blocks[i], "height"));
    
    const wrapper_height = parseFloat(property(schedule_wrapper, "height"));
    
    // schedule time
    if(blocks[i].getElementsByClassName("_syjon_time").length < 1) {
      const start_time = blocks[i].dataset.starttime;
      const end_time = blocks[i].dataset.endtime;
      
      const time_wrapper = document.createElement("li");
      time_wrapper.innerHTML = start_time + " - " + end_time;
      
      addClass(time_wrapper, "_syjon_time");

      blocks[i].getElementsByClassName("itemlist")[0].getElementsByTagName("ul")[0].appendChild(time_wrapper);
    }

  }
}

//
// Returns current pageId
//
function getPageId() {
  const locationArray = location.href.split("/");
  return pageId = "page" + locationArray[locationArray.length - 1];
}

//
// Pins parent block
// 
function pin(checkbox) {
  webext.storage.local.get(null, (items) => {
    settings = items;

    if (checkbox.checked) {
      checkbox.parentElement.classList.add(PINNED_CLASS);
    } else {
      checkbox.parentElement.classList.remove(PINNED_CLASS);
    }

    const chkClass = checkbox.classList.item(1);
    const pageId = getPageId();

    if (typeof settings[pageId] == 'undefined') {
      settings[pageId] = {};
    }

    settings[pageId][chkClass] = checkbox.checked;

    webext.storage.local.set(settings);
  });
}

//
// Injects a set of checkboxes
//
function injectCheckboxes() {

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = CHECKBOX_CLASS;

  const blocks = document.getElementsByClassName("activity_block");
  const pageId = getPageId();
  
  if(typeof settings[pageId] == 'undefined') {
    settings[pageId] = {};
  }
  
  let checkboxSettings = settings[pageId];
  
  for(let i = 0; i < blocks.length; i++) {
    const timetable = location.href.substr(location.href.lastIndexOf('/') + 1).replace(/[^0-9]/g, "");
    let time = blocks[i].dataset.starttime + "" + blocks[i].dataset.endtime;
    time = time.replace(/:/g, "");
    const day = DAYS.indexOf(blocks[i].dataset.weekdaytext);
    let room = blocks[i].getElementsByClassName("room")[0].getElementsByTagName("a")[0].innerHTML;
    room = room.replace(/[^0-9a-zA-Z]/g, "");
    let chkClass = "_chk_" + timetable + "_" + day + "_" + time + "_" + room;
    
    const currentCheckbox = checkbox.cloneNode(true);
    currentCheckbox.className += " " + chkClass;
    
    if(typeof checkboxSettings[chkClass] != 'undefined') {
      currentCheckbox.checked = checkboxSettings[chkClass];
    }
    
    if(blocks[i].getElementsByClassName(CHECKBOX_CLASS).length === 0) {
      blocks[i].appendChild(currentCheckbox);
      
      let child = document.getElementsByClassName(chkClass)[0];
      
      child.addEventListener('change', (e) => {
        pin(e.target);
      });
      
      pin(child);
    }
  }
}

//
// Add classes to announcement blocks
//
function addAnnouncementClass() {
  const blocks = document.getElementsByClassName("activity_block");
  
  for(var i = 0; i < blocks.length; i++) {
    var block = blocks[i]; // current block
    
    var type = block.dataset.typename;
    
    if(type === "praktyki") {
      block.classList.add(INFO_CLASS);
    }
  }
}

webext.storage.local.get(null, (items) => { 
  settings = items;
  injectCheckboxes();
});

function initSyjon() {
  const days = document.getElementsByClassName("weekdayentry").length;
  assignDays(days);
  markBlockInfo();
  assignTime();
  makeRoomGradient();
  addAnnouncementClass();
}

//
// Inject script to override set weekday
//
function overrideSetWeekday() {
  const script = document.createElement("script");
  script.src = webext.extension.getURL("/popup/syjon_scripts/setWeekday.js");
  document.getElementsByTagName("body")[0].appendChild(script);
}

overrideSetWeekday();
initSyjon();

window.addEventListener("message", function(event) {

  if (event.source !== window)
    return;

  if (event.data.action && (event.data.action === "INIT_SYJON")) {
    console.log("Received reload request");
    initSyjon();
    injectCheckboxes();
  }
}, false);