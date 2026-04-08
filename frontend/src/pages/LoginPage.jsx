import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createUser, getUserByEmail } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', age: '', occupation: '' })
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // 'login' | 'register'

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.email.trim()) { toast.error('Email is required'); return }
    setLoading(true)
    try {
      if (mode === 'login') {
        const user = await getUserByEmail(form.email.trim())
        login(user)
        toast.success(`Welcome back, ${user.name}!`)
        navigate('/log')
      } else {
        if (!form.name.trim()) { toast.error('Name is required'); return }
        const user = await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          age: form.age ? parseInt(form.age) : null,
          occupation: form.occupation.trim() || null,
        })
        login(user)
        toast.success(`Profile created! Welcome, ${user.name}!`)
        navigate('/log')
      }
    } catch (err) {
      if (err.response?.status === 404) toast.error('No account found. Please register.')
      else if (err.response?.status === 409) toast.error('Email already registered. Please log in.')
      else toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.headline}>Understand your stress.<br /><em>Act on it.</em></h1>
        <p className={styles.sub}>
          Log your daily lifestyle data and get ML-powered stress predictions,
          personalised insights, and actionable recommendations — all in one place.
        </p>
        <div className={styles.features}>
          {['🌙 Sleep analysis', '❤️ Heart rate tracking', '🧠 ML predictions', '📈 Trend visualisation'].map(f => (
            <span key={f} className={styles.featurePill}>{f}</span>
          ))}
        </div>
      </div>

      <div className={styles.formWrap}>
        <div className={styles.card}>
          <div className={styles.modeTabs}>
            <button className={`${styles.modeTab} ${mode === 'login' ? styles.modeActive : ''}`} onClick={() => setMode('login')}>Sign in</button>
            <button className={`${styles.modeTab} ${mode === 'register' ? styles.modeActive : ''}`} onClick={() => setMode('register')}>Create account</button>
          </div>

          {mode === 'register' && (
            <div className={styles.field}>
              <label>Full name</label>
              <input type="text" placeholder="e.g. Priya Sharma" value={form.name} onChange={set('name')} />
            </div>
          )}

          <div className={styles.field}>
            <label>Email address</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {mode === 'register' && (
            <>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>Age <span>(optional)</span></label>
                  <input type="number" placeholder="28" min="10" max="100" value={form.age} onChange={set('age')} />
                </div>
                <div className={styles.field}>
                  <label>Occupation <span>(optional)</span></label>
                  <input type="text" placeholder="Software Engineer" value={form.occupation} onChange={set('occupation')} />
                </div>
              </div>
            </>
          )}

          <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in →' : 'Create account →'}
          </button>
        </div>
      </div>
    </div>
  )
}
