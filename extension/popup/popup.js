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
        "id": new Date().valueOf().
          toString(),
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
            "id": new Date().valueOf().
              toString(),
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

//

const nav = document.querySelector('.nav');

nav.addEventListener('click', e => {
  e.preventDefault();

  if (!e.target.classList.contains('nav__tab--open')) {
    document.querySelector('.nav__tab--open').classList.toggle('nav__tab--open');
    e.target.classList.toggle('nav__tab--open');

    switch (e.target.textContent) {
      case 'Add Words':
        document.querySelector('.form').classList.toggle('form--hidden');
        document.querySelector('.words').classList.toggle('words--hidden');
        break;

      case 'Check Words':
        document.querySelector('.form').classList.toggle('form--hidden');
        document.querySelector('.words').classList.toggle('words--hidden');

        chrome.storage.sync.get("storedText", obj => {
          const textList = obj.storedText;

          const removeResults = document.querySelectorAll('.words__li');
          for (const el of removeResults) {
            el.remove();
          }

          textList.forEach(e => {
            const { word, description } = e;

            const template = `<div class="text">${word}</div>
                <div class="userText">${description}</div>`;

            const li = document.createElement('li'),
              ul = document.querySelector('.words__ul');

            li.classList = "words__li";
            li.innerHTML = template;
            ul.append(li);
          });
        });
        break;
    }
  }
});
