import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebasecin/firebase'

function Navbar({ user }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="navbar">
      <h1 className="navbar-title">Expense Tracker</h1>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/add-expenses" className="nav-link">Add Expense</Link>
            <Link to="/view-expenses" className="nav-link">View Expenses</Link>
            <button onClick={handleLogout} className="nav-link">Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-link" >Login</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar