import { useState } from "react";
import { FaHospital } from "react-icons/fa";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";
import { validateEmail, validatePassword, sanitizeInput } from "../utils/validation";
import PasswordInput from "../components/PasswordInput";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, updateLastActivity } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password, false);
    const next = { email: emailErr, password: passErr };
    setErrors(next);
    return !emailErr && !passErr;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    try {
      // Use real API instead of mock
      const { user, token } = await authApi.login(form.email, form.password);
      login(user, token);
      updateLastActivity();
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sessionMessage = location.state?.message;

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleLogin} noValidate>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <FaHospital className="mf-animate-float" style={{ fontSize: "48px", color: "var(--mf-primary-600)" }} />
        </div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Access the MediFlow resource coordination suite</p>

        {sessionMessage && (
          <div className="auth-message auth-message-info" role="alert">
            {sessionMessage}
          </div>
        )}
        {submitError && (
          <div className="auth-message auth-message-error" role="alert">
            {submitError}
          </div>
        )}

        <div className="field-group">
          <label htmlFor="login-email" className="sr-only">Email</label>
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            onBlur={() => setErrors((e) => ({ ...e, email: validateEmail(form.email) }))}
            className={`auth-input ${errors.email ? "input-error" : ""}`}
            autoComplete="email"
            disabled={loading}
          />
          {errors.email && <span className="input-error-text">{errors.email}</span>}
        </div>

        <div className="field-group">
          <label htmlFor="login-password" className="sr-only">Password</label>
          <PasswordInput
            id="login-password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => handleChange(e)}
            onBlur={() => setErrors((e) => ({ ...e, password: validatePassword(form.password, false) }))}
            error={errors.password}
            disabled={loading}
          />
        </div>

        <div className="auth-actions">
          <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </button>

        <p className="switch-text">
          Don&apos;t have an account?{" "}
          <span onClick={() => navigate("/signup")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/signup")}>
            Sign Up
          </span>
        </p>

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <Link to="/request-help" style={{ color: "#e74c3c", fontWeight: "bold", textDecoration: "none" }}>
            Emergency? Request Help
          </Link>
        </div>
      </form>
    </div>
  );
}
