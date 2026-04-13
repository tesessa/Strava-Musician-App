import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/navigation/BottomNav"
import "./calendar.css";

type EventType = "Lesson" | "Practice" | "Recital" | "Friend Recital" | "Other" | "";

type ReminderUnit = "minutes" | "hours" | "days" | "weeks";

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  type: EventType;
  title: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  reminder?: {
    value: number;
    unit: ReminderUnit;
  };
}

const STORAGE_KEY = "calendar-events";

/* ============================= */
/* TEMP DATA LAYER               */
/* Replace these with backend    */
/* calls later                   */
/* ============================= */
async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

async function createCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
  const existing = await getCalendarEvents();
  const updated = [...existing, event];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return event;
}

async function deleteCalendarEvent(id: string): Promise<void> {
  const existing = await getCalendarEvents();
  const updated = existing.filter((event) => event.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/* ============================= */
/* DATE HELPERS                  */
/* ============================= */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


export default function CalendarPage() {
// const testNotification = async () => {
//   alert("Test button clicked");

//   if (!("Notification" in window)) {
//     alert("This browser does not support notifications.");
//     return;
//   }

//   const permission = await Notification.requestPermission();
//   alert(`Permission result: ${permission}`);
//   console.log("Notification.permission =", permission);

//   if (permission === "granted") {
//     new Notification("Test notification", {
//       body: "If you can see this, notifications are working.",
//     });

//     alert("Notification was created.");
//   } else {
//     alert("Notifications are not allowed.");
//   }
// };
//----------------

  const navigate = useNavigate();
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDayView, setShowDayView] = useState(false);

  const [eventType, setEventType] = useState<EventType>("");
  const [eventTitle, setEventTitle] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");

  const [showReminder, setShowReminder] = useState(false);
  const [reminderValue, setReminderValue] = useState<number>(10);
  const [reminderUnit, setReminderUnit] = useState<ReminderUnit>("minutes");

  /* ============================= */
  /* LOAD EVENTS                   */
  /* ============================= */
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getCalendarEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to load events:", error);
      }
    };

    loadEvents();
  }, []);

  /* ============================= */
  /* CALENDAR GRID                 */
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

  const canSave = Boolean(selectedDate && eventTitle.trim() && eventType);

  const changeMonth = (offset: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1)
    );
  };

  const eventsForDate = (date: string) => events.filter((e) => e.date === date);

  const monthEvents = useMemo(() => {
    return events
      .filter((event) => {
        const d = parseDateKey(event.date);
        return (
          d.getFullYear() === currentMonth.getFullYear() &&
          d.getMonth() === currentMonth.getMonth()
        );
      })
      .sort(
        (a, b) => parseDateKey(a.date).getTime() - parseDateKey(b.date).getTime()
      );
  }, [events, currentMonth]);

  /* ============================= */
  /* STREAK                        */
  /* ============================= */
  const getPracticeStreak = (allEvents: CalendarEvent[]) => {
    const practiceDates = [
      ...new Set(allEvents.filter((e) => e.type === "Practice").map((e) => e.date)),
    ].sort();

    if (practiceDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latestPractice = parseDateKey(practiceDates[practiceDates.length - 1]);
    latestPractice.setHours(0, 0, 0, 0);

    const latestDiff = Math.round(
      (today.getTime() - latestPractice.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If latest practice was neither today nor yesterday, streak is broken
    if (latestDiff > 1) return 0;

    // Start counting from latest valid streak day
    let streak = 1;
    let expectedDate = new Date(latestPractice);

    for (let i = practiceDates.length - 2; i >= 0; i--) {
      expectedDate.setDate(expectedDate.getDate() - 1);

      const d = parseDateKey(practiceDates[i]);
      d.setHours(0, 0, 0, 0);

      if (d.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (d.getTime() < expectedDate.getTime()) {
        break;
      }
    }

    return streak;
  };

  const practiceStreak = getPracticeStreak(events);

  /* ============================= */
  /* REMINDERS                     */
  /* ============================= */
  const convertToMs = (value: number, unit: ReminderUnit) => {
    switch (unit) {
      case "minutes":
        return value * 60 * 1000;
      case "hours":
        return value * 60 * 60 * 1000;
      case "days":
        return value * 24 * 60 * 60 * 1000;
      case "weeks":
        return value * 7 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return false;
    }

    if (Notification.permission === "granted") return true;

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  };

  /* ============================= */
  /* FORM ACTIONS                  */
  /* ============================= */
  const resetForm = () => {
    setEventType("");
    setEventTitle("");
    setStartTime("12:00");
    setEndTime("13:00");
    setShowReminder(false);
    setReminderValue(10);
    setReminderUnit("minutes");
  };

  const addEvent = async () => {
    if (!selectedDate || !eventTitle.trim() || !eventType) return;

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: selectedDate,
      type: eventType,
      title: eventTitle.trim(),
      startTime,
      endTime,
      duration: eventType === "Practice" ? 60 : undefined,
      reminder: showReminder
        ? {
            value: reminderValue,
            unit: reminderUnit,
          }
        : undefined,
    };


        try {
      await createCalendarEvent(newEvent);
      setEvents((prev) => [...prev, newEvent]);
 
      if (newEvent.reminder) {
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          const eventDate = parseDateKey(selectedDate);
          const [hours, minutes] = startTime.split(":").map(Number);
          eventDate.setHours(hours, minutes, 0, 0);
 
          const reminderMs = convertToMs(reminderValue, reminderUnit);
          const reminderTime = eventDate.getTime() - reminderMs;
          const now = Date.now();
 
          if (reminderTime > now) {
            const delay = reminderTime - now;
            setTimeout(() => {
              new Notification(`Reminder: ${eventTitle}`, {
                body: `${eventType} starts at ${startTime}`,
              });
            }, delay);
          }
        }
      }
 
      resetForm();
      setShowModal(false);
      setShowDayView(false);
    } catch (error) {
      console.error("Failed to add event:", error);
      alert("Failed to add event.");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteCalendarEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event.");
    }
  };
  //   try {
  //     const saved = await createCalendarEvent(newEvent);
  //     setEvents((prev) => [...prev, saved]);

  //     if (showReminder) {
  //       const hasPermission = await requestNotificationPermission();

  //       if (hasPermission) {
  //         if (!newEvent.startTime) {
  //           alert("Please choose a start time for reminders.");
  //         } else {
  //           const eventStart = new Date(`${newEvent.date}T${newEvent.startTime}`);
  //           const reminderOffset = convertToMs(reminderValue, reminderUnit);
  //           const delay = eventStart.getTime() - Date.now() - reminderOffset;

  //           console.log("eventStart:", eventStart);
  //           console.log("reminderOffset:", reminderOffset);
  //           console.log("delay:", delay);

  //           if (delay > 0) {
  //             setTimeout(() => {
  //               new Notification(`Reminder: ${newEvent.title}`, {
  //                 body: `${newEvent.type} starting soon`,
  //               });
  //             }, delay);
  //           } else {
  //             alert("That reminder time is already in the past.");
  //           }
  //         }
  //       }
  //     }

  //     resetForm();
  //     setShowModal(false);
  //   } catch (error) {
  //     console.error("Failed to save event:", error);
  //     alert("Failed to save event.");
  //   }
  // };

  // const handleDeleteEvent = async (id: string) => {
  //   try {
  //     await deleteCalendarEvent(id);
  //     setEvents((prev) => prev.filter((e) => e.id !== id));
  //   } catch (error) {
  //     console.error("Failed to delete event:", error);
  //     alert("Failed to delete event.");
  //   }
  // };

  /* ============================= */
  /* DISPLAY HELPERS               */
  /* ============================= */
  const colorClass = (type: EventType) => {
    switch (type) {
      case "Practice":
        return "practice-day";
      case "Lesson":
        return "lesson-day";
      case "Recital":
        return "recital-day";
      case "Friend Recital":
        return "friend-recital-day";
      case "Other":
        return "other-day";
      default:
        return "";
    }
  };

  const dotClass = (type: EventType) => {
    switch (type) {
      case "Lesson":
        return "lesson";
      case "Practice":
        return "practice";
      case "Recital":
        return "recital";
      case "Friend Recital":
        return "friend-recital";
      case "Other":
        return "other";
      default:
        return "";
    }
  };


  return (
    <div className="calendar-container">
      {/* <button className="back-button" onClick={() => navigate("/home")}>
        ←
      </button> */}
 
      <div className="purple-bg" />
 
      <div className="calendar-sheet">
        <div className="calendar-header">
          <button onClick={() => changeMonth(-1)}>◀</button>
          <h2>
            {currentMonth.toLocaleString("default", { month: "long" })}{" "}
            {currentMonth.getFullYear()}
          </h2>
          <button onClick={() => changeMonth(1)}>▶</button>
        </div>
 
        <div className="weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
 
        <div className="calendar-grid">
          {daysArray.map((_, index) => {
            const dayNumber = index - startDay + 1;
 
            if (index < startDay) {
              return <div key={index} className="empty" />;
            }
 
            const cellDate = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              dayNumber
            );
            const dateKey = formatDateKey(cellDate);
            const dayEvents = eventsForDate(dateKey);
            const isToday = isSameDate(cellDate, today);
 
            return (
              <div
                key={dateKey}
                className={`day ${dayEvents.length > 0 ? "has-events" : ""} ${
                  isToday ? "today" : ""
                }`}
                onClick={() => {
                  setSelectedDate(dateKey);
                  setShowDayView(true);
                }}
              >
                <span className="day-number">{dayNumber}</span>
 
                <div className="event-preview">
                  {dayEvents.slice(0, 2).map((event, i) => (
                    <div key={i} className={`event-chip ${dotClass(event.type)}`}>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="more">+{dayEvents.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
 
        {/* Practice Streak moved to bottom */}
        <div className="month-events">
          <div className="stats-grid" style={{ marginBottom: '16px' }}>
            <div className="stat-card">
              <h4>Practice Streak</h4>
              <p>{practiceStreak} day{practiceStreak !== 1 ? "s" : ""}</p>
            </div>
          </div>
 
          {monthEvents.length === 0 ? (
            <p className="no-events">No events this month</p>
          ) : (
            monthEvents.map((event) => (
              <div key={event.id} className={`event-item ${colorClass(event.type)}`}>
                <span>
                  {event.date} — <strong>{event.type}</strong>: {event.title}
                  {event.startTime && event.endTime
                    ? ` (${event.startTime} - ${event.endTime})`
                    : ""}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
 
      {/* Floating + button */}
      {/* <button
        className="add-event-fab"
        onClick={() => {
          setSelectedDate(formatDateKey(today));
          setShowModal(true);
        }}
        aria-label="Add event"
      >
        +
      </button> */}
 
      {/* Day View Modal */}
      {showDayView && selectedDate && (
        <div className="modal-overlay" onClick={() => setShowDayView(false)}>
          <div className="modal day-view-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{parseDateKey(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}</h3>
              <button
                className="secondary-btn"
                onClick={() => setShowDayView(false)}
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
 
            <div className="day-view-content">
              {eventsForDate(selectedDate).length === 0 ? (
                <p className="no-events">No events scheduled</p>
              ) : (
                <div className="day-view-events">
                  {eventsForDate(selectedDate)
                    .sort((a, b) => {
                      if (!a.startTime || !b.startTime) return 0;
                      return a.startTime.localeCompare(b.startTime);
                    })
                    .map((event) => (
                      <div key={event.id} className={`event-item ${colorClass(event.type)}`}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span className={`dot ${dotClass(event.type)}`} />
                            <strong>{event.type}</strong>
                          </div>
                          <div style={{ fontSize: '15px', marginBottom: '4px' }}>{event.title}</div>
                          {event.startTime && event.endTime && (
                            <div style={{ fontSize: '13px', color: '#a5b4fc' }}>
                              {event.startTime} - {event.endTime}
                            </div>
                          )}
                        </div>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
 
            <button
              className="primary-btn"
              onClick={() => {
                setShowDayView(false);
                setShowModal(true);
              }}
              style={{ marginTop: '12px' }}
            >
              Add Event
            </button>
          </div>
        </div>
      )}
 
      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Event</h3>
 
            {selectedDate && (
              <div className="selected-date">
                {parseDateKey(selectedDate).toLocaleDateString()}
              </div>
            )}
 
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
            >
              <option value="">Select type</option>
              <option value="Lesson">Lesson</option>
              <option value="Practice">Practice</option>
              <option value="Recital">Recital</option>
              <option value="Friend Recital">Friend Recital</option>
              <option value="Other">Other</option>
            </select>
 
            <input
              type="text"
              placeholder="Event Title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />
 
            <div className="time-row">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <span>to</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
 
            <button
              type="button"
              className="reminder-toggle"
              onClick={() => setShowReminder(!showReminder)}
            >
              {showReminder ? "Hide Reminder" : "Add Reminder"}
            </button>
 
            {showReminder && (
              <div className="reminder-row">
                <input
                  type="number"
                  min="0"
                  value={reminderValue}
                  onChange={(e) => setReminderValue(Number(e.target.value))}
                />
                <select
                  value={reminderUnit}
                  onChange={(e) => setReminderUnit(e.target.value as ReminderUnit)}
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                  <option value="weeks">weeks</option>
                </select>
              </div>
            )}
 
            <div className="modal-buttons">
              <button className="primary-btn" onClick={addEvent} disabled={!canSave}>
                Save
              </button>
              <button
                className="secondary-btn"
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
 
      <BottomNav active="calendar" />
    </div>
  );

}