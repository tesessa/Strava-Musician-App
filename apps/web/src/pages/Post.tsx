import { useState, useRef } from "react";
import "./post.css"
import { useNavigate } from "react-router-dom";

type MediaFile = {
    file: File;
    preview: string;
    type: "image" | "video" | "audio" | "pdf";
}

const Post = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private" | "friends">("public");
    const [instrument, setInstrument] = useState("");
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFileType = (file: File): MediaFile["type"] => {
        if (file.type.startsWith("image/")) return "image";
        if (file.type.startsWith("video/")) return "video";
        if (file.type.startsWith("audio/")) return "audio";
        return "pdf";
    }     
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newMedia: MediaFile[] = files.map((file) => ({
            file,
            type: getFileType(file),
            preview: file.type.startsWith("image/") || file.type.startsWith("video/")
                ? URL.createObjectURL(file) : "",
        }));
        setMediaFiles((prev) => [...prev, ...newMedia]);
        e.target.value = "";
    } ;

    const removeFile = (index: number) => {
        setMediaFiles((prev) => {
            const updated = [...prev];
            if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const renderPreview = (media: MediaFile, index: number) => {
                switch (media.type) {
            case "image":
                return <img src={media.preview} alt="preview" className="media-preview-img" />;
            case "video":
                return <video src={media.preview} controls className="media-preview-img" />;
            case "audio":
                return (
                    <div className="media-preview-audio">
                        <span>🎵</span>
                        <audio src={URL.createObjectURL(media.file)} controls />
                    </div>
                );
            case "pdf":
                return (
                    <div className="media-preview-pdf">
                        <span>📄</span>
                        <span>{media.file.name}</span>
                    </div>
                );
        }
    }


    return (
        <div className="post-container">

            <div className="post-header">
                <button className="header-btn resume" onClick={() => navigate("/practice")}>Resume</button>
            </div>
            <div className="post-content">
                <input className="title-input" type="text" placeholder="Title your practice" value={title} onChange={(e) => setTitle(e.target.value)} />

                <textarea className="notes-input" placeholder="How'd it go? What did you work on?" value={notes} onChange={(e) => setNotes(e.target.value)} />
                
                <h4 className="section-title">Instrument</h4>
                <div className="visibility-row">
                    {/* <span>Who can view</span> */}
                    <select value={instrument} onChange={(e) => setInstrument(e.target.value as any)}>
                        <option value="piano">piano</option>
                        <option value="violin">violin</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="activity-card">
                    <div className="activity-type">🎵 {instrument} Practice Session</div>
                    <div className="activity-meta">45 min · Scales, repertoire</div>
                </div>

                {/* Media Upload */}
                <div className="media-upload">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*,audio/*,.pdf"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                    <button className="media-btn" onClick={() => fileInputRef.current?.click()}>
                        ➕ Add Photos / Videos / Audio / PDFs
                    </button>

                    {/* Previews */}
                    {mediaFiles.length > 0 && (
                        <div className="media-preview-grid">
                            {mediaFiles.map((media, index) => (
                                <div key={index} className="media-preview-item">
                                    {renderPreview(media, index)}
                                    <button className="media-remove-btn" onClick={() => removeFile(index)}>✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <h2 className="section-title">Details</h2>
                <textarea className="notes-input" placeholder="Write down private notes here. Only you can see these" value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} />
                {/* Visibility */}

                <h4 className="section-title">Who can view</h4>
                <div className="visibility-row">
                    {/* <span>Who can view</span> */}
                    <select value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
                        <option value="public">Everyone</option>
                        <option value="friends">Friends</option>
                        <option value="private">Only me</option>
                    </select>
                </div>
            </div>
            <button className="header-btn discard">Discard Practice</button>
            {/* <span className="header-title">Save Activity</span> */}
            <button className="header-btn save">Save Practice</button>

        </div>
    )
}

export default Post;