import { useState, useEffect, useRef } from "react";
import "./calendar.css";

type EventType = "Recital" | "Concert" | "Other" | "Practice";

interface CalendarEvent {
  id: string;
  date: string;
  type: EventType;
  title: string;
  duration?: number;
}

export default function CalendarPage() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);

  const [eventType, setEventType] = useState<EventType>("Recital");
  const [eventTitle, setEventTitle] = useState("");

  /* ============================= */
  /* FAKE PRACTICE DATA            */
  /* ============================= */

  const generateFakePractices = () => {
    const fake: CalendarEvent[] = [];

    const createPractice = (date: Date) => ({
      id: Date.now().toString() + Math.random(),
      date: formatDate(date),
      type: "Practice" as EventType,
      title: "1 Hour Practice",
      duration: 60,
    });

    // 3 this week
    for (let i = 1; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      fake.push(createPractice(d));
    }

    // 4 last week
    for (let i = 7; i <= 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      fake.push(createPractice(d));
    }

    return fake;
  };

  /* ============================= */
  /* LOAD / SAVE                   */
  /* ============================= */

  useEffect(() => {
    const stored = localStorage.getItem("calendar-events");
    if (stored) {
      setEvents(JSON.parse(stored));
    } else {
      const fake = generateFakePractices();
      setEvents(fake);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("calendar-events", JSON.stringify(events));
  }, [events]);

  /* ============================= */
  /* HELPERS                       */
  /* ============================= */

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  };

  const getWeekTotal = (weekOffset: number) => {
    const base = startOfWeek(today);
    base.setDate(base.getDate() - weekOffset * 7);

    const weekStart = new Date(base);
    const weekEnd = new Date(base);
    weekEnd.setDate(weekStart.getDate() + 6);

    return events
      .filter(
        (e) =>
          e.type === "Practice" &&
          new Date(e.date) >= weekStart &&
          new Date(e.date) <= weekEnd
      )
      .reduce((sum, e) => sum + (e.duration || 0), 0);
  };

  const getPracticeStreak = () => {
    const practiceDates = events
      .filter((e) => e.type === "Practice")
      .map((e) => e.date);

    let streak = 0;
    let d = new Date(today);

    while (practiceDates.includes(formatDate(d))) {
      streak++;
      d.setDate(d.getDate() - 1);
    }

    return streak;
  };

  /* ============================= */
  /* CALENDAR                      */
  /* ============================= */

  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  const daysInMonth = endOfMonth.getDate();
  const startDay = startOfMonth.getDay();
  const daysArray = Array.from({ length: startDay + daysInMonth });

  const changeMonth = (offset: number) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + offset,
        1
      )
    );
  };

  const eventsForDate = (date: string) =>
    events.filter((e) => e.date === date);

  const addEvent = () => {
    if (!selectedDate || !eventTitle) return;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: selectedDate,
      type: eventType,
      title: eventTitle,
      duration: eventType === "Practice" ? 60 : undefined,
    };

    setEvents([...events, newEvent]);
    setEventTitle("");
    setShowModal(false);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const thisWeekTotal = getWeekTotal(0);
  const lastWeekTotal = getWeekTotal(1);
  const streak = getPracticeStreak();

  return (
    <div className="calendar-container">
      <div className="purple-bg"></div>

      <div
        ref={sheetRef}
        className={`calendar-sheet ${sheetOpen ? "open" : ""}`}
      >
        <div
          className="drag-handle"
          onClick={() => setSheetOpen(!sheetOpen)}
        ></div>

        <div className="calendar-header">
          <button onClick={() => changeMonth(-1)}>◀</button>
          <h2>
            {currentMonth.toLocaleString("default", {
              month: "long",
            })}{" "}
            {currentMonth.getFullYear()}
          </h2>
          <button onClick={() => changeMonth(1)}>▶</button>
        </div>

        <div className="weekdays">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day)=>(
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {daysArray.map((_, index) => {
            const dayNumber = index - startDay + 1;

            if (index < startDay)
              return <div key={index} className="empty"></div>;

            const dateKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${dayNumber}`;
            const dayEvents = eventsForDate(dateKey);
            const hasPractice = dayEvents.some(
              (e) => e.type === "Practice"
            );
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={index}
                className={`day ${
                  hasPractice
                    ? "practice-day"
                    : hasEvents
                    ? "has-event"
                    : ""
                }`}
                onClick={() => {
                  setSelectedDate(dateKey);
                  setShowModal(true);
                }}
              >
                {dayNumber}
              </div>
            );
          })}
        </div>

        {sheetOpen && (
          <div className="activity-log">
            <h3>Practice Overview</h3>

            <div className="stats-grid">
              <div className="stat-card">
                <h4>This Week</h4>
                <p>{thisWeekTotal / 60} hrs</p>
              </div>

              <div className="stat-card">
                <h4>Last Week</h4>
                <p>{lastWeekTotal / 60} hrs</p>
              </div>

              <div className="stat-card">
                <h4>Streak</h4>
                <p>{streak} days 🔥</p>
              </div>
            </div>

            <h3>All Activity</h3>

            {events
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() -
                  new Date(a.date).getTime()
              )
              .map((event) => (
                <div key={event.id} className="sheet-item">
                  <strong>{event.type}</strong> – {event.title}
                  <div className="sheet-date">
                    {new Date(event.date).toDateString()}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Event</h3>

            <select
              value={eventType}
              onChange={(e) =>
                setEventType(e.target.value as EventType)
              }
            >
              <option>Recital</option>
              <option>Concert</option>
              <option>Other</option>
              <option>Practice</option>
            </select>

            <input
              type="text"
              placeholder="Event Title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />

            <div className="modal-buttons">
              <button className="primary-btn" onClick={addEvent}>
                Save
              </button>
              <button
                className="secondary-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>

            {selectedDate &&
              eventsForDate(selectedDate).map((event) => (
                <div key={event.id} className="event-item">
                  <div>
                    <strong>{event.type}</strong>: {event.title}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => deleteEvent(event.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}