import { useState, useEffect, useRef } from "react";
import {
  type RecordingEntry,
  type UploadedFile,
  type PersistedRecordingMeta,
  type PersistedUploadMeta,
  REC_META_KEY,
  UP_META_KEY,
  idbPut,
  idbGet,
  idbDelete,
} from "./practiceStorage";

/** Shown when AI feedback can’t be loaded; rotates so the copy stays fresh and actionable. */
const AI_ERROR_FEEDBACK_MESSAGES: readonly string[] = [
  "Try recording in a slightly quieter space next time so you can really hear how your note attacks line up with the pulse.",
  "Slow the phrase down and aim for each note to land evenly on the beat; speed comes after the groove feels easy.",
  "Try tapping your foot on beats 1 and 3 (or 2 and 4) while you play—it’s a simple way to feel where the pulse wants to sit.",
  "Listen back once and hum the melody without playing; you’ll often notice small rushing or dragging before you fix it on the instrument.",
  "Spend a minute on long, relaxed quarter notes or whole notes before a hard part—steady breath and motion help steady rhythm.",
  "If a section feels rushed, break it into two-bar chunks and loop each until it breathes, then stitch them together.",
  "Practice with a metronome on the off-beats only (clicks on “and”)—it forces you to own the downbeats yourself.",
  "Accent the backbeat lightly in your strumming or picking; it can make your internal clock more obvious without playing louder overall.",
  "Record a very short clip—just four bars—and listen for the first note of each bar; aligning those anchors cleans up everything between them.",
  "When you try again, count a full measure out loud before you start; a clear “one” gives your hands and ears the same starting line.",
];

let aiErrorFeedbackRoundRobinIndex = 0;

function getNextAiErrorFeedback(): string {
  const i = aiErrorFeedbackRoundRobinIndex % AI_ERROR_FEEDBACK_MESSAGES.length;
  aiErrorFeedbackRoundRobinIndex += 1;
  return AI_ERROR_FEEDBACK_MESSAGES[i]!;
}

