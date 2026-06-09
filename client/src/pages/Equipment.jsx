import { useEffect, useState } from 'react';
import { getEquipment, createEquipment, deleteEquipment, getTeams } from '../api';

const empty = {
  name: '', serial_number: '', department: '',
  employee_name: '', location: '', purchase_date: '',
  warranty_info: '', team_id: '',
};

export default function Equipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load equipment and teams on mount
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [eq, tm] = await Promise.all([getEquipment(), getTeams()]);
      setEquipmentList(eq.data);
      setTeams(tm.data);
    } catch (err) {
      setError('Failed to load data');
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.serial_number) {
      setError('Name and Serial Number are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createEquipment(form);
      setForm(empty);
      fetchAll();
    } catch (err) {
      setError('Failed to create equipment');
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this equipment?')) return;
    try {
      await deleteEquipment(id);
      fetchAll();
    } catch (err) {
      setError('Failed to delete');
    }
  }

  return (
    <div>
      <h2 style={styles.heading}>Equipment</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3 style={{ marginBottom: '12px' }}>Add New Equipment</h3>
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.grid}>
          <input name="name" placeholder="Equipment Name *"
            value={form.name} onChange={handleChange} style={styles.input} />
          <input name="serial_number" placeholder="Serial Number *"
            value={form.serial_number} onChange={handleChange} style={styles.input} />
          <input name="department" placeholder="Department"
            value={form.department} onChange={handleChange} style={styles.input} />
          <input name="employee_name" placeholder="Assigned Employee"
            value={form.employee_name} onChange={handleChange} style={styles.input} />
          <input name="location" placeholder="Location"
            value={form.location} onChange={handleChange} style={styles.input} />
          <input name="purchase_date" type="date"
            value={form.purchase_date} onChange={handleChange} style={styles.input} />
          <input name="warranty_info" placeholder="Warranty Info"
            value={form.warranty_info} onChange={handleChange} style={styles.input} />

          {/* Team dropdown — pulls from DB */}
          <select name="team_id" value={form.team_id}
            onChange={handleChange} style={styles.input}>
            <option value="">Select Maintenance Team</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? 'Adding...' : 'Add Equipment'}
        </button>
      </form>

      {/* Table */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th>Name</th>
            <th>Serial No.</th>
            <th>Department</th>
            <th>Location</th>
            <th>Team</th>
            <th>Scrapped</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipmentList.map(eq => (
            <tr key={eq.id} style={styles.row}>
              <td>{eq.name}</td>
              <td>{eq.serial_number}</td>
              <td>{eq.department || '—'}</td>
              <td>{eq.location || '—'}</td>
              <td>{eq.team_name || '—'}</td>
              <td style={{ color: eq.is_scrapped ? 'red' : 'green' }}>
                {eq.is_scrapped ? 'Yes' : 'No'}
              </td>
              <td>
                <button onClick={() => handleDelete(eq.id)} style={styles.deleteBtn}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {equipmentList.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '16px' }}>
              No equipment yet
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  heading: { marginBottom: '20px', fontSize: '1.5rem' },
  form: {
    background: '#f7f7f7', padding: '20px',
    borderRadius: '8px', marginBottom: '32px',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
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
  row: { borderBottom: '1px solid #eee', padding: '8px' },
  deleteBtn: {
    padding: '4px 12px', background: '#e53e3e', color: 'white',
    border: 'none', borderRadius: '4px', cursor: 'pointer',
  },
};