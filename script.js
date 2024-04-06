function getAccessToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(token);
      }
    });
  });
}

async function getFileId() {
     let fileId = (await chrome.storage.sync.get('LEETCODE_SYNC_FILE_ID'))['LEETCODE_SYNC_FILE_ID']
     if(!fileId) {
      const accessToken = await getAccessToken();
      const response = await fetch('https://www.googleapis.com/drive/v3/files?q=name="leetcode_sync.json"&trashed=false',{method:'GET',headers: {'Authorization': `Bearer ${accessToken}`}})
      const files = await response.json()
      if(files.files.length>0) {
        await chrome.storage.sync.set({'LEETCODE_SYNC_FILE_ID':files.files[0].id})
        fileId = files.files[0].id;
      }
    }
    return fileId;
}
     

document.getElementById("save").addEventListener("click", async() => {
      chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
        const myTabId = tabs[0].id;
        await chrome.runtime.sendMessage({action: 'sync-storage',tabId:myTabId})
        const accessToken = await getAccessToken();
        chrome.storage.local.get('leetcode-sync', async (result) => {
          const blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
          const fileId = await getFileId();
          const metadata = {
              name: 'leetcode_sync.json',
              mimeType: blob.type,
          };
          const formData = new FormData();
          formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
          formData.append('file', blob);
          if(!fileId) {
            const apiUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
            const resp = await fetch(apiUrl, {method: 'POST',headers: {Authorization: `Bearer ${accessToken}`},body: formData})
            const respjson = await resp.json();
            await chrome.storage.sync.set({'LEETCODE_SYNC_FILE_ID':respjson.id})
          } else {
            await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
            {method: 'PATCH',headers: {'Authorization': `Bearer ${accessToken}`},body: formData});
          }
          alert('Saved to Drive!')
       });
  });
});

document.getElementById("restore").addEventListener("click", async () => {
    const accessToken = await getAccessToken();
    const fileId = await getFileId();
    if(fileId) {
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

      fetch(downloadUrl, {headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const jsonContent = reader.result;
            const jsonObject = JSON.parse(jsonContent)['leetcode-sync']
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
              const myTabId = tabs[0].id;
              chrome.runtime.sendMessage({action: "setLocalStorage", data: jsonObject,tabId:myTabId});
            });
          };
          reader.readAsText(blob);
        })
        .catch((error) => {
          console.error('Error downloading file:', error);
        });
    } else {
       alert('No sync file found')
    } 
});