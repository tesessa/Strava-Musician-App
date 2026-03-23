import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { INSTRUMENTS } from "@strava-musician-app/shared";
import type { PracticeLog, User } from "@strava-musician-app/shared";
import { userService, practiceLogService } from "../../model";
import BottomNav from "../navigation/BottomNav";
import "./profile.css";

type ProfileTab = "overview" | "practice" | "challenges" | "friends" | "settings";

const VALID_TABS: ProfileTab[] = [
  "overview",
  "practice",
  "challenges",
  "friends",
  "settings",
];

const isTab = (value?: string): value is ProfileTab =>
  !!value && VALID_TABS.includes(value as ProfileTab);

const TempProfile = () => {
  const navigate = useNavigate();
  const params = useParams<{ userId?: string; tab?: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const routeUserId = isTab(params.userId) ? undefined : params.userId;
  const routeTab = isTab(params.userId)
    ? params.userId
    : isTab(params.tab)
      ? params.tab
      : "overview";

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editInstruments, setEditInstruments] = useState<string[]>([]);
  const [editProfilePhoto, setEditProfilePhoto] = useState("");
  const [editVisibility, setEditVisibility] = useState<"public" | "friends" | "private">("friends");

  const isOwnProfile = useMemo(() => {
    if (!currentUser || !profileUser) return false;
    return currentUser.userId === profileUser.userId;
  }, [currentUser, profileUser]);

  useEffect(() => {
    void loadProfile();
  }, [routeUserId]);

  useEffect(() => {
    if (routeTab === "practice" && profileUser) {
      void loadPracticeLogs(profileUser.userId);
    }
  }, [routeTab, profileUser]);

  useEffect(() => {
    if (routeTab === "settings" && !loading && !isOwnProfile) {
      navigate(routeUserId ? `/profile/${routeUserId}` : "/profile", { replace: true });
    }
  }, [routeTab, loading, isOwnProfile, navigate, routeUserId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const me = await userService.getCurrentUser();
      setCurrentUser(me);

      if (!me) {
        navigate("/");
        return;
      }

      const userToShow =
        routeUserId && routeUserId !== me.userId
          ? await userService.getUser(routeUserId)
          : me;

      setProfileUser(userToShow);
      setEditUsername(userToShow.username ?? "");
      setEditBio(userToShow.bio ?? "");
      setEditInstruments(userToShow.instruments ?? []);
      setEditProfilePhoto(userToShow.profilePhoto ?? "");
      setEditVisibility(userToShow.postVisibility ?? "friends");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to load profile:", error);
      setErrorMessage("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const loadPracticeLogs = async (userId: string) => {
    try {
      setPracticeLoading(true);
      setErrorMessage("");

      const logs = await practiceLogService.getUserPracticeLogs(userId, undefined, 20);
      setPracticeLogs(logs ?? []);
    } catch (error) {
      console.error("Failed to load practice logs:", error);
      setErrorMessage("Failed to load practice sessions.");
    } finally {
      setPracticeLoading(false);
    }
  };

  const changeTab = (tab: ProfileTab) => {
    if (!profileUser || !currentUser) return;

    const base =
      profileUser.userId === currentUser.userId
        ? "/profile"
        : `/profile/${profileUser.userId}`;

    navigate(tab === "overview" ? base : `${base}/${tab}`);
  };

  const handleSaveProfile = async () => {
    if (!profileUser) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const updatedUser = await userService.updateUser(
        profileUser.userId,
        editUsername.trim(),
        editBio.trim(),
        editProfilePhoto.trim() || undefined,
        editInstruments,
        editVisibility
      );

      setProfileUser(updatedUser);

      if (isOwnProfile) {
        setCurrentUser(updatedUser);
      }

      setEditUsername(updatedUser.username ?? "");
      setEditBio(updatedUser.bio ?? "");
      setEditInstruments(updatedUser.instruments ?? []);
      setEditProfilePhoto(updatedUser.profilePhoto ?? "");
      setEditVisibility(updatedUser.postVisibility ?? "friends");

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setErrorMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!profileUser) return;

    setEditUsername(profileUser.username ?? "");
    setEditBio(profileUser.bio ?? "");
    setEditInstruments(profileUser.instruments ?? []);
    setEditProfilePhoto(profileUser.profilePhoto ?? "");
    setEditVisibility(profileUser.postVisibility ?? "friends");
    setIsEditing(false);
  };

  const toggleInstrument = (instrument: string) => {
    setEditInstruments((prev) =>
      prev.includes(instrument)
        ? prev.filter((i) => i !== instrument)
        : [...prev, instrument]
    );
  };

  const handleProfilePhotoFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please choose an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setEditProfilePhoto(result);
        setErrorMessage("");
      }
    };

    reader.onerror = () => {
      setErrorMessage("Failed to read image file.");
    };

    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    try {
      await userService.logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setErrorMessage("Failed to log out.");
    }
  };

  const renderOverview = () => {
    if (!profileUser) return null;

    return (
      <>
        <div className="profile-card">
          <div className="profile-username">{profileUser.username}</div>

          {isOwnProfile && <div className="profile-email">{profileUser.email}</div>}

          {profileUser.bio && (
            <div className="profile-bio-section">
              <div className="profile-section-title">Bio</div>
              <div className="profile-bio">{profileUser.bio}</div>
            </div>
          )}

          {profileUser.instruments?.length > 0 && (
            <div className="profile-instruments-section">
              <div className="profile-section-title">Instruments</div>
              <div className="instruments-list">
                {profileUser.instruments.map((instrument) => (
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
                {new Date(profileUser.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="profile-stat">
              <div className="profile-stat-label">Visibility</div>
              <div className="profile-stat-value">{profileUser.postVisibility}</div>
            </div>

            <div className="profile-stat">
              <div className="profile-stat-label">Practice Sessions Loaded</div>
              <div className="profile-stat-value">{practiceLogs.length}</div>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="profile-actions">
            <button className="profile-logout-btn" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        )}
      </>
    );
  };

  const renderPractice = () => {
    if (practiceLoading) {
      return <div className="profile-panel-empty">Loading practice sessions...</div>;
    }

    if (!practiceLogs.length) {
      return <div className="profile-panel-empty">No practice sessions yet.</div>;
    }

    return (
      <div className="profile-list">
        {practiceLogs.map((log) => (
          <div key={log.practiceLogId} className="profile-list-card">
            <div className="profile-list-card-title">{log.title}</div>
            <div className="profile-list-card-meta">
              {log.instrument || "No instrument"} · {log.durationMinutes} min
            </div>
            {log.pieceTitle && (
              <div className="profile-list-card-body">
                Piece: {log.pieceTitle}
                {log.composer ? ` — ${log.composer}` : ""}
              </div>
            )}
            {log.postText && <div className="profile-list-card-body">{log.postText}</div>}
            <div className="profile-list-card-date">
              {new Date(log.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderChallenges = () => {
    return (
      <div className="profile-panel-empty">
        Challenges tab
        <br />
        Need backend route to dispatch completed challenges for profile?
      </div>
    );
  };

  const renderFriends = () => {
    return (
      <div className="profile-panel-empty">
        Friends tab
        <br />
        No route yet?
      </div>
    );
  };

  const renderSettings = () => {
    if (!profileUser || !isOwnProfile) return null;

    return (
      <div className="profile-card">
        {!isEditing ? (
          <button
            className="profile-primary-btn"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            Edit Profile
          </button>
        ) : (
          <>
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
              <div className="profile-value-readonly">{profileUser.email}</div>
            </div>

            <div className="profile-field">
              <label className="profile-label">Bio</label>
              <textarea
                className="profile-textarea"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <div className="profile-field">
              <label className="profile-label">Profile Picture</label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleProfilePhotoFileChange}
              />

              <button
                type="button"
                className="profile-primary-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Picture
              </button>

              {editProfilePhoto && (
                <div className="profile-upload-preview-wrap">
                  <img
                    src={editProfilePhoto}
                    alt="Profile preview"
                    className="profile-upload-preview"
                  />
                </div>
              )}
            </div>

            <div className="profile-field">
              <label className="profile-label">Post Visibility</label>
              <select
                className="profile-input"
                value={editVisibility}
                onChange={(e) =>
                  setEditVisibility(e.target.value as "public" | "friends" | "private")
                }
              >
                <option value="public">Public</option>
                <option value="friends">Friends</option>
                <option value="private">Private</option>
              </select>
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
                onClick={handleSaveProfile}
                type="button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                className="profile-cancel-btn"
                onClick={handleCancelEdit}
                type="button"
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading profile...</div>
        <BottomNav active="profile" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-container">
        <div className="profile-error">{errorMessage || "User not found"}</div>
        <BottomNav active="profile" />
      </div>
    );
  }

  const userInitial = profileUser.username?.[0]?.toUpperCase() || "U";

  return (
    <div className="profile-container">
      <header className="profile-header">
        <button className="profile-back-btn" onClick={() => navigate("/home")} type="button">
          ←
        </button>

        <h1 className="profile-header-title">
          {isOwnProfile ? "My Profile" : `${profileUser.username}'s Profile`}
        </h1>

        <div className="profile-header-spacer" />
      </header>

      <div className="profile-content">
        <div className="profile-avatar-section">
          {profileUser.profilePhoto ? (
            <img
              src={profileUser.profilePhoto}
              alt={`${profileUser.username} profile`}
              className="profile-avatar-image"
            />
          ) : (
            <div className="profile-avatar-large">{userInitial}</div>
          )}
        </div>

        {errorMessage && <div className="profile-error">{errorMessage}</div>}

        <div className="profile-tab-bar">
          <button
            className={`profile-tab-btn ${routeTab === "overview" ? "active" : ""}`}
            onClick={() => changeTab("overview")}
            type="button"
          >
            Overview
          </button>

          <button
            className={`profile-tab-btn ${routeTab === "practice" ? "active" : ""}`}
            onClick={() => changeTab("practice")}
            type="button"
          >
            Practice
          </button>

          <button
            className={`profile-tab-btn ${routeTab === "challenges" ? "active" : ""}`}
            onClick={() => changeTab("challenges")}
            type="button"
          >
            Challenges
          </button>

          <button
            className={`profile-tab-btn ${routeTab === "friends" ? "active" : ""}`}
            onClick={() => changeTab("friends")}
            type="button"
          >
            Friends
          </button>

          {isOwnProfile && (
            <button
              className={`profile-tab-btn ${routeTab === "settings" ? "active" : ""}`}
              onClick={() => changeTab("settings")}
              type="button"
            >
              Settings
            </button>
          )}
        </div>

        {routeTab === "overview" && renderOverview()}
        {routeTab === "practice" && renderPractice()}
        {routeTab === "challenges" && renderChallenges()}
        {routeTab === "friends" && renderFriends()}
        {routeTab === "settings" && renderSettings()}
      </div>

      <BottomNav active="profile" />
    </div>
  );
};

export default TempProfile;