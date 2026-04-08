import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = user
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const isActive = (path) => location.pathname === path

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        calm<span>·IQ</span>
      </Link>

      {user && (
        <div className={styles.tabs}>
          <Link to="/log"     className={`${styles.tab} ${isActive('/log')     ? styles.active : ''}`}>Log Today</Link>
          <Link to="/history" className={`${styles.tab} ${isActive('/history') ? styles.active : ''}`}>History</Link>
        </div>
      )}

      <div className={styles.right}>
        {user ? (
          <>
            <div className={styles.avatar}>{initials}</div>
            <span className={styles.userName}>{user.name}</span>
            <button className={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
          </>
        ) : (
          <span className={styles.tagline}>Your stress, understood.</span>
        )}
      </div>
    </nav>
  )
}
