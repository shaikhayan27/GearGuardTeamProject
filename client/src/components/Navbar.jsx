import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>⚙️ GearGuard</span>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Equipment</Link>
        <Link to="/teams" style={styles.link}>Teams</Link>
        <Link to="/kanban" style={styles.link}>Kanban</Link>
        <Link to="/calendar" style={styles.link}>Calendar</Link>
        <Link to="/requests" style={styles.link}>Requests</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 24px', background: '#1e1e2e', color: 'white',
  },
  brand: { fontWeight: 'bold', fontSize: '1.2rem' },
  links: { display: 'flex', gap: '24px' },
  link: { color: '#a0aec0', textDecoration: 'none', fontSize: '0.95rem' },
};