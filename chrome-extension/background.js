// background.js
chrome.runtime.onInstalled.addListener(function() {
    console.log("Email Tracker extension installed");
  });
  
  // Listen for messages from content script or popup
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action === "trackEmail") {
        // Here you would implement the logic to track the email
        console.log("Tracking email:", request.emailId);
        // You might want to send this data to your Google Apps Script here
        sendResponse({status: "Email tracked"});
      }
    }
  );