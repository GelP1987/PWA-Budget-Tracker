console.log("Loading idb.js");

const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let database;
const request = indexedDB.open("budget-tracker", 1);

request.onsuccess = ({ target }) => {
  db = target.result;
};

request.onupgradeneeded = (event) => {
  const database = event.target.result;
  database.createObjectStore("savedData", { autoIncrement: true });
};

function saveRecord(savesRecord) {
  const transaction = database.transaction(["savedData"], "readwrite");
  const store = transaction.objectStore("savedData");

  console.log("in saveRecord", savesRecord);
  store.add(savesRecord);
}

function checkDB() {
  const transaction = database.transaction(["savedData"], "readwrite");
  const store = transaction.objectStore("savedData");
  const allRecords = store.getAll();

  allRecords.onsuccess = () => {
    if (allRecords.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(allRecords.result),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = database.transaction(["savedData"], "readwrite");
          const store = transaction.objectStore("savedData");
          store.clear();
        });
    }
  };
}

window.addEventListener("online", checkDB);
