chrome.runtime.onMessage.addListener(async function (message) {
  if (message.action === "setLocalStorage") {
    // Set localStorage data from the extension
    chrome.scripting.executeScript({
      target: {tabId: message.tabId},
      func: (data) => {
        for(const key in data) {
          localStorage.setItem(key, data[key]);
        }  
        alert('Restore Complete. Please reload page to see changes')
      },
      args: [message.data]
   });
  } else {
    chrome.scripting.executeScript({
      target: {tabId: message.tabId},
      func: () => {
        const map = {}
        Object.keys(localStorage).forEach(key => {
              map[key] = localStorage.getItem(key)
        }); //get all leetcode solutions from tab's local storage
        chrome.storage.local.set({'leetcode-sync':map},()=>{}) // storing the recieved solutions into localstorage
      }
   });
  }
});