import { useState } from "react";
import "./post.css";
import { useNavigate, useLocation } from "react-router-dom";
import { INSTRUMENTS } from "@strava-musician-app/shared";
import type { PostVisibility } from "@strava-musician-app/shared";
import { postService } from "../../model";
import { userService } from "../../model";
import { clearAllPracticeStorage } from "./practiceStorage";



type LocationState = {
  audioClips?: Blob[];
  videoClips?: Blob[];
  sheetMusic?: File[];
  durationMinutes?: number;
  instrument?: string;
};

type MediaEntry = {
  id: string;
  blob: Blob;
  url: string;
  kind: "audio" | "video";
};


const Post = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const durationMinutes = state.durationMinutes ?? 0;

  const [mediaEntries] = useState<MediaEntry[]>(() => {
    const entries: MediaEntry[] = [];
    (state.audioClips ?? []).forEach((blob, i) => {
      entries.push({ id: `audio-${i}`, blob, url: URL.createObjectURL(blob), kind: "audio" });
    });
    (state.videoClips ?? []).forEach((blob, i) => {
      entries.push({ id: `video-${i}`, blob, url: URL.createObjectURL(blob), kind: "video" });
    });
    return entries;
  });

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [instrument, setInstrument] = useState(state.instrument ?? "");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [loading, setLoading] = useState(false);



  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };


  const handleSave = async () => {
    setLoading(true);
    try {
      const user = await userService.getCurrentUser();
      const userId = user?.id ?? "user";
      await postService.savePost(
        userId,
        title,
        visibility,
        durationMinutes,
        notes,
        privateNotes,
        instrument
      ); 
      await clearAllPracticeStorage();
      navigate("/home");
    } catch (err) {
      console.error("Failed to save post:", err);
      alert("Something went wrong saving your practice. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleDiscard = async () => {
    setLoading(true);
    try {
      await postService.discardPost("unsaved");
      navigate("/home");
    } catch {
        // navigate to home in finally block
    } finally {
      await clearAllPracticeStorage();
      setLoading(false);
      navigate("/home")
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="post-container">
      {/* Header */}
      <div className="post-header">
        <button
          className="header-btn resume"
          onClick={() => navigate("/practice")}
          disabled={loading}
        >
          ← Resume
        </button>
        <span className="post-header-title">Save Practice</span>
        <button className="header-btn save" onClick={handleSave} disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="post-content">
        {/* Activity summary card */}
        <div className="activity-card">
          <div className="activity-type">
            {instrument ? `🎵 ${instrument}` : "🎵 Practice"} Session
          </div>
          <div className="activity-meta">{formatDuration(durationMinutes)}</div>
        </div>

        {/* Title */}
        <input
          className="title-input"
          type="text"
          placeholder="Title your practice"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Notes */}
        <textarea
          className="notes-input"
          placeholder="How'd it go? What did you work on?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Instrument */}
        <h4 className="section-title">Instrument</h4>
        <div className="visibility-row">
          <select
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
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

        {/* Media from practice (audio/video clips) */}
        {mediaEntries.length > 0 && (
          <>
            <h4 className="section-title">Recordings from Practice</h4>
            <div className="media-preview-grid">
              {mediaEntries.map((entry) => (
                <div key={entry.id} className="media-preview-item">
                  {entry.kind === "audio" ? (
                    <div className="media-preview-audio">
                      {/* <span>🎙</span> */}
                      <audio src={entry.url} controls />
                    </div>
                  ) : (
                    <video
                      src={entry.url}
                      controls
                      className="media-preview-img"
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Private notes */}
        <h2 className="section-title">Private Notes</h2>
        <textarea
          className="notes-input"
          placeholder="Write down private notes here. Only you can see these."
          value={privateNotes}
          onChange={(e) => setPrivateNotes(e.target.value)}
        />

        {/* Visibility */}
        <h4 className="section-title">Who can view</h4>
        <div className="visibility-row">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as PostVisibility)}
          >
            <option value="public">Everyone</option>
            <option value="friends">Friends</option>
            <option value="private">Only me</option>
          </select>
        </div>
      </div>

      {/* Footer actions */}
      <div className="post-footer">
        <button
          className="header-btn discard"
          onClick={handleDiscard}
          disabled={loading}
        >
          Discard Practice
        </button>
        <button
          className="header-btn save footer-save"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving…" : "Save Practice"}
        </button>
      </div>
    </div>
  );
};

export default Post;