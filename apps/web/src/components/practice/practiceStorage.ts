/**
 * practiceStorage.ts
 *
 * All persistence helpers for an in-progress practice session.
 * Practice writes here; Post imports clearAllPracticeStorage() to clean up
 * on save or discard.
 */


export const SESSION_KEY  = "koda_practice_session";
export const REC_META_KEY = "koda_recordings_meta";
export const UP_META_KEY  = "koda_uploads_meta";

// this is basically what lives in session storage so timer doesn't get reset on refresh
export type PersistedSession = {
  startTimestamp: number;       // ms epoch when practice began
  pausedMs:       number;       // total ms already spent paused
  pausedAt:       number | null; // epoch ms when current pause started (null = running)
  instrument:     string;
};

// these 2 types are used to store in indexDB
export type RecordingEntry = {
  id:          string;
  type:        "audio" | "video";
  blob:        Blob;
  url:         string;
  aiFileUrl?:  string;
  durationSec: number;
  aiRequested: boolean;
  savedForPracticeLog: boolean;
};

export type UploadedFile = {
  id:          string;
  type:        "image" | "pdf";
  name:        string;
  url:         string;
  aiRequested: boolean;
  file:        File;
};

// these types are used to store in session storage (specifically id)
export type PersistedRecordingMeta = {
  id:          string;
  type:        "audio" | "video";
  aiFileUrl?:  string;
  durationSec: number;
  aiRequested: boolean;
  savedForPracticeLog: boolean;
};

export type PersistedUploadMeta = {
  id:       string;
  type:     "image" | "pdf";
  name:     string;
  aiRequested: boolean;
  mimeType: string;
};


export function loadSession(): PersistedSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(s: PersistedSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function clearPracticeSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(REC_META_KEY);
  sessionStorage.removeItem(UP_META_KEY);
}

// This allows audio/video files to persist across rerenders on client side without having to save all media files to backend DB

const IDB_NAME  = "koda_practice";
const IDB_STORE = "blobs";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function idbPut(key: string, value: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

export async function idbGet(key: string): Promise<Blob | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror   = () => reject(req.error);
  });
}

export async function idbDelete(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).delete(key);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

export async function idbClearAll(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).clear();
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}


export async function clearAllPracticeStorage(): Promise<void> {
  clearPracticeSession();
  await idbClearAll();
}

// formats time on Practice.tsx
export function formatTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}