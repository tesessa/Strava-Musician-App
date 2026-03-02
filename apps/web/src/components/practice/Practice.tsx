import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { INSTRUMENTS } from "@strava-musician-app/shared";
import { usePracticeSession } from "./usePracticeSession";
import { usePracticeMedia } from "./usePraticeMedia";
import { formatTime, clearPracticeSession, idbClearAll } from "./practiceStorage";
import "./practice.css";


export default function Practice() {
  const navigate = useNavigate();

  const {
    session,
    isPaused,
    displaySeconds,
    handlePause,
    handleResume,
    updateInstrument,
  } = usePracticeSession();

  const {
    recordings, uploads,
    audioRecording, audioRecordTime,
    videoRecording, videoRecordTime,
    videoPreviewRef, uploadRef,
    startAudio, stopAudio,
    startVideo, stopVideo,
    handleUpload,
    toggleAI, toggleAIUpload, toggleSaveForPost,
    deleteRecording, deleteUpload,
  } = usePracticeMedia();

  // ── UI-only state (no persistence needed) ────────────────────────────────
  const [showMetronome, setShowMetronome]       = useState(false);
  const [bpm, setBpm]                           = useState(80);
  const [metronomeRunning, setMetronomeRunning] = useState(false);
  const [drawerOpen, setDrawerOpen]             = useState(false);
  const [previewUrl, setPreviewUrl]             = useState<string | null>(null);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const metronomeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef  = useRef<AudioContext | null>(null);

  const hasMedia = recordings.length > 0 || uploads.length > 0;

  // ── Metronome ─────────────────────────────────────────────────────────────
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

  // ── Finish → /post ────────────────────────────────────────────────────────
  // Session + IDB are intentionally NOT cleared here.
  // Post page owns cleanup on save or discard, so Resume still works.
  const handleFinish = () => {
    navigate("/post", {
      state: {
        durationMinutes: Math.max(1, Math.round(displaySeconds / 60)),
        instrument:      session.instrument,
        audioClips:      recordings.filter((r) => r.type === "audio" && r.savedForPost).map((r) => r.blob),
        videoClips:      recordings.filter((r) => r.type === "video" && r.savedForPost).map((r) => r.blob),
      },
    });
  };

  // ── Leave practice without saving ─────────────────────────────────────────
  const handleConfirmLeave = () => {
    clearPracticeSession();
    idbClearAll();
    navigate("/home");
  };


  // ─────────────────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────────────────

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

      {/* Camera pip — live feed while video is recording */}
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

        {/* Review recordings button */}
        {hasMedia && (
          <div className="sheet-section">
            <button className="review-btn" onClick={() => setDrawerOpen(true)}>
              <span className="review-btn-count">{recordings.length + uploads.length}</span>
              <span>Review Recordings</span>
              <span className="review-btn-arrow">↑</span>
            </button>
          </div>
        )}

        {/* Strava-style Pause / Resume + Finish */}
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
                      {u.type === "image" && (
                        <img
                          src={u.url}
                          className="sheet-preview-img"
                          alt={u.name}
                          onClick={() => setPreviewUrl(u.url)}
                        />
                      )}
                      {u.type === "pdf" && (
                        <div className="pdf-preview-row">
                          <button className="pdf-preview-btn" onClick={() => window.open(u.url, "_blank")}>
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