const BLOCK_CLASS = "_syjon_pinned_block";
const CHECKBOX_CLASS = "_syjon_activity_checkbox";
//let webext = typeof chrome !== 'undefined' ? chrome : browser;
let schedule_wrapper = document.getElementById("plantablecontainer");
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
function assignDays(view = 1) {
  schedule_wrapper = document.getElementById("plantablecontainer");
  
  const blocks = document.getElementsByClassName("activity_block");
  
  // prevent redundancy
  if(blocks.length > 0 && blocks[0].classList.contains("_syjon"))
    return;
  
  for(var i = 0; i < blocks.length; i++) {
    addClass(blocks[i], "_syjon");
    
    let blockClass = "_syjon_day_";
    
    // weekend view
    if(view === 2) {
      blockClass += "weekend_" + getDay(parseFloat(property(blocks[i], "left")), 50);
    }
    
    // working days view
    if(view === 5) {
      blockClass += "working_" + getDay(parseFloat(property(blocks[i], "left")), 20);
    }

    // whole week view
    if(view === 7) {
      blockClass += "whole_" + getDay(parseFloat(property(blocks[i], "left")), 14.285714286);
    }
    
    addClass(blocks[i], blockClass);
  }
}

//
// Formats time from float
//
function formatTime(ftime) {
  let hour = Math.floor(ftime);
  let minutes = Math.round(ftime % Math.floor(ftime) * 60); 
  
  if(minutes >= 60) {
    hour++;
    minutes %= 60;
  }
  
  if(minutes / 10 === 0) {
    minutes = "0" + minutes;
  }
  
  
  return hour + ":" + minutes;
  
}

//
// Assign time schedule
//
function assignTime() {
  schedule_wrapper = document.getElementById("plantablecontainer");
  
  const blocks = document.getElementsByClassName("activity_block");
  
  for(let i = 0; i < blocks.length; i++) {
    const top    = parseFloat(property(blocks[i], "top"));
    const height = parseFloat(property(blocks[i], "height"));
    
    const wrapper_height = parseFloat(property(schedule_wrapper, "height"));
    
    // schedule time
    if(blocks[i].getElementsByClassName("_syjon_time").length < 1) {
      const start_time = formatTime(8 + 13 * top/wrapper_height);
      const end_time = formatTime(8 + 13 * (top + height)/wrapper_height);
      
      const time_wrapper = document.createElement("div");
      time_wrapper.innerHTML = start_time + " - " + end_time;
      
      addClass(time_wrapper, "_syjon_time");

      blocks[i].getElementsByClassName("activity_content")[0].appendChild(time_wrapper);
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
  if(checkbox.checked) {
    checkbox.parentElement.classList.add(BLOCK_CLASS);
  } else {
    checkbox.parentElement.classList.remove(BLOCK_CLASS);
  }
  
  var chkClass = checkbox.classList.item(1);
  var pageId = getPageId();
  
  if(typeof settings[pageId] == 'undefined') {
    settings[pageId] = {};
  }
  
  settings[pageId][chkClass] = checkbox.checked;
  
  webext.storage.local.set(settings);
  
};

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
  
  var checkboxSettings = settings[pageId];
  
  for(let i = 0; i < blocks.length; i++) {
    var chkClass = "_chk_" + i;
    
    var currentCheckbox = checkbox.cloneNode(true);
    currentCheckbox.className += " " + chkClass;
    
    if(typeof checkboxSettings[chkClass] != 'undefined') {
      currentCheckbox.checked = checkboxSettings[chkClass];
    }
    
    if(blocks[i].getElementsByClassName(CHECKBOX_CLASS).length === 0) {
      blocks[i].appendChild(currentCheckbox);
      
      var child = document.getElementsByClassName(chkClass)[0];
      
      child.addEventListener('change', (e) => {
        pin(e.target);
      });
      
      pin(child);
    }
  }
}

webext.storage.local.get(null, (items) => { 
  settings = items;
  injectCheckboxes();
});

var days = document.getElementById("weekday_header").children[0].rows[0].cells.length; 
assignDays(days);
assignTime();