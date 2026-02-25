import { useState, useEffect } from "react";
import { checkBackendHealth } from "../services/api";

export default function BackendStatus() {
  const [status, setStatus] = useState("checking"); // "checking" | "connected" | "disconnected");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const { ok } = await checkBackendHealth();
        if (!cancelled) setStatus(ok ? "connected" : "disconnected");
      } catch (e) {
        if (!cancelled) setStatus("disconnected");
      }
    };

    check(); // Initial check
    const interval = setInterval(check, 5000); // Poll every 5 seconds

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (status === "checking") {
    return (
      <span className="backend-status backend-status-checking" title="Checking backend…">
        <span className="backend-status-dot" /> Backend…
      </span>
    );
  }
  if (status === "connected") {
    return (
      <span className="backend-status backend-status-connected" title="Backend is reachable">
        <span className="backend-status-dot" /> Backend connected
      </span>
    );
  }
  return (
    <span className="backend-status backend-status-disconnected" title="Cannot reach backend (is it running on port 5000?)">
      <span className="backend-status-dot" /> Backend disconnected
    </span>
  );
}
