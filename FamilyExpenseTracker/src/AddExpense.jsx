import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "./firebasecin/firebase";
import {auth} from "./firebasecin/firebase";
function AddExpense({ setTransactions }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("expense");

  const navigate = useNavigate();
  const userId = auth.currentUser.uid;
  const addTransaction = async (e) => {
    e.preventDefault();
    if (!title || !amount || !date) return;

    const newTransaction = {
      title,
      amount: parseFloat(amount),
      date,
      type,
      userId
    };

    try {
      // Add the transaction to Firestore
      await addDoc(collection(db, "transactions"), newTransaction);

      // Update local transactions state
      setTransactions((prev) => [...prev, newTransaction]);

      // Clear inputs
      setTitle("");
      setAmount("");
      setDate("");
      setType("expense");

      // Navigate to view expenses
      navigate("/view-expenses");
    } catch (error) {
      console.error("Error adding transaction to Firestore: ", error);
    }
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
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <button type="submit" className="submit-button">
          Add Transaction
        </button>
      </form>
    </div>
  );
}

export default AddExpense;
