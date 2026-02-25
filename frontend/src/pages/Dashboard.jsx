import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <h1>Hospital Resource Dashboard 🏥</h1>

        <div className="cards">
          <div className="card">Blood Units Available<br/><b>120 Units</b></div>
          <div className="card">Medicines Available<br/><b>350 Items</b></div>
          <div className="card">Critical Alerts<br/><b>5 Cases</b></div>
          <div className="card">Equipment Available<br/><b>45 Devices</b></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
