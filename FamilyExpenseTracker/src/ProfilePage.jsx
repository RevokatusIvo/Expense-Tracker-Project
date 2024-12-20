import React, { useState, useEffect } from "react";
import { auth, db } from "./firebasecin/firebase";
import { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where } from "firebase/firestore";
import { updateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import "./ProfilePage.css";

function ProfilePage() {
  const [userId, setUserId] = useState("");
  const [customId, setCustomId] = useState("");
  const [initialCustomId, setInitialCustomId] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserId(userData.userId);
          setCustomId(userData.customId || userData.userId);
          setInitialCustomId(userData.customId || userData.userId);
        } else {
          // Initialize user document if it doesn't exist
          const newUser = {
            userId: auth.currentUser.uid,
            customId: auth.currentUser.uid,
          };
          await setDoc(userDocRef, newUser);
          setUserId(newUser.userId);
          setCustomId(newUser.customId);
          setInitialCustomId(newUser.customId);
        }
        setEmail(auth.currentUser.email);
        setNewEmail(auth.currentUser.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!/^[a-zA-Z0-9]{4,}$/.test(customId)) {
      alert("Custom ID must be at least 4 characters long and contain only letters and numbers.");
      return;
    }

    if (newEmail !== email) {
      try {
        // Check if the new email already exists
        const usersCollection = collection(db, "users");
        const emailQuery = query(usersCollection, where("email", "==", newEmail));
        const emailSnapshot = await getDocs(emailQuery);

        if (!emailSnapshot.empty) {
          alert("Email already exists. Please use a different email.");
          return;
        }

        await updateEmail(auth.currentUser, newEmail);
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, { email: newEmail });
        setEmail(newEmail); // Update displayed email
      } catch (error) {
        console.error("Error updating email:", error);
        alert("Failed to update email: " + error.message);
        return;
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        alert("Please enter your current password to change your password.");
        return;
      }

      if (newPassword !== confirmNewPassword) {
        alert("New passwords do not match. Please try again.");
        return;
      }

      try {
        // Reauthenticate user before updating the password
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
        alert("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } catch (error) {
        console.error("Error updating password:", error);
        alert("Failed to update password: " + error.message);
        return;
      }
    }

    if (customId !== initialCustomId) {
      try {
        const usersCollection = collection(db, "users");
        const customIdQuery = query(usersCollection, where("customId", "==", customId));
        const customIdSnapshot = await getDocs(customIdQuery);

        if (!customIdSnapshot.empty) {
          alert("Custom ID already exists. Please choose a different ID.");
          return;
        }

        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, { customId });
        setInitialCustomId(customId); // Update initial ID to match saved one
      } catch (error) {
        console.error("Error updating Custom ID:", error);
        alert("Failed to update Custom ID.");
        return;
      }
    }

    alert("Profile updated successfully!");
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {loading ? (
        <p>Loading your profile...</p>
      ) : (
        <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
          {/* <div className="form-group">
            <label>Firebase ID (Cannot be changed):</label>
            <input
              type="text"
              value={userId}
              disabled
              placeholder="Firebase ID (Cannot be changed)"
            />
          </div> */}
          <div className="form-group">
            <label>Custom ID:</label>
            <input
              type="text"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="Enter new Custom ID"
            />
          </div>
          <div className="form-group">
            <label>Current Email:</label>
            <input type="text" value={email} disabled />
          </div>
          <div className="form-group">
            <label>New Email:</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email"
            />
          </div>
          <div className="form-group">
            <label>Current Password:</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
          </div>
          <button
            type="button"
            onClick={handleUpdateProfile}
            className="save-button"
          >
            Update Profile
          </button>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;
