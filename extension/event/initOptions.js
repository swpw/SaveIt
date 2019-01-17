chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ "checkbox": true });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ "webUrl": true });
});
