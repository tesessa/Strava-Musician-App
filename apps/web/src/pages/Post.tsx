import { useState } from "react";
import "./post.css"
import { useNavigate } from "react-router-dom";

const Post = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private" | "friends">("public");
    const [instrument, setInstrument] = useState("");
    // const ret = 0;
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

                {/* Media */}
                <div className="media-upload">
                    <button className="media-btn">➕ Add Photos / Videos</button>
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