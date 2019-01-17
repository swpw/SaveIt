// Notifications
const notifyBox = document.querySelector('.notify__checkbox'),
  webUrl = document.querySelector('.webUrl__checkbox');

chrome.storage.sync.get("checkbox", obj => {
  if (obj.checkbox === false) {
    delete notifyBox.removeAttribute("checked");
  }
});

notifyBox.addEventListener('change', e => {
  const checked = e.target.checked;
  chrome.storage.sync.set({ "checkbox": checked });
});


chrome.storage.sync.get('webUrl', obj => {
  if (obj.webUrl === false) {
    delete webUrl.removeAttribute("checked");
  }
});

webUrl.addEventListener('change', e => {
  const checked = e.target.checked;
  chrome.storage.sync.set({ "webUrl": checked });
});
