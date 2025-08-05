const { useState, useEffect, useCallback } = React;

const daySchedules = {
  Monday: [
    { time: '9:00-10:00', subject: 'Maths AIDS(T)', location: 'TS16', color: 'lavender' },
    { time: '10:00-11:00', subject: 'Data Structures', location: 'FF6', color: 'blue' },
    { time: '12:00-1:00', subject: 'Computational Theory', location: 'G1', color: 'green' },
    { time: '3:00-5:00', subject: 'DBMS LAB', location: 'CL13', color: 'red' }
  ],
  Tuesday: [
    { time: '9:00-10:00', subject: 'Maths AIDS (Lec)', location: 'FF6', color: 'blue' },
    { time: '10:00-11:00', subject: 'UNIX (Lec)', location: 'CR256', color: 'green' },
    { time: '11:00-12:00', subject: 'Computational Theory', location: 'G3', color: 'red' },
    { time: '2:00-3:00', subject: 'Data Structures', location: 'G1', color: 'blue' },
    { time: '4:00-5:00', subject: 'Economics', location: 'FF6', color: 'green' }
  ],
  Wednesday: [
    { time: '9:00-11:00', subject: 'Data Structures(Lab)', location: 'CL13', color: 'red' },
    { time: '11:00-12:00', subject: 'Data Structures', location: 'FF6', color: 'blue' },
    { time: '12:00-1:00', subject: 'Maths AIDS (Lec)', location: 'G2', color: 'green' }
  ],
  Thursday: [
    { time: '9:00-10:00', subject: 'Computational Theory', location: 'CS4', color: 'lavender' },
    { time: '11:00-12:00', subject: 'Economics', location: 'FF6', color: 'green' },
    { time: '12:00-1:00', subject: 'Economics Tut', location: 'TS6', color: 'blue' },
    { time: '2:00-3:00', subject: 'DBMS', location: 'FF6', color: 'red' },
    { time: '3:00-4:00', subject: 'Maths AIDS', location: 'FF6', color: 'lavender' }
  ],
  Friday: [
    { time: '9:00-11:00', subject: 'UNIX LAB', location: 'CL09', color: 'green' },
    { time: '11:00-12:00', subject: 'Data Structure', location: 'TS10', color: 'blue' },
    { time: '12:00-1:00', subject: 'DBMS', location: 'FF6', color: 'red' },
    { time: '3:00-5:00', subject: 'JAVA LAB', location: 'CL06', color: 'lavender' }
  ]
};

const parseTime = (timeStr) => {
  let [hour, minute] = timeStr.split(':').map(Number);
  if (hour < 7) hour += 12;
  return hour * 60 + minute;
};

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
};

