// schedule wrapper
var wrapper = document.getElementById("plantablecontainer");

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
  var result  = 0;
  var percent = left * 100 / parseFloat(property(wrapper, "width"));
  
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
  wrapper = document.getElementById("plantablecontainer");
  
  var blocks = document.getElementsByClassName("activity_block");
  
  // prevent redundancy
  if(blocks.length > 0 && blocks[0].classList.contains("_syjon"))
    return;
  
  for(var i = 0; i < blocks.length; i++) {
    addClass(blocks[i], "_syjon");
    
    var blockClass = "_syjon_day_";
    
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
  var hour = Math.floor(ftime);
  var minutes = Math.round(ftime % Math.floor(ftime) * 60); 
  
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
  wrapper = document.getElementById("plantablecontainer");
  
  var blocks = document.getElementsByClassName("activity_block");
  
  for(var i = 0; i < blocks.length; i++) {
    var top    = parseFloat(property(blocks[i], "top"));
    var height = parseFloat(property(blocks[i], "height"));
    
    var wrapper_height = parseFloat(property(wrapper, "height"));
    
    // schedule time
    if(blocks[i].getElementsByClassName("_syjon_time").length < 1) {
      var start_time = formatTime(8 + 13 * top/wrapper_height);
      var end_time = formatTime(8 + 13 * (top + height)/wrapper_height);
      
      var time_wrapper = document.createElement("div");
      time_wrapper.innerHTML = start_time + " - " + end_time;
      
      addClass(time_wrapper, "_syjon_time");

      blocks[i].getElementsByClassName("activity_content")[0].appendChild(time_wrapper);
    }

  }
}


var days = document.getElementById("weekday_header").children[0].rows[0].cells.length; 
assignDays(days);
assignTime();