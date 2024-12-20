import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore"; // Firestore methods
import { db } from "./firebasecin/firebase"; // Your Firestore instance
import DatePicker from "react-datepicker"; // Import the date picker
import "react-datepicker/dist/react-datepicker.css"; // Import the styles for the date picker
import './index.css';

function ViewExpenses() {
  const [transactions, setTransactions] = useState([]);
  const [families, setFamilies] = useState([]); // State to store families
  const [selectedFamily, setSelectedFamily] = useState(""); // State for selected family
  const [startDate, setStartDate] = useState(null); // For start date
  const [endDate, setEndDate] = useState(null); // For end date

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch families
        const familiesCollection = collection(db, "families");
        const familiesSnapshot = await getDocs(familiesCollection);
        const familiesList = familiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFamilies(familiesList);

        // If a family is selected, fetch transactions for that family
        if (selectedFamily) {
          const selectedFamilyDoc = familiesList.find(family => family.groupName === selectedFamily);
          if (selectedFamilyDoc) {
            const familyId = selectedFamilyDoc.id;
            
            // Fetch transactions for the selected family
            const transactionsCollection = collection(db, "transactions");
            const transactionsQuery = query(
              transactionsCollection,
              where("groupId", "==", familyId) // Fetch transactions related to this family
            );
            const transactionsSnapshot = await getDocs(transactionsQuery);
            const transactionsList = transactionsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setTransactions(transactionsList);
          }
        }
      } catch (error) {
        console.error("Error fetching families or transactions:", error);
      }
    };

    fetchData();
  }, [selectedFamily]); // Run whenever selectedFamily changes

  const getTotalByDateRange = () => {
    const normalizedStartDate = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
    const normalizedEndDate = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);

      if (normalizedStartDate && normalizedEndDate) {
        return transactionDate >= normalizedStartDate && transactionDate <= normalizedEndDate;
      }
      return true; // If no date range is selected, show all transactions
    });

    const totalExpense = filteredTransactions.reduce((total, transaction) => {
      return transaction.type === "expense" ? total + transaction.amount : total;
    }, 0);

    const totalBalance = filteredTransactions.reduce((balance, transaction) => {
      return transaction.type === "income"
        ? balance + transaction.amount
        : balance - transaction.amount;
    }, 0);

    return { totalExpense, totalBalance, filteredTransactions };
  };

  const { totalExpense, totalBalance, filteredTransactions } = getTotalByDateRange();

  return (
    <div className="container">
      <h2>View Transactions</h2>

      {/* Dropdown for selecting family/group */}
      <div className="family-selector">
        <label>Select Family:</label>
        <select
          value={selectedFamily}
          onChange={(e) => setSelectedFamily(e.target.value)}
        >
          <option value="">Select Family</option>
          {families.map((family) => (
            <option key={family.id} value={family.groupName}>
              {family.groupName}
            </option>
          ))}
        </select>
      </div>

      {/* Date picker for date range */}
      <div className="date-picker">
        <label>Start Date:</label>
        <DatePicker selected={startDate} onChange={date => setStartDate(date)} dateFormat="yyyy/MM/dd" />
        <label>End Date:</label>
        <DatePicker selected={endDate} onChange={date => setEndDate(date)} dateFormat="yyyy/MM/dd" />
      </div>

      <h3>Total Expense: Rp {totalExpense.toLocaleString("en-US")}</h3>
      <h3>Total Balance: Rp {totalBalance.toLocaleString("en-US")}</h3>

      {/* Only show expense list if there are filtered transactions */}
      {filteredTransactions.length === 0 ? (
        <p>{selectedFamily ? (startDate || endDate ? "No transactions found for this date range." : "No transactions in this family.") : "Please select a family."}</p>
      ) : (
        <div className="scrollable-list">
          <div className="expense-list">
            {filteredTransactions.map((transaction, index) => (
              <div className="expense-card" key={transaction.id || index}>
                <h4>{transaction.title}</h4>
                <p>Amount: Rp {transaction.amount.toLocaleString("en-US")}</p>
                <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
                <p>Category: {transaction.category || "Uncategorized"}</p>
                <p>Type: {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewExpenses;
