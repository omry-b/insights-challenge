import { NextRequest, NextResponse } from 'next/server'
import { schedulerService } from '@/lib/scheduler-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportData = schedulerService.getLatestReport(params.id)
    
    if (!reportData) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    
    return NextResponse.json({ reportData })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get report' }, { status: 500 })
  }
}
