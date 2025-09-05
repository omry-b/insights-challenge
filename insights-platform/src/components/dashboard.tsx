'use client'

import { useState, useEffect } from 'react'
import { ReportConfig, ReportData } from '@/types'
import { formatDate } from '@/lib/utils'
import { ReportChart } from './report-chart'

interface DashboardProps {
  config: ReportConfig
}

export function Dashboard({ config }: DashboardProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Load latest report
    fetchLatestReport()
  }, [config.id, refreshKey])

  const fetchLatestReport = async () => {
    try {
      const response = await fetch(`/api/report/${config.id}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data.reportData)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    }
  }

  const handleRunNow = async () => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/report/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId: config.id }),
      })
      
      if (response.ok) {
        setRefreshKey(prev => prev + 1)
      } else {
        console.error('Failed to run report')
      }
    } catch (error) {
      console.error('Error running report:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getTimeUntilNext = () => {
    if (!config.nextRun) return 'N/A'
    const now = new Date()
    const next = new Date(config.nextRun)
    const diff = next.getTime() - now.getTime()
    
    if (diff <= 0) return 'Overdue'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">Report Status</h2>
            <p className="text-muted-foreground">
              {config.platform.toUpperCase()} • {config.level} • {config.cadence}
            </p>
          </div>
          <button
            onClick={handleRunNow}
            disabled={isRunning}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run Now'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-muted-foreground">Last Run</h3>
            <p className="text-lg font-semibold">
              {config.lastRun ? formatDate(new Date(config.lastRun)) : 'Never'}
            </p>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-muted-foreground">Next Run</h3>
            <p className="text-lg font-semibold">
              {config.cadence === 'manual' ? 'Manual' : getTimeUntilNext()}
            </p>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
            <p className="text-lg font-semibold">
              {config.lastError ? (
                <span className="text-destructive">Error</span>
              ) : (
                <span className="text-green-600">Active</span>
              )}
            </p>
          </div>
        </div>

        {config.lastError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              <strong>Last Error:</strong> {config.lastError}
            </p>
          </div>
        )}
      </div>

      {/* Configuration Details */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Configuration</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Platform:</span>
            <span className="ml-2 font-medium">{config.platform.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Level:</span>
            <span className="ml-2 font-medium">{config.level}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Date Range:</span>
            <span className="ml-2 font-medium">{config.dateRangeEnum}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Delivery:</span>
            <span className="ml-2 font-medium">{config.delivery}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Metrics:</span>
            <span className="ml-2 font-medium">{config.metrics.join(', ')}</span>
          </div>
          {config.email && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2 font-medium">{config.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Latest Report */}
      {reportData && (
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Latest Report</h3>
              <div className="text-sm text-muted-foreground">
                Generated: {formatDate(new Date(reportData.generatedAt))}
              </div>
            </div>

            {config.delivery === 'link' && (
              <div className="mb-4">
                <a
                  href={`/report/${config.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Open Latest Report →
                </a>
              </div>
            )}

            {/* Chart */}
            <div className="mb-6">
              <ReportChart data={reportData.data} metrics={config.metrics} />
            </div>

            {/* Summary */}
            <div>
              <h4 className="font-medium mb-2">AI Summary</h4>
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {reportData.summary}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {!reportData && (
        <div className="bg-card rounded-lg border p-6 text-center">
          <p className="text-muted-foreground">
            No reports generated yet. Click "Run Now" to generate your first report.
          </p>
        </div>
      )}
    </div>
  )
}
