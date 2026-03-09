import { useState, useEffect } from 'react'
import { getAllMileage, getProjects } from '../db'
import type { MileageEntry, Project } from '../db'

const MILEAGE_RATE_2024 = 0.67

const MileageSummary = () => {
  const [mileage, setMileage] = useState<MileageEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      const [mileageList, projectList] = await Promise.all([
        getAllMileage(),
        getProjects()
      ])
      if (mounted) {
        setMileage(mileageList)
        setProjects(projectList)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [])

  const totalMiles = mileage.reduce((sum, entry) => sum + entry.miles, 0)
  const totalCost = totalMiles * MILEAGE_RATE_2024

  const byProject = projects.map(project => {
    const projectMileage = mileage.filter(m => m.projectId === project.id)
    const miles = projectMileage.reduce((sum, m) => sum + m.miles, 0)
    return {
      name: project.name,
      id: project.id,
      miles,
      cost: miles * MILEAGE_RATE_2024,
      count: projectMileage.length
    }
  }).filter(p => p.count > 0)

  const byMonth: Record<string, { miles: number; cost: number; count: number }> = {}
  mileage.forEach(entry => {
    const month = entry.date.substring(0, 7)
    if (!byMonth[month]) {
      byMonth[month] = { miles: 0, cost: 0, count: 0 }
    }
    byMonth[month].miles += entry.miles
    byMonth[month].cost += entry.miles * MILEAGE_RATE_2024
    byMonth[month].count++
  })

  return (
    <div className="container">
      <h1>Mileage Summary</h1>
      
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        <h2 style={{ marginTop: 0 }}>Overall Summary</h2>
        <div style={{ fontSize: '1.2rem' }}>
          <div><strong>Total Miles:</strong> {totalMiles.toFixed(1)} mi</div>
          <div><strong>Estimated Cost:</strong> ${totalCost.toFixed(2)}</div>
          <div><strong>Mileage Rate:</strong> ${MILEAGE_RATE_2024.toFixed(2)}/mi (2024 IRS Standard)</div>
        </div>
      </div>

      {byProject.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>By Project</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Project</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Entries</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Miles</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {byProject.map(project => (
                <tr key={project.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>{project.name}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>{project.count}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>{project.miles.toFixed(1)} mi</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>${project.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {Object.keys(byMonth).length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>By Month</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Month</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Entries</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Miles</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byMonth)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, data]) => (
                  <tr key={month} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '0.5rem' }}>{month}</td>
                    <td style={{ textAlign: 'right', padding: '0.5rem' }}>{data.count}</td>
                    <td style={{ textAlign: 'right', padding: '0.5rem' }}>{data.miles.toFixed(1)} mi</td>
                    <td style={{ textAlign: 'right', padding: '0.5rem' }}>${data.cost.toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default MileageSummary
