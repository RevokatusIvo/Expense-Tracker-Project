import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
          <h1 className="navbar-title">Expense Tracker</h1>
          <div className="nav-links">
          <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/add-expenses" className="nav-link">Add Expense</Link>
            <Link to="/view-expenses" className="nav-link">View Expenses</Link>
          </div>
        </nav>
  )
}

export default Navbar