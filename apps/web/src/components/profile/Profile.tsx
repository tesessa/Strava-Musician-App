import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { INSTRUMENTS } from "@strava-musician-app/shared";
import type { User, PracticeLog } from "@strava-musician-app/shared";
import { userService, mediaUploadService, practiceLogService } from "../../model";
import BottomNav from "../navigation/BottomNav";
import ImageCropper from "./ImageCropper";
import "./profile.css";

type TabType = "overview" | "practice" | "friends" | "challenges" | "settings";

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Settings/Edit state
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editInstruments, setEditInstruments] = useState<string[]>([]);

  // Image cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  // Practice logs for practice tab
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  useEffect(() => {
    if (activeTab === "practice") {
      loadPracticeLogs();
    }
  }, [activeTab]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const currentUser = await userService.getCurrentUser();
      
      let profileUser: User;
      if (userId && userId !== currentUser?.userId) {
        profileUser = await userService.getUser(userId);
        setIsOwnProfile(false);
      } else {
        profileUser = currentUser!;
        setIsOwnProfile(true);
      }

      setUser(profileUser);
      setEditUsername(profileUser.username);
      setEditBio(profileUser.bio || "");
      setEditInstruments(profileUser.instruments || []);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPracticeLogs = async () => {
    if (!user) return;

    try {
      setPracticeLoading(true);
      const logs = await practiceLogService.getUserPracticeLogs(user.userId, undefined, 20);
      setPracticeLogs(logs);
    } catch (error) {
      console.error("Failed to load practice logs:", error);
    } finally {
      setPracticeLoading(false);
    }
  };

  const handleProfilePictureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setTempImageUrl(url);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user) return;

    try {
      setUploading(true);
      setShowCropper(false);

      const file = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
      const url = await mediaUploadService.uploadProfileImage(user.userId, file);
      
      const updated = await userService.updateUser(
        user.userId,
        user.username,
        user.bio,
        url,
        user.instruments,
        user.postVisibility
      );
      setUser(updated);

      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      alert("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
    setShowCropper(false);
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      const updated = await userService.updateUser(
        user.userId,
        editUsername,
        editBio,
        user.profilePhoto,
        editInstruments,
        user.postVisibility
      );
      setUser(updated);
      alert("Profile updated!");
      setActiveTab("overview");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    }
  };

  const toggleInstrument = (instrument: string) => {
    setEditInstruments((prev) =>
      prev.includes(instrument)
        ? prev.filter((i) => i !== instrument)
        : [...prev, instrument]
    );
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading profile...</div>
        <BottomNav active="profile" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-error">User not found</div>
        <BottomNav active="profile" />
      </div>
    );
  }

  const userInitial = user.username[0]?.toUpperCase() || "U";

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <button
          className="profile-back-btn"
          onClick={() => navigate("/home")}
          type="button"
        >
          ←
        </button>
        <h1 className="profile-header-title">
          {isOwnProfile ? "My Profile" : user.username}
        </h1>
        <div className="profile-header-spacer" />
      </header>

      <div className="profile-content">
        {/* Avatar */}
        <div className="profile-avatar-section">
          {isOwnProfile ? (
            <button
              className="profile-avatar-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              type="button"
              disabled={uploading}
            >
              {user.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt={user.username} 
                  className="profile-avatar-image"
                />
              ) : (
                <div className="profile-avatar-large">
                  {userInitial}
                </div>
              )}
              {uploading && (
                <div className="profile-avatar-uploading">Uploading...</div>
              )}
              {!uploading && (
                <div className="profile-avatar-overlay">
                  📷 Change Photo
                </div>
              )}
            </button>
          ) : (
            <>
              {user.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt={user.username} 
                  className="profile-avatar-image"
                />
              ) : (
                <div className="profile-avatar-large">
                  {userInitial}
                </div>
              )}
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureSelect}
            className="visually-hidden"
          />
        </div>

        {/* Tab Bar */}
        <div className="profile-tab-bar">
          <button
            className={`profile-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
            type="button"
          >
            Overview
          </button>
          <button
            className={`profile-tab-btn ${activeTab === "practice" ? "active" : ""}`}
            onClick={() => setActiveTab("practice")}
            type="button"
          >
            Practice
          </button>
          <button
            className={`profile-tab-btn ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => setActiveTab("friends")}
            type="button"
          >
            Friends
          </button>
          <button
            className={`profile-tab-btn ${activeTab === "challenges" ? "active" : ""}`}
            onClick={() => setActiveTab("challenges")}
            type="button"
          >
            Challenges
          </button>
          {isOwnProfile && (
            <button
              className={`profile-tab-btn ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
              type="button"
            >
              Settings
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="profile-card">
            <div className="profile-username">{user.username}</div>
            <div className="profile-email">{user.email}</div>

            {user.bio && (
              <div className="profile-bio-section">
                <div className="profile-section-title">Bio</div>
                <div className="profile-bio">{user.bio}</div>
              </div>
            )}

            {user.instruments && user.instruments.length > 0 && (
              <div className="profile-instruments-section">
                <div className="profile-section-title">Instruments</div>
                <div className="instruments-list">
                  {user.instruments.map((instrument) => (
                    <span key={instrument} className="instrument-tag">
                      {instrument}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="profile-stats-section">
              <div className="profile-stat">
                <div className="profile-stat-label">Member Since</div>
                <div className="profile-stat-value">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-label">Default Visibility</div>
                <div className="profile-stat-value">
                  {user.postVisibility || "friends"}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "practice" && (
          <div>
            {practiceLoading ? (
              <div className="profile-panel-empty">Loading practice logs...</div>
            ) : practiceLogs.length === 0 ? (
              <div className="profile-panel-empty">
                No practice logs yet. Start practicing to see your sessions here!
              </div>
            ) : (
              <div className="profile-list">
                {practiceLogs.map((log) => (
                  <div key={log.practiceLogId} className="profile-list-card">
                    <div className="profile-list-card-title">{log.title}</div>
                    {log.instrument && (
                      <div className="profile-list-card-meta">
                        {log.instrument} • {formatDuration(log.durationMinutes)}
                      </div>
                    )}
                    {log.postText && (
                      <div className="profile-list-card-body">{log.postText}</div>
                    )}
                    <div className="profile-list-card-date">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "friends" && (
          <div className="profile-panel-empty">
            Friends feature coming soon! Connect with other musicians.
          </div>
        )}

        {activeTab === "challenges" && (
          <div className="profile-panel-empty">
            Challenges feature coming soon! Set goals and track your progress.
          </div>
        )}

        {activeTab === "settings" && isOwnProfile && (
          <div className="profile-card">
            <div className="profile-field">
              <label className="profile-label">Username</label>
              <input
                type="text"
                className="profile-input"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Your username"
              />
            </div>

            <div className="profile-field">
              <label className="profile-label">Email</label>
              <div className="profile-value-readonly">{user.email}</div>
            </div>

            <div className="profile-field">
              <label className="profile-label">Bio</label>
              <textarea
                className="profile-textarea"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="profile-field">
              <label className="profile-label">Instruments</label>
              <div className="instruments-grid">
                {INSTRUMENTS.map((instrument) => (
                  <button
                    key={instrument}
                    className={`instrument-chip ${
                      editInstruments.includes(instrument) ? "selected" : ""
                    }`}
                    onClick={() => toggleInstrument(instrument)}
                    type="button"
                  >
                    {instrument}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-settings-actions">
              <button
                className="profile-primary-btn"
                onClick={handleSaveSettings}
                type="button"
              >
                Save Changes
              </button>

              <button
                className="profile-logout-btn"
                onClick={async () => {
                  await userService.logout();
                  navigate("/");
                }}
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Cropper Modal */}
      {showCropper && tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <BottomNav active="profile" />
    </div>
  );
};

export default Profile;