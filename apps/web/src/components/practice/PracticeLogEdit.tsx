import { useState, useEffect } from "react";
import "./practiceLog.css";
import { useNavigate, useParams } from "react-router-dom";
import { INSTRUMENTS } from "@strava-musician-app/shared";
import { practiceLogService } from "../../model";
import type { Media } from "@strava-musician-app/shared";

const PracticeLogEdit = () => {
  const navigate = useNavigate();
  const { practiceLogId } = useParams<{ practiceLogId: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [privateText, setPrivateText] = useState("");
  const [instrument, setInstrument] = useState("");
  const [pieceTitle, setPieceTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [tempo, setTempo] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState(0);

  // Media
  const [media, setMedia] = useState<Media[]>([]);

  useEffect(() => {
    loadPracticeLog();
  }, [practiceLogId]);

  const loadPracticeLog = async () => {
    if (!practiceLogId) {
      navigate("/home");
      return;
    }

    try {
      setLoading(true);
      const log = await practiceLogService.getPracticeLog(practiceLogId);

      setTitle(log.title || "");
      setPostText(log.postText || "");
      setPrivateText(log.privateText || "");
      setInstrument(log.instrument || "");
      setPieceTitle(log.pieceTitle || "");
      setComposer(log.composer || "");
      setTempo(log.tempo ? log.tempo.toString() : "");
      setDurationMinutes(log.durationMinutes || 0);

      // Load media
      const mediaList =
        await practiceLogService.getPracticeLogMedia(practiceLogId);
      setMedia(mediaList);
    } catch (error) {
      console.error("Failed to load practice log:", error);
      alert("Failed to load practice log");
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!practiceLogId) return;

    setSaving(true);
    try {
      const tempoNum = tempo ? parseInt(tempo, 10) : undefined;

      await practiceLogService.updatePracticeLog(practiceLogId, {
        title,
        postText,
        privateText,
        instrument,
        tempo: tempoNum,
        pieceTitle,
        composer,
      });

      navigate("/home");
    } catch (err) {
      console.error("Failed to update practice log:", err);
      alert("Something went wrong updating your practice. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!window.confirm("Delete this recording?")) return;

    try {
      await practiceLogService.deleteMedia(mediaId);
      setMedia((prev) => prev.filter((m) => m.mediaId !== mediaId));
    } catch (error) {
      console.error("Failed to delete media:", error);
      alert("Failed to delete recording");
    }
  };

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  if (loading) {
    return (
      <div className="practice-log-container">
        <div className="practice-log-header">
          <button
            className="header-btn resume"
            onClick={() => navigate("/home")}
          >
            ← Back
          </button>
          <span className="practice-log-header-title">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-log-container">
      {/* Header */}
      <div className="practice-log-header">
        <button
          className="header-btn resume"
          onClick={() => navigate("/home")}
          disabled={saving}
        >
          ← Cancel
        </button>
        <span className="practice-log-header-title">Edit Practice</span>
        <button
          className="header-btn save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="practice-log-content">
        {/* Activity summary card */}
        <div className="activity-card">
          <div className="activity-type">
            {instrument ? `🎵 ${instrument}` : "🎵 Practice"} Log
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

        {/* Public Notes */}
        <h4 className="section-title">Public Notes</h4>
        <textarea
          className="notes-input"
          placeholder="How'd it go? What did you work on?"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
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

        <h4 className="section-title">Piece Title (Optional)</h4>
        <input
          className="title-input"
          type="text"
          placeholder="e.g., Etude Op 10 no 3"
          value={pieceTitle}
          onChange={(e) => setPieceTitle(e.target.value)}
        />

        <h4 className="section-title">Composer (Optional)</h4>
        <input
          className="title-input"
          type="text"
          placeholder="e.g., Fredric Chopin"
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
        />

        <h4 className="section-title">Tempo (Optional)</h4>
        <input
          className="title-input"
          type="number"
          placeholder="BPM (e.g., 76)"
          value={tempo}
          onChange={(e) => setTempo(e.target.value)}
        />

        {/* Existing Media */}
        {media.length > 0 && (
          <>
            <h4 className="section-title">Recordings</h4>
            <div className="media-preview-grid">
              {media.map((m) => (
                <div
                  key={m.mediaId}
                  className="media-preview-item edit-media-item"
                >
                  {m.type === "audio" ? (
                    <div className="media-preview-audio">
                      <audio src={m.url} controls />
                    </div>
                  ) : (
                    <video src={m.url} controls className="media-preview-img" />
                  )}
                  <button
                    className="delete-media-btn"
                    onClick={() => handleDeleteMedia(m.mediaId)}
                    type="button"
                  >
                    🗑 Delete
                  </button>
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
          value={privateText}
          onChange={(e) => setPrivateText(e.target.value)}
        />
      </div>

      {/* Footer actions */}
      <div className="practice-log-footer">
        <button
          className="header-btn discard"
          onClick={() => navigate("/home")}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          className="header-btn save footer-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default PracticeLogEdit;
