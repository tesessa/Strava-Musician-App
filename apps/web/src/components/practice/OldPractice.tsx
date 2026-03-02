import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { INSTRUMENTS } from "@strava-musician-app/shared";
import "./practice.css";


// Will probably want to move these 2 types out of this file 

type RecordingEntry = {
  id: string;
  type: "audio" | "video";
  blob: Blob;
  url: string;
  durationSec: number;
  aiRequested: boolean;
  savedForPost: boolean;
};

type UploadedFile = {
  id: string;
  type: "image" | "pdf";
  name: string;
  url: string;
  aiRequested: boolean;
  file: File;
};

// the types below are for the purpose of saving media to session storage so it persists across refreshes
// I just wanted the videos/audios to not be deleted on refresh this fixes it or we could use the database, or if we don't care they can be deleted on refresh
type PersistedRecordingMeta = {
  id: string;
  type: "audio" | "video";
  durationSec: number;
  aiRequested: boolean;
  savedForPost: boolean;
};

type PersistedUploadMeta = {
  id: string;
  type: "image" | "pdf";
  name: string;
  aiRequested: boolean;
  mimeType: string;
};


// Persists instrument, practice timer, and paused on refresh
// session storage is deleted if you go back to home from practice page

const SESSION_KEY  = "koda_practice_session";
const REC_META_KEY = "koda_recordings_meta";
const UP_META_KEY  = "koda_uploads_meta";

type PersistedSession = {
  startTimestamp: number;    
  pausedMs:       number;  
  pausedAt:       number | null; 
  instrument:     string;
};

function loadSession(): PersistedSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(s: PersistedSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

function clearAllSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(REC_META_KEY);
  sessionStorage.removeItem(UP_META_KEY);
}


// ─── IndexedDB blob storage ───────────────────────────────────────────────────
// sessionStorage is text-only — blobs go in IndexedDB instead.
// Survives page refresh within the same tab.  Cleared on finish/discard.

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

async function idbPut(key: string, value: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<Blob | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror   = () => reject(req.error);
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).delete(key);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

async function idbClearAll(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, "readwrite").objectStore(IDB_STORE).clear();
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// formats time on practice page
function formatTime(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}



