import React, { useState } from 'react';
import { Link } from "react-router-dom";
import AuthForm, { AuthFormData } from "./AuthForm";
import AuthLayout from './AuthLayout';

const ForgotPassword = () => {
  const [formData, setFormData] = useState<AuthFormData>({ email: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Forgot password attempted with:', { email: formData.email });
    // TODO: send password reset email
  };

  const forgotFields = [
    { name: 'email' as const, type: 'email', placeholder: 'Email address' },
  ];

 return (
    <AuthLayout>
      <h3 className="forgot-password-text">Find your account</h3>
      <p className="forgot-password-text">Please enter your email to search for your account</p>
      
      <AuthForm
        fields={forgotFields}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        submitLabel="Search"
      />

      <div className="divider" />

      <Link to="/">
        <button className="toggle-btn">Cancel</button>
      </Link>
    </AuthLayout>
  );
};

export default ForgotPassword;