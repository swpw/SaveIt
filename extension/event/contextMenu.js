let contextMenuList = {
  "id": "SaveIt",
  "title": "Save a word",
  "contexts": ["selection"]
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create(contextMenuList);
});

chrome.contextMenus.onClicked.addListener(contextClicked);

function contextClicked(select) {
  if (select.menuItemId === contextMenuList.id && select.selectionText) {
    chrome.tabs.query({
      'active': true,
      'lastFocusedWindow': true,
      'currentWindow': true
    }, tabs => {
      url = tabs[0].url;
      storage(select.selectionText, url);
    });
  }


}

function storage(value, url) {
  chrome.storage.sync.get("storedText", (obj) => {
    if (obj.storedText) {
      obj.storedText.push({
        "word": value,
        "location": getLocation(url),
        "isMarked": false,
        "date": new Date().toString(),
        "added": "popup",
        "id": new Date().valueOf().toString(),
        "description": ""
      });
      chrome.storage.sync.set({ "storedText": obj.storedText }, alertAdded(value));
    } else {
      chrome.storage.sync.set({
        "storedText": [
          {
            "word": value,
            "location": getLocation(url),
            "isMarked": false,
            "date": new Date().toString(),
            "added": "popup",
            "id": new Date().valueOf().toString(),
            "description": ""
          }
        ]
      }, alertAdded(value));
    }
  });
}

function alertAdded(word) {
  const options = {
    type: "basic",
    title: "New word added!",
    message: `"${word}" has been added to your library.`,
    iconUrl: "../icon128.png"
  };

  chrome.storage.sync.get("checkbox", (obj) => {
    if (obj.checkbox === true)
      chrome.notifications.create(options);
  });
}

function getLocation(href) {
  let match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
  if (match === null) {
    return href;
  } else {
    return match[3];
  }
}
