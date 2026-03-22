import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { INSTRUMENTS } from "@strava-musician-app/shared";
import type { User } from "@strava-musician-app/shared";
import { userService } from "../../model";
import BottomNav from "../navigation/BottomNav";
import "./profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Edit form state
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editInstruments, setEditInstruments] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const currentUser = await userService.getCurrentUser();
      
      let profileUser: User;
      if (userId && userId !== currentUser?.userId) {
        // Viewing someone else's profile
        profileUser = await userService.getUser(userId);
        setIsOwnProfile(false);
      } else {
        // Viewing own profile
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

  const handleSaveProfile = async () => {
    if (!user) return;

    //     userId: string, 
    // username?: string, 
    // bio?: string,  
    // profilePhoto?: string,
    // instruments?: string[],
    // postVisibility?: Visibility
    try {
      const updated = await userService.updateUser(
        user.userId,
        // username: editUsername,
        // bio: editBio,
        // profilePhoto: 
        // bio: editBio,
        // instruments: editInstruments,
    );
      setUser(updated);
      setIsEditing(false);
      alert("Profile updated!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditUsername(user.username);
      setEditBio(user.bio || "");
      setEditInstruments(user.instruments || []);
    }
    setIsEditing(false);
  };

  const toggleInstrument = (instrument: string) => {
    setEditInstruments((prev) =>
      prev.includes(instrument)
        ? prev.filter((i) => i !== instrument)
        : [...prev, instrument]
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
        <h1 className="profile-header-title">Profile</h1>
        {isOwnProfile && !isEditing && (
          <button
            className="profile-edit-btn"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            Edit
          </button>
        )}
        {isEditing && (
          <button
            className="profile-save-btn"
            onClick={handleSaveProfile}
            type="button"
          >
            Save
          </button>
        )}
      </header>

      <div className="profile-content">
        {/* Avatar */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {userInitial}
          </div>
        </div>

        {/* User Info */}
        <div className="profile-info-section">
          {isEditing ? (
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

              <button
                className="profile-cancel-btn"
                onClick={handleCancelEdit}
                type="button"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
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
              </div>
            </>
          )}
        </div>

        {/* Logout Button (only on own profile) */}
        {isOwnProfile && !isEditing && (
          <div className="profile-actions">
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
        )}
      </div>

      <BottomNav active="profile" />
    </div>
  );
};

export default Profile;