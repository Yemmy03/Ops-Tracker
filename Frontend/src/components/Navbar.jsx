import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        <div style={styles.brand}>
          <h2 style={styles.logo}>Ops Tracker</h2>
        </div>
        <div style={styles.userSection}>
          <span style={styles.userName}>{user?.name || user?.email}</span>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: '1rem 0',
    boxShadow: 'var(--shadow-md)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-lg)',
  },
  userName: {
    fontWeight: 500,
    fontSize: '0.9375rem',
  },
};

export default Navbar;
