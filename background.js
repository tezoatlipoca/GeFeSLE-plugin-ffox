
console.log(' | Background script running');


browser.commands.onCommand.addListener((command) => {
    if (command === "open_popup") {
      browser.browserAction.focus();
      
    }
  });

  browser.commands.onCommand.addListener((command) => {
    if (command === "_execute_browser_action") {
      browser.browserAction.focus();
    }
  });
  
 