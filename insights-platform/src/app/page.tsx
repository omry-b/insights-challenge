'use client'

import { useState, useEffect } from 'react'
import { ReportConfig } from '@/types'
import { ReportConfigForm } from '@/components/report-config-form'
import { Dashboard } from '@/components/dashboard'

export default function HomePage() {
  const [currentConfig, setCurrentConfig] = useState<ReportConfig | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load existing config if any
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/config')
      const data = await response.json()
      if (data.configs && data.configs.length > 0) {
        setCurrentConfig(data.configs[0]) // For now, we only support one config
      } else {
        setShowForm(true)
      }
    } catch (error) {
      console.error('Error fetching configs:', error)
      setShowForm(true)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigSave = async (config: ReportConfig) => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      
      if (response.ok) {
        setCurrentConfig(config)
        setShowForm(false)
      } else {
        console.error('Failed to save config')
      }
    } catch (error) {
      console.error('Error saving config:', error)
    }
  }

  const handleNewConfig = async () => {
    if (currentConfig) {
      try {
        await fetch(`/api/config?id=${currentConfig.id}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Error deleting config:', error)
      }
    }
    setCurrentConfig(null)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Insight Reports</h1>
          <p className="text-muted-foreground mt-2">
            Configure and manage your automated advertising reports
          </p>
        </div>
        {currentConfig && (
          <button
            onClick={handleNewConfig}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            New Report
          </button>
        )}
      </div>

      {showForm ? (
        <ReportConfigForm onSave={handleConfigSave} />
      ) : currentConfig ? (
        <Dashboard config={currentConfig} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      )}
    </div>
  )
}
