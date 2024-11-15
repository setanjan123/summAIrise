import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2';


chrome.runtime.onInstalled.addListener(async() => {
  // Create a parent menu item
  chrome.contextMenus.create({
    id: "summariseMenu",
    title: "Summarise!",
    contexts: ["selection"]  // Only appears when text is selected
  });
});

chrome.contextMenus.onClicked.addListener(async(info, tab) => {
  chrome.action.openPopup(); // Opens the popup window
  const pipe = await pipeline('summarization','Xenova/distilbart-cnn-12-6');
  const out = await pipe(info.selectionText);
  const summary = out[0].summary_text;
  chrome.storage.local.set({ selectedText: summary }, () => {});
  try {
  } catch (error) {
    console.error('Failed to send message to content script:', error);
  }
});