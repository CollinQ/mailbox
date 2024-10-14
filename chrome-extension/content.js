// content.js
function insertTrackingPixel(composeWindow) {
    // Generate a unique ID for this email
    const emailId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Create the tracking pixel URL
    const trackingUrl = `https://script.google.com/macros/s/AKfycbxu2YNCtzwg_g74bOGzjgcjDyGgFzSagYO4LMMlMovm7MMFi7FO3fP9BD32qfr5-FM/exec?emailId=${emailId}`;
    
    // Insert the tracking pixel into the email body
    const trackingPixel = `<img src="${trackingUrl}" width="1" height="1" />`;
    const body = composeWindow.querySelector('div[g_editable="true"]');
    body.innerHTML += trackingPixel;
    
    // Store the email ID for later reference
    chrome.storage.local.set({[emailId]: {sent: new Date().toISOString(), opened: null}});
  }
  
  // Listen for new compose windows
  const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      for (let node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('compose')) {
          insertTrackingPixel(node);
        }
      }
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });