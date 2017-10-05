var webext = typeof chrome !== 'undefined' ? chrome : browser;

function removeCSS(request, sender, response) {
  if(request.arg[0] !== "removeCSS") 
    return;
  
  var cssElements = document.getElementsByClassName(request.arg[1]);
  var amount = cssElements.length;
  
  for(var i = 0; i < amount; i++) {
    cssElements[0] & cssElements[0].parentNode.removeChild(cssElements[0]);
  }
}

// trigger on message
webext.runtime.onMessage.addListener(removeCSS);