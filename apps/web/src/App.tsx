// import { APP_CONFIG } from "@strava-musician-app/shared";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/home/Home";
import PracticeLog from "./components/practice/PracticeLog";
import Login from "./components/authentication/Login";
import Register from "./components/authentication/Register";
import ForgotPassword from "./components/authentication/ForgotPassword";
import CalendarPage from "./pages/calendar";
import Practice from "./components/practice/Practice";
import Profile from "./components/profile/TempProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        {/* <Route
          path="/profile"
          element={<div style={{ padding: 24 }}>Profile / Settings (TBD)</div>}
        /> */}
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice-log" element={<PracticeLog />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
