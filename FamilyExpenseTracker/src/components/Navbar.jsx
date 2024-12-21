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
      <h1 className="navbar-title">Family Expense Tracker</h1>
      <div className='nav-links-container'>
        
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/profile" className="nav-link">Profile</Link>
              <Link to="/" className="nav-link">Get Started</Link>
              <Link to="/add-expenses" className="nav-link">Add Transaction</Link>
              <Link to="/view-expenses" className="nav-link">View Transaction</Link>
              <Link to="/create-family" className="nav-link">Create Family</Link>
              <Link to="/view-family" className="nav-link">View Family</Link>
              
              <Link onClick={handleLogout} className="nav-link">Logout</Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  )
}

export default Navbar