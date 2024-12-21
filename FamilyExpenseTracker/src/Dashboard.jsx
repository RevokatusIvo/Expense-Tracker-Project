import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Reuse the existing CSS file or customize it for the Get Started page

function GetStarted() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="get-started-content">
        <h1>Welcome to the Family App</h1>
        <p>Manage your family groups and transactions effortlessly.</p>
        <button
          className="get-started-button"
          onClick={() => navigate("/create-family")}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default GetStarted;
