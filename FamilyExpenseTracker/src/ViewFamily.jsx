import React, { useState, useEffect } from "react";
import { auth, db } from "./firebasecin/firebase";
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./ViewFamily.css";

const ViewFamily = () => {
  const [families, setFamilies] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvitations, setShowInvitations] = useState(true);
  const navigate = useNavigate(); // Initialize navigate

  // Fetch families and invitations together
  useEffect(() => {
    const fetchFamiliesAndInvitations = async () => {
      try {
        // Fetch families
        const familiesCollection = collection(db, "families");
        const familiesSnapshot = await getDocs(familiesCollection);
        const familiesList = familiesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((family) =>
            family.members.some((member) => member.userId === auth.currentUser.uid)
          );

        // Fetch invitations
        const invitationsQuery = query(
          collection(db, "invitations"),
          where("invitedUserId", "==", auth.currentUser.uid),
          where("status", "==", "pending")
        );
        const invitationsSnapshot = await getDocs(invitationsQuery);
        const invitationsList = invitationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Map invitations with family names
        const invitationsWithFamilyNames = await Promise.all(
          invitationsList.map(async (invitation) => {
            const familyName = await getFamilyNameById(invitation.familyId);
            return { ...invitation, familyName };
          })
        );

        // Map families with customId for each member
        const familiesWithCustomIds = await Promise.all(
          familiesList.map(async (family) => {
            const membersWithCustomIds = await Promise.all(
              family.members.map(async (member) => {
                const customId = await getCustomIdByUserId(member.userId);
                return { ...member, customId };
              })
            );
            return { ...family, members: membersWithCustomIds };
          })
        );

        // Set state for families and invitations
        setFamilies(familiesWithCustomIds);
        setInvitations(invitationsWithFamilyNames);
      } catch (error) {
        console.error("Error fetching families or invitations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFamiliesAndInvitations();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // Get family name by ID
  const getFamilyNameById = async (familyId) => {
    try {
      const familyRef = doc(db, "families", familyId);
      const familySnapshot = await getDoc(familyRef);
      if (familySnapshot.exists()) {
        return familySnapshot.data().groupName;
      }
      return "Unknown Family";
    } catch (error) {
      console.error("Error fetching family name:", error);
      return "Unknown Family";
    }
  };

  // Get custom ID by userId
  const getCustomIdByUserId = async (userId) => {
    const userQuery = query(collection(db, "users"), where("userId", "==", userId));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
      return userSnapshot.docs[0].data().customId;
    }
    return userId; // Fallback to userId if customId is not found
  };

  // Handle invitation action (accept or decline)
  const handleInvitationAction = async (invitationId, action) => {
    try {
      const invitationRef = doc(db, "invitations", invitationId);

      if (action === "accepted") {
        const invitation = invitations.find((inv) => inv.id === invitationId);
        if (invitation) {
          const familyRef = doc(db, "families", invitation.familyId);
          await updateDoc(familyRef, {
            members: arrayUnion({
              userId: auth.currentUser.uid,
              role: invitation.role,
            }),
          });
        }
      }

      await updateDoc(invitationRef, { status: action });

      setInvitations((prev) =>
        prev.filter((invitation) => invitation.id !== invitationId)
      );
    } catch (error) {
      console.error(`Error ${action} invitation:`, error);
    }
  };

  return (
    <div className="view-families-container">
      <div className="invitations-section">
        <h2>
          Pending Invitations{" "}
          <button
            className="toggle-button"
            onClick={() => setShowInvitations(!showInvitations)}
          >
            {showInvitations ? "▼" : "▶"}
          </button>
        </h2>
        {showInvitations && (
          <div className="invitation-cards">
            {loading ? (
              <p>Loading invitations...</p>
            ) : invitations.length === 0 ? (
              <p className="no-invitations-message">No pending invitations</p>
            ) : (
              invitations.map((invitation) => (
                <div className="invitation-card" key={invitation.id}>
                  <p>
                    <strong>Family:</strong> {invitation.familyName}
                  </p>
                  <p>
                    <strong>Role:</strong> {invitation.role}
                  </p>
                  <div className="invitation-actions">
                    <button
                      className="accept-button"
                      onClick={() =>
                        handleInvitationAction(invitation.id, "accepted")
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="decline-button"
                      onClick={() =>
                        handleInvitationAction(invitation.id, "declined")
                      }
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <h2>Your Families</h2>
      {loading ? (
        <p>Loading families...</p>
      ) : families.length === 0 ? (
        <p className="no-families-message">You don't have any families yet. Please create one.</p>
      ) : (
        <div className="families-list">
          {families.map((family) => {
            const currentUserRole = family.members.find(
              (member) => member.userId === auth.currentUser.uid
            )?.role;

            return (
              <div className="family-card" key={family.id}>
                <h3>{family.groupName}</h3>
                <p>
                  <strong>Description:</strong>{" "}
                  {family.description || "No description available."}
                </p>
                <p>
                  <strong>Members:</strong>{" "}
                  {family.members.length > 0
                    ? family.members.map((member) => member.customId).join(", ")
                    : "No members yet."}
                </p>
                {currentUserRole === "Parent" && (
                  <button
                    className="manage-family-button"
                    onClick={() => navigate(`/manage-family/${family.id}`)} // Navigate to manage family
                  >
                    Manage Family
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewFamily;
