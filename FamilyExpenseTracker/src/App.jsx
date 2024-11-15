import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebasecin/firebase";
import AddExpense from "./AddExpense";
import ViewExpenses from "./ViewExpenses";
import Dashboard from "./Dashboard";
import Navbar from "./components/Navbar";
import Login from "./Login";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
      {location.pathname !== '/login' && <Navbar user={user} />}
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route
            path="/add-expenses"
            element={user ? <AddExpense transactions={transactions} setTransactions={setTransactions} /> : <Navigate to="/login" />}
          />
          <Route
            path="/view-expenses"
            element={user ? <ViewExpenses transactions={transactions} /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={user ? <Dashboard transactions={transactions} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;