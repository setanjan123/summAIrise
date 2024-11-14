chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.selectedText) {
      const textDisplay = document.getElementById("textDisplay");
      textDisplay.textContent = changes.selectedText.newValue || "No text selected.";
    }
  });

  // Handle the copy to clipboard functionality
  document.getElementById("copyButton").addEventListener("click", () => {
    const textDisplay = document.getElementById("textDisplay").textContent;
    if (textDisplay && textDisplay !== "No text selected.") {
      // Copy the text to the clipboard
      navigator.clipboard.writeText(textDisplay).then(() => {
      }).catch(err => {
        console.error("Error copying text: ", err);
      });
    }
  });