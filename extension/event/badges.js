chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("storedText", (obj) => {
    if (obj.storedText) {
      chrome.browserAction.setBadgeText({
        "text": obj.storedText.length.toString()
      });
    } else {
      chrome.browserAction.setBadgeText({
        "text": "0"
      });
    }
    chrome.browserAction.setBadgeBackgroundColor({
      color: "#2196f3"
    });
  });
});


chrome.storage.onChanged.addListener((changes) => {
  if (changes.storedText && changes.storedText.newValue) {
    chrome.browserAction.setBadgeText({
      "text": changes.storedText.newValue.length.toString()
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: "#2196f3"
    });
  }
});
