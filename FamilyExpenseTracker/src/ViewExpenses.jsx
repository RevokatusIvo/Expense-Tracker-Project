import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore"; // Firestore methods
import { db } from "./firebasecin/firebase"; // Your Firestore instance

function ViewExpenses() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("daily"); // Default filter

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

  // Calculate total expense for the given period
  const getTotalByPeriod = (period) => {
    const now = new Date();
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);

      if (period === "yearly") {
        return transactionDate.getFullYear() === now.getFullYear();
      } else if (period === "monthly") {
        return transactionDate.getFullYear() === now.getFullYear() && transactionDate.getMonth() === now.getMonth();
      } else if (period === "weekly") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return transactionDate >= startOfWeek && transactionDate <= now;
      } else if (period === "daily") {
        return transactionDate.toDateString() === now.toDateString();
      } else if (period === "all") {
        return true; // Return all transactions for "All" filter
      }

      return false;
    });

    return filteredTransactions.reduce((total, transaction) => {
      return transaction.type === "expense" ? total + transaction.amount : total;
    }, 0);
  };

  const totalExpense = getTotalByPeriod(filter);

  return (
    <div className="container">
      <h2>View Expenses</h2>
      <div className="filter-options">
        <button onClick={() => setFilter("yearly")}>Yearly</button>
        <button onClick={() => setFilter("monthly")}>Monthly</button>
        <button onClick={() => setFilter("weekly")}>Weekly</button>
        <button onClick={() => setFilter("daily")}>Daily</button>
        <button onClick={() => setFilter("all")}>All</button> {/* Added "All" filter */}
      </div>

      <h3>Total {filter.charAt(0).toUpperCase() + filter.slice(1)} Expense: ${totalExpense.toFixed(2)}</h3>
      
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="expense-list">
          {transactions
            .filter(transaction => {
              const transactionDate = new Date(transaction.date);

              if (filter === "yearly") {
                return transactionDate.getFullYear() === new Date().getFullYear();
              } else if (filter === "monthly") {
                return transactionDate.getFullYear() === new Date().getFullYear() && transactionDate.getMonth() === new Date().getMonth();
              } else if (filter === "weekly") {
                const startOfWeek = new Date();
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                return transactionDate >= startOfWeek && transactionDate <= new Date();
              } else if (filter === "daily") {
                return transactionDate.toDateString() === new Date().toDateString();
              } else if (filter === "all") {
                return true; // Show all transactions when "All" is selected
              }
              return false;
            })
            .map((transaction, index) => (
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
