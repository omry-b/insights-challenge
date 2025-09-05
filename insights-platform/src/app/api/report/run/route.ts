import { NextRequest, NextResponse } from 'next/server'
import { schedulerService } from '@/lib/scheduler-service'

export async function POST(request: NextRequest) {
  try {
    const { configId } = await request.json()
    
    if (!configId) {
      return NextResponse.json({ error: 'Config ID required' }, { status: 400 })
    }
    
    console.log(`API: Executing report for config ${configId}`)
    const success = await schedulerService.executeReport(configId)
    
    if (success) {
      const reportData = schedulerService.getLatestReport(configId)
      console.log(`API: Report executed successfully for config ${configId}`)
      return NextResponse.json({ success: true, reportData })
    } else {
      console.error(`API: Failed to execute report for config ${configId}`)
      return NextResponse.json({ error: 'Failed to execute report' }, { status: 500 })
    }
  } catch (error) {
    console.error('API: Error in report/run route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to run report: ${errorMessage}` }, { status: 500 })
  }
}
