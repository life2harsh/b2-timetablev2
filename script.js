const { useState, useEffect, useCallback } = React;

const daySchedules = {
  Monday: [
    { time: '9:00-10:50', subject: 'Life Skills', location: 'CL12', color: 'lavender' },
    { time: '1:00-1:50', subject: 'Mathematics-2', location: 'G5', color: 'blue' },
    { time: '2:00-2:50', subject: 'UHV', location: 'G1', color: 'green' },
    { time: '3:00-3:50', subject: 'Physics-2', location: 'G1', color: 'blue' }
  ],
  Tuesday: [
    { time: '10:00-10:50', subject: 'Mathematics-2', location: 'G2', color: 'blue' },
    { time: '11:00-11:50', subject: 'SDF', location: 'TS8', color: 'red' },
    { time: '1:00-2:50', subject: 'Physics Lab-2', location: 'PL2', color: 'lavender' }
  ],
  Wednesday: [
    { time: '10:00-10:50', subject: 'UHV', location: 'TS12', color: 'red' },
    { time: '11:00-11:50', subject: 'Physics-2', location: 'TS12', color: 'red' },
    { time: '3:00-3:50', subject: 'Mathematics-2', location: 'G3', color: 'blue' },
    { time: '4:00-4:50', subject: 'SDF', location: 'G1', color: 'blue' }
  ],
  Thursday: [
    { time: '11:00-11:50', subject: 'Mathematics-2', location: 'TS10', color: 'red' },
    { time: '2:00-4:50', subject: 'Engineering Drawing and Design', location: 'CAD2', color: 'lavender' }
  ],
  Friday: [
    { time: '9:00-9:50', subject: 'Physics-2', location: 'G3', color: 'blue' },
    { time: '10:00-10:50', subject: 'UHV', location: 'G3', color: 'green' },
    { time: '3:00-3:50', subject: 'SDF', location: 'G3', color: 'blue' }
  ],
  Saturday: [
    { time: '9:00-9:50', subject: 'SDF', location: 'G3', color: 'blue' },
    { time: '10:00-10:50', subject: 'Physics-2', location: 'G3', color: 'blue' },
    { time: '11:00-12:50', subject: 'SDF Lab', location: 'CL02', color: 'lavender' }
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
        showNotification(`⏰ ${nextClass.subject} starts in ${timeUntilNext} minutes!`);
        setLastNotifiedClass(nextClass.subject);
      }
    }

    if (currentClass && lastNotifiedClass !== `current-${currentClass.subject}`) {
      showNotification(`📚 ${currentClass.subject} is now in session!`);
      setLastNotifiedClass(`current-${currentClass.subject}`);
    }
  }, [currentClass, nextClass, currentMinutes, lastNotifiedClass, showNotification]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    showNotification(`${newDarkMode ? '🌙' : '☀️'} ${newDarkMode ? 'Dark' : 'Light'} mode activated!`);
  };

  const toggleFullTimetable = () => {
    setShowFullTimetable(!showFullTimetable);
    setTimeout(() => {
      const table = document.getElementById('fullTimetable');
      if (table) {
        table.classList.toggle('visible', !showFullTimetable);
      }
    }, 50);
  };

  const renderTodaySchedule = () => {
    if (todaySlots.length === 0) {
      return <p>🎉 No Classes Today! Enjoy your free time!</p>;
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
      '9:00-9:50', '10:00-10:50', '11:00-11:50', '12:00-12:50',
      '1:00-1:50', '2:00-2:50', '3:00-3:50', '4:00-4:50'
    ];

    return (
      <tr key={day}>
        <td><strong>{day}</strong></td>
        {timeSlots.map((timeSlot, index) => {
          const matchingSlot = slots.find(slot => slot.time === timeSlot);
          const multiSlot = slots.find(slot => slot.time.includes(timeSlot.split('-')[0]));

          if (matchingSlot) {
            return (
              <td key={index}>
                <div className={`card ${matchingSlot.color}`}>
                  <p>{matchingSlot.subject}</p>
                  <p>{matchingSlot.location}</p>
                </div>
              </td>
            );
          } else if (multiSlot && multiSlot.time.includes('-')) {
            const [start, end] = multiSlot.time.split('-');
            const startTime = parseTime(start.trim());
            const endTime = parseTime(end.trim());
            const currentTime = parseTime(timeSlot.split('-')[0]);

            if (currentTime >= startTime && currentTime < endTime) {
              const colspan = Math.ceil((endTime - startTime) / 50);
              return (
                <td key={index} colSpan={colspan}>
                  <div className={`card ${multiSlot.color}`}>
                    <p>{multiSlot.subject}</p>
                    <p>{multiSlot.location}</p>
                  </div>
                </td>
              );
            }
          }

          return <td key={index}></td>;
        })}
      </tr>
    );
  };

  return (
    <>
      <div className="header">
        <h1>📚 B2 Timetable</h1>
        <div className="button-group">
          <button onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'} Toggle {darkMode ? 'Light' : 'Dark'} Mode
          </button>
          <button onClick={toggleFullTimetable}>
            📅 {showFullTimetable ? 'HIDE' : 'SHOW'} FULL TIMETABLE
          </button>
        </div>
      </div>

      <div className="stats-container">
        <StatCard title="Total Classes Today" value={totalClasses} icon="📊" />
        <StatCard title="Completed Classes" value={completedClasses} icon="✅" />
      </div>

      <div id="todayScheduleContainer">
        <h2>🎯 Today's Schedule - {currentDay}</h2>
        <div className="schedule-cards">
          {renderTodaySchedule()}
        </div>
        {currentClass && (
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1.1rem' }}>
            📍 Currently in: <strong>{currentClass.subject}</strong> at <strong>{currentClass.location}</strong>
          </div>
        )}
        {nextClass && (
          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '1rem', color: '#666' }}>
            ⏭️ Next: <strong>{nextClass.subject}</strong> at <strong>{nextClass.time}</strong>
          </div>
        )}
      </div>

      <div className="table-container">
        <table id="fullTimetable">
          <thead>
            <tr>
              <th>Day</th>
              <th>9:00-9:50</th>
              <th>10:00-10:50</th>
              <th>11:00-11:50</th>
              <th>12:00-12:50</th>
              <th>1:00-1:50</th>
              <th>2:00-2:50</th>
              <th>3:00-3:50</th>
              <th>4:00-4:50</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(daySchedules).map(([day, slots]) => 
              renderTimetableRow(day, slots)
            )}
          </tbody>
        </table>
      </div>

      <Notification 
        message={notification.message}
        show={notification.show}
        onClose={hideNotification}
      />
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