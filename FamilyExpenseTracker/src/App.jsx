import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom"; // Import necessary components
import AddExpense from "./AddExpense"; // Import AddExpense component
import ViewExpenses from "./ViewExpenses"; // Import ViewExpenses component

function App() {
  const [transactions, setTransactions] = useState([]);

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h1 className="navbar-title">Expense Tracker</h1>
          <div className="nav-links">
            <Link to="/" className="nav-link">Add Expense</Link>
            <Link to="/view-expenses" className="nav-link">View Expenses</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<AddExpense setTransactions={setTransactions} />} />
          <Route path="/view-expenses" element={<ViewExpenses transactions={transactions} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
