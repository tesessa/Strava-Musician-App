import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { INSTRUMENTS } from "@strava-musician-app/shared";
import { usePracticeSession } from "./usePracticeSession";
import { usePracticeMedia } from "./usePracticeMedia";
import {
  formatTime,
  clearPracticeSession,
  idbClearAll,
} from "./practiceStorage";
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
    recordings,
    uploads,
    audioRecording,
    audioRecordTime,
    videoRecording,
    videoRecordTime,
    aiFeedbackById,
    aiErrorById,
    aiLoadingById,
    videoPreviewRef,
    uploadRef,
    mediaUploadRef,
    startAudio,
    stopAudio,
    startVideo,
    stopVideo,
    handleUpload,
    handleMediaUpload,
    toggleAI,
    toggleAIUpload,
    toggleSaveForPracticeLog,
    deleteRecording,
    deleteUpload,
  } = usePracticeMedia();

  // useState/useRef/const variables
  const [showMetronome, setShowMetronome] = useState(false);
  const [bpm, setBpm] = useState(80);
  const [metronomeRunning, setMetronomeRunning] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const [showTuner, setShowTuner] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [cents, setCents] = useState(0);
  const [listening, setListening] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const metronomeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxTunerRef = useRef<AudioContext | null>(null);

  const hasMedia = recordings.length > 0 || uploads.length > 0;

  // Claude coded this nice metronome for us, can look into it more later for deliverable 2
  const startMetronome = () => {
    audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    const interval = (60 / bpm) * 1000;
    metronomeRef.current = setInterval(() => {
      const osc = ctx.createOscillator();
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
  // tuner code
  const startTuner = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    streamRef.current = stream; 

    const audioCtx = new AudioContext();
    await audioCtx.resume();

    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);

    analyserRef.current = analyser;
    audioCtxTunerRef.current = audioCtx;

    setListening(true);
    updatePitch();
  };

  const stopTuner = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    audioCtxTunerRef.current?.close();
    audioCtxTunerRef.current = null;

    analyserRef.current = null;

    setListening(false);

    // reset UI. This helps get rid of old notes
    setNote(null);
    setCents(0);
  };

  const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  function frequencyToNote(freq: number) {
    const A4 = 440;
    const noteNum = 12 * Math.log2(freq / A4);
    const midi = Math.round(noteNum) + 69;

    const noteIndex = ((midi % 12) + 12) % 12;
    const note = NOTE_STRINGS[noteIndex];

    const cents = Math.round((noteNum - Math.round(noteNum)) * 100);

    return {
      note,
      cents,
    };
  }

  function autoCorrelate(buffer: Float32Array, sampleRate: number) {
    let SIZE = buffer.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      let val = buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let r1 = 0, r2 = SIZE - 1;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < 0.2) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < 0.2) { r2 = SIZE - i; break; }
    }

    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;

    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] += buffer[j] * buffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;

    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;
    return sampleRate / T0;
  }

  const updatePitch = () => {
    const analyser = analyserRef.current;
    const audioCtx = audioCtxTunerRef.current;

    if (!analyser || !audioCtx) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    const freq = autoCorrelate(buffer, audioCtx.sampleRate);

    if (freq !== -1) {
      const data = frequencyToNote(freq);

      let adjustedCents = data.cents;

      // makes it less precise (real life isn't exact) Also helps it not jump around a lot
      if (Math.abs(adjustedCents) < 8) {
        adjustedCents = 0;
      }

      setNote(data.note);
      setCents(adjustedCents);
    }

    requestAnimationFrame(updatePitch);
  };

  // navigate to /practice-log page with right state variables
  const handleFinish = () => {
    navigate("/practice-log", {
      state: {
        durationMinutes: Math.max(1, Math.round(displaySeconds / 60)),
        instrument: session.instrument,
        audioClips: recordings
          .filter((r) => r.type === "audio" && r.savedForPracticeLog)
          .map((r) => r.blob),
        videoClips: recordings
          .filter((r) => r.type === "video" && r.savedForPracticeLog)
          .map((r) => r.blob),
      },
    });
  };

  // for navigating home from practice page
  const handleConfirmLeave = () => {
    clearPracticeSession();
    idbClearAll();
    navigate("/home");
  };

  return (
    <div className="record-page">
      {/* Back → confirm leave dialog */}
      <button className="back-btn" onClick={() => setShowConfirmLeave(true)}>
        ←
      </button>

      {/* Purple hero */}
      <div className="record-bg">
        <div className="music-note-deco">♪</div>
        <div className="hero-instrument">
          <select
            className="hero-instrument-select"
            value={session.instrument}
            onChange={(e) => updateInstrument(e.target.value)}
          >
            <option value="" disabled>
              Select instrument…
            </option>
            {INSTRUMENTS.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>
        </div>
        <div
          className={`practice-timer-display ${isPaused ? "timer-paused" : ""}`}
        >
          {formatTime(displaySeconds)}
        </div>
        <p className="timer-label">{isPaused ? "PAUSED" : "PRACTICE TIMER"}</p>
      </div>

      {/* Camera pip — live feed while video is recording */}
      {videoRecording && (
        <div className="camera-preview-wrapper">
          <video
            ref={videoPreviewRef}
            className="camera-preview"
            muted
            autoPlay
            playsInline
          />
          <div className="recording-badge">
            ● REC {formatTime(videoRecordTime)}
          </div>
        </div>
      )}

      {/* ── Fixed bottom panel ── */}
      <div className="bottom-panel">
        {/* Tools row */}
        <div className="sheet-section tools-row">
          <button className="tool-btn" onClick={() => setShowTuner(true)}>
            Tuner
          </button>
          {metronomeRunning ? (
            <button className="tool-btn metronome-on" onClick={stopMetronome}>
              {bpm} BPM ■
            </button>
          ) : (
            <button className="tool-btn" onClick={() => setShowMetronome(true)}>
              Metronome
            </button>
          )}
        </div>

        {/* Record / upload buttons */}
        <div className="sheet-section">
          <div className="record-btns-row">
            {!audioRecording ? (
              <button
                className="rec-btn audio-btn"
                onClick={startAudio}
                disabled={videoRecording}
              >
                <span className="rec-icon"></span>
                <span>Record Audio</span>
              </button>
            ) : (
              <button
                className="rec-btn audio-btn recording-active"
                onClick={stopAudio}
              >
                <span className="rec-icon pulse">⏺</span>
                <span>{formatTime(audioRecordTime)}</span>
              </button>
            )}
            {!videoRecording ? (
              <button
                className="rec-btn video-btn"
                onClick={startVideo}
                disabled={audioRecording}
              >
                <span className="rec-icon"></span>
                <span>Record Video</span>
              </button>
            ) : (
              <button
                className="rec-btn video-btn recording-active"
                onClick={stopVideo}
              >
                <span className="rec-icon pulse">⏺</span>
                <span>{formatTime(videoRecordTime)}</span>
              </button>
            )}
            <button
              className="rec-btn upload-btn"
              onClick={() => uploadRef.current?.click()}
            >
              <span className="rec-icon"></span>
              <span>Upload Sheet Music</span>
            </button>
              <button                                                                                                                                                                                                            
                className="rec-btn upload-btn"
                onClick={() => mediaUploadRef.current?.click()}                                                                                                                                                                  
              >                                                                                                                                                                                                                  
                <span className="rec-icon"></span>
                <span>Upload Audio/Video</span>                                                                                                                                                                                  
              </button>                                                                                                                                                                                                          
              <input   
                ref={mediaUploadRef}                                                                                                                                                                                             
                type="file"         
                accept="audio/*,video/*"
                multiple                
                className="visually-hidden-upload-input"                                                                                                                                                                         
                title="Upload audio or video"           
                onChange={handleMediaUpload}                                                                                                                                                                                     
              /> 
            <input
              ref={uploadRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              capture="environment"
              className="visually-hidden-upload-input"
              title="Upload sheet music"
              onChange={handleUpload}
            />
          </div>
        </div>

        {/* Review recordings button */}
        {hasMedia && (
          <div className="sheet-section">
            <button className="review-btn" onClick={() => setDrawerOpen(true)}>
              <span className="review-btn-count">
                {recordings.length + uploads.length}
              </span>
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
              <button
                className="drawer-close-btn"
                onClick={() => setDrawerOpen(false)}
              >
                ↓ Close
              </button>
            </div>
            <div className="drawer-scroll">
              {recordings.length > 0 && (
                <div className="drawer-section">
                  <h4 className="section-label">RECORDINGS</h4>
                  {recordings.map((r) => (
                    <div key={r.id} className="media-card">
                      <div className="media-card-header">
                        <span className="media-card-title">
                          {r.type === "audio" ? "Audio" : "Video"}
                        </span>
                        <span className="media-card-duration">
                          {formatTime(r.durationSec)}
                        </span>
                      </div>
                      {r.type === "audio" ? (
                        <audio src={r.url} controls className="media-player" />
                      ) : (
                        <video
                          src={r.url}
                          controls
                          className="media-player media-video-player"
                        />
                      )}
                      <div className="media-card-actions">
                        <button
                          className={`media-action-btn ai-btn ${r.aiRequested ? "ai-active" : ""}`}
                          disabled={Boolean(aiLoadingById[r.id])}
                          onClick={() => toggleAI(r.id)}
                        >
                          {aiLoadingById[r.id] ? "Analyzing..." : "✦ AI Feedback"}
                        </button>
                        <button
                          className={`media-action-btn save-btn ${r.savedForPracticeLog ? "save-active" : ""}`}
                          onClick={() => toggleSaveForPracticeLog(r.id)}
                        >
                          {r.savedForPracticeLog ? "✓ In log" : "+ Log"}
                        </button>
                        <button
                          className="media-action-btn delete-btn"
                          onClick={() => deleteRecording(r.id)}
                        >
                          🗑
                        </button>
                      </div>
                      {aiFeedbackById[r.id] && (
                        <p className="ai-feedback-text">{aiFeedbackById[r.id]}</p>
                      )}
                      {aiErrorById[r.id] && (
                        <p className="ai-feedback-error">{aiErrorById[r.id]}</p>
                      )}
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
                        <button
                          className="media-action-btn delete-btn"
                          onClick={() => deleteUpload(u.id)}
                        >
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
          <button
            className="lightbox-close"
            onClick={() => setPreviewUrl(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Confirm leave dialog ── */}
      {showConfirmLeave && (
        <div
          className="popup-overlay"
          onClick={() => setShowConfirmLeave(false)}
        >
          <div className="confirm-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Leave Practice?</h3>
            <p>
              Your practice time and all recordings will be permanently deleted.
            </p>
            <div className="confirm-actions">
              <button
                className="confirm-cancel-btn"
                onClick={() => setShowConfirmLeave(false)}
              >
                Stay
              </button>
              <button
                className="confirm-leave-btn"
                onClick={handleConfirmLeave}
              >
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
            <label htmlFor="metronome-bpm-slider" className="visually-hidden">
              Metronome tempo in BPM
            </label>
            <input
              id="metronome-bpm-slider"
              type="range"
              min="20"
              max="250"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
            <div className="bpm-adjust">
              <button onClick={() => setBpm((b) => Math.max(20, b - 5))}>
                −5
              </button>
              <button onClick={() => setBpm((b) => Math.max(20, b - 1))}>
                −1
              </button>
              <button onClick={() => setBpm((b) => Math.min(250, b + 1))}>
                +1
              </button>
              <button onClick={() => setBpm((b) => Math.min(250, b + 5))}>
                +5
              </button>
            </div>
            <div className="metronome-actions">
              <button className="start-btn" onClick={startMetronome}>
                Start
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowMetronome(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/*-- Tuner popup -- */}
      {showTuner && (
        <div className="popup-overlay" onClick={() => { stopTuner(); setShowTuner(false); }}>
          <div className="tuner-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Tuner</h3>
            <div className="tuner-display">

              <div className="tuner-arc">
                {Array.from({ length: 11 }).map((_, i) => {
                  const position = i - 5; 
                  const threshold = Math.round(cents / 10);

                  let className = "tuner-segment";

                  if (position === 0 && Math.abs(cents) < 5) {
                    className += " active-center";
                  } else if (position < 0 && position >= threshold) {
                    className += " active-flat";
                  } else if (position > 0 && position <= threshold) {
                    className += " active-sharp";
                  }

                  return <div key={i} className={className}></div>;
                })}
              </div>

              <div className="tuner-note">{note || "--"}</div>

            </div>
            {!listening ? (
              <div className="tuner-actions">
                <button className="start-btn" onClick={startTuner}>
                  Start
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => { stopTuner(); setShowTuner(false); }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="tuner-actions">
                <button
                  className="start-btn"
                  onClick={() => { stopTuner(); setShowTuner(false); }}
                  style={{ background: "#c0392b" }}
                >
                  Stop
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
