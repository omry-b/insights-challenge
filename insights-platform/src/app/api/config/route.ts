import { NextRequest, NextResponse } from 'next/server'
import { ReportConfig } from '@/types'
import { storageService } from '@/lib/storage-service'
import { schedulerService } from '@/lib/scheduler-service'

export async function GET() {
  try {
    const configs = storageService.getAllConfigs()
    return NextResponse.json({ configs })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get configs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: ReportConfig = await request.json()
    
    // Save the config
    storageService.saveConfig(config)
    
    // Start the scheduler if not manual
    if (config.cadence !== 'manual') {
      schedulerService.startScheduler(config)
    }
    
    return NextResponse.json({ success: true, config })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Config ID required' }, { status: 400 })
    }
    
    // Stop scheduler and delete config
    schedulerService.stopScheduler(id)
    storageService.deleteConfig(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 })
  }
}
