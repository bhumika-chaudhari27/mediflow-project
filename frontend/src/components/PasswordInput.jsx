import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../styles/PasswordInput.css";

export default function PasswordInput({
  value,
  onChange,
  onBlur,
  placeholder = "Password",
  name = "password",
  id,
  error,
  disabled,
  "aria-label": ariaLabel,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input
        type={show ? "text" : "password"}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`auth-input ${error ? "input-error" : ""}`}
        aria-label={ariaLabel || placeholder}
        aria-invalid={!!error}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
        title={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <FiEyeOff aria-hidden />
        ) : (
          <FiEye aria-hidden />
        )}
      </button>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
