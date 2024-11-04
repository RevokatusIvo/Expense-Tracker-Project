import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AddExpense from "./AddExpense";
import ViewExpenses from "./ViewExpenses";
import Dashboard from "./Dashboard";
import Navbar from "./components/Navbar";

function App() {
  const [transactions, setTransactions] = useState([]); // Store transactions

  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/add-expenses" element={<AddExpense transactions={transactions} setTransactions={setTransactions} />} />
          <Route path="/view-expenses" element={<ViewExpenses transactions={transactions} />} />
          <Route path="/" element={<Dashboard transactions={transactions} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