const ScheduleCard = ({ slot, isCurrent }) => {
  const [startStr, endStr] = slot.time.split('-');
  const start = parseTime(startStr.trim());
  const end = parseTime(endStr.trim());
  const remaining = isCurrent ? end - (new Date().getHours() * 60 + new Date().getMinutes()) : null;

  return (
    <div className={`schedule-card ${slot.color} ${isCurrent ? 'current' : ''}`}>
      <p><strong>{slot.time}</strong></p>
      <p>{slot.subject}</p>
      <p>{slot.location}</p>
      {isCurrent && <p>Remaining: {remaining} min</p>}
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="stat-card">
    <div className="stat-number">{value}</div>
    <div>{icon} {title}</div>
  </div>
);

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

const TimetableApp = () => {
  const [darkMode, setDarkMode] = useState(false);
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

  const showNotification = useCallback((message) => {
    setNotification({ show: true, message });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification({ show: false, message: '' });
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.body.classList.toggle('dark-mode', savedDarkMode);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (nextClass && lastNotifiedClass !== nextClass.subject) {
      const [startStr] = nextClass.time.split('-');
      const start = parseTime(startStr.trim());
      const timeUntilNext = start - currentMinutes;

      if (timeUntilNext <= 10 && timeUntilNext > 0) {
        showNotification(`${nextClass.subject} starts in ${timeUntilNext} minutes!`);
        setLastNotifiedClass(nextClass.subject);
      }
    }

    if (currentClass && lastNotifiedClass !== `current-${currentClass.subject}`) {
      showNotification(`${currentClass.subject} is now in session!`);
      setLastNotifiedClass(`current-${currentClass.subject}`);
    }
  }, [currentClass, nextClass, currentMinutes, lastNotifiedClass, showNotification]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    showNotification(`${newDarkMode ? 'Dark' : 'Light'} mode activated!`);
  };

  const toggleFullTimetable = () => {
    setShowFullTimetable(!showFullTimetable);
  };

  const renderTodaySchedule = () => {
    if (todaySlots.length === 0) {
      return <p>No Classes Today! Enjoy your free time!</p>;
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

  const renderTimetableRow = (day, slots) => {
    const timeSlots = [
      { start: 540, end: 600, label: '9:00-10:00' },
      { start: 600, end: 660, label: '10:00-11:00' },
      { start: 660, end: 720, label: '11:00-12:00' },
      { start: 720, end: 780, label: '12:00-1:00' },
      { start: 780, end: 840, label: '1:00-2:00' },
      { start: 840, end: 900, label: '2:00-3:00' },
      { start: 900, end: 960, label: '3:00-4:00' },
      { start: 960, end: 1020, label: '4:00-5:00' }
    ];

    const cells = [];
    let slotIndex = 0;

    for (let i = 0; i < timeSlots.length; i++) {
      const timeSlot = timeSlots[i];
      let found = false;

      for (let j = slotIndex; j < slots.length; j++) {
        const slot = slots[j];
        const [startStr, endStr] = slot.time.split('-');
        const startTime = parseTime(startStr.trim());
        const endTime = parseTime(endStr.trim());

        if (startTime <= timeSlot.start && endTime > timeSlot.start) {
          const duration = endTime - startTime;
          const colspan = Math.ceil(duration / 60);
          
          cells.push(
            <td key={`${day}-${startTime}`} colSpan={colspan} className="schedule-cell">
              <div className={`timetable-card ${slot.color}`}>
                <div className="subject">{slot.subject}</div>
                <div className="location">{slot.location}</div>
                <div className="time">{slot.time}</div>
              </div>
            </td>
          );
          
          i += colspan - 1;
          slotIndex = j + 1;
          found = true;
          break;
        }
      }

      if (!found) {
        cells.push(<td key={`${day}-${timeSlot.start}`} className="empty-cell"></td>);
      }
    }

    return (
      <tr key={day}>
        <td className="day-cell"><strong>{day}</strong></td>
        {cells}
      </tr>
    );
  };

  return (
    <>
      <div className="header">
        <h1>B2 Timetable</h1>
        <div className="button-group">
          <button onClick={toggleDarkMode} className="toggle-btn">
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={toggleFullTimetable} className="toggle-btn">
            {showFullTimetable ? 'Hide Full Timetable' : 'Show Full Timetable'}
          </button>
        </div>
      </div>

      <div className="stats-container">
        <StatCard title="Total Classes Today" value={totalClasses} icon="" />
        <StatCard title="Completed Classes" value={completedClasses} icon="" />
      </div>

      <div id="todayScheduleContainer">
        <h2>Today's Schedule - {currentDay}</h2>
        <div className="schedule-cards">
          {renderTodaySchedule()}
        </div>
        {currentClass && (
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1.1rem' }}>
            Currently in: <strong>{currentClass.subject}</strong> at <strong>{currentClass.location}</strong>
          </div>
        )}
        {nextClass && (
          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '1rem', color: '#666' }}>
            Next: <strong>{nextClass.subject}</strong> at <strong>{nextClass.time}</strong>
          </div>
        )}
      </div>

      {showFullTimetable && (
        <div className="table-container" style={{ display: 'block', marginTop: '2rem' }}>
          <h2>Full Weekly Timetable</h2>
          <div style={{ overflowX: 'auto' }}>
            <table id="fullTimetable" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ minWidth: '100px', padding: '12px', border: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>Day</th>
                  <th style={{ minWidth: '120px', padding: '12px', border: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>9:00-10:00</th>
                  <th style={{ minWidth: '120px', padding: '12px', border: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>10:00-11:00</th>
                  <th style={{ minWidth: '120px', padding: '12px', border: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>11:00-12:00</th>
                  <th style={{ minWidth: '120px', padding: '12px', border: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>12:00-1:00</th>
                  <th style={{ minWidth: '120px', padding: '12px', border: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>1:00-2:00</th>
                  <th style={{ minWidth: '120px', padding: '12px', border: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>2:00-3:00</th>
                  <th style={{ minWidth: '120px', padding: '12px', border: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>3:00-4:00</th>
                  <th style={{ minWidth: '120px', padding: '12px', border: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>4:00-5:00</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(daySchedules).map(([day, slots]) => 
                  renderTimetableRow(day, slots)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Notification 
        message={notification.message}
        show={notification.show}
        onClose={hideNotification}
      />

      <style jsx>{`
        .schedule-cell, .empty-cell, .day-cell {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: center;
          vertical-align: middle;
        }
        
        .day-cell {
          background-color: #f8f9fa;
          font-weight: bold;
          min-width: 100px;
        }
        
        .empty-cell {
          background-color: #fafafa;
          height: 60px;
        }
        
        .timetable-card {
          padding: 8px;
          border-radius: 8px;
          min-height: 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }
        
        .timetable-card.blue { background-color: #e3f2fd; }
        .timetable-card.green { background-color: #e8f5e8; }
        .timetable-card.red { background-color: #ffebee; }
        .timetable-card.lavender { background-color: #f3e5f5; }
        
        .timetable-card .subject {
          font-weight: bold;     
          font-size: 0.9rem;
          margin-bottom: 4px;
        }
        
        .timetable-card .location {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 2px;
        }
        
        .timetable-card .time {
          font-size: 0.7rem;
          color: #888;
        }
        
        .table-container {
          margin-top: 2rem;
        }
        
        .toggle-btn {
          padding: 8px 16px;
          margin: 0 4px;
          border: none;
          border-radius: 4px;
          background-color: #007bff;
          color: white;
          cursor: pointer;
        }
        
        .toggle-btn:hover {
          background-color: #0056b3;
        }
      `}</style>
    </>
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
