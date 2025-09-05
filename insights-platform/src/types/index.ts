export type Platform = 'meta' | 'tiktok';

export type DateRangeEnum = 'last7' | 'last14' | 'last30';

export type Cadence = 'manual' | 'hourly' | 'every 12 hours' | 'daily';

export type DeliveryMethod = 'email' | 'link';

export type MetaMetric = 
  | 'spend' 
  | 'impressions' 
  | 'clicks' 
  | 'ctr' 
  | 'conversions' 
  | 'cost_per_conversion' 
  | 'reach' 
  | 'frequency';

export type MetaLevel = 'account' | 'campaign' | 'adset' | 'ad';

export type TikTokMetric = 
  | 'spend' 
  | 'impressions' 
  | 'clicks' 
  | 'conversions' 
  | 'cost_per_conversion' 
  | 'conversion_rate' 
  | 'ctr' 
  | 'cpc' 
  | 'reach' 
  | 'frequency';

export type TikTokLevel = 'AUCTION_ADVERTISER' | 'AUCTION_AD' | 'AUCTION_CAMPAIGN';

export interface ReportConfig {
  id: string;
  platform: Platform;
  metrics: string[];
  level: string;
  dateRangeEnum: DateRangeEnum;
  cadence: Cadence;
  delivery: DeliveryMethod;
  email?: string;
  createdAt: Date;
  lastRun?: Date;
  nextRun?: Date;
  lastError?: string;
  isActive: boolean;
}

export interface ApiResponse {
  data: any[];
  success: boolean;
  error?: string;
}

export interface ReportData {
  config: ReportConfig;
  data: any[];
  summary: string;
  generatedAt: Date;
}

export interface SchedulerJob {
  configId: string;
  cronExpression?: string;
  intervalId?: ReturnType<typeof setInterval>;
}
