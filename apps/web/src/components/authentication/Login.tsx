import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthForm, { AuthFormData } from "./AuthForm";
import AuthLayout from "./AuthLayout";
import { userService } from "../../model";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<AuthFormData>({
        email: '',
        password: ''
    });
    const [error, setError] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const user = await userService.login(formData.email ?? "", formData.password ?? "");
        if (user) {
            navigate("/home");
        } else {
            setError("Invalid email or password. Please try again.");
        }
    }

    const loginFields = [
        { name: 'email' as const, type: 'text', placeholder: 'Email' },
        { name: 'password' as const, type: 'password', placeholder: 'Password' },
    ];

 return (
    <AuthLayout>
      {error && <p className="error-text">{error}</p>}

      <AuthForm
        fields={loginFields}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        submitLabel="Log In"
      >
        <Link to="/forgotPassword" className="forgot-password">
          Forgot password?
        </Link>
      </AuthForm>

      <div className="divider" />

      <Link to="/register">
        <button className="toggle-btn">Create New Account</button>
      </Link>
    </AuthLayout>
  );
};

export default Login;