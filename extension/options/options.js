// Notifications
const notifyBox = document.querySelector('.notify__checkbox');

chrome.storage.sync.get("checkbox", (obj) => {
  if (obj.checkbox === false) {
    delete notifyBox.removeAttribute("checked")
  };
});

notifyBox.addEventListener('change', (e) => {
  const checked = e.target.checked;
  chrome.storage.sync.set({ "checkbox": checked });
});
