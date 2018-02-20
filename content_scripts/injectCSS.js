var webext = typeof chrome !== 'undefined' ? chrome : browser;

function injectCSS(request, sender, response) {
  if(request.arg[0] !== "injectCSS") 
    return;
  
  const link = document.createElement("link");
  link.href = webext.extension.getURL("/popup/syjon_style/" + request.arg[1] + ".css");
  link.className = request.arg[1];
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);
}

// trigger on message
webext.runtime.onMessage.addListener(injectCSS);