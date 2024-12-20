import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebasecin/firebase";
import AddExpense from "./AddExpense";
import ViewExpenses from "./ViewExpenses";
import Dashboard from "./Dashboard";
import Navbar from "./components/Navbar";
import Login from "./Login";
import CreateFamily from "./CreateFamily";  // Import CreateFamily component
import ViewFamily from "./ViewFamily";  // Import ViewFamily component
import ProfilePage from "./ProfilePage";
import ManageFamily from "./ManageFamily";
function App() {
  const [transactions, setTransactions] = useState([]);
  const [families, setFamilies] = useState([]); // State for families
  const [user, setUser ] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser ) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        {/* Navbar will not render on login page */}
        {location.pathname !== '/login' && <Navbar user={user} />}
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          
          {/* Add Expenses Route */}
          <Route
            path="/add-expenses"
            element={user ? <AddExpense transactions={transactions} setTransactions={setTransactions} /> : <Navigate to="/login" />}
          />
          
          {/* View Expenses Route */}
          <Route
            path="/view-expenses"
            element={user ? <ViewExpenses transactions={transactions} /> : <Navigate to="/login" />}
          />
          
          {/* Dashboard Route */}
          <Route
            path="/"
            element={user ? <Dashboard transactions={transactions} /> : <Navigate to="/login" />}
          />
          
          {/* Create Family Route */}
          <Route
            path="/create-family"  // Route for creating family
            element={user ? <CreateFamily setFamilies={setFamilies} /> : <Navigate to="/login" />}  // Pass setFamilies to CreateFamily
          />
          
          {/* View Families Route */}
          <Route
            path="/view-family"  // Route for viewing families
            element={user ? <ViewFamily families={families} /> : <Navigate to="/login" />}  // Pass families to ViewFamily
          />
          
          <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
          path="/manage-family/:familyId"
          element={user ? <ManageFamily /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
