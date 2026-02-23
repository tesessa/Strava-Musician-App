import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./record.css";

export default function PracticePage() {
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);

  const [instrument, setInstrument] = useState("");
  const [showInstrumentOptions, setShowInstrumentOptions] = useState(false);

  /* ============================= */
  /* PRACTICE TIMER (COUNT UP)     */
  /* ============================= */

  const [practiceTime, setPracticeTime] = useState(0);
  const [practiceRunning, setPracticeRunning] = useState(false);
  const [practicePaused, setPracticePaused] = useState(false);

  /* ============================= */
  /* RECORD TIMER (COUNT UP)       */
  /* ============================= */

  const [recordTime, setRecordTime] = useState(0);
  const [recordRunning, setRecordRunning] = useState(false);
  const [showPostRecordButtons, setShowPostRecordButtons] = useState(false);

  /* ============================= */
  /* PRACTICE COUNT UP EFFECT      */
  /* ============================= */

  useEffect(() => {
    if (!practiceRunning) return;

    const interval = setInterval(() => {
      setPracticeTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [practiceRunning]);

  /* ============================= */
  /* RECORD COUNT UP EFFECT        */
  /* ============================= */

  useEffect(() => {
    if (!recordRunning) return;

    const interval = setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [recordRunning]);

  /* ============================= */
  /* PRACTICE AUTO-STOPS RECORD    */
  /* ============================= */

  useEffect(() => {
    if (!practiceRunning && recordRunning) {
      setRecordRunning(false);
    }
  }, [practiceRunning]);

  /* ============================= */
  /* METRONOME STATE               */
  /* ============================= */

  const [showMetronome, setShowMetronome] = useState(false);
  const [bpm, setBpm] = useState(80);
  const [metronomeRunning, setMetronomeRunning] = useState(false);

  /* ============================= */
  /* BUTTON HANDLERS               */
  /* ============================= */

  const startRecord = () => {
    if (!practiceRunning || practicePaused) return;

    setRecordTime(0);
    setRecordRunning(true);
    setShowPostRecordButtons(false);
  };

  const stopRecord = () => {
    setRecordRunning(false);
    setShowPostRecordButtons(true);
  };

  const formatTime = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container">
    <button
      className="back-arrow"
      onClick={() => navigate("/feed")}
    >
      ←
    </button>
      <div className="purple-bg"></div>

      <div className={`bottom-sheet ${expanded ? "expanded" : ""}`}>
        <div
          className="drag-handle"
          onClick={() => !practicePaused && setExpanded(!expanded)}
        ></div>

        {/* Timers */}
        <div className="timer-row">
          <div className="timer-box">
            <h3>Practice Timer</h3>
            <h1 className="practice-timer">
              {formatTime(practiceTime)}
            </h1>
          </div>

          <div className="timer-box">
            <h3>Record Timer</h3>
            <h1 className="record-timer">
              {formatTime(recordTime)}
            </h1>
          </div>
        </div>

        {/* Buttons */}
        <div className="buttons">
          {/* Instrument */}
          <div className="instrument-wrapper">
            <button
              className="secondary"
              disabled={practicePaused}
              onClick={() =>
                setShowInstrumentOptions(!showInstrumentOptions)
              }
            >
              {instrument
                ? instrument.charAt(0).toUpperCase() +
                  instrument.slice(1)
                : "Instrument"}
            </button>

            {showInstrumentOptions && !practicePaused && (
              <div className="dropdown-up">
                {["piano", "violin", "other"].map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      setInstrument(item);
                      setShowInstrumentOptions(false);
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Practice */}
          <button
            className="primary"
            disabled={practicePaused}
            onClick={() => {
              if (!practiceRunning) {
                setPracticeRunning(true);
                setPracticePaused(false);
              } else {
                setPracticeRunning(false);
                setPracticePaused(true);
              }
            }}
          >
            {practiceRunning ? "Stop Practice" : "Practice"}
          </button>

          {/* Record */}
          {!recordRunning && !showPostRecordButtons ? (
            <button
              className="secondary"
              disabled={!practiceRunning || practicePaused}
              onClick={startRecord}
            >
              Record
            </button>
          ) : recordRunning ? (
            <button
              className="secondary"
              disabled={practicePaused}
              onClick={stopRecord}
            >
              Stop
            </button>
          ) : showPostRecordButtons ? (
            <div className="post-record-buttons">
              <button
                className="secondary"
                disabled={practicePaused}
                onClick={() => {
                  setRecordTime(0);
                  setShowPostRecordButtons(false);
                }}
              >
                Save
              </button>
              <button
                className="secondary"
                disabled={practicePaused}
                onClick={() => {
                  setRecordTime(0);
                  setShowPostRecordButtons(false);
                }}
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>

        {expanded && (
          <div className="extra-buttons">
            <button
              disabled={practicePaused}
              onClick={() => navigate("/tuner")}
            >
              Tuner
            </button>
            {!metronomeRunning ? (
              <button
                disabled={practicePaused}
                onClick={() => setShowMetronome(true)}
              >
                Metronome
              </button>
            ) : (
              <button
                className="metronome-stop"
                onClick={() => setMetronomeRunning(false)}
              >
                {bpm} BPM
              </button>
            )}
            <button
              disabled={practicePaused}
              onClick={() => navigate("/settings")}
            >
              Settings
            </button>
          </div>
        )}
      </div>

      {showMetronome && !metronomeRunning && (
        <div className="metronome-popup">
          <h3>Select BPM</h3>

          <input
            type="range"
            min="1"
            max="250"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
          />

          <div className="bpm-display">{bpm} BPM</div>

          <div className="bpm-adjust">
            <button onClick={() => setBpm(prev => Math.max(1, prev - 5))}>-5</button>
            <button onClick={() => setBpm(prev => Math.max(1, prev - 1))}>-1</button>
            <button onClick={() => setBpm(prev => Math.min(250, prev + 1))}>+1</button>
            <button onClick={() => setBpm(prev => Math.min(250, prev + 5))}>+5</button>
          </div>
          <div className="metronome-buttons">
            <button
              onClick={() => {
                setMetronomeRunning(true);
                setShowMetronome(false);
              }}
            >
              Start
            </button>

            <button
              onClick={() => setShowMetronome(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {practicePaused && (
        <div className="practice-overlay">
          <div className="practice-popup">
            <button
              className="resume-btn"
              onClick={() => {
                // Reset record timer completely
                setRecordTime(0);
                setRecordRunning(false);
                setShowPostRecordButtons(false);

                // Resume practice
                setPracticeRunning(true);
                setPracticePaused(false);
              }}
            >
              Resume
            </button>


            <button
              className="finish-btn"
              onClick={() => {
                navigate("/upload");
              }}
            >
              Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
