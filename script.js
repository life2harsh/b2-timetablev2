const { useState, useEffect, useCallback } = React;

    const daySchedules = {
      Monday: [
        { time: '9:00-10:00', subject: 'Maths AIDS(T)', location: 'TS16' },
        { time: '10:00-11:00', subject: 'Data Structures', location: 'FF6' },
        { time: '12:00-1:00', subject: 'Automata', location: 'G1' },
        { time: '2:00-3:00' , subject: 'DBMS', location: 'FF6'},
        { time: '3:00-5:00', subject: 'DBMS LAB', location: 'CL13' }
      ],
      Tuesday: [
        { time: '9:00-10:00', subject: 'Maths AIDS (Lec)', location: 'FF6' },
        { time: '10:00-11:00', subject: 'UNIX (Lec)', location: 'CR526' },
        { time: '11:00-12:00', subject: 'Automata', location: 'G3' },
        { time: '2:00-3:00', subject: 'Data Structures', location: 'G1' },
        { time: '4:00-5:00', subject: 'Economics', location: 'FF6' }
      ],
      Wednesday: [
        { time: '9:00-11:00', subject: 'DS Lab', location: 'CL13' },
        { time: '11:00-12:00', subject: 'Data Structures', location: 'FF6' },
        { time: '12:00-1:00', subject: 'Maths AIDS (Lec)', location: 'G2' }
      ],
      Thursday: [
        { time: '9:00-10:00', subject: 'Automata', location: 'CS4' },
        { time: '11:00-12:00', subject: 'Economics', location: 'FF6' },
        { time: '12:00-1:00', subject: 'Economics Tut', location: 'TS6' },
        { time: '2:00-3:00', subject: 'DBMS', location: 'FF6' },
        { time: '3:00-4:00', subject: 'Maths AIDS', location: 'FF6' }
      ],
      Friday: [
        { time: '9:00-11:00', subject: 'UNIX LAB', location: 'CL09' },
        { time: '11:00-12:00', subject: 'Data Structure', location: 'TS10' },
        { time: '12:00-1:00', subject: 'DBMS', location: 'FF6' },
        { time: '3:00-5:00', subject: 'JAVA LAB', location: 'CL06' }
      ]
    };

    const timeSlots = [
      { start: 540, end: 600, label: '9:00-10:00' },
      { start: 600, end: 660, label: '10:00-11:00' },
      { start: 660, end: 720, label: '11:00-12:00' },
      { start: 720, end: 780, label: '12:00-1:00' },
      { start: 780, end: 840, label: '1:00-2:00', isLunch: true },
      { start: 840, end: 900, label: '2:00-3:00' },
      { start: 900, end: 960, label: '3:00-4:00' },
      { start: 960, end: 1020, label: '4:00-5:00' }
    ];

    const parseTime = (timeStr) => {
      let [hour, minute] = timeStr.split(':').map(Number);
      if (hour < 7) hour += 12;
      return hour * 60 + minute;
    };

    const ScheduleCard = ({ slot, isCurrent }) => {
      const [startStr, endStr] = slot.time.split('-');
      const start = parseTime(startStr.trim());
      const end = parseTime(endStr.trim());
      const remaining = isCurrent ? end - (new Date().getHours() * 60 + new Date().getMinutes()) : null;

      return (
        <div className={`card ${isCurrent ? 'current' : ''}`}>
          <div className="card-time">{slot.time}</div>
          <div className="card-subject">{slot.subject}</div>
          <div className="card-location">{slot.location}</div>
          {isCurrent && remaining > 0 && (
            <div className="card-remaining">{remaining} min remaining</div>
          )}
        </div>
      );
    };

    const Notification = ({ message, show, onClose }) => {
      useEffect(() => {
        if (show) {
          const timer = setTimeout(onClose, 3000);
          return () => clearTimeout(timer);
        }
      }, [show, onClose]);

      return (
        <div className={`notification ${show ? 'show' : ''}`}>
          {message}
        </div>
      );
    };

    const getFreeSlots = (daySlots) => {
      const freeSlots = [];
      const lunchSlots = [];
      const occupiedSlots = [];

      daySlots.forEach(slot => {
        const [startStr, endStr] = slot.time.split('-');
        const start = parseTime(startStr.trim());
        const end = parseTime(endStr.trim());
        occupiedSlots.push({ start, end });
      });

      occupiedSlots.sort((a, b) => a.start - b.start);

      for (let i = 0; i < timeSlots.length; i++) {
        const currentTimeSlot = timeSlots[i];
        
        const isOccupied = occupiedSlots.some(occupied => {
          return (occupied.start < currentTimeSlot.end && occupied.end > currentTimeSlot.start);
        });

        if (!isOccupied) {
          if (currentTimeSlot.isLunch) {
            lunchSlots.push(currentTimeSlot.label);
          } else {
            freeSlots.push(currentTimeSlot.label);
          }
        }
      }

      return { freeSlots, lunchSlots };
    };

    const TimetableApp = () => {
      const [showFullTimetable, setShowFullTimetable] = useState(false);
      const [currentTime, setCurrentTime] = useState(new Date());
      const [notification, setNotification] = useState({ show: false, message: '' });
      const [lastNotifiedClass, setLastNotifiedClass] = useState(null);

      const currentDay = currentTime.toLocaleString('en-us', { weekday: 'long' });
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      const todaySlots = daySchedules[currentDay] || [];

      const totalClasses = todaySlots.length;
      const completedClasses = todaySlots.filter(slot => {
        const [, endStr] = slot.time.split('-');
        const end = parseTime(endStr.trim());
        return currentMinutes >= end;
      }).length;
      
      const currentClass = todaySlots.find(slot => {
        const [startStr, endStr] = slot.time.split('-');
        const start = parseTime(startStr.trim());
        const end = parseTime(endStr.trim());
        return currentMinutes >= start && currentMinutes < end;
      });
      
      const nextClass = todaySlots.find(slot => {
        const [startStr] = slot.time.split('-');
        const start = parseTime(startStr.trim());
        return currentMinutes < start;
      });

      const { freeSlots, lunchSlots } = getFreeSlots(todaySlots);

      const showNotification = useCallback((message) => {
        setNotification({ show: true, message });
      }, []);

      const hideNotification = useCallback(() => {
        setNotification({ show: false, message: '' });
      }, []);

      useEffect(() => {
        const timer = setInterval(() => {
          setCurrentTime(new Date());
        }, 30000);
        return () => clearInterval(timer);
      }, []);

      useEffect(() => {
        if (nextClass && lastNotifiedClass !== nextClass.subject) {
          const [startStr] = nextClass.time.split('-');
          const start = parseTime(startStr.trim());
          const timeUntilNext = start - currentMinutes;

          if (timeUntilNext <= 10 && timeUntilNext > 0) {
            showNotification(`${nextClass.subject} in ${timeUntilNext} min`);
            setLastNotifiedClass(nextClass.subject);
          }
        }
      }, [nextClass, currentMinutes, lastNotifiedClass, showNotification]);

      const toggleFullTimetable = () => {
        const newState = !showFullTimetable;
        setShowFullTimetable(newState);
        
        // Auto scroll to weekly timetable when shown
        if (newState) {
          setTimeout(() => {
            const timetableElement = document.querySelector('.timetable-container');
            if (timetableElement) {
              timetableElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest' 
              });
            }
          }, 100); // Small delay to ensure the element is rendered
        }
      };

      const renderTodaySchedule = () => {
        if (todaySlots.length === 0) {
          return (
            <div className="empty-state">
              No classes today
            </div>
          );
        }

        return todaySlots.map((slot, index) => {
          const [startStr, endStr] = slot.time.split('-');
          const start = parseTime(startStr.trim());
          const end = parseTime(endStr.trim());
          const isCurrent = currentMinutes >= start && currentMinutes < end;

          return (
            <ScheduleCard
              key={index}
              slot={slot}
              isCurrent={isCurrent}
            />
          );
        });
      };

      const renderFreeSlots = () => {
        const totalFreeSlots = freeSlots.length + lunchSlots.length;
        
        if (totalFreeSlots === 0) {
          return (
            <div className="empty-state">
              No free time today
            </div>
          );
        }

        return (
          <>
            {freeSlots.map((slot, index) => (
              <div key={index} className="card free-card">
                <div className="card-time">{slot}</div>
                <div className="free-label">Free</div>
              </div>
            ))}
            {lunchSlots.map((slot, index) => (
              <div key={`lunch-${index}`} className="card lunch-card">
                <div className="card-time">{slot}</div>
                <div className="lunch-label">Lunch</div>
              </div>
            ))}
          </>
        );
      };

      const renderFullTimetable = () => {
        return (
          <div className="timetable-scroll">
            <table className="timetable">
              <thead>
                <tr>
                  <th>Day</th>
                  {timeSlots.map(slot => (
                    <th key={slot.label}>{slot.label.split('-')[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(daySchedules).map(([day, slots]) => {
                  const renderedSlots = new Set();
                  
                  return (
                    <tr key={day}>
                      <td className="day-header">{day.slice(0, 3)}</td>
                      {timeSlots.map((timeSlot, timeIndex) => {
                        if (renderedSlots.has(timeIndex)) {
                          return null;
                        }

                        const matchingSlot = slots.find(slot => {
                          const [startStr, endStr] = slot.time.split('-');
                          const start = parseTime(startStr.trim());
                          const end = parseTime(endStr.trim());
                          return start <= timeSlot.start && end > timeSlot.start;
                        });

                        if (matchingSlot) {
                          const [startStr, endStr] = matchingSlot.time.split('-');
                          const start = parseTime(startStr.trim());
                          const end = parseTime(endStr.trim());
                          
                          let colspan = 0;
                          for (let i = timeIndex; i < timeSlots.length; i++) {
                            const currentSlot = timeSlots[i];
                            if (start < currentSlot.end && end > currentSlot.start) {
                              colspan++;
                              renderedSlots.add(i); 
                            } else if (colspan > 0) {
                              break; 
                            }
                          }

                          return (
                            <td 
                              key={timeSlot.label} 
                              className="timetable-cell occupied"
                              colSpan={colspan}
                            >
                              <div className="cell-subject">{matchingSlot.subject.split(' ')[0]}</div>
                              <div className="cell-location">{matchingSlot.location}</div>
                            </td>
                          );
                        } else if (timeSlot.isLunch) {
                          renderedSlots.add(timeIndex);
                          return (
                            <td key={timeSlot.label} className="timetable-cell lunch">
                              Lunch
                            </td>
                          );
                        } else {
                          renderedSlots.add(timeIndex);
                          return (
                            <td key={timeSlot.label} className="timetable-cell free">
                              —
                            </td>
                          );
                        }
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      };

      return (
        <div className="container">
          <div className="header">
            <h1>B2 Timetable</h1>
            <button onClick={toggleFullTimetable} className="toggle-btn">
              {showFullTimetable ? 'Hide Weekly' : 'Show Weekly'}
            </button>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat-num">{totalClasses}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat">
              <div className="stat-num">{completedClasses}</div>
              <div className="stat-label">Done</div>
            </div>
            <div className="stat">
              <div className="stat-num">{freeSlots.length + lunchSlots.length}</div>
              <div className="stat-label">Free</div>
            </div>
          </div>

          {(currentClass || nextClass) && (
            <div className="current-status">
              {currentClass && (
                <div className="current-class">
                  Now: {currentClass.subject} • {currentClass.location}
                </div>
              )}
              {nextClass && (
                <div className="next-class">
                  Next: {nextClass.subject} at {nextClass.time.split('-')[0]}
                </div>
              )}
            </div>
          )}

          <div className="main-content">
            <div className="schedule-section section">
              <div className="section-title">Today • {currentDay}</div>
              <div className="section-content">
                <div className="cards">
                  {renderTodaySchedule()}
                </div>
              </div>
            </div>

            <div className="free-time-section section">
              <div className="section-title">Free Time</div>
              <div className="section-content">
                <div className="cards">
                  {renderFreeSlots()}
                </div>
              </div>
            </div>
          </div>

          {showFullTimetable && (
            <div className="timetable-container">
              <div className="section-title" style={{padding: '1.25rem'}}>Weekly Overview</div>
              <div style={{padding: '0 1.25rem 1.25rem'}}>
                {renderFullTimetable()}
              </div>
            </div>
          )}

          <Notification 
            message={notification.message}
            show={notification.show}
            onClose={hideNotification}
          />
        </div>
      );
    };

    ReactDOM.render(<TimetableApp />, document.getElementById('root'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}
