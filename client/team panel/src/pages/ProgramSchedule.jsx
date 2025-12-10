import React from "react";
import "./ProgramSchedule.css";

const ProgramSchedule = () => (
  <div className="program-schedule-container">
    <h1 className="program-title">Program Schedule</h1>
    <div className="schedule-day day-1">
      <div className="day-label">Day 01</div>
      <div className="date-label">29 August, 2025</div>
      <ul className="schedule-list">
        <li><span className="time">10:00 AM - 11:00 AM</span> <span className="desc">Team Reporting</span></li>
        <li><span className="time">11:00 AM - 11:30 AM</span> <span className="desc">Guidelines for all teams & Briefing</span></li>
        <li><span className="time">11:30 AM - 12:00 PM</span> <span className="desc">Inauguration Program</span></li>
        <li><span className="time">01:30 PM - 02:30 PM</span> <span className="desc">Lunch Break</span></li>
        <li><span className="time">02:30 PM - 07:30 PM</span> <span className="desc">Mentoring-Continues.....</span></li>
        <li><span className="time">09:00 PM - 10:30 PM</span> <span className="desc">Dinner</span></li>
      </ul>
    </div>
    <div className="schedule-day day-2">
      <div className="day-label">Day 02</div>
      <div className="date-label">30 August, 2025</div>
      <ul className="schedule-list">
        <li><span className="time">12:00 AM - 01:00 AM</span> <span className="desc">Music performance by Ninad</span></li>
        <li><span className="time">01:00 AM - 06:00 AM</span> <span className="desc">Night Coders Challenge (Don't Fall Asleep)</span></li>
        <li><span className="time">08:00 AM - 09:00 AM</span> <span className="desc">Wakeup Tea & Breakfast</span></li>
        <li><span className="time">12:30 PM - 07:00 PM</span> <span className="desc">Round-1 Evaluation by Jury</span></li>
        <li><span className="time">01:00 PM onwards</span> <span className="desc">Lunch (Team wise after the first evaluation)</span></li>
        <li><span className="time">09:30 PM - 11:00 PM</span> <span className="desc">Dinner time</span></li>
      </ul>
    </div>
    <div className="schedule-day day-3">
      <div className="day-label">Day 03</div>
      <div className="date-label">31 August, 2025</div>
      <ul className="schedule-list">
        <li><span className="time">12:00 AM - 02:00 AM</span> <span className="desc">Ninad performance 2.0</span></li>
        <li><span className="time">02:00 AM - 06:00 AM</span> <span className="desc">Night coding challenge</span></li>
        <li><span className="time">08:30 AM - 09:30 AM</span> <span className="desc">Wake up call + breakfast</span></li>
        <li><span className="time">12:30 PM</span> <span className="desc">Hackathon end bell</span></li>
        <li><span className="time">12:30 PM - 05:00 PM</span> <span className="desc">Final presentation and pitching round</span></li>
        <li><span className="time">05:15 PM - 06:00 PM</span> <span className="desc">Prize distribution</span></li>
      </ul>
    </div>
  </div>
);

export default ProgramSchedule;