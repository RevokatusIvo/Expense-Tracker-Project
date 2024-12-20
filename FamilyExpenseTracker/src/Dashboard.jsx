import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { db, auth } from "./firebasecin/firebase"; // Adjust the path to your Firebase config
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Dashboard.css"; // Custom CSS for styling

// Registering the chart components with ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [monthlyExpenseData, setMonthlyExpenseData] = useState({
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
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
    const fetchTransactions = async () => {
      try {
        const userId = auth.currentUser?.uid; // Get the current user's ID
        if (!userId) {
          console.warn("User is not logged in");
          return;
        }

        // Fetch transactions for the logged-in user
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const fetchedTransactions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching transactions: ", error);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      calculateMonthlyExpenses();
    }
  }, [transactions]);

  const calculateMonthlyExpenses = () => {
    // Create an array for the entire year, indexed by month (0 = Jan, 11 = Dec)
    const monthlyData = Array(12).fill(0);

    transactions.forEach((transaction) => {
      if (transaction.type === "expense" && transaction.date) {
        const month = new Date(transaction.date).getMonth(); // Get month index
        monthlyData[month] += transaction.amount; // Accumulate expense for the month
      }
    });

    setMonthlyExpenseData((prevData) => ({
      ...prevData,
      datasets: [
        {
          ...prevData.datasets[0],
          data: monthlyData, // Update dataset with new monthly data
        },
      ],
    }));
  };

  // Chart options to force all labels to display
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: "Monthly Expenses Overview",
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false, // Force all labels to show
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dashboard-container">
      {/* Monthly Expenses Chart */}
      <div className="chart-container">
        <h3>Monthly Expenses</h3>
        {transactions.length > 0 ? (
          <Bar data={monthlyExpenseData} options={options} width={600} height={300} />
        ) : (
          <p>No transactions available.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
