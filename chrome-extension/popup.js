// popup.js
document.addEventListener('DOMContentLoaded', function() {
  loadTrackingData();
  checkForUpdates();
});

function loadTrackingData() {
  if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(null, function(items) {
          const table = document.getElementById('trackingData');
          if (table) {
              // Clear existing table rows
              while (table.rows.length > 1) {
                  table.deleteRow(1);
              }
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
}

function checkForUpdates() {
  if (chrome && chrome.storage && chrome.storage.local) {
      fetch('https://script.google.com/macros/s/AKfycbwrLxsdW4w6xOqu-GX1HOxNhPYG2qFeiE1J_NxgS9YlxnmvHv6_vqujay7EQHFcSzvu/exec?action=getTrackingData')
          .then(response => {
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.text(); // Get the response as text first
          })
          .then(text => {
              console.log('Response text:', text); // Log the raw response
              try {
                  return JSON.parse(text); // Try to parse it as JSON
              } catch (e) {
                  console.error('Failed to parse response as JSON:', e);
                  throw new Error('The server response was not valid JSON');
              }
          })
          .then(data => {
              chrome.storage.local.get(null, function(items) {
                  let updated = false;
                  for (let [emailId, timestamp] of Object.entries(data)) {
                      if (!items[emailId] || !items[emailId].opened) {
                          chrome.storage.local.set({
                              [emailId]: { ...items[emailId], opened: timestamp }
                          });
                          updated = true;
                      }
                  }
                  if (updated) {
                      loadTrackingData(); // Reload the table if there were updates
                  }
              });
          })
          .catch(error => {
              console.error('Error:', error);
              // Optionally, update the UI to show the error to the user
              document.getElementById('errorMessage').textContent = 'Failed to fetch updates: ' + error.message;
          });
  } else {
      console.error('Chrome storage is not available for updates');
  }
}

// Check for updates every minute
setInterval(checkForUpdates, 60000);

// Add a manual refresh button
document.getElementById('refreshButton').addEventListener('click', function() {
  checkForUpdates();
});