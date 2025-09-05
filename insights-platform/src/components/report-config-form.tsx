'use client'

import { useState } from 'react'
import { ReportConfig, Platform, DateRangeEnum, Cadence, DeliveryMethod, MetaMetric, TikTokMetric, MetaLevel, TikTokLevel } from '@/types'
import { generateId } from '@/lib/utils'

interface ReportConfigFormProps {
  onSave: (config: ReportConfig) => void
}

const META_METRICS: MetaMetric[] = ['spend', 'impressions', 'clicks', 'ctr', 'conversions', 'cost_per_conversion', 'reach', 'frequency']
const TIKTOK_METRICS: TikTokMetric[] = ['spend', 'impressions', 'clicks', 'conversions', 'cost_per_conversion', 'conversion_rate', 'ctr', 'cpc', 'reach', 'frequency']
const META_LEVELS: MetaLevel[] = ['account', 'campaign', 'adset', 'ad']
const TIKTOK_LEVELS: TikTokLevel[] = ['AUCTION_ADVERTISER', 'AUCTION_AD', 'AUCTION_CAMPAIGN']

export function ReportConfigForm({ onSave }: ReportConfigFormProps) {
  const [platform, setPlatform] = useState<Platform>('meta')
  const [metrics, setMetrics] = useState<string[]>(['spend', 'impressions'])
  const [level, setLevel] = useState<string>('campaign')
  const [dateRangeEnum, setDateRangeEnum] = useState<DateRangeEnum>('last30')
  const [cadence, setCadence] = useState<Cadence>('daily')
  const [delivery, setDelivery] = useState<DeliveryMethod>('link')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const availableMetrics = platform === 'meta' ? META_METRICS : TIKTOK_METRICS
  const availableLevels = platform === 'meta' ? META_LEVELS : TIKTOK_LEVELS

  const handleMetricToggle = (metric: string) => {
    setMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    )
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (metrics.length === 0) {
      newErrors.metrics = 'At least one metric is required'
    }

    if (delivery === 'email' && !email) {
      newErrors.email = 'Email is required when delivery method is email'
    }

    if (delivery === 'email' && email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const config: ReportConfig = {
      id: generateId(),
      platform,
      metrics,
      level,
      dateRangeEnum,
      cadence,
      delivery,
      email: delivery === 'email' ? email : undefined,
      createdAt: new Date(),
      isActive: true,
    }

    onSave(config)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-2xl font-semibold mb-6">Configure Report</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Platform *</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="meta"
                  checked={platform === 'meta'}
                  onChange={(e) => {
                    setPlatform(e.target.value as Platform)
                    setLevel('campaign')
                    setMetrics(['spend', 'impressions'])
                  }}
                  className="mr-2"
                />
                Meta
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="tiktok"
                  checked={platform === 'tiktok'}
                  onChange={(e) => {
                    setPlatform(e.target.value as Platform)
                    setLevel('AUCTION_CAMPAIGN')
                    setMetrics(['spend', 'impressions'])
                  }}
                  className="mr-2"
                />
                TikTok
              </label>
            </div>
          </div>

          {/* Metrics Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Metrics * (≥ 1)</label>
            <div className="grid grid-cols-2 gap-2">
              {availableMetrics.map((metric) => (
                <label key={metric} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={metrics.includes(metric)}
                    onChange={() => handleMetricToggle(metric)}
                    className="mr-2"
                  />
                  {metric.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
            {errors.metrics && <p className="text-destructive text-sm mt-1">{errors.metrics}</p>}
          </div>

          {/* Level Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Level *</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              {availableLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl.replace(/_/g, ' ').toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Date Range *</label>
            <select
              value={dateRangeEnum}
              onChange={(e) => setDateRangeEnum(e.target.value as DateRangeEnum)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="last7">Last 7 days</option>
              <option value="last14">Last 14 days</option>
              <option value="last30">Last 30 days</option>
            </select>
          </div>

          {/* Cadence */}
          <div>
            <label className="block text-sm font-medium mb-2">Cadence *</label>
            <select
              value={cadence}
              onChange={(e) => setCadence(e.target.value as Cadence)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="manual">Manual</option>
              <option value="hourly">Hourly</option>
              <option value="every 12 hours">Every 12 hours</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          {/* Delivery Method */}
          <div>
            <label className="block text-sm font-medium mb-2">Delivery *</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="email"
                  checked={delivery === 'email'}
                  onChange={(e) => setDelivery(e.target.value as DeliveryMethod)}
                  className="mr-2"
                />
                Email
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="link"
                  checked={delivery === 'link'}
                  onChange={(e) => setDelivery(e.target.value as DeliveryMethod)}
                  className="mr-2"
                />
                Public Link
              </label>
            </div>
          </div>

          {/* Email Input */}
          {delivery === 'email' && (
            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 font-medium"
          >
            Save & Start
          </button>
        </form>
      </div>
    </div>
  )
}
