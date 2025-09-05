'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ReportChartProps {
  data: any[]
  metrics: string[]
}

export function ReportChart({ data, metrics }: ReportChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">No data available for chart</p>
      </div>
    )
  }

  // Prepare chart data - aggregate by date if available, otherwise use first 10 rows
  const chartData = data.slice(0, 10).map((row, index) => {
    const item: any = {
      name: row.stat_time_day || row.date_start || `Item ${index + 1}`,
    }
    
    metrics.forEach(metric => {
      const value = parseFloat(row[metric]) || 0
      item[metric] = value
    })
    
    return item
  })

  // Color palette for different metrics
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', 
    '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
  ]

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: any, name: string) => [
              typeof value === 'number' ? value.toLocaleString() : value,
              name.replace(/_/g, ' ')
            ]}
            labelFormatter={(label) => `${label}`}
          />
          <Legend 
            formatter={(value) => value.replace(/_/g, ' ')}
          />
          {metrics.map((metric, index) => (
            <Bar 
              key={metric}
              dataKey={metric} 
              fill={colors[index % colors.length]}
              name={metric.replace(/_/g, ' ')}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
