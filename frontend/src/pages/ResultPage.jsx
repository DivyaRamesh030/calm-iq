import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import styles from './ResultPage.module.css'

export default function ResultPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state?.result

  useEffect(() => {
    if (!result) navigate('/log')
  }, [result, navigate])

  if (!result) return null

  const factors = (() => {
    try { return typeof result.factors === 'string' ? JSON.parse(result.factors) : result.factors }
    catch { return [] }
  })()

  const recs = (() => {
    try { return typeof result.recommendations === 'string' ? JSON.parse(result.recommendations) : result.recommendations }
    catch { return [] }
  })()

  const ringClass = result.stress_level === 'Low' ? styles.ringLow
    : result.stress_level === 'Medium' ? styles.ringMed : styles.ringHigh

  const levelColor = result.stress_level === 'Low' ? 'var(--low)'
    : result.stress_level === 'Medium' ? 'var(--med)' : 'var(--high)'

  return (
    <div className={`${styles.page} fade-in`}>
      {/* Hero */}
      <div className={`${styles.hero} card`}>
        <div className={`${styles.ring} ${ringClass}`}>
          <span className={styles.ringScore}>{Math.round(result.stress_score)}</span>
          <span className={styles.ringLabel}>/ 100</span>
        </div>
        <div className={styles.heroInfo}>
          <div className={styles.heroTag}>Today's stress level</div>
          <h1 className={styles.heroLevel} style={{ color: levelColor }}>
            {result.stress_level} Stress
          </h1>
          <p className={styles.heroSummary}>{result.summary}</p>
        </div>
      </div>

      {/* Insights grid */}
      <div className={styles.insightsGrid}>
        {/* Factors */}
        <div className="card">
          <div className={styles.cardTitle}>Key contributing factors</div>
          {factors.length > 0 ? factors.map((f, i) => (
            <div key={i} className={styles.factorRow}>
              <span className={styles.factorLabel}>{f.label}</span>
              <div className={styles.barWrap}>
                <div className={styles.bar} style={{ width: `${f.pct}%` }} />
              </div>
              <span className={styles.factorPct}>{f.pct}%</span>
            </div>
          )) : (
            <p className={styles.noFactors}>No significant stressors detected — great job!</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className={styles.cardTitle}>Personalised recommendations</div>
          {recs.map((r, i) => (
            <div key={i} className={styles.recItem}>
              <div className={styles.recIcon}>{r.icon}</div>
              <div>
                <div className={styles.recTitle}>{r.title}</div>
                <div className={styles.recText}>{r.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics summary */}
      <div className="card">
        <div className={styles.cardTitle}>Your logged metrics</div>
        <div className={styles.metricsGrid}>
          {[
            { label: 'Sleep', val: `${result.sleep_duration}h`, icon: '🌙' },
            { label: 'Work hours', val: `${result.work_hours}h`, icon: '💼' },
            { label: 'Mood', val: `${result.mood_level}/10`, icon: '😊' },
            { label: 'Screen time', val: `${result.screen_time}h`, icon: '📱' },
            { label: 'Activity', val: `${result.physical_activity}min`, icon: '🏃' },
            { label: 'Heart rate', val: `${result.heart_rate}bpm`, icon: '❤️' },
            { label: 'SpO₂', val: `${result.spo2}%`, icon: '🩺' },
          ].map(m => (
            <div key={m.label} className={styles.metricChip}>
              <span className={styles.metricIcon}>{m.icon}</span>
              <span className={styles.metricVal}>{m.val}</span>
              <span className={styles.metricLabel}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <Link to="/history" className="btn btn-dark">View My History →</Link>
        <Link to="/log" className="btn btn-outline">Log Again</Link>
      </div>
    </div>
  )
}
