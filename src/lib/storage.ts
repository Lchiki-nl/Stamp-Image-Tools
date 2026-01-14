import { GalleryImage } from "@/types/gallery";

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

interface StoredGalleryImage {
    id: string;
    file: File;
    name: string;
    type: string;
    width: number;
    height: number;
    status:  'pending' | 'processing' | 'done' | 'error';
    isSelected: boolean;
    createdAt: number;
    timestamp: number; // For expiration
}

export const saveGalleryState = async (images: GalleryImage[]) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing
    await new Promise<void>((resolve, reject) => {
        const clearReq = store.clear();
        clearReq.onsuccess = () => resolve();
        clearReq.onerror = () => reject(clearReq.error);
    });

    // Save all
    const promises = images.map((img) => {
      return new Promise<void>((resolve, reject) => {
        const item: StoredGalleryImage = {
          id: img.id,
          file: img.file,
          name: img.name,
          type: img.type,
          width: img.width,
          height: img.height,
          status: img.status,
          isSelected: img.isSelected,
          createdAt: img.createdAt,
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
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        const images: GalleryImage[] = results
            .filter((item: StoredGalleryImage) => {
                return (now - (item.timestamp || 0)) < TWENTY_FOUR_HOURS;
            })
            .map((item: StoredGalleryImage) => ({
                id: item.id,
                file: item.file,
                previewUrl: URL.createObjectURL(item.file),
                name: item.name,
                type: item.type,
                width: item.width,
                height: item.height,
                status: item.status,
                isSelected: item.isSelected,
                createdAt: item.createdAt,
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
