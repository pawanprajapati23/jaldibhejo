self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST' && event.request.url.includes('/share-target')) {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const files = formData.getAll('files');
          const title = formData.get('title') || '';
          const text = formData.get('text') || '';
          const url = formData.get('url') || '';

          // We use IndexedDB to pass files to the client
          await storeSharedData(files, { title, text, url });

          return Response.redirect('/?shared=1', 303);
        } catch (err) {
          console.error('Error handling share target POST', err);
          return Response.redirect('/?shared_error=1', 303);
        }
      })()
    );
  }
});

function storeSharedData(files, textData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('JaldiBhejoShareDB', 1);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('sharedFiles')) {
        db.createObjectStore('sharedFiles', { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('sharedText')) {
        db.createObjectStore('sharedText', { autoIncrement: true });
      }
    };

    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(['sharedFiles', 'sharedText'], 'readwrite');
      const fileStore = tx.objectStore('sharedFiles');
      const textStore = tx.objectStore('sharedText');

      fileStore.clear();
      textStore.clear();

      if (files && files.length > 0) {
        files.forEach((file) => {
          if (file instanceof File) fileStore.add(file);
        });
      }

      if (textData.text || textData.url || textData.title) {
        textStore.add(textData);
      }

      tx.oncomplete = () => {
        resolve();
      };
      tx.onerror = () => {
        reject(tx.error);
      };
    };

    request.onerror = (e) => reject(e.target.error);
  });
}
