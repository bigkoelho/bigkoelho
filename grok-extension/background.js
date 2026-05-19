chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

let taskQueue = [];
let expectedFilename = null;
let currentTabId = null;
let isStopped = false;
let isPaused = false;

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (expectedFilename) {
    // expectedFilename already contains the full path + correct extension — use it directly
    suggest({ filename: expectedFilename, conflictAction: 'uniquify' });
    expectedFilename = null;
  } else {
    suggest({});
  }
  return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // expect_download needs a synchronous response so content.js can await it,
  // guaranteeing expectedFilename is set before the download link is clicked.
  if (message.action === "expect_download") {
    expectedFilename = message.filename;
    sendResponse({ ok: true });
    return false;
  }

  switch (message.action) {
    case "start_batch":
      taskQueue = message.queue;
      currentTabId = message.tabId;
      isStopped = false;
      isPaused = false;
      processNext();
      break;
    case "task_done":
      if (!isStopped && !isPaused) setTimeout(processNext, 4000);
      break;
    case "stop_batch":
      isStopped = true;
      isPaused = false;
      taskQueue = [];
      chrome.runtime.sendMessage({ action: "batch_stopped" });
      break;
    case "pause_batch":
      isPaused = true;
      break;
    case "resume_batch":
      isPaused = false;
      processNext();
      break;
    case "download_media":
      // Set expectedFilename BEFORE starting the download so onDeterminingFilename
      // always overwrites Chrome's default suggestion with our explicit name.
      expectedFilename = message.filename;
      chrome.downloads.download({ url: message.url, filename: message.filename });
      break;
  }
});

async function processNext() {
  if (isStopped || isPaused) return;
  if (taskQueue.length === 0) {
    chrome.runtime.sendMessage({ action: "finish_all" });
    return;
  }

  const nextTask = taskQueue.shift();

  try {
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: ["content.js"]
    });

    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      func: (taskData) => {
        window.dispatchEvent(new CustomEvent('START_GROK_TASK', { detail: taskData }));
      },
      args: [nextTask]
    });
  } catch (err) {
    chrome.runtime.sendMessage({
      action: "update_ui_progress",
      index: nextTask.originalIndex,
      state: "error",
      text: "Erro ao injetar script. Recarregue o Grok (F5) e tente novamente."
    });
    if (!isStopped) setTimeout(processNext, 4000);
  }
}
