import { useEffect, useState } from 'react';
import { getTeams, createTeam, deleteTeam } from '../api';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [teamForm, setTeamForm] = useState({ name: '' });
  const [memberForms, setMemberForms] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    try {
      // Fetch all teams then fetch members for each
      const { data } = await getTeams();
      const teamsWithMembers = await Promise.all(
        data.map(async (team) => {
          const res = await API.get(`/teams/${team.id}`);
          return res.data;
        })
      );
      setTeams(teamsWithMembers);
    } catch (err) {
      setError('Failed to load teams');
    }
  }

  async function handleAddTeam(e) {
    e.preventDefault();
    if (!teamForm.name.trim()) return;
    try {
      await createTeam({ name: teamForm.name });
      setTeamForm({ name: '' });
      fetchTeams();
    } catch (err) {
      setError('Failed to create team');
    }
  }

  async function handleDeleteTeam(id) {
    if (!window.confirm('Delete this team?')) return;
    try {
      await deleteTeam(id);
      fetchTeams();
    } catch (err) {
      setError('Failed to delete team');
    }
  }

  async function handleAddMember(e, teamId) {
    e.preventDefault();
    const name = memberForms[teamId]?.trim();
    if (!name) return;
    try {
      await API.post(`/teams/${teamId}/members`, { name });
      setMemberForms({ ...memberForms, [teamId]: '' });
      fetchTeams();
    } catch (err) {
      setError('Failed to add member');
    }
  }

  return (
    <div>
      <h2 style={styles.heading}>Maintenance Teams</h2>

      {/* Add Team Form */}
      <form onSubmit={handleAddTeam} style={styles.form}>
        <h3 style={{ marginBottom: '12px' }}>Create New Team</h3>
        {error && <p style={styles.error}>{error}</p>}
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            placeholder="Team Name (e.g. Mechanics)"
            value={teamForm.name}
            onChange={e => setTeamForm({ name: e.target.value })}
            style={styles.input}
          />
          <button type="submit" style={styles.btn}>Add Team</button>
        </div>
      </form>

      {/* Teams Grid */}
      <div style={styles.grid}>
        {teams.map(team => (
          <div key={team.id} style={styles.card}>

            {/* Team Header */}
            <div style={styles.cardHeader}>
              <h3 style={{ margin: 0 }}>{team.name}</h3>
              <button
                onClick={() => handleDeleteTeam(team.id)}
                style={styles.deleteBtn}>
                Delete
              </button>
            </div>

            {/* Members List */}
            <ul style={styles.memberList}>
              {team.members?.length > 0
                ? team.members.map(m => (
                    <li key={m.id} style={styles.memberItem}>
                      👤 {m.name}
                    </li>
                  ))
                : <li style={{ color: '#999', fontSize: '0.85rem' }}>No members yet</li>
              }
            </ul>

            {/* Add Member Form */}
            <form
              onSubmit={e => handleAddMember(e, team.id)}
              style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input
                placeholder="Add member name"
                value={memberForms[team.id] || ''}
                onChange={e => setMemberForms({
                  ...memberForms,
                  [team.id]: e.target.value
                })}
                style={{ ...styles.input, fontSize: '0.85rem' }}
              />
              <button type="submit" style={styles.smallBtn}>Add</button>
            </form>

          </div>
        ))}

        {teams.length === 0 && (
          <p style={{ color: '#999' }}>No teams yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  heading: { marginBottom: '20px', fontSize: '1.5rem' },
  form: {
    background: '#f7f7f7', padding: '20px',
    borderRadius: '8px', marginBottom: '32px',
  },
  input: {
    padding: '8px 12px', borderRadius: '6px',
    border: '1px solid #ccc', fontSize: '0.9rem', flex: 1,
  },
  btn: {
    padding: '8px 20px', background: '#4f46e5', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
  },
  smallBtn: {
    padding: '6px 14px', background: '#4f46e5', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
  },
  deleteBtn: {
    padding: '4px 10px', background: '#e53e3e', color: 'white',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
  },
  error: { color: 'red', marginBottom: '8px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'white', border: '1px solid #e2e8f0',
    borderRadius: '8px', padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px',
  },
  memberList: {
    listStyle: 'none', padding: 0, margin: 0,
    borderTop: '1px solid #eee', paddingTop: '10px',
  },
  memberItem: {
    padding: '6px 0', fontSize: '0.9rem',
    borderBottom: '1px solid #f5f5f5',
  },
};