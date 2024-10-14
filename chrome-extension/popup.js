// popup.js
document.addEventListener('DOMContentLoaded', function() {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(null, function(items) {
        const table = document.getElementById('trackingData');
        if (table) {
          for (let [emailId, data] of Object.entries(items)) {
            const row = table.insertRow(-1);
            row.insertCell(0).textContent = emailId;
            row.insertCell(1).textContent = new Date(data.sent).toLocaleString();
            row.insertCell(2).textContent = data.opened 
              ? new Date(data.opened).toLocaleString() 
              : 'Not opened';
          }
        } else {
          console.error('Table element not found');
        }
      });
    } else {
      console.error('Chrome storage is not available');
      document.body.innerHTML = '<p>Error: Unable to access storage. Please check extension permissions.</p>';
    }
  });
  
  function checkForUpdates() {
    if (chrome && chrome.storage && chrome.storage.local) {
      fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=getTrackingData')
        .then(response => response.json())
        .then(data => {
          chrome.storage.local.get(null, function(items) {
            for (let [emailId, timestamp] of Object.entries(data)) {
              if (!items[emailId] || !items[emailId].opened) {
                chrome.storage.local.set({
                  [emailId]: { opened: timestamp }
                });
              }
            }
          });
        })
        .catch(error => console.error('Error:', error));
    } else {
      console.error('Chrome storage is not available for updates');
    }
  }
  
  // Check for updates every minute
  setInterval(checkForUpdates, 60000);