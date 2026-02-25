import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { mockResetPassword } from "../services/authService";
import { validatePassword } from "../utils/validation";
import PasswordInput from "../components/PasswordInput";
import "../styles/Login.css";
import "../styles/Signup.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const passErr = validatePassword(password, true);
    const confirmErr = password !== confirm ? "Passwords do not match" : "";
    setErrors({ password: passErr, confirm: confirmErr });
    if (passErr || confirmErr) return;

    setLoading(true);
    try {
      await mockResetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setSubmitError(err.message || "Reset failed. Try again or request a new link.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Password reset</h2>
          <p className="auth-subtitle">Redirecting you to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Enter your new password</p>

        {submitError && (
          <div className="auth-message auth-message-error" role="alert">
            {submitError}
          </div>
        )}

        <div className="field-group">
          <label className="label-visible">New password</label>
          <PasswordInput
            name="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={loading}
          />
          <p className="password-rules">
            Min 8 chars, uppercase, lowercase, number, special character
          </p>
        </div>

        <div className="field-group">
          <label className="label-visible">Confirm password</label>
          <PasswordInput
            name="confirmPassword"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setErrors((e) => ({ ...e, confirm: "" }));
            }}
            error={errors.confirm}
            disabled={loading}
          />
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Resetting…" : "Reset password"}
        </button>

        <p className="switch-text">
          <Link to="/login" className="auth-link">Back to Login</Link>
        </p>
      </form>
    </div>
  );
}
