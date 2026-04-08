import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Line, Doughnut, Radar, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale,
  Tooltip, Legend, Filler
} from 'chart.js'
import { format } from 'date-fns'
import { getUserLogs, getStats, getTrend, deleteLog } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import styles from './HistoryPage.module.css'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale,
  Tooltip, Legend, Filler
)

const LEVEL_COLORS = { Low: '#2D6A4F', Medium: '#B08A2E', High: '#C4540A' }

export default function HistoryPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [l, s, t] = await Promise.all([
        getUserLogs(user.id, 30),
        getStats(user.id),
        getTrend(user.id, 14),
      ])
      setLogs(l)
      setStats(s)
      setTrend(t)
    } catch { toast.error('Failed to load history') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [user.id])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try {
      await deleteLog(id)
      toast.success('Record deleted')
      fetchAll()
    } catch { toast.error('Delete failed') }
  }

  if (loading) return (
    <div className={styles.loading}>
      <div className="spinner" />
      <p>Loading your history…</p>
    </div>
  )

  // Chart data
  const trendLabels = trend.map(t => format(new Date(t.date), 'd MMM'))
  const trendScores = trend.map(t => t.score)
  const trendColors = trend.map(t => LEVEL_COLORS[t.level])

  const trendData = {
    labels: trendLabels,
    datasets: [{
      data: trendScores,
      borderColor: '#C4540A',
      backgroundColor: 'rgba(196,84,10,0.08)',
      pointBackgroundColor: trendColors,
      pointRadius: 5,
      tension: 0.35,
      fill: true,
    }]
  }

  const pieData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [{
      data: [stats?.low || 0, stats?.medium || 0, stats?.high || 0],
      backgroundColor: ['#2D6A4F', '#B08A2E', '#C4540A'],
      borderWidth: 0,
    }]
  }

  const avgMetric = (key) => {
    if (!logs.length) return 0
    return logs.reduce((a, l) => a + (l[key] || 0), 0) / logs.length
  }

  const radarData = {
    labels: ['Sleep', 'Mood', 'Activity', 'SpO₂', 'HR (inv)'],
    datasets: [{
      data: [
        Math.round(avgMetric('sleep_duration') / 12 * 100),
        Math.round(avgMetric('mood_level') / 10 * 100),
        Math.round(avgMetric('physical_activity') / 90 * 100),
        Math.round((avgMetric('spo2') - 85) / 15 * 100),
        Math.round((140 - avgMetric('heart_rate')) / 100 * 100),
      ],
      borderColor: '#1D3557',
      backgroundColor: 'rgba(29,53,87,0.12)',
      pointBackgroundColor: '#1D3557',
      pointRadius: 3,
      borderWidth: 2,
    }]
  }

  const chartOpts = (yMax = 100) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: yMax, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, color: '#6B6459' } },
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#6B6459', maxRotation: 45, autoSkip: false } },
    }
  })

  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.header}>
        <div>
          <h1>Your Stress Journal</h1>
          <p>{user.name} · {user.occupation || '—'} · {stats?.total || 0} records</p>
        </div>
        <Link to="/log" className="btn btn-primary">+ Log Today</Link>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { label: 'Total entries', val: stats?.total || 0, sub: 'logged days' },
          { label: 'Avg stress score', val: stats?.avg_score || 0, sub: 'out of 100' },
          { label: 'Low stress days', val: stats?.low || 0, sub: `${stats?.total ? Math.round((stats.low/stats.total)*100) : 0}% of entries`, color: 'var(--low)' },
          { label: 'High stress days', val: stats?.high || 0, sub: `${stats?.total ? Math.round((stats.high/stats.total)*100) : 0}% of entries`, color: 'var(--high)' },
        ].map(s => (
          <div key={s.label} className={`${styles.statCard} card`}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statVal} style={s.color ? { color: s.color } : {}}>{s.val}</div>
            <div className={styles.statSub}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      {stats?.total > 0 ? (
        <>
          <div className="card">
            <div className={styles.chartTitle}>Stress score — last 14 days</div>
            <div className={styles.chartWrap} style={{ height: 200 }}>
              <Line data={trendData} options={chartOpts()} />
            </div>
          </div>

          <div className={styles.chartsRow}>
            <div className="card">
              <div className={styles.chartTitle}>Distribution by level</div>
              <div className={styles.chartLegend}>
                {['Low','Medium','High'].map(l => (
                  <span key={l} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: LEVEL_COLORS[l] }} />
                    {l} {stats?.[l.toLowerCase()] || 0}
                  </span>
                ))}
              </div>
              <div className={styles.chartWrap} style={{ height: 160 }}>
                <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '65%' }} />
              </div>
            </div>
            <div className="card">
              <div className={styles.chartTitle}>Wellness radar (averages)</div>
              <div className={styles.chartWrap} style={{ height: 190 }}>
                <Radar data={radarData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: 'rgba(0,0,0,0.08)' }, pointLabels: { font: { size: 11 }, color: '#6B6459' } } }
                }} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={`${styles.empty} card`}>
          <div className={styles.emptyIcon}>📊</div>
          <h3>No data yet</h3>
          <p>Log your first entry to start seeing trends and charts.</p>
          <Link to="/log" className="btn btn-primary" style={{ marginTop: '1rem' }}>Log Today →</Link>
        </div>
      )}

      {/* Records table */}
      {logs.length > 0 && (
        <div className="card">
          <div className={styles.chartTitle}>Recent records</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {['Date', 'Sleep', 'Work', 'Mood', 'Activity', 'HR', 'SpO₂', 'Result', ''].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>{format(new Date(log.logged_at), 'dd MMM yyyy')}</td>
                    <td>{log.sleep_duration}h</td>
                    <td>{log.work_hours}h</td>
                    <td>{log.mood_level}/10</td>
                    <td>{log.physical_activity}min</td>
                    <td>{log.heart_rate}bpm</td>
                    <td>{log.spo2}%</td>
                    <td><span className={`pill pill-${log.stress_level.toLowerCase()}`}>{log.stress_level}</span></td>
                    <td>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(log.id)} title="Delete">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
