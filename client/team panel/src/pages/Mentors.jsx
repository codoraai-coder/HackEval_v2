import React, { useState, useContext, useEffect } from "react";
import { TeamContext } from "../context/TeamContext";

const API_BASE_URL = "http://localhost:8000"; // Your FastAPI server URL

const Mentors = () => {
  const { team } = useContext(TeamContext);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/mentors`);
        if (!response.ok) {
          throw new Error("Failed to fetch mentors");
        }
        const data = await response.json();
        setMentors(data);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleSlotSelection = (mentorId, slot) => {
    setSelectedSlot({ mentorId, slot });
    // In a real app, you would call an API to book this slot
    alert(
      `Slot selected with mentor ${mentorId} at ${slot}. Booking functionality not implemented.`,
    );
  };

  return (
    <div className="mentors-container">
      <h1>Mentor Sessions</h1>
      {loading ? (
        <p>Loading available mentors...</p>
      ) : (
        <div className="mentors-grid">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="mentor-card">
              <img
                src={
                  mentor.profile_picture || "https://via.placeholder.com/150"
                }
                alt={mentor.name}
                className="mentor-image"
              />
              <div className="mentor-info">
                <h2>{mentor.name}</h2>
                <div className="expertise">
                  <h3>Expertise:</h3>
                  <div className="tags">
                    {mentor.expertise.map((skill, index) => (
                      <span key={index} className="tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Availability would need another API call or be part of the mentor object */}
                <div className="availability">
                  <h3>
                    Status:{" "}
                    <span className={mentor.availability}>
                      {mentor.availability}
                    </span>
                  </h3>
                  {/* You would map over actual availability slots here */}
                  {mentor.availability === "available" ? (
                    <div className="slots">
                      {mentor.availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          className={`slot-button ${
                            selectedSlot &&
                            selectedSlot.mentorId === mentor.id &&
                            selectedSlot.slot === slot
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => handleSlotSelection(mentor.id, slot)}
                        >
                          {new Date(slot).toLocaleString()}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p>No available slots</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="booked-sessions">
        <h2>Your Booked Sessions</h2>
        {team?.mentorSessions?.length > 0 ? (
          <div className="sessions-list">
            {team.mentorSessions.map((session, index) => (
              <div key={index} className="session-card">
                <h3>Session with {session.mentorName}</h3>
                <p>Date: {new Date(session.scheduledFor).toLocaleString()}</p>
                <p>Status: {session.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No sessions booked yet</p>
        )}
      </div>
    </div>
  );
};

export default Mentors;