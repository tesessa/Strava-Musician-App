import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import AuthForm, { AuthFormData } from "./AuthForm";
import AuthLayout from './AuthLayout';
import { userService } from '../../model';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AuthFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError("");

    await userService.register(
        formData.username ?? "",
        formData.email ?? "",
        formData.password ?? ""
    );
    navigate("/home");
  };

  const registerFields = [
    { name: 'username' as const, type: 'text', placeholder: 'username' },
    { name: 'email' as const, type: 'email', placeholder: 'Email address' },
    { name: 'password' as const, type: 'password', placeholder: 'Password' },
    { name: 'confirmPassword' as const, type: 'password', placeholder: 'Confirm Password' },
  ];

 return (
    <AuthLayout>
      {error && <p className="error-text">{error}</p>}

      <AuthForm
        fields={registerFields}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        submitLabel="Sign Up"
      />

      <div className="divider" />

      <Link to ="/">
        <button className="toggle-btn">Already have an account? Log In</button>
      </Link>

    </AuthLayout>
  );
};

export default Register;