export default function Test() {
  const navigate = useNavigate();

  // ── Session state (timer + instrument + pause — all survive refresh) ─────────
  const [session, setSession] = useState<PersistedSession>(() => {
  const saved = loadSession();
  if (saved) return saved;
    const fresh: PersistedSession = {
      startTimestamp: Date.now(),
      pausedMs:       0,
      pausedAt:       null,
      instrument:     "",
    };
    saveSession(fresh);
    return fresh;
  });

  const isPaused = session.pausedAt !== null;

  const getElapsedMs = useCallback(() => {
    if (session.pausedAt !== null) {
      return session.pausedAt - session.startTimestamp - session.pausedMs;
    }
    return Date.now() - session.startTimestamp - session.pausedMs;
  }, [session]);

  const [displaySeconds, setDisplaySeconds] = useState(() =>
    Math.floor(getElapsedMs() / 1000)
  );

  // ── Media state (restored from IndexedDB on refresh) ─────────────────────────
  const [recordings, setRecordings]         = useState<RecordingEntry[]>([]);
  const [uploads, setUploads]               = useState<UploadedFile[]>([]);
  const [mediaRestored, setMediaRestored]   = useState(false);

  // ── UI / overlay state ────────────────────────────────────────────────────────
  const [audioRecording, setAudioRecording]     = useState(false);
  const [audioRecordTime, setAudioRecordTime]   = useState(0);
  const [videoRecording, setVideoRecording]     = useState(false);
  const [videoRecordTime, setVideoRecordTime]   = useState(0);
  const [showMetronome, setShowMetronome]       = useState(false);
  const [bpm, setBpm]                           = useState(80);
  const [metronomeRunning, setMetronomeRunning] = useState(false);
  const [drawerOpen, setDrawerOpen]             = useState(false);
  const [previewUrl, setPreviewUrl]             = useState<string | null>(null);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const audioRecorder    = useRef<MediaRecorder | null>(null);
  const audioChunks      = useRef<Blob[]>([]);
  const audioRecordStart = useRef<number>(0);
  const videoRecorder    = useRef<MediaRecorder | null>(null);
  const videoChunks      = useRef<Blob[]>([]);
  const videoPreviewRef  = useRef<HTMLVideoElement>(null);
  const uploadRef        = useRef<HTMLInputElement>(null);
  const metronomeRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef      = useRef<AudioContext | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────────────
  const hasMedia = recordings.length > 0 || uploads.length > 0;


  // ── Restore blobs from IndexedDB on mount ────────────────────────────────────
  useEffect(() => {
    async function restoreMedia() {
      try {
        const recRaw = sessionStorage.getItem(REC_META_KEY);
        if (recRaw) {
          const metas: PersistedRecordingMeta[] = JSON.parse(recRaw);
          const restored: RecordingEntry[] = [];
          for (const m of metas) {
            const blob = await idbGet(m.id);
            if (blob) restored.push({ ...m, blob, url: URL.createObjectURL(blob) });
          }
          setRecordings(restored);
        }

        const upRaw = sessionStorage.getItem(UP_META_KEY);
        if (upRaw) {
          const metas: PersistedUploadMeta[] = JSON.parse(upRaw);
          const restored: UploadedFile[] = [];
          for (const m of metas) {
            const blob = await idbGet(m.id);
            if (blob) {
              const file = new File([blob], m.name, { type: m.mimeType });
              restored.push({ id: m.id, type: m.type, name: m.name, aiRequested: m.aiRequested, url: URL.createObjectURL(blob), file });
            }
          }
          setUploads(restored);
        }
      } catch (err) {
        console.warn("Could not restore media from IndexedDB:", err);
      } finally {
        setMediaRestored(true);
      }
    }
    restoreMedia();
  }, []);

  // Persist recording metadata whenever recordings change (after first restore)
  useEffect(() => {
    if (!mediaRestored) return;
    const metas: PersistedRecordingMeta[] = recordings.map((r) => ({
      id: r.id, type: r.type, durationSec: r.durationSec,
      aiRequested: r.aiRequested, savedForPost: r.savedForPost,
    }));
    sessionStorage.setItem(REC_META_KEY, JSON.stringify(metas));
  }, [recordings, mediaRestored]);

  // Persist upload metadata whenever uploads change (after first restore)
  useEffect(() => {
    if (!mediaRestored) return;
    const metas: PersistedUploadMeta[] = uploads.map((u) => ({
      id: u.id, type: u.type, name: u.name, aiRequested: u.aiRequested, mimeType: u.file.type,
    }));
    sessionStorage.setItem(UP_META_KEY, JSON.stringify(metas));
  }, [uploads, mediaRestored]);

  // ── Timer tick ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setDisplaySeconds(Math.floor(getElapsedMs() / 1000)), 500);
    return () => clearInterval(id);
  }, [isPaused, getElapsedMs]);

  // ── Audio record timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!audioRecording) return;
    const id = setInterval(() => setAudioRecordTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [audioRecording]);

  // ── Video record timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoRecording) return;
    const id = setInterval(() => setVideoRecordTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [videoRecording]);


  // ── Session helpers ───────────────────────────────────────────────────────────
  const updateSession = (patch: Partial<PersistedSession>) => {
    setSession((prev) => {
      const updated = { ...prev, ...patch };
      saveSession(updated);
      return updated;
    });
  };

  const handlePause = () => updateSession({ pausedAt: Date.now() });

  const handleResume = () => {
    if (session.pausedAt !== null) {
      updateSession({
        pausedMs: session.pausedMs + (Date.now() - session.pausedAt),
        pausedAt: null,
      });
    }
  };

  const updateInstrument = (value: string) => updateSession({ instrument: value });

  // ── Metronome ─────────────────────────────────────────────────────────────────
  const startMetronome = () => {
    audioCtxRef.current = new AudioContext();
    const ctx      = audioCtxRef.current;
    const interval = (60 / bpm) * 1000;
    metronomeRef.current = setInterval(() => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }, interval);
    setMetronomeRunning(true);
    setShowMetronome(false);
  };

  const stopMetronome = () => {
    if (metronomeRef.current) clearInterval(metronomeRef.current);
    audioCtxRef.current?.close();
    setMetronomeRunning(false);
  };

  // ── Audio recording ───────────────────────────────────────────────────────────
  const startAudio = async () => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current      = [];
      audioRecordStart.current = Date.now();
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        const id   = `rec-${crypto.randomUUID()}`;
        const url  = URL.createObjectURL(blob);
        const dur  = Math.round((Date.now() - audioRecordStart.current) / 1000);
        await idbPut(id, blob);
        setRecordings((prev) => [
          ...prev,
          { id, type: "audio", blob, url, durationSec: dur, aiRequested: false, savedForPost: false },
        ]);
        stream.getTracks().forEach((t) => t.stop());
        setAudioRecordTime(0);
        setAudioRecording(false);
      };
      recorder.start();
      audioRecorder.current = recorder;
      setAudioRecording(true);
    } catch {
      alert("Microphone permission denied.");
    }
  };

  const stopAudio = () => { audioRecorder.current?.stop(); };

  // ── Video recording ───────────────────────────────────────────────────────────
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Wire live feed into the camera pip immediately
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
      const recorder = new MediaRecorder(stream);
      videoChunks.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) videoChunks.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(videoChunks.current, { type: "video/webm" });
        const id   = `vid-${crypto.randomUUID()}`;
        const url  = URL.createObjectURL(blob);
        const dur  = videoRecordTime;
        await idbPut(id, blob);
        setRecordings((prev) => [
          ...prev,
          { id, type: "video", blob, url, durationSec: dur, aiRequested: false, savedForPost: false },
        ]);
        stream.getTracks().forEach((t) => t.stop());
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
        setVideoRecordTime(0);
        setVideoRecording(false);
      };
      recorder.start();
      videoRecorder.current = recorder;
      setVideoRecording(true);
    } catch {
      alert("Camera/microphone permission denied.");
    }
  };

  const stopVideo = () => { videoRecorder.current?.stop(); };

  // ── Toggles ───────────────────────────────────────────────────────────────────
  // Only recordings marked savedForPost are sent to /post
  const toggleAI = (id: string) =>
    setRecordings((prev) => prev.map((r) => r.id === id ? { ...r, aiRequested: !r.aiRequested } : r));

  const toggleAIUpload = (id: string) =>
    setUploads((prev) => prev.map((u) => u.id === id ? {...u, aiRequested: !u.aiRequested } : u ))

  const toggleSaveForPost = (id: string) =>
    setRecordings((prev) => prev.map((r) => r.id === id ? { ...r, savedForPost: !r.savedForPost } : r));

  const deleteRecording = async (id: string) => {
    setRecordings((prev) => {
      const entry = prev.find((r) => r.id === id);
      if (entry) URL.revokeObjectURL(entry.url);
      return prev.filter((r) => r.id !== id);
    });
    await idbDelete(id);
  };

  // ── Upload ────────────────────────────────────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isPdf   = file.type === "application/pdf";
      if (!isImage && !isPdf) continue;
      const id   = `up-${crypto.randomUUID()}`;
      const type: "image" | "pdf" = isImage ? "image" : "pdf";
      const url  = URL.createObjectURL(file);
      await idbPut(id, file);
      setUploads((prev) => [...prev, { id, type, name: file.name, aiRequested: false, url, file }]);
    }
    e.target.value = "";
  };

  const deleteUpload = async (id: string) => {
    setUploads((prev) => {
      const entry = prev.find((u) => u.id === id);
      if (entry) URL.revokeObjectURL(entry.url);
      return prev.filter((u) => u.id !== id);
    });
    await idbDelete(id);
  };

  // ── Finish → /post ────────────────────────────────────────────────────────────
  // Only recordings with savedForPost=true go to /post
  const handleFinish = () => {
    // clearAllSession();
    // idbClearAll();
    navigate("/post", {
      state: {
        durationMinutes: Math.max(1, Math.round(displaySeconds / 60)),
        instrument:      session.instrument,
        audioClips:      recordings.filter((r) => r.type === "audio" && r.savedForPost).map((r) => r.blob),
        videoClips:      recordings.filter((r) => r.type === "video" && r.savedForPost).map((r) => r.blob),
        // sheetMusic:      uploads.map((u) => u.file),
      },
    });
  };

  // this handles if you go home in middle of practice session
  const handleConfirmLeave = () => {
    clearAllSession();
    idbClearAll();
    navigate("/home");
  };



  return (
    <div className="record-page">

      {/* Back → confirm leave dialog */}
      <button className="back-btn" onClick={() => setShowConfirmLeave(true)}>←</button>

      {/* Purple hero */}
      <div className="record-bg">
        <div className="music-note-deco">♪</div>

        <div className="hero-instrument">
          <select
            className="hero-instrument-select"
            value={session.instrument}
            onChange={(e) => updateInstrument(e.target.value)}
          >
            <option value="" disabled>Select instrument…</option>
            {INSTRUMENTS.map((inst) => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
        </div>

        <div className={`practice-timer-display ${isPaused ? "timer-paused" : ""}`}>
          {formatTime(displaySeconds)}
        </div>
        <p className="timer-label">{isPaused ? "PAUSED" : "PRACTICE TIMER"}</p>
      </div>

      {/* Camera pip — live feed shown while video is recording */}
      {videoRecording && (
        <div className="camera-preview-wrapper">
          <video ref={videoPreviewRef} className="camera-preview" muted autoPlay playsInline />
          <div className="recording-badge">● REC {formatTime(videoRecordTime)}</div>
        </div>
      )}

      {/* ── Fixed bottom panel ── */}
      <div className="bottom-panel">

        {/* Tools row */}
        <div className="sheet-section tools-row">
          <button className="tool-btn" onClick={() => navigate("/tuner")}>Tuner</button>
          {metronomeRunning ? (
            <button className="tool-btn metronome-on" onClick={stopMetronome}>
              {bpm} BPM ■
            </button>
          ) : (
            <button className="tool-btn" onClick={() => setShowMetronome(true)}>Metronome</button>
          )}
        </div>

        {/* Record / upload buttons */}
        <div className="sheet-section">
          <div className="record-btns-row">
            {!audioRecording ? (
              <button className="rec-btn audio-btn" onClick={startAudio} disabled={videoRecording}>
                <span className="rec-icon"></span><span>Record Audio</span>
              </button>
            ) : (
              <button className="rec-btn audio-btn recording-active" onClick={stopAudio}>
                <span className="rec-icon pulse">⏺</span><span>{formatTime(audioRecordTime)}</span>
              </button>
            )}
            {!videoRecording ? (
              <button className="rec-btn video-btn" onClick={startVideo} disabled={audioRecording}>
                <span className="rec-icon"></span><span>Record Video</span>
              </button>
            ) : (
              <button className="rec-btn video-btn recording-active" onClick={stopVideo}>
                <span className="rec-icon pulse">⏺</span><span>{formatTime(videoRecordTime)}</span>
              </button>
            )}
            <button className="rec-btn upload-btn" onClick={() => uploadRef.current?.click()}>
              <span className="rec-icon"></span><span>Upload Sheet Music</span>
            </button>
            <input
              ref={uploadRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              capture="environment"
              style={{ display: "none" }}
              onChange={handleUpload}
            />
          </div>
        </div>

        {/* Review recordings button — appears when media exists */}
        {hasMedia && (
          <div className="sheet-section">
            <button className="review-btn" onClick={() => setDrawerOpen(true)}>
              <span className="review-btn-count">{recordings.length + uploads.length}</span>
              <span>Review Recordings</span>
              <span className="review-btn-arrow">↑</span>
            </button>
          </div>
        )}

        {/* Strava-style Pause / Resume + Finish — always pinned at bottom */}
        <div className="finish-row">
          {!isPaused ? (
            <button className="strava-pause-btn" onClick={handlePause}>
              <span className="strava-pause-icon">⏸</span>
              Pause
            </button>
          ) : (
            <div className="strava-paused-row">
              <button className="strava-resume-btn" onClick={handleResume}>
                <span className="strava-btn-icon">▶</span>
                Resume
              </button>
              <button className="strava-finish-btn" onClick={handleFinish}>
                <span className="strava-btn-icon">⏹</span>
                Finish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Media drawer ── */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="media-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="drawer-title">Recordings & Uploads</span>
              <button className="drawer-close-btn" onClick={() => setDrawerOpen(false)}>↓ Close</button>
            </div>

            <div className="drawer-scroll">

              {recordings.length > 0 && (
                <div className="drawer-section">
                  <h4 className="section-label">RECORDINGS</h4>
                  {recordings.map((r) => (
                    <div key={r.id} className="media-card">
                      <div className="media-card-header">
                        <span className="media-card-title">{r.type === "audio" ? "Audio" : "Video"}</span>
                        {/* <span className="media-card-title">{r.type === "audio" ? "🎙 Audio" : "🎥 Video"}</span> */}
                        <span className="media-card-duration">{formatTime(r.durationSec)}</span>
                      </div>
                      {r.type === "audio"
                        ? <audio src={r.url} controls className="media-player" />
                        : <video src={r.url} controls className="media-player media-video-player" />
                      }
                      <div className="media-card-actions">
                        <button
                          className={`media-action-btn ai-btn ${r.aiRequested ? "ai-active" : ""}`}
                          onClick={() => toggleAI(r.id)}
                        >
                          ✦ AI Feedback
                        </button>
                        <button
                          className={`media-action-btn save-btn ${r.savedForPost ? "save-active" : ""}`}
                          onClick={() => toggleSaveForPost(r.id)}
                        >
                          {r.savedForPost ? "✓ In Post" : "+ Post"}
                        </button>
                        <button className="media-action-btn delete-btn" onClick={() => deleteRecording(r.id)}>
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {uploads.length > 0 && (
                <div className="drawer-section">
                  <h4 className="section-label">SHEET MUSIC</h4>
                  {uploads.map((u) => (
                    <div key={u.id} className="media-card">
                      <div className="media-card-header">
                        <span className="media-card-title">
                          {u.type === "pdf" ? "📄" : "🖼"} {u.name}
                        </span>
                      </div>

                      {/* Image: thumbnail that opens full lightbox on tap */}
                      {u.type === "image" && (
                        <img
                          src={u.url}
                          className="sheet-preview-img"
                          alt={u.name}
                          onClick={() => setPreviewUrl(u.url)}
                        />
                      )}

                      {/* PDF: open in new tab for preview */}
                      {u.type === "pdf" && (
                        <div className="pdf-preview-row">
                          {/* <p className="pdf-note">AI analysis only · not saved to post</p> */}
                          <button
                            className="pdf-preview-btn"
                            onClick={() => window.open(u.url, "_blank")}
                          >
                            Preview PDF
                          </button>
                        </div>
                      )}

                      <div className="media-card-actions">
                        <button
                            className={`media-action-btn ai-btn ${u.aiRequested ? "ai-active" : ""}`}
                            onClick={() => toggleAIUpload(u.id)}
                        >
                          ✦ AI Feedback
                        </button>
                        <button className="media-action-btn delete-btn" onClick={() => deleteUpload(u.id)}>
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── Image lightbox ── */}
      {previewUrl && (
        <div className="lightbox-overlay" onClick={() => setPreviewUrl(null)}>
          <img src={previewUrl} className="lightbox-img" alt="Preview" />
          <button className="lightbox-close" onClick={() => setPreviewUrl(null)}>✕</button>
        </div>
      )}

      {/* ── Confirm leave dialog ── */}
      {showConfirmLeave && (
        <div className="popup-overlay" onClick={() => setShowConfirmLeave(false)}>
          <div className="confirm-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Leave Practice?</h3>
            <p>Your practice time and all recordings will be permanently deleted.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel-btn" onClick={() => setShowConfirmLeave(false)}>
                Stay
              </button>
              <button className="confirm-leave-btn" onClick={handleConfirmLeave}>
                Leave & Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Metronome popup ── */}
      {showMetronome && (
        <div className="popup-overlay" onClick={() => setShowMetronome(false)}>
          <div className="metronome-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Metronome</h3>
            <div className="bpm-display">{bpm} BPM</div>
            <input type="range" min="20" max="250" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
            <div className="bpm-adjust">
              <button onClick={() => setBpm((b) => Math.max(20, b - 5))}>−5</button>
              <button onClick={() => setBpm((b) => Math.max(20, b - 1))}>−1</button>
              <button onClick={() => setBpm((b) => Math.min(250, b + 1))}>+1</button>
              <button onClick={() => setBpm((b) => Math.min(250, b + 5))}>+5</button>
            </div>
            <div className="metronome-actions">
              <button className="start-btn" onClick={startMetronome}>Start</button>
              <button className="cancel-btn" onClick={() => setShowMetronome(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}