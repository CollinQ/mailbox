console.log('Email Tracker content script loaded');

function insertTrackingPixel(composeWindow) {
    console.log('Attempting to insert tracking pixel');
    try {
        const emailId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const trackingUrl = `https://script.google.com/macros/s/AKfycbxu2YNCtzwg_g74bOGzjgcjDyGgFzSagYO4LMMlMovm7MMFi7FO3fP9BD32qfr5-FM/exec?emailId=${emailId}`;
        const trackingPixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none" alt="" />`;
        
        const body = composeWindow.querySelector('div[g_editable="true"]');
        if (!body) {
            console.error('Could not find editable email body');
            return;
        }
        body.innerHTML += trackingPixel;
        console.log('Tracking pixel inserted successfully');
        
        chrome.storage.local.set({[emailId]: {sent: new Date().toISOString(), opened: null}}, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving email data:', chrome.runtime.lastError);
            } else {
                console.log('Email data saved:', emailId);
            }
        });
    } catch (error) {
        console.error('Error inserting tracking pixel:', error);
    }
}

function isValidComposeWindow(element) {
    const hasEditableDiv = element.querySelector('div[g_editable="true"]') !== null;
    const hasSubjectInput = element.querySelector('input[name="subjectbox"]') !== null;
    const hasRecipientInput = element.querySelector('div[name="to"]') !== null;
    console.log('Checking compose window validity:', 
                'Has editable div:', hasEditableDiv, 
                'Has subject input:', hasSubjectInput,
                'Has recipient input:', hasRecipientInput);
    return hasEditableDiv && hasSubjectInput && hasRecipientInput;
}

function observeComposeMutations(mutations) {
    console.log('Mutation observed, checking for compose windows');
    for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                console.log('Added node:', node);
                const composeElement = node.classList.contains('AD') ? node : 
                                       node.querySelector('.AD') ||
                                       node.closest('.AD');
                console.log("Compose element:", composeElement);
                if (composeElement) {
                    console.log('Potential compose window detected:', composeElement);
                    if (isValidComposeWindow(composeElement)) {
                        console.log('Valid compose window confirmed');
                        insertTrackingPixel(composeElement);
                    } else {
                        console.log('Not a valid compose window');
                    }
                }
            }
        }
    }
}

function initializeTracker() {
    console.log('Initializing Email Tracker');
    const observer = new MutationObserver(observeComposeMutations);
    
    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);
    
    console.log('MutationObserver set up');
    checkExistingComposeWindows();
}

function checkExistingComposeWindows() {
    console.log('Checking for existing compose windows');
    const composeWindows = document.querySelectorAll('.AD');
    console.log('Found potential compose windows:', composeWindows.length);
    composeWindows.forEach((window, index) => {
        console.log(`Potential compose window ${index}:`, window);
        if (isValidComposeWindow(window)) {
            console.log('Valid compose window found:', window);
            insertTrackingPixel(window);
        }
    });
}

function checkGmailLoaded() {
    console.log('Checking if Gmail is loaded');
    const gmailViewElement = document.querySelector('div[role="main"]');
    if (gmailViewElement) {
        console.log('Gmail interface detected, initializing tracker');
        initializeTracker();
    } else {
        console.log('Gmail interface not yet loaded, retrying in 1 second');
        setTimeout(checkGmailLoaded, 1000);
    }
}

// Start the initialization process
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkGmailLoaded);
} else {
    checkGmailLoaded();
}

// Expose debugging functions globally
window.debugEmailTracker = {
    checkExistingComposeWindows: checkExistingComposeWindows,
    logComposeElements: () => {
        console.log('Logging potential compose elements:');
        console.log('.AD elements:', document.querySelectorAll('.AD'));
        document.querySelectorAll('.AD').forEach((el, index) => {
            console.log(`AD element ${index}:`, el);
            console.log(`Is valid compose window: ${isValidComposeWindow(el)}`);
        });
    }
};

console.log('Email Tracker content script fully loaded and initialized');