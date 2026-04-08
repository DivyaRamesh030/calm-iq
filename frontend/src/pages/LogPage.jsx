import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { predictStress } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import styles from './LogPage.module.css'

const FIELDS = [
  { id: 'sleep_duration',    icon: '🌙', name: 'Sleep duration',        unit: 'hrs', min: 0,  max: 12,  step: 0.5, def: 7,  desc: 'Hours slept last night' },
  { id: 'work_hours',        icon: '💼', name: 'Work hours',            unit: 'hrs', min: 0,  max: 16,  step: 0.5, def: 8,  desc: 'Hours worked today' },
  { id: 'mood_level',        icon: '😊', name: 'Mood level',            unit: '/4', min: 0,  max: 4,  step: 1,   def: 2,  desc: '0 = very Bad· 1=Bad· 2=Neutral· 3=Good· 4=very Good' },
  { id: 'screen_time',       icon: '📱', name: 'Screen time',           unit: 'hrs', min: 0,  max: 16,  step: 0.5, def: 5,  desc: 'Total screen hours' },
  { id: 'physical_activity', icon: '🏃', name: 'Physical activity',     unit: 'min', min: 0,  max: 180, step: 5,   def: 30, desc: 'Minutes of exercise' },
  { id: 'heart_rate',        icon: '❤️', name: 'Heart rate',            unit: 'bpm', min: 40, max: 140, step: 1,   def: 72, desc: 'Resting heart rate' },
  { id: 'spo2',              icon: '🩺', name: 'Blood oxygen (SpO₂)',   unit: '%',   min: 85, max: 100, step: 0.5, def: 98, desc: 'Oxygen saturation level' },
]

export default function LogPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState(() =>
    Object.fromEntries(FIELDS.map(f => [f.id, f.def]))
  )
  const [loading, setLoading] = useState(false)

  const handleChange = (id, val) => setValues(v => ({ ...v, [id]: parseFloat(val) }))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await predictStress(user.id, values)
      navigate('/result', { state: { result } })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Prediction failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>How are you today?</h1>
        <p>Adjust each slider to reflect your day, then analyse your stress level.</p>
      </div>

      <div className={styles.grid}>
        {FIELDS.map(f => (
          <div key={f.id} className={styles.fieldCard}>
            <div className={styles.fieldIcon}>{f.icon}</div>
            <div className={styles.fieldDesc}>{f.desc}</div>
            <div className={styles.fieldName}>{f.name}</div>
            <div className={styles.sliderRow}>
              <input
                type="range"
                min={f.min} max={f.max} step={f.step}
                value={values[f.id]}
                onChange={e => handleChange(f.id, e.target.value)}
              />
              <span className={styles.valBadge}>
                {values[f.id]}{f.unit}
              </span>
            </div>
            <div className={styles.rangeLabels}>
              <span>{f.min}{f.unit}</span>
              <span>{f.max}{f.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.submitBar}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: '14px 40px', fontSize: '15px' }}
        >
          {loading ? (
            <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, marginRight: 8 }} /> Analysing…</>
          ) : 'Analyse My Stress →'}
        </button>
      </div>
    </div>
  )
}
