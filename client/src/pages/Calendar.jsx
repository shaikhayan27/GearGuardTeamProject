import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getRequests } from '../api';

const localizer = dayjsLocalizer(dayjs);

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPreventive();
  }, []);

  async function fetchPreventive() {
    try {
      const { data } = await getRequests();
      // Only show preventive requests on the calendar
      const preventive = data
        .filter(r => r.type === 'preventive' && r.scheduled_date)
        .map(r => ({
          id: r.id,
          title: `🔧 ${r.subject} — ${r.equipment_name || ''}`,
          start: new Date(r.scheduled_date),
          end: new Date(r.scheduled_date),
          resource: r,
        }));
      setEvents(preventive);
    } catch (err) {
      setError('Failed to load calendar');
    }
  }

  function handleSelectEvent(event) {
    const r = event.resource;
    alert(
      `Subject: ${r.subject}\nEquipment: ${r.equipment_name || '—'}\nTeam: ${r.team_name || '—'}\nStage: ${r.stage}`
    );
  }

  return (
    <div>
      <h2 style={styles.heading}>Maintenance Calendar</h2>
      <p style={styles.sub}>Showing all Preventive maintenance requests</p>
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.calendarWrap}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={() => ({
            style: {
              background: '#4f46e5',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
            },
          })}
        />
      </div>
    </div>
  );
}

const styles = {
  heading: { marginBottom: '4px', fontSize: '1.5rem' },
  sub: { color: '#718096', marginBottom: '20px', fontSize: '0.9rem' },
  error: { color: 'red', marginBottom: '12px' },
  calendarWrap: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
};