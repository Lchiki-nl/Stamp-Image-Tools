export interface GalleryImage {
  id: string;
  file: File;
  previewUrl: string;
  isProcessed: boolean;
  isSelected?: boolean;
}

const DB_NAME = "stamp-tools-db";
const STORE_NAME = "gallery";
const DB_VERSION = 1;

// Helper to open DB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
        reject(new Error("Browser only"));
        return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

export const saveGalleryState = async (images: GalleryImage[]) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing (simple strategy: overwrite all)
    // To be safer, we could clear first, or just put one by one.
    // Let's clear first to remove deleted images.
    await new Promise<void>((resolve, reject) => {
        const clearReq = store.clear();
        clearReq.onsuccess = () => resolve();
        clearReq.onerror = () => reject(clearReq.error);
    });

    // Save all
    const promises = images.map((img) => {
      return new Promise<void>((resolve, reject) => {
        // Store just the file/blob and metadata
        // createObjectURL's previewUrl cannot be stored, we must regenerate it on load
        const item = {
          id: img.id,
          file: img.file, // IndexedDB can store File/Blob objects directly
          isProcessed: img.isProcessed,
          isSelected: img.isSelected,
          timestamp: Date.now()
        };
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Failed to save gallery state:", error);
  }
};

export const loadGalleryState = async (): Promise<GalleryImage[]> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const results = request.result || [];
        // Convert stored items back to GalleryImage
        // Filter out old items if needed (e.g. > 24h)
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        const images: GalleryImage[] = results
            .filter((item: any) => {
                return (now - (item.timestamp || 0)) < TWENTY_FOUR_HOURS;
            })
            .map((item: any) => ({
                id: item.id,
                file: item.file,
                isProcessed: item.isProcessed,
                isSelected: item.isSelected,
                previewUrl: URL.createObjectURL(item.file) // Regenerate URL
            }));
        resolve(images);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to load gallery state:", error);
    return [];
  }
};

export const clearGalleryState = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
  } catch (error) {
    console.error("Failed to clear gallery state:", error);
  }
};
