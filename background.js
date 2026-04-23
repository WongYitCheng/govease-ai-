// background.js - Service Worker for GovEase AI

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('GovEase AI Extension Installed');
  
  // Initialize default settings
  chrome.storage.local.set({
    settings: {
      autoFillEnabled: true,
      highlightFields: true,
      showNotifications: true
    }
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received:', request);
  
  switch (request.action) {
    case 'getUserData':
      chrome.storage.local.get(['userData'], (result) => {
        sendResponse({ userData: result.userData || null });
      });
      return true; // Keep channel open for async response
      
    case 'saveUserData':
      chrome.storage.local.set({ userData: request.data }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'clearUserData':
      chrome.storage.local.remove('userData', () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'fillCurrentForm':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: triggerAutoFill
        });
      });
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Helper function injected into page
function triggerAutoFill() {
  // Dispatch custom event that content script listens for
  window.dispatchEvent(new CustomEvent('govEaseFillForm'));
}