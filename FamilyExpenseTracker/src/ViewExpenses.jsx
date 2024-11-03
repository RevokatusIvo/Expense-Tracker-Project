import React, { useState } from "react";

function ViewExpenses({ transactions }) {
  const [filter, setFilter] = useState("monthly"); // Default filter

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
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of the week
        return transactionDate >= startOfWeek && transactionDate <= now;
      } else if (period === "daily") {
        return transactionDate.toDateString() === now.toDateString();
      }
      return false;
    });

    return filteredTransactions.reduce((total, transaction) => {
      return transaction.type === "expense" ? total + transaction.amount : total; // Only include expenses
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
      </div>

      <h3>Total {filter.charAt(0).toUpperCase() + filter.slice(1)} Expense: ${totalExpense.toFixed(2)}</h3>
      
      {transactions.length > 0 ? (
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
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Adjust based on the first day of the week
                return transactionDate >= startOfWeek && transactionDate <= new Date();
              } else if (filter === "daily") {
                return transactionDate.toDateString() === new Date().toDateString();
              }
              return false;
            })
            .map((transaction, index) => (
              <div className="expense-card" key={index}>
                <h4>{transaction.title}</h4>
                <p>Amount: ${transaction.amount.toFixed(2)}</p>
                <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
                <p>Type: {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</p>
              </div>
            ))}
        </div>
      ) : (
        <p className="no-expenses">No transactions added yet.</p>
      )}
    </div>
  );
}

export default ViewExpenses;
