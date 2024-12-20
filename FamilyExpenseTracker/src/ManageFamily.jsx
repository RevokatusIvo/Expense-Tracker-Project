import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebasecin/firebase";
import "./ManageFamily.css";

const ManageFamily = () => {
  const { familyId } = useParams();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([]);
  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Child");

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const familyRef = doc(db, "families", familyId);
        const familySnap = await getDoc(familyRef);
        if (familySnap.exists()) {
          const familyData = familySnap.data();
          setFamily(familyData);
          setGroupName(familyData.groupName || "");
          setDescription(familyData.description || "");
          setMembers(familyData.members || []);
        }
      } catch (error) {
        console.error("Error fetching family data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFamily();
  }, [familyId]);

  const handleUpdate = async () => {
    try {
      const familyRef = doc(db, "families", familyId);
      await updateDoc(familyRef, {
        groupName,
        description,
      });
      alert("Family updated successfully!");
    } catch (error) {
      console.error("Error updating family:", error);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberId.trim()) {
      alert("Member ID cannot be blank!");
      return;
    }

    try {
      const newMember = { userId: newMemberId, role: newMemberRole };
      const updatedMembers = [...members, newMember];
      const familyRef = doc(db, "families", familyId);
      await updateDoc(familyRef, { members: updatedMembers });
      setMembers(updatedMembers);
      setNewMemberId("");
      alert("Member added successfully!");
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleDeleteMember = async (userId) => {
    try {
      const updatedMembers = members.filter((member) => member.userId !== userId);
      const familyRef = doc(db, "families", familyId);
      await updateDoc(familyRef, { members: updatedMembers });
      setMembers(updatedMembers);
      alert("Member deleted successfully!");
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const updatedMembers = members.map((member) =>
        member.userId === userId ? { ...member, role: newRole } : member
      );
      const familyRef = doc(db, "families", familyId);
      await updateDoc(familyRef, { members: updatedMembers });
      setMembers(updatedMembers);
      alert("Role updated successfully!");
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!family) {
    return <div className="not-found">Family not found</div>;
  }

  return (
    <div className="manage-family-container">
      <h1 className="manage-family-title">Manage Family</h1>
      <div className="form-section">
        <label className="form-label">
          Group Name:
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="form-input"
          />
        </label>
        <label className="form-label">
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea"
          />
        </label>
      </div>
      <div className="members-section">
        <h2 >Members</h2>
        <ul className="members-list">
          {members.map((member, index) => (
            <li key={index} className="member-item">
              <span className="member-id">{member.userId}</span>
              <select
                value={member.role}
                onChange={(e) => handleChangeRole(member.userId, e.target.value)}
                className="role-selector"
              >
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
              </select>
              <button
                className="delete-button"
                onClick={() => handleDeleteMember(member.userId)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <div className="add-member-section">
          <h3>Add New Member</h3>
          <input
            type="text"
            placeholder="Member ID"
            value={newMemberId}
            onChange={(e) => setNewMemberId(e.target.value)}
            className="form-input"
          />
          <select
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value)}
            className="role-selector"
          >
            <option value="Parent">Parent</option>
            <option value="Child">Child</option>
          </select>
          <button className="add-button" onClick={handleAddMember}>
            Add Member
          </button>
        </div>
      </div>
      <button className="update-button" onClick={handleUpdate}>
        Update Family
      </button>
    </div>
  );
};

export default ManageFamily;
