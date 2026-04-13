import { APP_CONFIG } from "@strava-musician-app/shared";
import React from "react";
import "./login.css";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form-panel">
          <div className="login-header">
            <img
              className="login-main-logo"
              src="/koda-main-logo.png"
              alt={APP_CONFIG.appName}
            />
          </div>

          <div className="login-box">{children}</div>
        </div>

        <div className="footer-text">
          <p>
            Connect with fellow musicians • Track practice sessions • Share
            achievements
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
