import { useNavigate } from "react-router-dom";
import "../../index.css";

type BottomNavProps = {
  active: "home" | "practice" | "calendar" | "profile";
};

const BottomNav = ({ active }: BottomNavProps) => {
  const navigate = useNavigate();

  return (
    <nav className="home-bottomnav">
      <button
        className={`nav-btn ${active === "home" ? "nav-btn-active" : ""}`}
        onClick={() => navigate("/home")}
        type="button"
      >
        Home
      </button>

      <button
        className={`nav-btn ${active === "practice" ? "nav-btn-active" : ""}`}
        onClick={() => navigate("/practice")}
        type="button"
      >
        Record
      </button>

      <button
        className={`nav-btn ${active === "calendar" ? "nav-btn-active" : ""}`}
        onClick={() => navigate("/calendar")}
        type="button"
      >
        Calendar
      </button>

      <button
        className={`nav-btn ${active === "profile" ? "nav-btn-active" : ""}`}
        onClick={() => navigate("/profile")}
        type="button"
      >
        Profile
      </button>
    </nav>
  );
};

export default BottomNav;