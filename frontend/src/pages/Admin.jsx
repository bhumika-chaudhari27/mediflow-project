import { Outlet } from "react-router-dom";
import "../styles/ResourceModule.css";
import "../styles/AdminPanel.css";

export default function Admin() {
  return (
    <div className="resource-page admin-page">
      <Outlet />
    </div>
  );
}
