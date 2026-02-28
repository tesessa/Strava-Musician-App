import { APP_CONFIG } from "@strava-musician-app/shared";
// import type { User } from "@strava-musician-app/shared";
import React, { useState } from 'react';
import '../index.css'
import { useNavigate } from "react-router-dom";
import { userService } from "../model";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      console.log('Login attempted with:', { email: formData.email, password: formData.password });
      // Look up information in database to make sure it is valid (then navigate to next page)
      navigate("/home");
      // route to /home after logging in
    } else if (forgotPassword) {
      console.log('Forgot password attempted with:', { email: formData.email })
      // not sure if we want to keep this, but sends email to user to reset password
    } else  {
      console.log('Registration attempted with:', formData);
      // Input info into database, check that password === confirmPassword, navigate to next page
    }
    // navigate("/practice");
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <h1 className="logo">{APP_CONFIG.appName}</h1>
        </div>

        <div className="login-box">
          {forgotPassword && (
            <>
              <h3 className="forgot-password-text">Find your account</h3>
              <p className="forgot-password-text">Please enter your email to search for your account</p>
            </>
          )}
          <form onSubmit={handleSubmit}>
            {!isLogin && !forgotPassword && (
              <>
                <input
                  type="text"
                  name="firstname"
                  placeholder="First Name"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="input-field"
                />
                <input
                  type="text"
                  name="lastname"
                  placeholder="Last Name"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="input-field"
                />
              </>
            )}
            
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="input-field"
            />
            
            {!forgotPassword && (
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="input-field"
            />
            )}

            {!isLogin && !forgotPassword && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required={!isLogin}
                className="input-field"
              />
            )}

            <button type="submit" className="submit-btn">
              {forgotPassword ? 'Search' : (isLogin ? 'Log In' : 'Sign Up')}
            </button>
          </form>

          {isLogin && !forgotPassword && (
            <a href="#" className="forgot-password" onClick={(e) => {
              e.preventDefault();
              setForgotPassword(true);
            }}
            >
              Forgot password?</a>
          )}

          <div className="divider"></div>

          <button 
            className="toggle-btn"
            onClick={() => {
              if(forgotPassword) {
                setForgotPassword(false);
              } else {
               setIsLogin(!isLogin) 
              }
            }}
          >
            {forgotPassword ? 'Cancel' : (isLogin ? 'Create New Account' : 'Already have an account? Log In')}
          </button>
        </div>

        <div className="footer-text">
          <p>Connect with fellow musicians • Track practice sessions • Share achievements</p>
        </div>
      </div>
    </div>
  );
};

export default Login;