import { Platform, ApiResponse } from '@/types';

const API_BASE_URL = 'https://bizdev.newform.ai';

export interface ApiRequestParams {
  platform: Platform;
  metrics: string[];
  level: string;
  dateRangeEnum: string;
  breakdowns?: string[];
  dimensions?: string[];
}

export async function fetchAdData(params: ApiRequestParams): Promise<ApiResponse> {
  try {
    const endpoint = `${API_BASE_URL}/sample-data/${params.platform}`;
    
    let requestBody: any = {
      metrics: params.metrics,
      level: params.level,
      dateRangeEnum: params.dateRangeEnum,
    };

    // Add platform-specific required fields based on our API testing
    if (params.platform === 'meta') {
      requestBody.breakdowns = params.breakdowns || ['age'];
    } else if (params.platform === 'tiktok') {
      requestBody.dimensions = params.dimensions || ['ad_id'];
    }

    console.log(`ApiService: Making request to ${endpoint}`, requestBody);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`ApiService: Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ApiService: Error response body:`, errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log(`ApiService: Success! Response structure:`, typeof responseData);
    
    // The API returns {data: [...]} structure, extract the actual data array
    const actualData = responseData.data || responseData;
    console.log(`ApiService: Extracted data array with ${Array.isArray(actualData) ? actualData.length : 'non-array'} items`);
    
    return {
      data: actualData,
      success: true,
    };
  } catch (error) {
    console.error('ApiService: API request error:', error);
    return {
      data: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function generateLLMSummary(data: any[], metrics: string[]): Promise<string> {
  // For now, we'll create a simple summary. In a real implementation, 
  // this would call an LLM API like OpenAI, Claude, etc.
  try {
    const totalRows = data.length;
    const metricsData: { [key: string]: number } = {};
    
    // Calculate totals for each metric
    metrics.forEach(metric => {
      metricsData[metric] = data.reduce((sum, row) => {
        const value = parseFloat(row[metric]) || 0;
        return sum + value;
      }, 0);
    });

    let summary = `Report Summary:\n\n`;
    summary += `Total data points: ${totalRows}\n\n`;
    
    Object.entries(metricsData).forEach(([metric, total]: [string, number]) => {
      const avg = totalRows > 0 ? (total / totalRows).toFixed(2) : '0';
      summary += `${metric.charAt(0).toUpperCase() + metric.slice(1)}: Total ${total.toFixed(2)}, Average ${avg}\n`;
    });

    // Add some basic insights
    if (metricsData.spend && metricsData.conversions) {
      const costPerConversion = metricsData.conversions > 0 ? 
        (metricsData.spend / metricsData.conversions).toFixed(2) : 'N/A';
      summary += `\nCost per conversion: $${costPerConversion}\n`;
    }

    if (metricsData.clicks && metricsData.impressions) {
      const ctr = metricsData.impressions > 0 ? 
        ((metricsData.clicks / metricsData.impressions) * 100).toFixed(2) : '0';
      summary += `Click-through rate: ${ctr}%\n`;
    }

    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Unable to generate summary due to an error.';
  }
}
