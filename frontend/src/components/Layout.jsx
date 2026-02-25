import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "../styles/theme.css";
import "../styles/Layout.css";

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="layout-main">
        <TopBar />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
