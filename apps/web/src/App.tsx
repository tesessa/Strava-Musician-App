// import { APP_CONFIG } from "@strava-musician-app/shared";
// import type { User } from "@strava-musician-app/shared";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from './pages/Login';
import Home from './pages/Home';
import Post from './components/practice/Post'
// import Post from "./pages/Post"
import Login from "./components/authentication/Login"
import Register from "./components/authentication/Register";
import ForgotPassword from "./components/authentication/ForgotPassword";
import CalendarPage from "./pages/calendar";
import Practice from "./components/practice/Practice"

function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/calendar" element={<div style={{ padding: 24 }}>Calendar (TBD)</div>} />
        <Route path="/profile" element={<div style={{ padding: 24 }}>Profile / Settings (TBD)</div>} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/post" element={<Post/>} />
        <Route path="/forgotPassword" element={<ForgotPassword/>} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </BrowserRouter>
  );

}

export default App;
