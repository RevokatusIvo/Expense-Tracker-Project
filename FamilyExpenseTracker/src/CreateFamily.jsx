import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, query, where, getDocs, arrayUnion, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebasecin/firebase";
import "./CreateFamily.css";

function CreateFamily({ setFamilies }) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([]);
  const navigate = useNavigate();

  // Fetch the current user's customId and add them as the first member (Parent)
  useEffect(() => {
    const fetchCustomId = async () => {
      try {
        const userQuery = query(
          collection(db, "users"),
          where("userId", "==", auth.currentUser.uid)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setMembers([{ customId: userData.customId || "", role: "Parent" }]);
        } else {
          console.error("Current user's customId not found in the database.");
        }
      } catch (error) {
        console.error("Error fetching customId:", error);
      }
    };

    fetchCustomId();
  }, []);

  // Add a new member input field
  const addMember = () => {
    setMembers([...members, { customId: "", role: "Child" }]);
  };

  // Update member details
  const updateMember = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  // Remove a member input field
  const removeMember = (index) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
  };

  // Resolve custom IDs to Firebase UIDs
  const resolveCustomIds = async () => {
    const resolvedMembers = await Promise.all(
      members.map(async (member) => {
        if (!member.customId.trim()) {
          throw new Error("Custom ID cannot be empty.");
        }

        const userQuery = query(collection(db, "users"), where("customId", "==", member.customId.trim()));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          throw new Error(`Custom ID "${member.customId}" not found.`);
        }

        const userDoc = userSnapshot.docs[0];
        return { userId: userDoc.id, role: member.role };
      })
    );

    return resolvedMembers;
  };

  // Handle family creation
  const createFamily = async (e) => {
    e.preventDefault();

    if (!groupName.trim() || members.some((m) => !m.customId.trim() || !m.role.trim())) {
      alert("Please fill out all fields for the group and members.");
      return;
    }

    try {
      // Resolve custom IDs to Firebase UIDs
      const resolvedMembers = await resolveCustomIds();

      // Create the family document (parent will be included as the first member)
      const newFamily = {
        groupName: groupName.trim(),
        description: description.trim(),
        members: [{ userId: auth.currentUser.uid, role: "Parent" }], // Only creator added
      };

      const familyRef = await addDoc(collection(db, "families"), newFamily);

      // Send invitations to non-creator members (pending invitations)
      const invitationsCollection = collection(db, "invitations");
      const promises = resolvedMembers
        .filter((m) => m.userId !== auth.currentUser.uid) // Exclude the creator from being invited
        .map((m) =>
          addDoc(invitationsCollection, {
            familyId: familyRef.id,
            invitedUserId: m.userId,
            role: m.role,
            status: "pending", // Invitation is pending until accepted
            timestamp: new Date().toISOString(),
          })
        );

      await Promise.all(promises);

      // Update the local family list
      setFamilies((prev) => [...prev, { id: familyRef.id, ...newFamily }]);

      // Reset the form
      setGroupName("");
      setDescription("");
      setMembers([{ customId: members[0]?.customId || "", role: "Parent" }]);

      // Navigate to the family view page
      navigate("/view-family");
    } catch (error) {
      console.error("Error creating family group:", error);
      alert(error.message);
    }
  };

  return (
    <div className="container">
      <form onSubmit={createFamily} className="family-form">
        <div className="form-group">
          <label>Family Name:</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional: Add a brief description about this group"
          />
        </div>
        <div className="form-group">
          <label>Members:</label>
          {members.map((member, index) => (
            <div key={index} className="member-input">
              <input
                type="text"
                placeholder="Custom ID"
                value={member.customId}
                onChange={(e) => updateMember(index, "customId", e.target.value)}
                disabled={index === 0} // Disable editing for the creator
                required
              />
              <select
                value={member.role}
                onChange={(e) => updateMember(index, "role", e.target.value)}
                required
                disabled={index === 0} // Disable editing for the creator
              >
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
              </select>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="remove-member-button"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addMember} className="add-member-button">
            Add Member
          </button>
        </div>
        <button type="submit" className="submit-button">
          Create Group
        </button>
      </form>
    </div>
  );
}

export default CreateFamily;
