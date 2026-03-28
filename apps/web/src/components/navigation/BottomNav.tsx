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
        aria-label="Home"
      >
        <span className="nav-icon nav-icon-home" aria-hidden="true" />
      </button>

      <button
        className={`nav-btn ${active === "practice" ? "nav-btn-active" : ""}`}
        onClick={() => navigate("/practice")}
        type="button"
        aria-label="Record"
      >
        <span className="nav-icon nav-icon-record" aria-hidden="true" />
      </button>

      <button
        className={`nav-btn ${active === "calendar" ? "nav-btn-active" : ""}`}
        onClick={() => navigate("/calendar")}
        type="button"
        aria-label="Calendar"
      >
        <span className="nav-icon nav-icon-calendar" aria-hidden="true" />
      </button>

      <button
        className={`nav-btn ${active === "profile" ? "nav-btn-active" : ""}`}
        onClick={() => navigate("/profile")}
        type="button"
        aria-label="Profile"
      >
        <span className="nav-icon nav-icon-profile" aria-hidden="true" />
      </button>
    </nav>
  );
};

export default BottomNav;