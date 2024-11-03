import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import "./Dashboard.css"; // Custom CSS for styling

// Registering the chart components with ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard({ transactions }) {
  const [filteredExpenses, setFilteredExpenses] = useState({});
  const [monthlyExpenseData, setMonthlyExpenseData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Monthly Expenses",
        data: Array(12).fill(0), // Default to zero values for all months
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      categorizeExpenses();
      calculateMonthlyExpenses();
    }
  }, [transactions]);

  const categorizeExpenses = () => {
    const categories = {};
    transactions.forEach(transaction => {
      if (transaction.type === "expense") {
        const category = transaction.category || "Uncategorized";
        categories[category] = (categories[category] || 0) + transaction.amount;
      }
    });
    setFilteredExpenses(categories);
  };

  const calculateMonthlyExpenses = () => {
    const monthlyData = Array(12).fill(0);
    transactions.forEach(transaction => {
      if (transaction.type === "expense") {
        const month = new Date(transaction.date).getMonth();
        monthlyData[month] += transaction.amount;
      }
    });
    setMonthlyExpenseData(prevData => ({
      ...prevData,
      datasets: [
        {
          ...prevData.datasets[0],
          data: monthlyData,
        },
      ],
    }));
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      {/* Monthly Expenses Chart */}
      <div className="chart-container">
        <h3>Monthly Expenses</h3>
        <Bar data={monthlyExpenseData} width={600} height={300} />
        </div>

      {/* Expense Categories */}
      <div className="categories-container">
        <h3>Expenses by Category</h3>
        <ul>
          {Object.keys(filteredExpenses).length > 0 ? (
            Object.keys(filteredExpenses).map((category, index) => (
              <li key={index}>
                {category}: ${filteredExpenses[category].toFixed(2)}
              </li>
            ))
          ) : (
            <p>No expense data available.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;

