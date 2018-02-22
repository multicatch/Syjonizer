const HIDDEN_CLASS = "_syjon_hidden_block";
var webext = typeof chrome !== 'undefined' ? chrome : browser;

function updateBlocks(request, sender, response) {
  if(request.arg[0] !== "groups")
    return;
  
  // get groups
  var lb = "" + request.arg[1][0];
  var kw = "" + request.arg[1][1];
  
  // get all blocks
  var blocks = document.getElementsByClassName("activity_block");
  
  for(var i = 0; i < blocks.length; i++) {
    var block = blocks[i]; // current block
    
    block.classList.remove(HIDDEN_CLASS);
    
    var type = block.getElementsByClassName("activity_content")[0].getElementsByClassName("bottom_content_containter")[0].getElementsByClassName("type_content")[0].children[0].innerHTML;
    
    var group = block.getElementsByClassName("activity_group")[0];
    
    // if block has a group, get it
    if(typeof group !== "undefined") {
      group = group.innerHTML;
    }
    
    // LB check
    if(type === "LB" && group != lb && lb !== "0") {
      block.classList.add(HIDDEN_CLASS);
    }
    
    // KW check
    if(type === "KW" && group != kw && kw !== "0") {
      block.classList.add(HIDDEN_CLASS);
    }
  }
}

// trigger on message
webext.runtime.onMessage.addListener(updateBlocks);