import React, { useState, useEffect, useRef } from "react";
import "./ProgramSchedule.css";

const ProgramSchedule = () => {
  const [now, setNow] = useState(new Date());
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const [alarmDismissed, setAlarmDismissed] = useState(false);
  const [lastDismissTime, setLastDismissTime] = useState(0);
  const [animatedTimers, setAnimatedTimers] = useState([]);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const audioRef = useRef(null);
  const containerRef = useRef(null);

  const scheduleData = [
    {
      day: 1,
      date: "29 December, 2025",
      events: [
        { 
          time: "10:00 AM", 
          endTime: "11:00 AM", 
          desc: "Team Reporting", 
          icon: "👥",
          priority: "high"
        },
        { 
          time: "11:00 AM", 
          endTime: "11:30 AM", 
          desc: "Guidelines & Briefing", 
          icon: "📋",
          priority: "medium"
        },
        { 
          time: "11:30 AM", 
          endTime: "12:00 PM", 
          desc: "Inauguration Program", 
          icon: "🎉",
          priority: "high"
        },
        { 
          time: "01:30 PM", 
          endTime: "02:30 PM", 
          desc: "Lunch Break", 
          icon: "🍽️",
          priority: "low"
        },
        { 
          time: "02:30 PM", 
          endTime: "07:30 PM", 
          desc: "Mentoring Session", 
          icon: "👨‍🏫",
          priority: "medium"
        },
        { 
          time: "10:30 PM", 
          endTime: "10:45 PM", 
          desc: "Dinner", 
          icon: "🌙",
          priority: "low"
        }
      ]
    },
    {
      day: 2,
      date: "30 December, 2025",
      events: [
        { 
          time: "12:00 AM", 
          endTime: "01:00 AM", 
          desc: "Music Performance", 
          icon: "🎵",
          priority: "medium"
        },
        { 
          time: "01:00 AM", 
          endTime: "06:00 AM", 
          desc: "Night Coding Challenge", 
          icon: "💻",
          priority: "high"
        },
        { 
          time: "08:00 AM", 
          endTime: "09:00 AM", 
          desc: "Wakeup & Breakfast", 
          icon: "☕",
          priority: "low"
        },
        { 
          time: "12:30 PM", 
          endTime: "07:00 PM", 
          desc: "Round-1 Evaluation", 
          icon: "⚖️",
          priority: "high"
        },
        { 
          time: "01:00 PM", 
          endTime: "02:00 PM", 
          desc: "Team Lunch", 
          icon: "🍱",
          priority: "low"
        },
        { 
          time: "09:30 PM", 
          endTime: "11:00 PM", 
          desc: "Dinner", 
          icon: "🌃",
          priority: "low"
        }
      ]
    },
    {
      day: 3,
      date: "31 December, 2025",
      events: [
        { 
          time: "12:00 AM", 
          endTime: "02:00 AM", 
          desc: "Performance 2.0", 
          icon: "🎸",
          priority: "medium"
        },
        { 
          time: "02:00 AM", 
          endTime: "06:00 AM", 
          desc: "Night Challenge", 
          icon: "🌙💻",
          priority: "high"
        },
        { 
          time: "08:30 AM", 
          endTime: "09:30 AM", 
          desc: "Breakfast", 
          icon: "🥞",
          priority: "low"
        },
        { 
          time: "12:30 PM", 
          endTime: "12:30 PM", 
          desc: "Hackathon End Bell", 
          icon: "🔔",
          priority: "high"
        },
        { 
          time: "12:30 PM", 
          endTime: "05:00 PM", 
          desc: "Final Presentations", 
          icon: "🎤",
          priority: "high"
        },
        { 
          time: "05:15 PM", 
          endTime: "06:00 PM", 
          desc: "Prize Distribution", 
          icon: "🏆",
          priority: "high"
        }
      ]
    }
  ];

  const parseTime = (timeStr, dateStr) => {
    const [date, month, year] = dateStr.split(/[\s,]+/);
    const dateNum = parseInt(date);
    const monthIndex = new Date(`${month} 1, 2025`).getMonth();
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    
    hours = parseInt(hours);
    minutes = parseInt(minutes || 0);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    return new Date(2025, monthIndex, dateNum, hours, minutes);
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
      findUpcomingEvent();
      
      // Pulse animation every 5 seconds
      if (Math.floor(Date.now() / 5000) % 2 === 0) {
        setPulseAnimation(true);
        setTimeout(() => setPulseAnimation(false), 500);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const findUpcomingEvent = () => {
    let upcoming = null;
    let minTime = Infinity;

    scheduleData.forEach(day => {
      day.events.forEach(event => {
        const eventTime = parseTime(event.time, day.date);
        const timeDiff = eventTime - now;
        
        if (timeDiff > 0 && timeDiff < minTime) {
          minTime = timeDiff;
          upcoming = { ...event, day: day.day, date: day.date, eventTime };
        }
      });
    });

    setUpcomingEvent(upcoming);
    
    const currentTime = Date.now();
    
    // Check if we should trigger alarm
    if (upcoming && minTime <= 600000 && minTime > 0) {
      // If alarm was dismissed recently (within 2 minutes), don't re-trigger
      const timeSinceDismiss = currentTime - lastDismissTime;
      const shouldRing = timeSinceDismiss > 120000 || !alarmDismissed; // 2 minutes cooldown
      
      if (shouldRing && !alarmPlaying) {
        setAlarmPlaying(true);
        setAlarmDismissed(false); // Reset dismissed flag when new alarm triggers
        if (audioRef.current) {
          audioRef.current.volume = 0.3;
          audioRef.current.play().catch(e => console.log("Auto-play prevented:", e));
        }
      }
    } else {
      // If event is not upcoming or has passed, reset alarm state
      if (alarmPlaying) {
        setAlarmPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
      setAlarmDismissed(false); // Reset when no upcoming events
    }
  };

  const stopAlarm = () => {
    setAlarmPlaying(false);
    setAlarmDismissed(true); // Mark as dismissed
    setLastDismissTime(Date.now()); // Record when it was dismissed
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Add effect to reset dismissed state when alarmPlaying becomes false naturally
  useEffect(() => {
    if (!alarmPlaying && !alarmDismissed) {
      // This handles when alarm auto-stops (not by user)
      setAlarmDismissed(true);
      setLastDismissTime(Date.now());
    }
  }, [alarmPlaying]);

  

  

  const timeRemaining = upcomingEvent ? calculateTimeRemaining(upcomingEvent.eventTime) : null;

  return (
    <div className="program-schedule-container" ref={containerRef}>
      <audio ref={audioRef} loop>
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-digital-clock-digital-alarm-buzzer-992.mp3" type="audio/mpeg" />
      </audio>

      {/* Background Animated Elements */}
      <div className="bg-animations">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="pulse-ring"></div>
      </div>

      {/* Alarm Overlay */}
      {alarmPlaying && (
        <div className="alarm-overlay">
          <div className="alarm-container">
            <div className="alarm-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
            </div>
            <div className="alarm-content">
              <div className="alarm-icon">⏰</div>
              <h2 className="alarm-title">EVENT STARTING SOON!</h2>
              <h3 className="alarm-event">{upcomingEvent?.desc}</h3>
              <p className="alarm-time">Starts at {upcomingEvent?.time}</p>
              <button className="alarm-stop-btn" onClick={stopAlarm}>
                DISMISS ALARM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="main-header">
        <h1 className="program-title">
          <span className="title-text">PROGRAM SCHEDULE</span>
          <span className="title-highlight"></span>
        </h1>
        <div className={`current-timer ${pulseAnimation ? 'pulse' : ''}`}>
          <div className="timer-label">LIVE TIMER</div>
          <div className="timer-digits">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Upcoming Event Timer Card */}
      {upcomingEvent && timeRemaining && (
        <div className="upcoming-timer-container">
          {/* Animated Timer Particles */}
          {animatedTimers.map(timer => (
            <div 
              key={timer.id}
              className={`timer-particle ${timer.type}`}
              style={{
                left: `${timer.x}%`,
                top: `${timer.y}%`,
                width: timer.size,
                height: timer.size
              }}
            />
          ))}
          
          <div className="timer-card">
            <div className="timer-header">
              <div className="next-up-label">
                <span className="blinking-dot"></span>
                NEXT EVENT COUNTDOWN
              </div>
              <div className="event-priority">
                <span className={`priority-badge ${upcomingEvent.priority}`}>
                  {upcomingEvent.priority.toUpperCase()} PRIORITY
                </span>
              </div>
            </div>
            
            <div className="timer-body">
              <div className="event-info">
                <div className="event-icon">{upcomingEvent.icon}</div>
                <div className="event-details">
                  <h2 className="event-title">{upcomingEvent.desc}</h2>
                  <div className="event-meta">
                    <span className="meta-item">Day 0{upcomingEvent.day}</span>
                    <span className="meta-divider">•</span>
                    <span className="meta-item">{upcomingEvent.date}</span>
                    <span className="meta-divider">•</span>
                    <span className="meta-item time-badge">{upcomingEvent.time}</span>
                  </div>
                </div>
              </div>
              
              <div className="countdown-section">
                <div className="countdown-label">TIME REMAINING</div>
                <div className="countdown-display">
                  <div className="time-unit">
                    <div className="unit-value animate-digit">{timeRemaining.hours.toString().padStart(2, '0')}</div>
                    <div className="unit-label">HOURS</div>
                  </div>
                  <div className="time-separator animate-colon">:</div>
                  <div className="time-unit">
                    <div className="unit-value animate-digit">{timeRemaining.minutes.toString().padStart(2, '0')}</div>
                    <div className="unit-label">MINUTES</div>
                  </div>
                  <div className="time-separator animate-colon">:</div>
                  <div className="time-unit">
                    <div className="unit-value animate-digit">{timeRemaining.seconds.toString().padStart(2, '0')}</div>
                    <div className="unit-label">SECONDS</div>
                  </div>
                </div>
                
                {/* Circular Progress Timer */}
                <div className="circular-timer">
                  <div className="circular-progress">
                    <svg className="progress-ring" width="120" height="120">
                      <circle
                        className="progress-ring-circle"
                        stroke="#00b4d8"
                        strokeWidth="4"
                        fill="transparent"
                        r="52"
                        cx="60"
                        cy="60"
                        style={{
                          strokeDasharray: `${(timeRemaining.seconds / 60) * 326.56} 326.56`
                        }}
                      />
                    </svg>
                    <div className="circular-label">SEC</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="timer-footer">
              <div className="progress-container">
                <div 
                  className="progress-bar"
                  style={{
                    width: `${Math.max(0, Math.min(100, (1 - (timeRemaining.total / (24 * 60 * 60 * 1000))) * 100))}%`
                  }}
                >
                  <div className="progress-glow"></div>
                </div>
              </div>
              <div className="progress-labels">
                <span>START</span>
                <span>{upcomingEvent.time}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Navigation */}
      <div className="schedule-nav">
        <div className="nav-header">
          <h3 className="nav-title">DAILY SCHEDULE</h3>
          <div className="nav-indicator">
            <div className="indicator-dot"></div>
            <div className="indicator-text">SELECT DAY</div>
          </div>
        </div>
        
        <div className="day-selector">
          {scheduleData.map(day => (
            <button
              key={day.day}
              className={`day-tab ${activeDay === day.day ? 'active' : ''}`}
              onClick={() => setActiveDay(day.day)}
            >
              <span className="tab-day">DAY {day.day.toString().padStart(2, '0')}</span>
              <span className="tab-date">{day.date.split(',')[0]}</span>
              <span className="tab-arrow">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Content */}
      <div className="schedule-content">
        {scheduleData.map(day => (
          <div 
            key={day.day} 
            className={`schedule-day ${activeDay === day.day ? 'active' : ''}`}
          >
            <div className="day-header animated-gradient">
              <div className="day-title">
                <span className="day-number">0{day.day}</span>
                <span className="day-text">SCHEDULE</span>
              </div>
              <div className="day-date">{day.date}</div>
            </div>
            
            <div className="events-grid">
              {day.events.map((event, index) => {
                const eventTime = parseTime(event.time, day.date);
                const isPast = eventTime < now;
                const isNow = !isPast && calculateTimeRemaining(eventTime).total <= 600000;
                const eventRemaining = calculateTimeRemaining(eventTime);
                
                return (
                  <div 
                    key={index}
                    className={`event-card ${isPast ? 'past' : ''} ${isNow ? 'current' : 'upcoming'}`}
                    data-priority={event.priority}
                  >
                    <div className="event-card-header">
                      <div className="event-icon-small">{event.icon}</div>
                      <div className="event-time-display">
                        <span className="event-start">{event.time}</span>
                        {event.endTime !== event.time && (
                          <>
                            <span className="time-sep">→</span>
                            <span className="event-end">{event.endTime}</span>
                          </>
                        )}
                      </div>
                      <div className="event-status">
                        {isPast ? (
                          <span className="status-badge completed">✓ COMPLETED</span>
                        ) : isNow ? (
                          <span className="status-badge live">● LIVE SOON</span>
                        ) : (
                          <span className="status-badge upcoming">⏱️ UPCOMING</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="event-card-body">
                      <h4 className="event-title-small">{event.desc}</h4>
                      
                      {!isPast && (
                        <div className="event-countdown">
                          <div className="countdown-mini">
                            <div className="mini-timer">
                              <span className="mini-label">Starts in:</span>
                              <span className="mini-time">
                                {eventRemaining.hours > 0 && `${eventRemaining.hours}h `}
                                {eventRemaining.minutes}m {eventRemaining.seconds}s
                              </span>
                            </div>
                            <div className="mini-progress">
                              <div 
                                className="mini-progress-bar"
                                style={{
                                  width: `${100 - (eventRemaining.total / (24 * 60 * 60 * 1000)) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Animated border */}
                    <div className="event-border"></div>
                    {isNow && <div className="event-glow"></div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button 
        className="fab" 
        onClick={() => {
          if (upcomingEvent) {
            const time = calculateTimeRemaining(upcomingEvent.eventTime);
            alert(`Next event: ${upcomingEvent.desc}\nStarts in: ${time.hours}h ${time.minutes}m ${time.seconds}s`);
          }
        }}
      >
        <span className="fab-icon">⏱️</span>
        <span className="fab-text">QUICK VIEW</span>
      </button>
    </div>
  );
};

export default ProgramSchedule;