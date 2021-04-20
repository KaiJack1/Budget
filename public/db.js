let db;
let budgetVersion;

// New budget request
const request = indexedDB.open('BudgetDB', budgetVersion || 21);

request.onupgradeneeded = function (e) {
  console.log('Upgrade needed in IndexDB');

  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetStore', { autoIncrement: true });
  }
};

request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log('check db invoked');

  // New transaction
  let transaction = db.transaction(['BudgetStore'], 'readwrite');

  // Checking the BudgetStore
  const store = transaction.objectStore('BudgetStore');

  // We need to get all the records
  const getAll = store.getAll();

  // If the request was successful
  getAll.onsuccess = function () {
    // grouping items and adding them
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // Checking to see if the response is empty
          if (res.length !== 0) {
            // Allowing another transaction to open.
            transaction = db.transaction(['BudgetStore'], 'readwrite');

            // matching currentStore
            const currentStore = transaction.objectStore('BudgetStore');

            // Insertions cleared
            currentStore.clear();
            console.log('Clearing store 🧹');
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log('success');
  db = e.target.result;

  // App is online
  if (navigator.onLine) {
    console.log('Backend online! 🗄️');
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log('Save record invoked');
  // Using readwrite to create transactions
  const transaction = db.transaction(['BudgetStore'], 'readwrite');

  // Were getting the object 'budgetstore'.
  const store = transaction.objectStore('BudgetStore');

  // Using add method to insert record
  store.add(record);
};

// App is listening for data
window.addEventListener('online', checkDatabase);