export function usePracticeMedia() {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3001";
  const [recordings, setRecordings]       = useState<RecordingEntry[]>([]);
  const [uploads, setUploads]             = useState<UploadedFile[]>([]);
  const [mediaRestored, setMediaRestored] = useState(false);
  const [aiFeedbackById, setAiFeedbackById] = useState<Record<string, string>>({});
  const [aiErrorById, setAiErrorById] = useState<Record<string, string>>({});
  const [aiLoadingById, setAiLoadingById] = useState<Record<string, boolean>>({});

  // Active recording state
  const [audioRecording, setAudioRecording]   = useState(false);
  const [audioRecordTime, setAudioRecordTime] = useState(0);
  const [videoRecording, setVideoRecording]   = useState(false);
  const [videoRecordTime, setVideoRecordTime] = useState(0);

  // Refs
  const audioRecorder    = useRef<MediaRecorder | null>(null);
  const audioChunks      = useRef<Blob[]>([]);
  const audioRecordStart = useRef<number>(0);
  const videoRecorder    = useRef<MediaRecorder | null>(null);
  const videoChunks      = useRef<Blob[]>([]);
  const videoPreviewRef  = useRef<HTMLVideoElement>(null);
  const uploadRef        = useRef<HTMLInputElement>(null);

  // restores data from indexDB on rerender
  useEffect(() => {
    async function restoreMedia() {
      try {
        const recRaw = sessionStorage.getItem(REC_META_KEY);
        if (recRaw) {
          const metas: PersistedRecordingMeta[] = JSON.parse(recRaw);
          const restored: RecordingEntry[] = [];
          for (const m of metas) {
            const blob = await idbGet(m.id);
            if (blob) restored.push({ ...m, blob, url: URL.createObjectURL(blob), aiFileUrl: m.aiFileUrl });
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


  useEffect(() => {
    if (!mediaRestored) return;
    const metas: PersistedRecordingMeta[] = recordings.map((r) => ({
      id: r.id, type: r.type, durationSec: r.durationSec,
      aiFileUrl: r.aiFileUrl,
      aiRequested: r.aiRequested, savedForPracticeLog: r.savedForPracticeLog,
    }));
    sessionStorage.setItem(REC_META_KEY, JSON.stringify(metas));
  }, [recordings, mediaRestored]);


  useEffect(() => {
    if (!mediaRestored) return;
    const metas: PersistedUploadMeta[] = uploads.map((u) => ({
      id: u.id, type: u.type, name: u.name, aiRequested: u.aiRequested, mimeType: u.file.type,
    }));
    sessionStorage.setItem(UP_META_KEY, JSON.stringify(metas));
  }, [uploads, mediaRestored]);

 
  useEffect(() => {
    if (!audioRecording) return;
    const id = setInterval(() => setAudioRecordTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [audioRecording]);

  useEffect(() => {
    if (!videoRecording) return;
    const id = setInterval(() => setVideoRecordTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [videoRecording]);

  // starts audio recording when you click button
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
          { id, type: "audio", blob, url, durationSec: dur, aiRequested: false, savedForPracticeLog: false },
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

  // ── Video recording ───────────────────────────────────────────────────────
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
          { id, type: "video", blob, url, durationSec: dur, aiRequested: false, savedForPracticeLog: false },
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

  const getExtension = (mimeType: string) => {
    if (mimeType.includes("mp4")) return "mp4";
    if (mimeType.includes("ogg")) return "ogg";
    if (mimeType.includes("wav")) return "wav";
    return "webm";
  };

  const analyzeRecording = async (entry: RecordingEntry): Promise<{ feedback: string }> => {
    const mimeType = entry.blob.type || (entry.type === "audio" ? "audio/webm" : "video/webm");
    const ext = getExtension(mimeType);
    const file = new File([entry.blob], `${entry.type}-${entry.id}.${ext}`, { type: mimeType });
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${SERVER_URL}/ai`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`AI request failed with status ${response.status}: ${details}`);
    }

    const result = (await response.json()) as { feedback?: string };
    if (!result.feedback) {
      throw new Error("AI response was missing feedback text");
    }

    return { feedback: result.feedback };
  };

  // ── Toggles + deletes ─────────────────────────────────────────────────────
  const toggleAI = async (id: string) => {
    const target = recordings.find((r) => r.id === id);
    if (!target) return;

    setAiLoadingById((prev) => ({ ...prev, [id]: true }));
    setAiErrorById((prev) => ({ ...prev, [id]: "" }));
    try {
      const data = await analyzeRecording(target);
      setAiFeedbackById((prev) => ({ ...prev, [id]: data.feedback ?? "" }));
      setRecordings((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, aiRequested: true } : r
        )
      );
    } catch (err) {
      console.error("AI feedback request failed:", err);
      setAiErrorById((prev) => ({ ...prev, [id]: getNextAiErrorFeedback() }));
    } finally {
      setAiLoadingById((prev) => ({ ...prev, [id]: false }));
    }
  };

  const toggleAIUpload = (id: string) =>
    setUploads((prev) => prev.map((u) => u.id === id ? { ...u, aiRequested: !u.aiRequested } : u));

  const toggleSaveForPracticeLog = (id: string) =>
    setRecordings((prev) => prev.map((r) => r.id === id ? { ...r, savedForPracticeLog: !r.savedForPracticeLog } : r));

  const deleteRecording = async (id: string) => {
    setRecordings((prev) => {
      const entry = prev.find((r) => r.id === id);
      if (entry) URL.revokeObjectURL(entry.url);
      return prev.filter((r) => r.id !== id);
    });
    setAiFeedbackById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setAiErrorById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setAiLoadingById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    await idbDelete(id);
  };

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

  return {
    // state
    recordings,
    uploads,
    audioRecording,
    audioRecordTime,
    videoRecording,
    videoRecordTime,
    aiFeedbackById,
    aiErrorById,
    aiLoadingById,
    // refs
    videoPreviewRef,
    uploadRef,
    // actions
    startAudio,  stopAudio,
    startVideo,  stopVideo,
    handleUpload,
    toggleAI,    toggleAIUpload,  toggleSaveForPracticeLog,
    deleteRecording, deleteUpload,
  };
}