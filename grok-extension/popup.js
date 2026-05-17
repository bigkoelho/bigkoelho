document.getElementById('open-panel').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.sidePanel.open({ tabId: tabs[0].id }).catch(() => {
        chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
      });
    }
  });
  window.close();
});
