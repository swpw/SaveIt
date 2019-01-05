const filter = document.querySelector('.filter'),
  search = document.querySelector('.header__search');

window.addEventListener('load', () => {
  chrome.storage.sync.get("storedText", obj => {
    const textList = obj.storedText;

    if (textList) {
      filterSwitch(filter.value, textList);
    }
  });
});

filter.addEventListener('change', e => {
  chrome.storage.sync.get("storedText", obj => {
    const textList = obj.storedText,
      value = e.target.value;

    if (textList) {
      filterSwitch(value, textList);
    }
  });
});

chrome.storage.onChanged.addListener((changes) => {
  const textList = changes.storedText.newValue;

  if (textList) {
    filterSwitch(filter.value, textList);
  }
});

function filterSwitch(value, textList) {
  let descList = [];

  switch (value) {
    case 'ascending':
      textList.sort((obj1, obj2) => obj1.word - obj2.word);
      textList.sort((a, b) => {
        if (a.word.toLowerCase() < b.word.toLowerCase()) return -1;
        if (a.word.toLowerCase() > b.word.toLowerCase()) return 1;
        return 0;
      });
      createElements(textList);
      break;

    case 'descending':
      textList.sort((obj1, obj2) => obj1.word - obj2.word);
      textList.sort((a, b) => {
        if (a.word.toLowerCase() < b.word.toLowerCase()) return -1;
        if (a.word.toLowerCase() > b.word.toLowerCase()) return 1;
        return 0;
      });
      for (let el of textList) {
        descList.unshift(el);
      }
      createElements(descList);
      break;

    case 'old-date':
      createElements(textList);
      break;

    case 'new-date':
      for (let el of textList) {
        descList.unshift(el);
      }
      createElements(descList);
      break;

    case 'fav':
      createElements(textList.filter(e => e.isMarked === true));
      break;

    case 'not-fav':
      createElements(textList.filter(e => e.isMarked === false));
      break;
  }
}

//

search.addEventListener('keyup', e => {
  const allWords = document.querySelectorAll('.text__paragraph');
  let userInput = e.target.value;

  allWords.forEach(txt => {
    let text = txt.textContent.toLowerCase();

    if (text.toLowerCase().slice(0, userInput.length) === userInput.toLowerCase() || userInput.length === 0) {
      txt.parentElement.parentElement.classList = 'results__item';
    } else {
      txt.parentElement.parentElement.classList = 'results__item results__item--not-visible';
    }
  });

  wordResultsCount();
});

//

function createElements(array) {
  const removeResults = document.querySelectorAll('.results__item');
  for (const el of removeResults) {
    el.remove();
  }

  array.forEach(e => {
    const { word, description, date, location, isMarked } = e;

    const html = `<div class="modify">
        <img class="modify__icon--edit" src="../../icons/edit.svg">
        <img class="modify__icon--delete" src="../../icons/delete.svg">
      </div>
      <div class="text">
        <p class="text__paragraph">${word}</p>
      </div>
      <div class="user-text">
        <p class="user-text__paragraph">${description}</p>
      </div>
      <div class="date">
        <p class="date__paragraph">${dateFormat(new Date(date))}</p>
      </div>
      <div class="website">
        <p class="website__paragraph">${location}</p>
      </div>
      <div class="${favClassChecker(isMarked)}">
        <img class="favorite__icon" src="../../icons/${favSvgName(isMarked)}.svg">
      </div>`;

    const li = document.createElement('li'),
      ul = document.querySelector('.results');

    li.id = e.id;
    li.classList = "results__item";
    li.innerHTML = html;
    ul.append(li);
  });

  const newResults = document.querySelectorAll('.results__item'),
    wordsFound = document.querySelector('.main__wordsCount');

  if (newResults.length === 1)
    wordsFound.textContent = `${newResults.length} word found.`;
  else if (newResults.length >= 2 || newResults.length === 0)
    wordsFound.textContent = `${newResults.length} words found.`;

  newResults.forEach(e => e.addEventListener('click', columnEvent));
}

