import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore"; // Firestore methods
import { db } from "./firebasecin/firebase"; // Your Firestore instance
import DatePicker from "react-datepicker"; // Import the date picker
import "react-datepicker/dist/react-datepicker.css"; // Import the styles for the date picker
import './index.css'
function ViewExpenses() {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState(null); // For start date
  const [endDate, setEndDate] = useState(null); // For end date

  // Fetch transactions from Firestore when the component mounts
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsCollection = collection(db, "transactions");
        const transactionsSnapshot = await getDocs(transactionsCollection);
        const transactionsList = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched Transactions:", transactionsList); // Verify data
        setTransactions(transactionsList); // Set the state with fetched data
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []); // Empty array means this runs once when the component mounts

  const getTotalByDateRange = () => {
    // Normalize start and end dates to midnight to ignore the time part
    const normalizedStartDate = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
    const normalizedEndDate = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;
  
    // Filter transactions based on date range
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date); // Firestore date
      if (normalizedStartDate && normalizedEndDate) {
        return transactionDate >= normalizedStartDate && transactionDate <= normalizedEndDate;
      }
      return false; // If no dates are selected, don't show any transactions
    });
  
    // Calculate total expenses and total balance
    const totalExpense = filteredTransactions.reduce((total, transaction) => {
      return transaction.type === "expense" ? total + transaction.amount : total;
    }, 0);
  
    const totalBalance = filteredTransactions.reduce((balance, transaction) => {
      return transaction.type === "income"
        ? balance + transaction.amount
        : balance - transaction.amount; // Expenses subtract from balance
    }, 0);
  
    return { totalExpense, totalBalance, filteredTransactions };
  };
  
  const { totalExpense, totalBalance, filteredTransactions } = getTotalByDateRange();
  
  

  return (
    <div className="container">
      <h2>View Expenses</h2>
      <div className="date-picker">
        <label>Start Date:</label>
        <DatePicker selected={startDate} onChange={date => setStartDate(date)} dateFormat="yyyy/MM/dd" />
        <label>End Date:</label>
        <DatePicker selected={endDate} onChange={date => setEndDate(date)} dateFormat="yyyy/MM/dd" />
      </div>

      <h3>Total Expense: ${totalExpense.toFixed(2)}</h3>
      <h3>Total Balance: ${totalBalance.toFixed(2)}</h3>

      {/* Only show expense list if there are filtered transactions */}
      {filteredTransactions.length === 0 ? (
        <p>{startDate || endDate ? "No transactions found for this date range." : "Please select a date range."}</p>
      ) : (
        <div className="expense-list">
          {filteredTransactions.map((transaction, index) => (
            <div className="expense-card" key={transaction.id || index}>
              <h4>{transaction.title}</h4>
              <p>Amount: ${transaction.amount.toFixed(2)}</p>
              <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
              <p>Type: {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ViewExpenses;