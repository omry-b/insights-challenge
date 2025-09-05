import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing external API connection...')
    
    const testPayload = {
      metrics: ["spend", "impressions"],
      level: "campaign",
      breakdowns: ["age"],
      dateRangeEnum: "last30"
    }
    
    console.log('Making test request to Meta API...')
    const response = await fetch('https://bizdev.newform.ai/sample-data/meta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    })
    
    console.log(`Test response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Test API error:', errorText)
      return NextResponse.json({ 
        success: false, 
        error: `API returned ${response.status}: ${errorText}` 
      })
    }
    
    const data = await response.json()
    console.log('Test API success - full response:', JSON.stringify(data, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      message: 'External API is accessible',
      dataType: typeof data,
      isArray: Array.isArray(data),
      dataLength: Array.isArray(data) ? data.length : 'not an array',
      sampleData: data
    })
    
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}
