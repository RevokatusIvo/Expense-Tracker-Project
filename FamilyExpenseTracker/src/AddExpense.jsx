import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebasecin/firebase";

function AddExpense({ setTransactions }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("expense");
  const [families, setFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState("");
  const [category, setCategory] = useState(""); // State for category
  const [userRole, setUserRole] = useState(""); // Store user role in selected family
  const navigate = useNavigate();
  const userId = auth.currentUser.uid;

  // Hardcoded list of categories
  const categories = ["Food", "Transportation", "Utilities", "Entertainment", "Health", "Education", "Other"];

  // Fetch families where the user has a valid role
  useEffect(() => {
    const fetchFamilies = async () => {
      const familiesQuery = query(collection(db, "families"));
      const familiesSnapshot = await getDocs(familiesQuery);
      const userFamilies = familiesSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((family) =>
          family.members.some(
            (member) => member.userId === userId && member.role
          )
        );
      setFamilies(userFamilies);
    };

    fetchFamilies();
  }, [userId]);

  // Fetch the role of the user in the selected family
  useEffect(() => {
    const fetchUserRoleInFamily = async () => {
      if (selectedFamily) {
        try {
          // Get the family document using getDoc instead of getDocs
          const familyDoc = await getDoc(doc(db, "families", selectedFamily));
          
          if (familyDoc.exists()) {
            const familyData = familyDoc.data();

            const member = familyData.members.find((member) => member.userId === userId);
            
            if (member) {
              setUserRole(member.role);
            } else {
              setUserRole(""); // If the user is not part of the family, reset the role
            }
          } else {
            console.log("Family document not found.");
          }
        } catch (error) {
          console.error("Error fetching user role in family:", error);
        }
      }
    };

    fetchUserRoleInFamily();
  }, [selectedFamily, userId]);

  const addTransaction = async (e) => {
    e.preventDefault();

    // Check if the user is a "Parent"
    if (userRole !== "Parent") {
      alert("Only Parents can add transactions.");
      return;
    }

    if (!title || !amount || !date || !selectedFamily || !category) {
      alert("Please fill out all fields.");
      return;
    }

    const newTransaction = {
      title,
      amount: parseFloat(amount),
      date,
      type,
      userId,
      groupId: selectedFamily, // Link to the selected family group
      category, // Add category to the transaction
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
      setSelectedFamily("");
      setCategory("");

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
        <div className="form-group">
          <label>Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Group:</label>
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Group
            </option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.groupName}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="submit-button" disabled={userRole !== "Parent"}>
          Add Transaction
        </button>
        {userRole === "Child" && <p>You cannot add transactions as a Child.</p>}
      </form>
    </div>
  );
}

export default AddExpense;
