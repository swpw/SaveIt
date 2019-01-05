const form = document.querySelector('.form');

form.addEventListener('submit', e => {
  e.preventDefault();

  const inputText = e.target[0],
    value = inputText.value;

  if (value.length >= 1) {
    storage(value);
  }

  inputText.value = "";
});

function storage(value) {
  chrome.storage.sync.get("storedText", (obj) => {
    if (obj.storedText) {
      obj.storedText.push({
        "word": value,
        "location": "Manually Added",
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
            "location": "Manually Added",
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
