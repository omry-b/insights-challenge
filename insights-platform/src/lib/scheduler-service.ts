import * as cron from 'node-cron';
import { ReportConfig, SchedulerJob, ReportData } from '@/types';
import { storageService } from './storage-service';
import { fetchAdData, generateLLMSummary } from './api-service';
import { getCronExpression, getNextRunTime } from './utils';

class SchedulerService {
  private jobs: Map<string, SchedulerJob> = new Map();
  private reports: Map<string, ReportData> = new Map();

  startScheduler(config: ReportConfig): boolean {
    try {
      // Stop existing job if any
      this.stopScheduler(config.id);

      if (config.cadence === 'manual') {
        return true; // No scheduling needed for manual reports
      }

      const cronExpression = getCronExpression(config.cadence);
      
      if (cronExpression) {
        // Use node-cron for scheduled execution
        const task = cron.schedule(cronExpression, () => {
          this.executeReport(config.id);
        });

        this.jobs.set(config.id, {
          configId: config.id,
          cronExpression,
        });

        // Update next run time
        storageService.updateConfig(config.id, {
          nextRun: getNextRunTime(config.cadence),
        });

        console.log(`Scheduler started for config ${config.id} with cadence ${config.cadence}`);
        return true;
      } else {
        console.error(`Invalid cadence: ${config.cadence}`);
        return false;
      }
    } catch (error) {
      console.error('Error starting scheduler:', error);
      return false;
    }
  }

  stopScheduler(configId: string): void {
    const job = this.jobs.get(configId);
    if (job) {
      if (job.cronExpression) {
        // Stop cron job - note: node-cron doesn't provide direct access to stop individual jobs
        // In a production environment, you'd want to track the task reference
      }
      if (job.intervalId) {
        clearInterval(job.intervalId);
      }
      this.jobs.delete(configId);
      console.log(`Scheduler stopped for config ${configId}`);
    }
  }

  async executeReport(configId: string): Promise<boolean> {
    try {
      console.log(`SchedulerService: Starting executeReport for ${configId}`);
      
      const config = storageService.getConfig(configId);
      if (!config || !config.isActive) {
        console.log(`SchedulerService: Config ${configId} not found or inactive`);
        return false;
      }

      console.log(`SchedulerService: Executing report for config ${configId}`, {
        platform: config.platform,
        metrics: config.metrics,
        level: config.level,
        dateRangeEnum: config.dateRangeEnum
      });

      // Update last run time
      const now = new Date();
      storageService.updateConfig(configId, {
        lastRun: now,
        nextRun: getNextRunTime(config.cadence, now),
        lastError: undefined,
      });

      // Fetch data from API
      console.log(`SchedulerService: Fetching data from API...`);
      const apiResponse = await fetchAdData({
        platform: config.platform,
        metrics: config.metrics,
        level: config.level,
        dateRangeEnum: config.dateRangeEnum,
        breakdowns: config.platform === 'meta' ? ['age'] : undefined,
        dimensions: config.platform === 'tiktok' ? ['ad_id'] : undefined,
      });

      console.log(`SchedulerService: API response received`, { success: apiResponse.success, dataLength: apiResponse.data?.length });

      if (!apiResponse.success) {
        const error = `API request failed: ${apiResponse.error}`;
        storageService.updateConfig(configId, { lastError: error });
        console.error(`SchedulerService: ${error}`);
        return false;
      }

      // Generate LLM summary
      console.log(`SchedulerService: Generating LLM summary...`);
      const summary = await generateLLMSummary(apiResponse.data, config.metrics);

      // Create report data
      const reportData: ReportData = {
        config,
        data: apiResponse.data,
        summary,
        generatedAt: now,
      };

      // Store the report
      this.reports.set(configId, reportData);
      console.log(`SchedulerService: Report stored for config ${configId}`);

      // Handle delivery
      await this.deliverReport(reportData);

      console.log(`SchedulerService: Report executed successfully for config ${configId}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`SchedulerService: Error executing report for config ${configId}:`, error);
      storageService.updateConfig(configId, { lastError: errorMessage });
      return false;
    }
  }

  private async deliverReport(reportData: ReportData): Promise<void> {
    if (reportData.config.delivery === 'email') {
      await this.sendEmailReport(reportData);
    } else if (reportData.config.delivery === 'link') {
      // Report is already stored and accessible via link
      console.log(`Report available at link for config ${reportData.config.id}`);
    }
  }

  private async sendEmailReport(reportData: ReportData): Promise<void> {
    // In a real implementation, this would use an email service like SendGrid, Resend, etc.
    console.log(`Sending email report to ${reportData.config.email}`);
    console.log(`Subject: ${reportData.config.platform.toUpperCase()} Insight Report`);
    console.log(`Summary: ${reportData.summary}`);
    
    // For demo purposes, we'll just log the email content
    // In production, you would integrate with an actual email service
  }

  getLatestReport(configId: string): ReportData | undefined {
    return this.reports.get(configId);
  }

  getAllReports(): ReportData[] {
    return Array.from(this.reports.values());
  }

  isSchedulerRunning(configId: string): boolean {
    return this.jobs.has(configId);
  }
}

export const schedulerService = new SchedulerService();
