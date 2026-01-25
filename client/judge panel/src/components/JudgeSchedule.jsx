import React, { useState, useEffect, useRef } from "react";
import "./JudgeSchedule.css";

const JudgeSchedule = () => {
  const [now, setNow] = useState(new Date());
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const [currentDayInfo, setCurrentDayInfo] = useState({});
  const audioRef = useRef(null);

  // Judge schedule data
  const judgeScheduleData = [
    {
      day: 1,
      date: "5 January, 2026",
      theme: "Registration & Orientation",
      description: "Team reporting, judge briefing, and inauguration ceremony",
      events: [
        { 
          time: "10:00 AM", 
          endTime: "11:00 AM", 
          desc: "Team Reporting & Registration", 
          icon: "👥",
          type: "registration",
          judgeRole: "Welcome & Orientation",
          location: "Main Hall",
          required: true
        },
        { 
          time: "11:00 AM", 
          endTime: "11:30 AM", 
          desc: "Guidelines & Briefing", 
          icon: "📋",
          type: "briefing",
          judgeRole: "Judge Briefing Session",
          location: "Judge's Room",
          required: true,
          notes: "All judges must attend"
        },
        { 
          time: "11:30 AM", 
          endTime: "12:00 PM", 
          desc: "Inauguration Program", 
          icon: "🎉",
          type: "ceremony",
          judgeRole: "Guest of Honor",
          location: "Main Stage",
          required: true
        },
        { 
          time: "01:30 PM", 
          endTime: "02:30 PM", 
          desc: "Lunch Break", 
          icon: "🍽️",
          type: "break",
          judgeRole: "Judge's Lunch",
          location: "Judge's Lounge",
          required: false
        },
        { 
          time: "02:30 PM", 
          endTime: "08:30 PM", 
          desc: "Team Mentoring Session", 
          icon: "👨‍🏫",
          type: "mentoring",
          judgeRole: "Mentoring Rounds",
          location: "Team Areas",
          required: true,
          assignments: ["Team 1-10", "Team 11-20"]
        },
        { 
          time: "09:58 PM", 
          endTime: "10:30 PM", 
          desc: "Dinner", 
          icon: "🌙",
          type: "dinner",
          judgeRole: "Judge's Dinner",
          location: "Dining Hall",
          required: false
        }
      ]
    },
    {
      day: 2,
      date: "6 January, 2026",
      theme: "Evaluation & Deliberation",
      description: "Round-1 evaluations and judge deliberation sessions",
      events: [
        { 
          time: "08:00 AM", 
          endTime: "09:00 AM", 
          desc: "Wakeup & Breakfast", 
          icon: "☕",
          type: "breakfast",
          judgeRole: "Breakfast Meeting",
          location: "Judge's Lounge",
          required: true,
          notes: "Review evaluation criteria"
        },
        { 
          time: "12:30 PM", 
          endTime: "07:00 PM", 
          desc: "Round-1 Evaluation", 
          icon: "⚖️",
          type: "evaluation",
          judgeRole: "Primary Judge",
          location: "Evaluation Hall A",
          required: true,
          critical: true,
          teams: ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta"],
          criteria: ["Innovation", "Technical Implementation", "Presentation", "Business Value"]
        },
        { 
          time: "01:00 PM", 
          endTime: "02:00 PM", 
          desc: "Team Lunch", 
          icon: "🍱",
          type: "lunch",
          judgeRole: "Lunch Break",
          location: "Dining Area",
          required: false
        },
        { 
          time: "07:30 PM", 
          endTime: "09:00 PM", 
          desc: "Judges Deliberation", 
          icon: "🤝",
          type: "deliberation",
          judgeRole: "Deliberation Session",
          location: "Judge's Chamber",
          required: true,
          critical: true,
          notes: "Score finalization and ranking"
        },
        { 
          time: "09:30 PM", 
          endTime: "11:00 PM", 
          desc: "Dinner", 
          icon: "🌃",
          type: "dinner",
          judgeRole: "Evening Dinner",
          location: "Main Dining",
          required: false
        }
      ]
    },
    {
      day: 3,
      date: "7 January, 2026",
      theme: "Finals & Awards",
      description: "Final presentations and prize distribution ceremony",
      events: [
        { 
          time: "08:30 AM", 
          endTime: "09:30 AM", 
          desc: "Breakfast", 
          icon: "🥞",
          type: "breakfast",
          judgeRole: "Final Day Briefing",
          location: "Judge's Lounge",
          required: true,
          notes: "Final round preparations"
        },
        { 
          time: "12:30 PM", 
          endTime: "05:00 PM", 
          desc: "Final Presentations", 
          icon: "🎤",
          type: "presentation",
          judgeRole: "Final Round Judge",
          location: "Main Stage",
          required: true,
          critical: true,
          teams: ["Top 8 Teams"],
          criteria: ["Final Pitch", "Demo Quality", "Scalability", "Teamwork"]
        },
        { 
          time: "05:15 PM", 
          endTime: "06:00 PM", 
          desc: "Prize Distribution", 
          icon: "🏆",
          type: "ceremony",
          judgeRole: "Award Presenter",
          location: "Main Stage",
          required: true,
          critical: true,
          notes: "Announce winners and present awards"
        }
      ]
    }
  ];

  const parseTime = (timeStr, dateStr) => {
    const [date, month, year] = dateStr.split(/[\s,]+/);
    const dateNum = parseInt(date);
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    
    hours = parseInt(hours);
    minutes = parseInt(minutes || 0);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    return new Date(year, monthIndex, dateNum, hours, minutes);
  };

  const calculateTimeRemaining = (eventTime) => {
    const diff = eventTime - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, total: diff };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    findUpcomingEvent();
    updateCurrentDayInfo();
  }, [now]);

  const updateCurrentDayInfo = () => {
    const today = new Date();
    const currentYear = 2026;
    
    // Find which day we're in based on date
    let currentDay = 1;
    let dayProgress = 0;
    let nextDayStartsIn = null;
    
    judgeScheduleData.forEach(day => {
      const dayDate = parseTime("12:00 AM", day.date);
      const nextDay = new Date(dayDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      if (today >= dayDate && today < nextDay) {
        currentDay = day.day;
        // Calculate progress through the day
        const dayStart = dayDate;
        const dayEnd = new Date(dayDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        const totalDayDuration = dayEnd - dayStart;
        const elapsed = today - dayStart;
        dayProgress = Math.min((elapsed / totalDayDuration) * 100, 100);
        
        // Calculate time until next day
        nextDayStartsIn = nextDay - today;
      }
    });
    
    setCurrentDayInfo({ currentDay, dayProgress, nextDayStartsIn });
  };

  const findUpcomingEvent = () => {
    let upcoming = null;
    let minTime = Infinity;

    judgeScheduleData.forEach(day => {
      day.events.forEach(event => {
        const eventTime = parseTime(event.time, day.date);
        const eventEndTime = parseTime(event.endTime, day.date);
        const timeDiff = eventTime - now;
        
        if (timeDiff > 0 && timeDiff < minTime) {
          minTime = timeDiff;
          upcoming = { 
            ...event, 
            day: day.day, 
            date: day.date, 
            eventTime,
            eventEndTime 
          };
        }
      });
    });

    setUpcomingEvent(upcoming);
    
    // Trigger alarm for critical judge events (5 minutes before)
    // if (upcoming && upcoming.critical && minTime <= 300000 && minTime > 0 && !alarmPlaying) {
    //   setAlarmPlaying(true);
    //   if (audioRef.current) {
    //     audioRef.current.volume = 0.3;
    //     audioRef.current.play().catch(e => console.log("Auto-play prevented:", e));
    //   }
    // }
  };

  const stopAlarm = () => {
    setAlarmPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const timeRemaining = upcomingEvent ? calculateTimeRemaining(upcomingEvent.eventTime) : null;
  
  // Calculate progress of day
  const getCurrentDayProgress = () => {
    const day = judgeScheduleData.find(d => d.day === currentDayInfo.currentDay);
    if (!day) return 0;
    
    return currentDayInfo.dayProgress;
  };

  // Calculate day statistics
  const getDayStats = (day) => {
    const events = day.events;
    let pending = 0;
    let completed = 0;
    let live = 0;

    events.forEach(event => {
      const eventTime = parseTime(event.time, day.date);
      const eventEndTime = parseTime(event.endTime, day.date);
      
      if (now > eventEndTime) {
        completed++;
      } else if (now >= eventTime && now <= eventEndTime) {
        live++;
      } else {
        pending++;
      }
    });

    return { pending, completed, live };
  };

  // Format time for next day countdown
  const formatTimeUntilNextDay = () => {
    if (!currentDayInfo.nextDayStartsIn || currentDayInfo.nextDayStartsIn <= 0) {
      return null;
    }
    
    const hours = Math.floor((currentDayInfo.nextDayStartsIn % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((currentDayInfo.nextDayStartsIn % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((currentDayInfo.nextDayStartsIn % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="judge-schedule-container">
      <audio ref={audioRef} loop>
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" type="audio/mpeg" />
      </audio>

      {/* Page Header */}
      <div className="schedule-header">
        <div className="header-main">
          <div className="header-title">
            <h1>🧑‍⚖️ Judge Schedule Dashboard</h1>
            <p className="schedule-subtitle">Track your judging commitments and upcoming events</p>
          </div>
          <div className="header-time">
            <div className="current-time-display">
              <div className="time-label">CURRENT TIME</div>
              <div className="time-value">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="date-value">
                {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div className="current-day-info">
              <div className="day-progress-label">
                Day {currentDayInfo.currentDay || 1} Progress
              </div>
              <div className="day-progress-bar">
                <div 
                  className="day-progress-fill"
                  style={{ width: `${getCurrentDayProgress()}%` }}
                ></div>
              </div>
              {formatTimeUntilNextDay() && (
                <div className="next-day-countdown">
                  <span className="countdown-label">Next Day In:</span>
                  <span className="countdown-value">{formatTimeUntilNextDay()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alarm Overlay */}
      {alarmPlaying && (
        <div className="alarm-overlay">
          <div className="alarm-content">
            <div className="alarm-icon">⚖️</div>
            <h2>JUDGE ALERT!</h2>
            <h3>{upcomingEvent?.desc}</h3>
            <p>Your Role: {upcomingEvent?.judgeRole}</p>
            <p className="alarm-time">Starts at {upcomingEvent?.time}</p>
            <button className="alarm-dismiss-btn" onClick={stopAlarm}>
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Event Card */}
      {upcomingEvent && timeRemaining && (
        <div className="upcoming-event-card">
          <div className="upcoming-header">
            <div className="upcoming-label">
              <span className="blink-dot"></span>
              NEXT JUDGE COMMITMENT
              <span className="upcoming-timer">
                {timeRemaining.days > 0 ? `${timeRemaining.days}d ` : ''}
                {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
              </span>
            </div>
            <div className={`priority-badge ${upcomingEvent.critical ? 'critical' : 'standard'}`}>
              {upcomingEvent.critical ? "CRITICAL" : "STANDARD"}
            </div>
          </div>
          
          <div className="upcoming-body">
            <div className="event-main-info">
              <div className="event-icon-wrapper">
                <div className="event-icon">{upcomingEvent.icon}</div>
                <div className="event-day-badge">Day {upcomingEvent.day}</div>
              </div>
              <div className="event-details">
                <h2 className="event-title">{upcomingEvent.desc}</h2>
                <div className="event-role">{upcomingEvent.judgeRole}</div>
                <div className="event-meta">
                  <span className="meta-item">
                    <span className="meta-icon">📍</span>
                    {upcomingEvent.location}
                  </span>
                  <span className="meta-item">
                    <span className="meta-icon">📅</span>
                    {upcomingEvent.date} • {upcomingEvent.time}
                  </span>
                  <span className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    {upcomingEvent.time} - {upcomingEvent.endTime}
                  </span>
                  <span className="meta-item">
                    <span className="meta-icon">📝</span>
                    {upcomingEvent.required ? "Mandatory" : "Optional"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="countdown-section">
              <div className="countdown-label">TIME UNTIL EVENT</div>
              <div className="countdown-timer">
                {timeRemaining.days > 0 && (
                  <>
                    <div className="time-unit large">
                      <div className="time-value">{timeRemaining.days.toString().padStart(2, '0')}</div>
                      <div className="time-label">DAYS</div>
                    </div>
                    <div className="time-separator">:</div>
                  </>
                )}
                <div className="time-unit large">
                  <div className="time-value">{timeRemaining.hours.toString().padStart(2, '0')}</div>
                  <div className="time-label">HOURS</div>
                </div>
                <div className="time-separator">:</div>
                <div className="time-unit large">
                  <div className="time-value">{timeRemaining.minutes.toString().padStart(2, '0')}</div>
                  <div className="time-label">MINUTES</div>
                </div>
                <div className="time-separator">:</div>
                <div className="time-unit large">
                  <div className="time-value">{timeRemaining.seconds.toString().padStart(2, '0')}</div>
                  <div className="time-label">SECONDS</div>
                </div>
              </div>
              <div className="countdown-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(100, (1 - (timeRemaining.total / (24 * 60 * 60 * 1000))) * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="progress-labels">
                  <span>Event Approaching</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
          
          {upcomingEvent.notes && (
            <div className="event-notes">
              <strong>Judge Notes:</strong> {upcomingEvent.notes}
            </div>
          )}
        </div>
      )}

      {/* Day Selector */}
      <div className="day-selector">
        {judgeScheduleData.map(day => {
          const stats = getDayStats(day);
          const isCurrentDay = currentDayInfo.currentDay === day.day;
          const isPastDay = day.day < currentDayInfo.currentDay;
          
          return (
            <button
              key={day.day}
              className={`day-tab ${activeDay === day.day ? "active" : ""} ${isCurrentDay ? "current-day" : ""} ${isPastDay ? "past-day" : ""}`}
              onClick={() => setActiveDay(day.day)}
            >
              <div className="day-header-info">
                <div className="day-number">Day {day.day}</div>
                <div className="day-status">
                  {isCurrentDay && <span className="status-indicator live">● CURRENT DAY</span>}
                  {isPastDay && <span className="status-indicator completed">✓ COMPLETED</span>}
                  {!isPastDay && !isCurrentDay && <span className="status-indicator upcoming">UPCOMING</span>}
                </div>
              </div>
              <div className="day-date">{day.date}</div>
              <div className="day-theme">{day.theme}</div>
              <div className="day-summary">
                <div className="summary-item-group">
                  <span className="summary-item completed">
                    <span className="summary-count">{stats.completed}</span>
                    <span className="summary-label">Done</span>
                  </span>
                  <span className="summary-item live">
                    <span className="summary-count">{stats.live}</span>
                    <span className="summary-label">Live</span>
                  </span>
                  <span className="summary-item pending">
                    <span className="summary-count">{stats.pending}</span>
                    <span className="summary-label">Pending</span>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Schedule List */}
      <div className="schedule-list">
        {judgeScheduleData
          .filter(day => day.day === activeDay)
          .map(day => {
            const stats = getDayStats(day);
            const isCurrentDay = currentDayInfo.currentDay === day.day;
            
            return (
              <div key={day.day} className="day-schedule">
                <div className="day-header">
                  <div className="day-title-section">
                    <h2>
                      <span className="day-title">Day {day.day}</span>
                      <span className="day-theme-title">{day.theme}</span>
                    </h2>
                    <p className="day-description">{day.description}</p>
                    <div className="day-date-display">
                      <span className="date-icon">📅</span>
                      {day.date}
                      {isCurrentDay && <span className="current-day-badge">● CURRENT DAY</span>}
                    </div>
                  </div>
                  <div className="day-stats">
                    <div className="stat-card total">
                      <div className="stat-count">{day.events.length}</div>
                      <div className="stat-label">Total Events</div>
                    </div>
                    <div className="stat-card completed">
                      <div className="stat-count">{stats.completed}</div>
                      <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card live">
                      <div className="stat-count">{stats.live}</div>
                      <div className="stat-label">Live Now</div>
                    </div>
                    <div className="stat-card pending">
                      <div className="stat-count">{stats.pending}</div>
                      <div className="stat-label">Pending</div>
                    </div>
                    <div className="stat-card progress">
                      <div className="stat-count">{Math.round(currentDayInfo.dayProgress || 0)}%</div>
                      <div className="stat-label">Day Progress</div>
                    </div>
                  </div>
                </div>

                <div className="events-timeline">
                  {day.events.map((event, index) => {
                    const eventTime = parseTime(event.time, day.date);
                    const eventEndTime = parseTime(event.endTime, day.date);
                    const isPast = eventEndTime < now;
                    const isLive = now >= eventTime && now <= eventEndTime;
                    const eventDuration = (eventEndTime - eventTime) / (1000 * 60 * 60); // in hours
                    
                    return (
                      <div 
                        key={index}
                        className={`event-item ${isPast ? "past" : ""} ${isLive ? "live" : ""} ${event.critical ? "critical" : ""}`}
                      >
                        <div className="event-time">
                          <div className="time-start">{event.time}</div>
                          <div className="time-end">{event.endTime}</div>
                          <div className="time-duration">{eventDuration.toFixed(1)}h</div>
                        </div>
                        
                        <div className="event-marker">
                          <div className={`time-dot ${isLive ? "live-dot" : ""} ${event.critical ? "critical-dot" : ""} ${isPast ? "past-dot" : ""}`}>
                            {isLive && <div className="pulse-ring"></div>}
                          </div>
                          {index < day.events.length - 1 && <div className="timeline-line"></div>}
                        </div>
                        
                        <div className="event-content">
                          <div className="event-header">
                            <div className="content-icon">{event.icon}</div>
                            <div className="content-title">
                              <h3>{event.desc}</h3>
                              <div className="event-type">{event.type.toUpperCase()}</div>
                              {isLive && (
                                <div className="live-timer">
                                  <span className="timer-icon">⏱️</span>
                                  Live for {Math.floor((now - eventTime) / (1000 * 60))}m
                                </div>
                              )}
                            </div>
                            <div className="event-status">
                              {isLive ? (
                                <span className="status-badge live">
                                  <span className="status-dot"></span>
                                  LIVE NOW
                                </span>
                              ) : isPast ? (
                                <span className="status-badge completed">
                                  <span className="status-check">✓</span>
                                  COMPLETED
                                </span>
                              ) : (
                                <span className="status-badge upcoming">
                                  UPCOMING
                                  <span className="upcoming-time">
                                    In {calculateTimeRemaining(eventTime).days}d {calculateTimeRemaining(eventTime).hours}h {calculateTimeRemaining(eventTime).minutes}m
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="event-details">
                            <div className="role-info">
                              <strong>Your Role:</strong> {event.judgeRole}
                            </div>
                            <div className="location-info">
                              <span className="location-icon">📍</span>
                              {event.location}
                            </div>
                            
                            {event.notes && (
                              <div className="notes-info">
                                <span className="notes-icon">📝</span>
                                {event.notes}
                              </div>
                            )}
                            
                            {event.teams && (
                              <div className="teams-section">
                                <strong>Assigned Teams:</strong>
                                <div className="team-tags">
                                  {event.teams.map((team, idx) => (
                                    <span key={idx} className="team-tag">{team}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {event.criteria && (
                              <div className="criteria-section">
                                <strong>Evaluation Criteria:</strong>
                                <div className="criteria-tags">
                                  {event.criteria.map((criteria, idx) => (
                                    <span key={idx} className="criteria-tag">{criteria}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {event.required && (
                            <div className="required-badge">
                              ⚠️ Mandatory Attendance
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* Quick Info */}
      <div className="quick-info">
        <div className="info-card">
          <div className="info-icon">📅</div>
          <div className="info-content">
            <h4>Schedule Legend</h4>
            <div className="info-items">
              <div className="info-item">
                <span className="indicator critical"></span>
                <span>Critical Event</span>
              </div>
              <div className="info-item">
                <span className="indicator live"></span>
                <span>Live Now</span>
              </div>
              <div className="info-item">
                <span className="indicator completed"></span>
                <span>Completed</span>
              </div>
              <div className="info-item">
                <span className="indicator mandatory"></span>
                <span>Mandatory</span>
              </div>
            </div>
          </div>
        </div>
        <div className="info-card">
          <div className="info-icon">⏱️</div>
          <div className="info-content">
            <h4>Time Zone</h4>
            <p>All times shown in your local timezone</p>
            <div className="timezone-info">
              Current: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeSchedule;