import { useState, useEffect } from "react";
import "./record.css";

export default function PracticePage() {
  const [expanded, setExpanded] = useState(false);

  const [instrument, setInstrument] = useState("");
  const [showInstrumentOptions, setShowInstrumentOptions] = useState(false);

  // PRACTICE TIMER
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [practiceTimeLeft, setPracticeTimeLeft] = useState(0);
  const [practiceRunning, setPracticeRunning] = useState(false);
  const [practiceFinished, setPracticeFinished] = useState(false);
  const stopPractice = () => {
    setPracticeRunning(false);
    setPracticeTimeLeft(0);
    setPracticeFinished(false); // remove blinking
  };



  // RECORD TIMER
  const [recordTime, setRecordTime] = useState(0);
  const [recordRunning, setRecordRunning] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPostRecordButtons, setShowPostRecordButtons] = useState(false);


  // PRACTICE COUNTDOWN
  useEffect(() => {
    if (!practiceRunning) return;

    if (practiceTimeLeft <= 0) {
  setPracticeRunning(false);

    if (practiceTimeLeft === 0) {
      setPracticeFinished(true);
      }

      return;
  }


    const interval = setInterval(() => {
      setPracticeTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [practiceRunning, practiceTimeLeft]);

  // RECORD COUNT UP
  useEffect(() => {
    if (!recordRunning) return;

    const interval = setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [recordRunning]);

  const startPractice = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds === 0) return;

    setPracticeFinished(false); 
    setPracticeTimeLeft(totalSeconds);
    setPracticeRunning(true);
    setShowTimePicker(false);
  };

  const startRecord = () => {
    setRecordTime(0);
    setRecordRunning(true);
  };

  const stopRecord = () => {
  setRecordRunning(false);
  setShowPostRecordButtons(true); // show Save/Delete buttons
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
      <div className="purple-bg"></div>

      <div className={`bottom-sheet ${expanded ? "expanded" : ""}`}>
        <div
          className="drag-handle"
          onClick={() => setExpanded(!expanded)}
        ></div>

        <div className="timer-row">
        {/* Practice Timer */}
        <div className="timer-box">
          <h3>Practice Timer</h3>
          <h1
            className={`practice-timer ${
              practiceFinished ? "blink" : ""
            }`}
          >
            {formatTime(practiceTimeLeft)}
          </h1>

        </div>

        {/* Record Timer */}
        <div className="timer-box">
          <h3>Record Timer</h3>
          <h1 className="record-timer">
            {formatTime(recordTime)}
          </h1>
        </div>
      </div>



        <div className="buttons">
          {/* Instrument */}
          <div className="instrument-wrapper">
            <button
              className="secondary"
              onClick={() =>
                setShowInstrumentOptions(!showInstrumentOptions)
              }
            >
              {instrument
                ? instrument.charAt(0).toUpperCase() + instrument.slice(1)
                : "Instrument"}

            </button>

            {showInstrumentOptions && (
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
            onClick={() => {
              if (practiceRunning || practiceFinished) {
                // Stop countdown immediately
                setPracticeRunning(false);
                setPracticeTimeLeft(0);
                setPracticeFinished(false); // remove blinking
                setShowTimePicker(false);   // hide time picker if open
              } else {
                setShowTimePicker(!showTimePicker);
              }
            }}
          >
            {practiceRunning || practiceFinished ? "Stop Practice" : "Practice"}
          </button>


          {/* Record */}
          {!recordRunning && !showPostRecordButtons ? (
              <button className="secondary" onClick={startRecord}>
                Record
              </button>
            ) : recordRunning ? (
              <button className="secondary" onClick={stopRecord}>
                Stop
              </button>
            ) : showPostRecordButtons ? (
              <div className="post-record-buttons">
                <button
                  className="secondary"
                  onClick={() => {
                    // Save action (you can add save logic here)
                    setRecordTime(0);
                    setShowPostRecordButtons(false);
                  }}
                >
                  Save
                </button>
                <button
                  className="secondary"
                  onClick={() => {
                    // Delete action
                    setRecordTime(0);
                    setShowPostRecordButtons(false);
                  }}
                >
                  Delete
                </button>
              </div>
            ) : null}

        </div>

        {/* Time Picker */}
        {showTimePicker && (
          <div className="time-picker">
            <div className="picker-row">
              <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                {Array.from({ length: 6 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>

              <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>

              <select value={seconds} onChange={(e) => setSeconds(Number(e.target.value))}>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>

            <button className="start-btn" onClick={startPractice}>
              Start Countdown
            </button>
          </div>
        )}

        {expanded && (
          <div className="extra-buttons">
            <button>Tuner</button>
            <button>Metronome</button>
            <button>Settings</button>
          </div>
        )}
      </div>
    </div>
  );
}
