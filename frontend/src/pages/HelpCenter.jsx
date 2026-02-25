import { useState } from "react";
import { FaQuestionCircle, FaChevronDown, FaBook, FaBell, FaTint, FaPills, FaCogs, FaEnvelope } from "react-icons/fa";
import "../styles/ResourceModule.css";
import "../styles/HelpCenter.css";

const FAQ_ITEMS = [
  {
    q: "How do I check blood availability?",
    a: "Go to Blood Availability from the sidebar. You can filter by status (All, OK, Low, Critical) to see which blood types need attention.",
  },
  {
    q: "What do the status badges mean?",
    a: "OK = stock is healthy. Low = below recommended level, consider reordering. Critical = urgent restock or action needed.",
  },
  {
    q: "How are notifications shown?",
    a: "Click the bell icon in the top bar to open the notification center. Alerts include low stock, equipment maintenance, and emergency notices.",
  },
  {
    q: "Who can access the Admin Panel?",
    a: "Only users with the Admin role can see and open the Admin Panel. There you can manage users, settings, and resource visibility.",
  },
  {
    q: "Is my session secure?",
    a: "Yes. We use role-based access and session timeout (30 minutes of inactivity). Always log out when leaving a shared device.",
  },
];

export default function HelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="resource-page help-center-page">
      <header className="resource-header">
        <h1 className="resource-title">
          <span className="resource-title-icon-wrap">
            <FaQuestionCircle className="resource-title-icon" />
          </span>
          Help Center
        </h1>
        <p className="resource-subtitle">
          Learn how to use MediFlow and find answers to common questions.
        </p>
      </header>

      <section className="help-section">
        <h2 className="help-section-title">
          <FaBook />
          Getting started
        </h2>
        <div className="help-cards">
          <div className="help-card">
            <FaTint className="help-card-icon" />
            <h3>Blood Availability</h3>
            <p>View blood types and units. Filter by OK, Low, or Critical to focus on items needing attention.</p>
          </div>
          <div className="help-card">
            <FaPills className="help-card-icon" />
            <h3>Medicine Availability</h3>
            <p>Search and monitor medicine stock. Use the summary strip to see how many items need attention.</p>
          </div>
          <div className="help-card">
            <FaCogs className="help-card-icon" />
            <h3>Equipment Status</h3>
            <p>Check equipment counts and availability. Critical and low status items are highlighted.</p>
          </div>
          <div className="help-card">
            <FaBell className="help-card-icon" />
            <h3>Critical Alerts</h3>
            <p>See active alerts and priorities. Use the notification bell in the top bar for real-time updates.</p>
          </div>
        </div>
      </section>

      <section className="help-section">
        <h2 className="help-section-title">Frequently asked questions</h2>
        <ul className="help-faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <li key={i} className={`help-faq-item ${openFaq === i ? "open" : ""}`}>
              <button
                type="button"
                className="help-faq-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <span>{item.q}</span>
                <FaChevronDown className="help-faq-chevron" />
              </button>
              <div className="help-faq-answer">
                <p>{item.a}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="help-section help-contact">
        <h2 className="help-section-title">
          <FaEnvelope />
          Contact & support
        </h2>
        <p className="help-contact-text">
          For technical issues or questions not covered here, contact your system administrator or IT support.
        </p>
        <div className="help-contact-meta">
          <span>MediFlow – Smart Emergency Healthcare Resource System</span>
        </div>
      </section>
    </div>
  );
}
