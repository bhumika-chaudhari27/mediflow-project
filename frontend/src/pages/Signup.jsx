import { useState } from "react";
import { FaHospital } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";
import { validateEmail, validatePassword, validateName, sanitizeInput } from "../utils/validation";
import PasswordInput from "../components/PasswordInput";
import "../styles/Login.css";
import "../styles/Signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const { login, updateLastActivity } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "User" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "role" ? value : sanitizeInput(value) }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const nameErr = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password, true);
    const next = { name: nameErr, email: emailErr, password: passErr };
    setErrors(next);
    return !nameErr && !emailErr && !passErr;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const { user, token } = await authApi.signup(form.name, form.email, form.password, form.role);
      login(user, token);
      updateLastActivity();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setSubmitError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card signup-card" onSubmit={handleSignup} noValidate>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <FaHospital className="mf-animate-float" style={{ fontSize: "48px", color: "var(--mf-primary-600)" }} />
        </div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the regional healthcare coordination network</p>

        {submitError && (
          <div className="auth-message auth-message-error" role="alert">
            {submitError}
          </div>
        )}

        <div className="field-group">
          <label htmlFor="signup-name" className="sr-only">Full Name</label>
          <input
            id="signup-name"
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            onBlur={() => setErrors((e) => ({ ...e, name: validateName(form.name) }))}
            className={`auth-input ${errors.name ? "input-error" : ""}`}
            autoComplete="name"
            disabled={loading}
          />
          {errors.name && <span className="input-error-text">{errors.name}</span>}
        </div>

        <div className="field-group">
          <label htmlFor="signup-email" className="sr-only">Email</label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-role" className="sr-only">Role</label>
          <select
            id="signup-role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="auth-input auth-select"
            disabled={loading}
          >
            <option value="User">User</option>
            <option value="Provider">Emergency Coordinator</option>
          </select>
        </div>

        <div className="field-group">
          <label className="label-visible">Password</label>
          <PasswordInput
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => handleChange(e)}
            onBlur={() => setErrors((e) => ({ ...e, password: validatePassword(form.password, true) }))}
            error={errors.password}
            disabled={loading}
          />
          <p className="password-rules">
            Min 8 chars, uppercase, lowercase, number, special character
          </p>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Creating account…" : "Sign Up"}
        </button>

        <p className="switch-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/login")}>
            Login
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
