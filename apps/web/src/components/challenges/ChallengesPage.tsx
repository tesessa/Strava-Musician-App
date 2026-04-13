import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { INSTRUMENTS } from "@strava-musician-app/shared";
import type { Challenge, CreateChallengeRequest, User } from "@strava-musician-app/shared";
import { challengeService, userService } from "../../model";
import BottomNav from "../navigation/BottomNav";
import "./challenges.css";

const ChallengesPage = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState("");

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedChallengeIds, setCompletedChallengeIds] = useState<Set<string>>(new Set());

  const [description, setDescription] = useState("");
  const [task, setTask] = useState("");
  const [targetNumber, setTargetNumber] = useState("");
  const [instrument, setInstrument] = useState("");

  useEffect(() => {
    void initialize();
  }, []);

  const initialize = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const me = await userService.getCurrentUser();
      if (!me) {
        navigate("/");
        return;
      }

      setCurrentUser(me);

      const [allChallenges, completed] = await Promise.all([
        challengeService.getChallenges(),
        challengeService.getCompletedChallenges(me.userId),
      ]);

      setChallenges(allChallenges);
      setCompletedChallengeIds(new Set(completed.map((item) => item.challengeId)));
    } catch (error) {
      console.error("Failed to load challenges page:", error);
      setErrorMessage("Failed to load challenges.");
    } finally {
      setLoading(false);
    }
  };

  const sortedChallenges = useMemo(() => {
    return [...challenges].sort((a, b) => {
      const aDone = completedChallengeIds.has(a.challengeId);
      const bDone = completedChallengeIds.has(b.challengeId);

      if (aDone === bDone) return 0;
      return aDone ? 1 : -1;
    });
  }, [challenges, completedChallengeIds]);

  const resetForm = () => {
    setDescription("");
    setTask("");
    setTargetNumber("");
    setInstrument("");
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();

    const target = Number(targetNumber);

    if (!description.trim() || !task.trim() || !targetNumber.trim() || Number.isNaN(target) || target <= 0) {
      setErrorMessage("Please enter a description, task, and a valid target number.");
      return;
    }

    const payload: CreateChallengeRequest = {
      description: description.trim(),
      task: task.trim(),
      targetNumber: target,
      instrument: instrument.trim() || undefined,
    };

    try {
      setCreating(true);
      setErrorMessage("");

      const created = await challengeService.createChallenge(payload);

      setChallenges((prev) => [created, ...prev]);
      resetForm();
    } catch (error) {
      console.error("Failed to create challenge:", error);
      setErrorMessage("Failed to create challenge.");
    } finally {
      setCreating(false);
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    if (completedChallengeIds.has(challengeId) || completingIds.has(challengeId)) {
      return;
    }

    try {
      setErrorMessage("");
      setCompletingIds((prev) => new Set(prev).add(challengeId));

      await challengeService.completeChallenge(challengeId);

      setCompletedChallengeIds((prev) => new Set(prev).add(challengeId));
    } catch (error) {
      console.error("Failed to complete challenge:", error);
      setErrorMessage("Failed to complete challenge.");
    } finally {
      setCompletingIds((prev) => {
        const next = new Set(prev);
        next.delete(challengeId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="challenges-container">
        <div className="challenges-empty">Loading challenges...</div>
        <BottomNav active="home" />
      </div>
    );
  }

  return (
    <div className="challenges-container">
      <header className="challenges-header">
        <button
          className="challenges-back-btn"
          onClick={() => navigate("/profile/challenges")}
          type="button"
        >
          ←
        </button>

        <h1 className="challenges-title">Challenges</h1>

        <div className="challenges-header-spacer" />
      </header>

      <main className="challenges-content">
        {errorMessage && <div className="challenges-error">{errorMessage}</div>}

        <section className="challenges-card">
          <h2 className="challenges-section-heading">Create Challenge</h2>

          <form className="challenges-form" onSubmit={handleCreateChallenge}>
            <div className="challenges-field">
              <label className="challenges-label">Description</label>
              <input
                className="challenges-input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Practice scales every day"
              />
            </div>

            <div className="challenges-field">
              <label className="challenges-label">Task</label>
              <input
                className="challenges-input"
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Ex: Daily practice"
              />
            </div>

            <div className="challenges-field">
              <label className="challenges-label">Target Number</label>
              <input
                className="challenges-input"
                type="number"
                min="1"
                value={targetNumber}
                onChange={(e) => setTargetNumber(e.target.value)}
                placeholder="Ex: 5"
              />
            </div>

            <div className="challenges-field">
              <label className="challenges-label">Instrument (optional)</label>
              <select
                className="challenges-input"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
              >
                <option value="">Any instrument</option>
                {INSTRUMENTS.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="challenges-primary-btn"
              type="submit"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Challenge"}
            </button>
          </form>
        </section>

        <section className="challenges-card">
          <h2 className="challenges-section-heading">All Challenges</h2>

          {sortedChallenges.length === 0 ? (
            <div className="challenges-empty">No challenges yet.</div>
          ) : (
            <div className="challenges-list">
              {sortedChallenges.map((challenge) => {
                const isCompleted = completedChallengeIds.has(challenge.challengeId);
                const isCompleting = completingIds.has(challenge.challengeId);

                return (
                  <div key={challenge.challengeId} className="challenges-item">
                    <div className="challenges-item-title">
                      {challenge.description}
                    </div>

                    <div className="challenges-item-meta">
                      {challenge.task} · Target: {challenge.targetNumber}
                      {challenge.instrument ? ` · ${challenge.instrument}` : ""}
                    </div>

                    <button
                      className={`challenges-complete-btn ${isCompleted ? "completed" : ""}`}
                      type="button"
                      onClick={() => handleCompleteChallenge(challenge.challengeId)}
                      disabled={isCompleted || isCompleting}
                    >
                      {isCompleted
                        ? "Completed"
                        : isCompleting
                          ? "Completing..."
                          : "Mark Complete"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {currentUser && (
          <section className="challenges-card">
            <button
              className="challenges-secondary-btn"
              type="button"
              onClick={() => navigate("/profile/challenges")}
            >
              View My Completed Challenges
            </button>
          </section>
        )}
      </main>

      <BottomNav active="home" />
    </div>
  );
};

export default ChallengesPage;