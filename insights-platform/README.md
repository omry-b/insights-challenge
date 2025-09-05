# Insights Platform - Scheduled Insight Reports

A Next.js application that consumes Meta and TikTok advertising data APIs to create scheduled insight reports with LLM summaries and charts.

## Features

✅ **Configuration Form**: Single-page form to configure one recurring insight report
- Platform selection (Meta/TikTok)
- Metrics multi-select with validation
- Level selection (per-platform)
- Date range selection (last7/last14/last30)
- Cadence selection (manual/hourly/every 12 hours/daily)
- Delivery method (email/public link)
- Email validation when email delivery is selected

✅ **Scheduler**: Node-cron based scheduling system
- Runs reports according to selected cadence
- Manual "Run Now" functionality
- Automatic next run time calculation

✅ **Report Builder**: 
- Fetches data from Meta/TikTok APIs using discovered working formats
- Generates LLM-style summaries with metrics analysis
- Creates interactive charts using Recharts
- Handles both email and public link delivery

✅ **Dashboard**:
- Shows last run timestamp and next run countdown
- Displays configuration details
- Shows latest report with chart and summary
- Error handling and status display
- "Run Now" button for manual execution

✅ **Public Report Links**:
- Dedicated report pages accessible via public URLs
- Executive summary, performance charts, and raw data tables
- Professional report layout

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom components with shadcn/ui patterns
- **Charts**: Recharts for data visualization
- **Scheduling**: node-cron for report automation
- **API Integration**: Meta and TikTok advertising APIs
- **Storage**: In-memory storage (easily replaceable with database)

## API Integration

The platform integrates with the discovered working API formats:

### Meta API
```json
{
  "metrics": ["spend", "impressions"],
  "level": "campaign", 
  "breakdowns": ["age"],
  "dateRangeEnum": "last30"
}
```

### TikTok API  
```json
{
  "metrics": ["spend", "impressions"],
  "level": "AUCTION_CAMPAIGN",
  "dimensions": ["ad_id"], 
  "dateRangeEnum": "last7"
}
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3001](http://localhost:3001) in your browser

## Usage

1. **Configure Report**: Fill out the form with your desired settings
2. **Save & Start**: Click to save configuration and start scheduler
3. **Run Now**: Use the dashboard button to manually trigger reports
4. **View Reports**: Access reports via the dashboard or public links

## Architecture

- **Client-side**: React components with API calls to Next.js routes
- **Server-side**: API routes handle scheduling, data fetching, and report generation
- **Separation**: Server-only code (node-cron) isolated from client-side code
- **Modular**: Clean separation between services, components, and utilities

## Core Requirements Met

✅ Single report configuration form
✅ Scheduler with chosen cadence + manual trigger  
✅ Report generation with API data + LLM summary + charts
✅ Delivery via public links (email delivery framework ready)
✅ Dashboard with status, configuration, and latest report
✅ Professional UI with Tailwind CSS
✅ TypeScript throughout
✅ Error handling and validation

## Future Enhancements

- Database persistence (SQLite/Postgres)
- Email delivery integration (SendGrid/Resend)
- Multiple concurrent reports
- PDF report generation
- Advanced LLM integration (OpenAI/Claude)
- Signed URLs for secure public reports
- Advanced scheduling (weekly/monthly cron expressions)
