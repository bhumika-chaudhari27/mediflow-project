import { FaHeartbeat, FaFirstAid, FaAppleAlt } from "react-icons/fa";
import "../styles/ResourceModule.css";

const TIPS = [
    {
        id: 1,
        title: "CPR Basics",
        category: "First Aid",
        icon: FaHeartbeat,
        content: "Push hard and fast in the center of the chest. 100-120 compressions per minute."
    },
    {
        id: 2,
        title: "Treating Burns",
        category: "First Aid",
        icon: FaFirstAid,
        content: "Cool the burn with running cool tap water for 20 minutes. Do not use ice."
    },
    {
        id: 3,
        title: "Stay Hydrated",
        category: "Daily Health",
        icon: FaAppleAlt,
        content: "Drink at least 8 glasses of water a day to maintain energy and kidney function."
    },
    {
        id: 4,
        title: "Heart Attack Signs",
        category: "Emergency",
        icon: FaHeartbeat,
        content: "Chest pain, shortness of breath, and arm pain are common signs. Call for help immediately."
    }
];

export default function HealthTips() {
    return (
        <div className="resource-page">
            <header className="page-header">
                <h1>Health Tips & First Aid</h1>
                <p>Essential knowledge for a healthier, safer life.</p>
            </header>

            <div className="alerts-grid">
                {TIPS.map((tip) => (
                    <div key={tip.id} className="alert-item" style={{ borderLeftColor: "#28a745" }}>
                        <div className="alert-icon-wrapper" style={{ backgroundColor: "#e6f9e9", color: "#28a745" }}>
                            <tip.icon />
                        </div>
                        <div className="alert-content">
                            <h3>{tip.title} <span className="badge" style={{ fontSize: "0.7rem", verticalAlign: "middle" }}>{tip.category}</span></h3>
                            <p>{tip.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
