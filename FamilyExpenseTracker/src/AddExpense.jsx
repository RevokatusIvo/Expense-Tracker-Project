import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

function AddExpense({ setTransactions }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("expense");

  const navigate = useNavigate(); // Create navigate function

  const addTransaction = (e) => {
    e.preventDefault();
    if (!title || !amount || !date) return;

    const newTransaction = { title, amount: parseFloat(amount), date, type };
    setTransactions((prev) => [...prev, newTransaction]);

    setTitle("");
    setAmount("");
    setDate("");
    setType("expense");

    navigate("/view-expenses"); // Navigate to the view page after adding
  };

  return (
    <div className="container">
      <form onSubmit={addTransaction} className="expense-form">
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Transaction Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <button type="submit" className="submit-button">Add Transaction</button>
      </form>
    </div>
  );
}

export default AddExpense;
