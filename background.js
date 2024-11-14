import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2';


chrome.runtime.onInstalled.addListener(() => {
  // Create a parent menu item
  chrome.contextMenus.create({
    id: "summariseMenu",
    title: "Summarise!",
    contexts: ["selection"]  // Only appears when text is selected
  });
});

chrome.contextMenus.onClicked.addListener(async(info, tab) => {
  const pipe = await pipeline('summarization','Xenova/distilbart-cnn-6-6');
  switch (info.menuItemId) {
    case "summariseMenu":
      // Delegate to content script for page interaction
      try {
        chrome.storage.local.set({ selectedText: 'Generating Summary Please Wait...' }, async () => {
          chrome.action.openPopup(); // Opens the popup window
          const out = await pipe(info.selectionText);
          const summary = out[0].summary_text;
          chrome.storage.local.set({ selectedText: summary }, () => {});
        });
      } catch (error) {
        console.error('Failed to send message to content script:', error);
      }
      break;
  }
});