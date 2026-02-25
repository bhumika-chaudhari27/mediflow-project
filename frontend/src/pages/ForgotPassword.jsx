import { useState } from "react";
import { Link } from "react-router-dom";
import { mockForgotPassword } from "../services/authService";
import { validateEmail, sanitizeInput } from "../utils/validation";
import "../styles/Login.css";
import "../styles/Signup.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setLoading(true);
    try {
      await mockForgotPassword(sanitizeInput(email));
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Check your email</h2>
          <p className="auth-subtitle">
            We&apos;ve sent a password reset link to <strong>{email}</strong> (simulated).
          </p>
          <Link to="/login" className="auth-btn auth-btn-secondary">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to get a reset link</p>

        {error && (
          <div className="auth-message auth-message-error" role="alert">
            {error}
          </div>
        )}

        <div className="field-group">
          <label htmlFor="forgot-email" className="sr-only">Email</label>
          <input
            id="forgot-email"
            type="email"
            name="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(sanitizeInput(e.target.value));
              setError("");
            }}
            className="auth-input"
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </button>

        <p className="switch-text">
          <Link to="/login" className="auth-link">Back to Login</Link>
        </p>
      </form>
    </div>
  );
}
