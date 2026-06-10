import { useEffect, useState } from 'react';
import { getEquipment, getRequests, createRequest, getMembers } from '../api';

const empty = {
  subject: '',
  type: 'corrective',
  equipment_id: '',
  team_id: '',
  team_name: '',
  assigned_to: '',
  scheduled_date: '',
};

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [eq, req] = await Promise.all([getEquipment(), getRequests()]);
      setEquipment(eq.data);
      setRequests(req.data);
    } catch (err) {
      setError('Failed to load data');
    }
  }

  // AUTO-FILL LOGIC — when equipment is selected, fetch its team automatically
  async function handleEquipmentChange(e) {
    const equipmentId = e.target.value;
    if (!equipmentId) {
      setForm({ ...form, equipment_id: '', team_id: '', team_name: '' });
      setMembers([]);
      return;
    }

    const selected = equipment.find(eq => eq.id === parseInt(equipmentId));
    setForm({
      ...form,
      equipment_id: equipmentId,
      team_id: selected?.team_id || '',
      team_name: selected?.team_name || '',
    });

    // Fetch members of that team for the assignment dropdown
    if (selected?.team_id) {
      try {
        const { data } = await getMembers(selected.team_id);
        setMembers(data.members || []);
      } catch (err) {
        setMembers([]);
      }
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.subject || !form.equipment_id) {
      setError('Subject and Equipment are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createRequest(form);
      setForm(empty);
      setMembers([]);
      fetchAll();
    } catch (err) {
      setError('Failed to create request');
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 style={styles.heading}>Maintenance Requests</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3 style={{ marginBottom: '12px' }}>New Request</h3>
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.grid}>
          <input
            name="subject"
            placeholder="Subject e.g. Leaking Oil *"
            value={form.subject}
            onChange={handleChange}
            style={styles.input}
          />

          {/* Equipment dropdown */}
          <select
            name="equipment_id"
            value={form.equipment_id}
            onChange={handleEquipmentChange}
            style={styles.input}>
            <option value="">Select Equipment *</option>
            {equipment.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>

          {/* Auto-filled team — read only */}
          <input
            placeholder="Maintenance Team (auto-filled)"
            value={form.team_name}
            readOnly
            style={{ ...styles.input, background: '#f0f0f0', cursor: 'not-allowed' }}
          />

          {/* Type */}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            style={styles.input}>
            <option value="corrective">Corrective (Breakdown)</option>
            <option value="preventive">Preventive (Routine Checkup)</option>
          </select>

          {/* Assigned to — only shows after equipment is picked */}
          <select
            name="assigned_to"
            value={form.assigned_to}
            onChange={handleChange}
            style={styles.input}
            disabled={members.length === 0}>
            <option value="">
              {members.length === 0 ? 'Select equipment first' : 'Assign Technician'}
            </option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Scheduled date — required for preventive */}
          <input
            name="scheduled_date"
            type="date"
            value={form.scheduled_date}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? 'Creating...' : 'Create Request'}
        </button>
      </form>

      {/* Requests Table */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th style={styles.th}>Subject</th>
            <th style={styles.th}>Equipment</th>
            <th style={styles.th}>Team</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Stage</th>
            <th style={styles.th}>Assigned To</th>
            <th style={styles.th}>Scheduled</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id} style={styles.row}>
              <td style={styles.td}>{r.subject}</td>
              <td style={styles.td}>{r.equipment_name || '—'}</td>
              <td style={styles.td}>{r.team_name || '—'}</td>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge,
                  background: r.type === 'corrective' ? '#fed7d7' : '#c6f6d5',
                  color: r.type === 'corrective' ? '#c53030' : '#276749',
                }}>
                  {r.type}
                </span>
              </td>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge,
                  background: stageColor(r.stage).bg,
                  color: stageColor(r.stage).text,
                }}>
                  {r.stage}
                </span>
              </td>
              <td style={styles.td}>{r.assigned_to_name || '—'}</td>
              <td style={styles.td}>{r.scheduled_date
                ? r.scheduled_date.slice(0, 10) : '—'}
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '16px', color: '#999' }}>
                No requests yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function stageColor(stage) {
  const map = {
    new:         { bg: '#ebf8ff', text: '#2b6cb0' },
    in_progress: { bg: '#fefcbf', text: '#975a16' },
    repaired:    { bg: '#c6f6d5', text: '#276749' },
    scrap:       { bg: '#fed7d7', text: '#c53030' },
  };
  return map[stage] || { bg: '#eee', text: '#333' };
}

const styles = {
  heading: { marginBottom: '20px', fontSize: '1.5rem' },
  form: {
    background: '#f7f7f7', padding: '20px',
    borderRadius: '8px', marginBottom: '32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px', marginBottom: '16px',
  },
  input: {
    padding: '8px 12px', borderRadius: '6px',
    border: '1px solid #ccc', fontSize: '0.9rem', width: '100%',
  },
  btn: {
    padding: '10px 24px', background: '#4f46e5', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem',
  },
  error: { color: 'red', marginBottom: '8px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#1e1e2e', color: 'white' },
  th: { padding: '10px 12px', textAlign: 'left', fontWeight: '600' },
  row: { borderBottom: '1px solid #eee' },
  td: { padding: '10px 12px', fontSize: '0.9rem' },
  badge: {
    padding: '2px 10px', borderRadius: '999px',
    fontSize: '0.78rem', fontWeight: '600',
  },
};