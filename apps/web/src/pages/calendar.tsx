import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./calendar.css";




type EventType = "Lesson" | "Practice" | "Recital" | "Other" | "";
type ReminderUnit = "minutes" | "hours" | "days" | "weeks";


interface CalendarEvent {
 id: string;
 date: string;
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


export default function CalendarPage() {
 const navigate = useNavigate();
 const today = new Date();
 const [currentMonth, setCurrentMonth] = useState(today);
 const [selectedDate, setSelectedDate] = useState<string | null>(null);
 const [events, setEvents] = useState<CalendarEvent[]>([]);
 const [showModal, setShowModal] = useState(false);


 const [eventType, setEventType] = useState<EventType>("");
 const [eventTitle, setEventTitle] = useState("");
 const [startTime, setStartTime] = useState("12:00");
 const [endTime, setEndTime] = useState("13:00");


 const [showReminder, setShowReminder] = useState(false);
 const [reminderValue, setReminderValue] = useState<number>(10);
 const [reminderUnit, setReminderUnit] = useState<ReminderUnit>("minutes");




 /* ============================= */
 /* LOAD / SAVE                   */
 /* ============================= */
 useEffect(() => {
   const stored = localStorage.getItem("calendar-events");
   if (stored) setEvents(JSON.parse(stored));
 }, []);


 useEffect(() => {
   localStorage.setItem("calendar-events", JSON.stringify(events));
 }, [events]);


 /* ============================= */
 /* CALENDAR                      */
 /* ============================= */
 const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
 const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
 const daysInMonth = endOfMonth.getDate();
 const startDay = startOfMonth.getDay();
 const daysArray = Array.from({ length: startDay + daysInMonth });


 const changeMonth = (offset: number) => {
   setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
 };


 const eventsForDate = (date: string) => events.filter((e) => e.date === date);
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
     alert("This browser does not support notifications");
     return false;
   }


   if (Notification.permission === "granted") return true;


   if (Notification.permission !== "denied") {
     const permission = await Notification.requestPermission();
     return permission === "granted";
   }


   return false;
 };


 const addEvent = async () => {
   if (!selectedDate || !eventTitle) return;


   const newEvent: CalendarEvent = {
     id: Date.now().toString(),
     date: selectedDate,
     type: eventType,
     title: eventTitle,
     startTime,
     endTime,
     duration: eventType === "Practice" ? 60 : undefined,
     reminder: showReminder
       ? { value: reminderValue, unit: reminderUnit }
       : undefined,
   };


   setEvents((prev) => [...prev, newEvent]);


   if (showReminder) {
     const hasPermission = await requestNotificationPermission();


     if (hasPermission) {
       const reminderMs = convertToMs(reminderValue, reminderUnit);


       setTimeout(() => {
         new Notification(`Reminder: ${newEvent.title}`, {
           body: `${newEvent.type} starting soon`,
         });
       }, reminderMs);
     }
   }


   resetForm();
   setShowModal(false);
 };




 const resetForm = () => {
   setEventType("");   // or "" if you want no default
   setEventTitle("");
   setStartTime("12:00");
   setEndTime("13:00");


   setShowReminder(false);
   setReminderValue(10);
   setReminderUnit("minutes");
 };


 const deleteEvent = (id: string) => setEvents(events.filter((e) => e.id !== id));


 const colorClass = (type: EventType) => {
   switch (type) {
     case "Practice":
       return "practice-day";
     case "Lesson":
       return "lesson-day";
     case "Recital":
       return "recital-day";
     case "Other":
       return "other-day";
     default:
       return "";
   }
 };


 const monthEvents = events
   .filter((e) => {
     const [year, month] = e.date.split("-").map(Number);


     return (
       year === currentMonth.getFullYear() &&
       month === currentMonth.getMonth()
     );
   })
   .sort((a, b) => {
     const [ay, am, ad] = a.date.split("-").map(Number);
     const [by, bm, bd] = b.date.split("-").map(Number);


     const dateA = new Date(ay, am, ad).getTime();
     const dateB = new Date(by, bm, bd).getTime();


     return dateA - dateB;
   });


 return (
   <div className="calendar-container">


     <button className="back-button" onClick={() => navigate("/home")}>
       ←
     </button>


     <div className="calendar-sheet">


       <div className="calendar-header">
         <button onClick={() => changeMonth(-1)}>◀</button>
         <h2>
           {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
         </h2>
         <button onClick={() => changeMonth(1)}>▶</button>
       </div>


       <div className="weekdays">
         {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => <div key={day}>{day}</div>)}
       </div>


       <div className="calendar-grid">
         {daysArray.map((_, index) => {
           const dayNumber = index - startDay + 1;
           if (index < startDay) return <div key={index} className="empty"></div>;


           const dateKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${dayNumber}`;
           const dayEvents = eventsForDate(dateKey);

           return (
             <div
               key={index}
               className="day"
               onClick={() => {
                 setSelectedDate(dateKey);
                 setShowModal(true);
               }}
             >
               <div
                 key={index}
                 className="day"
                 onClick={() => {
                   setSelectedDate(dateKey);
                   setShowModal(true);
                 }}
               >
                 <span className="day-number">{dayNumber}</span>


                 <div className="event-dots">
                 {dayEvents.slice(0, 3).map((event, i) => (
                   <span key={i} className={`dot ${event.type.toLowerCase()}`}></span>
                 ))}
                 {dayEvents.length > 3 && <span className="more">+</span>}
               </div>
               </div>
             </div>
           );
         })}
       </div>


       {/* Monthly Events List */}
       <div className="month-events">
         {monthEvents.length === 0 && (
           <p className="no-events">No events this month</p>
         )}


         {monthEvents.map((event) => (
           <div key={event.id} className={`event-item ${colorClass(event.type)}`}>
             <span>
               {event.date} — <strong>{event.type}</strong>: {event.title}
               {event.startTime && event.endTime
                 ? ` (${event.startTime} - ${event.endTime})`
                 : ""}
             </span>
           </div>
         ))}
       </div>
     </div>


     {/* Modal */}
     {showModal && (
       <div className="modal-overlay">
         <div className="modal">
           <h3>Add Event</h3>


           <select value={eventType} onChange={(e) => setEventType(e.target.value as EventType)}>
             <option value="">Select type</option>
             <option>Lesson</option>
             <option>Practice</option>
             <option>Recital</option>
             <option>Other</option>
           </select>


           <input
             type="text"
             placeholder="Event Title"
             value={eventTitle}
             onChange={(e) => setEventTitle(e.target.value)}
           />


           {/* Time Inputs */}
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


           <button type="button" onClick={() => setShowReminder(!showReminder)}>
             Add Reminder
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
             <button className="primary-btn" onClick={addEvent}>
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


           {selectedDate &&
             eventsForDate(selectedDate).map((event) => (
               <div key={event.id} className={`event-item ${colorClass(event.type)}`}>
                 <div>
                   <strong>{event.type}</strong>: {event.title}{" "}
                   {event.startTime && event.endTime ? `(${event.startTime} - ${event.endTime})` : ""}
                 </div>
                 <button className="delete-btn" onClick={() => deleteEvent(event.id)}>
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