function columnEvent(e) {
  switch (e.target.className) {
    //delete element
    case 'modify__icon--delete':
      if (confirm(`Are you sure you want to delete`)) {
        chrome.storage.sync.get("storedText", obj => {
          const textList = obj.storedText;
          const getChosenElement = textList.map((obj, pos) => {
            if (obj.id === e.path[2].id) {
              return pos;
            }
          }).filter(isFinite)[0];

          textList.splice(getChosenElement, 1);
          chrome.storage.sync.set({ "storedText": textList }, () => alertDelete());
          e.path[2].remove();

          wordResultsCount();
        });
      }
      break;

    // Add/Remove favorite
    case 'favorite__icon':
      chrome.storage.sync.get("storedText", obj => {
        const textList = obj.storedText;
        const getChosenElement = textList.map((obj, pos) => {
          if (obj.id === e.path[2].id) {
            return pos;
          }
        }).filter(isFinite)[0];

        if (textList[getChosenElement].isMarked === false) {
          textList[getChosenElement].isMarked = true;
          e.target.setAttribute('src', '../../icons/star-full.svg');
        } else {
          textList[getChosenElement].isMarked = false;
          e.target.setAttribute('src', '../../icons/star-empty.svg');
        }

        chrome.storage.sync.set({ "storedText": textList });
      });
      break;

    // Enable Edit
    case 'modify__icon--edit':
      const text = e.target.parentElement.parentElement.children[1].children[0],
        userText = e.target.parentElement.parentElement.children[2].children[0];

      e.target.setAttribute('src', "../../icons/check.svg");
      e.target.classList = 'modify__icon--check';

      text.setAttribute('contentEditable', true);
      text.classList = 'text__paragraph text__paragraph--edit-enable';
      userText.setAttribute('contentEditable', true);
      userText.classList = 'user-text__paragraph user-text__paragraph--edit-enable';
      break;

    // Approve Edit
    case 'modify__icon--check':
      (() => {
        const text = e.target.parentElement.parentElement.children[1].children[0],
          userText = e.target.parentElement.parentElement.children[2].children[0];

        text.removeAttribute('contentEditable');
        text.classList = 'text__paragraph';
        userText.removeAttribute('contentEditable');
        userText.classList = 'user-text__paragraph';

        chrome.storage.sync.get("storedText", obj => {
          const textList = obj.storedText;
          const getChosenElement = textList.map((obj, pos) => {
            if (obj.id === e.path[2].id) {
              return pos;
            }
          }).filter(isFinite)[0];

          if (textList[getChosenElement].word !== text.textContent || textList[getChosenElement].description !== userText.textContent) {
            textList[getChosenElement].word = text.textContent;
            textList[getChosenElement].description = userText.textContent;
            chrome.storage.sync.set({ "storedText": textList });
          }
        });
      })();

      e.target.setAttribute('src', "../../icons/edit.svg");
      e.target.classList = 'modify__icon--edit';
      break;
  }
}

function dateFormat(date) {
  return `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)} ${("0" + date.getDate()).slice(-2)}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
}
function dateFormatDownload(date) {
  return `${("0" + date.getDate()).slice(-2)}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
}

function favClassChecker(word) {
  if (word) {
    return 'favorite';
  } else {
    return 'not-favorite';
  }
}

function favSvgName(fav) {
  if (fav) {
    return "star-full";
  } else {
    return "star-empty";
  }
}

function alertDelete() {
  const options = {
    type: "basic",
    title: "Word removed!",
    message: `Word has been removed from your library.`,
    iconUrl: "../icon128.png"
  };

  chrome.storage.sync.get("checkbox", obj => {
    if (obj.checkbox) chrome.notifications.create(options);
  });
}

//

document.querySelector('#deleteAll').addEventListener('click', () => {
  const results = document.querySelectorAll('.results__item'),
    wordsCount = document.querySelector('.main__wordsCount');

  if (confirm('Are you sure you want to delete all your words?')) {
    chrome.storage.sync.remove('storedText');

    chrome.browserAction.setBadgeText({
      "text": '0'
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: "#2196f3"
    });

    results.forEach(e => e.remove());
    wordsCount.textContent = '0 words found.';
  }
});

//

document.querySelector('#export').addEventListener('click', () => {
  chrome.storage.sync.get("storedText", obj => {
    const textList = obj.storedText,
      link = document.createElement('a'),
      makeTextFile = text => {
        let data = new Blob([text], { type: 'application/json' });
        if (textFile !== null) {
          window.URL.revokeObjectURL(textFile);
        }
        textFile = window.URL.createObjectURL(data);
        return textFile;
      };
    let textFile = null;

    link.href = makeTextFile(JSON.stringify(textList));
    link.setAttribute('download', `SaveIt-${dateFormatDownload(new Date())}.json`);
    link.click();
  });
});

//

document.querySelector('#import').addEventListener('click', () => {
  const importFile = document.createElement('input');
  importFile.setAttribute('type', 'file');
  importFile.setAttribute('accept', 'application/json');
  importFile.addEventListener('change', (e) => {
    if (!confirm('Are you sure you want to overwrite all your words with new ones?')) {
      return;
    }

    const file = e.path[0].files[0],
      reader = new FileReader();

    reader.onload = e => {
      const result = e.target.result;
      chrome.storage.sync.set({ 'storedText': JSON.parse(result) }, () => notifyImport());
    };
    reader.readAsText(file);
  });
  importFile.click();
});

function notifyImport() {
  const options = {
    type: "basic",
    title: "Succesful import",
    message: `You've succesfully imported new files.`,
    iconUrl: "../icon128.png"
  };

  chrome.storage.sync.get("checkbox", obj => {
    if (obj.checkbox) chrome.notifications.create(options);
  });
}

function wordResultsCount() {
  const list = document.querySelectorAll('.results__item'),
    wordsFound = document.querySelector('.main__wordsCount');

  let listLength = 0;

  for (let i = 0; i < list.length; i++) {
    if (list[i].className === 'results__item') {
      listLength += 1;
    }
  }

  if (listLength === 1)
    wordsFound.textContent = `${listLength} word found.`;
  else if (listLength >= 2 || listLength === 0)
    wordsFound.textContent = `${listLength} words found.`;
}
