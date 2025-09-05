const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Test both APIs with different parameter combinations
app.get('/test-apis', async (req, res) => {
  const results = {
    tests: [],
    summary: {}
  };

  // Test configurations for Meta API
  const metaTests = [
    {
      name: "Meta - Campaign Level with Age Breakdown",
      payload: {
        metrics: ["spend", "impressions", "clicks", "ctr", "conversions", "cost_per_conversion"],
        level: "campaign",
        breakdowns: ["age"],
        timeIncrement: "7",
        dateRangeEnum: "last30"
      }
    },
    {
      name: "Meta - Account Level Basic",
      payload: {
        metrics: ["spend", "impressions", "clicks"],
        level: "account",
        dateRangeEnum: "last7"
      }
    },
    {
      name: "Meta - Ad Level with Gender Breakdown",
      payload: {
        metrics: ["spend", "impressions", "ctr", "reach"],
        level: "ad",
        breakdowns: ["gender"],
        timeIncrement: "1",
        dateRangeEnum: "last14"
      }
    },
    {
      name: "Meta - Campaign with Country Breakdown",
      payload: {
        metrics: ["spend", "conversions", "cost_per_conversion"],
        level: "campaign",
        breakdowns: ["country"],
        timeIncrement: "28",
        dateRangeEnum: "last30"
      }
    }
  ];

  // Test configurations for TikTok API
  const tiktokTests = [
    {
      name: "TikTok - Campaign Level Basic",
      payload: {
        metrics: ["spend", "impressions", "clicks", "ctr"],
        level: "AUCTION_CAMPAIGN",
        dateRangeEnum: "last7"
      }
    },
    {
      name: "TikTok - Ad Level with Dimensions",
      payload: {
        metrics: ["spend", "impressions", "conversions", "cost_per_conversion"],
        dimensions: ["ad_id", "campaign_id"],
        level: "AUCTION_AD",
        dateRangeEnum: "last14"
      }
    },
    {
      name: "TikTok - Advertiser Level with Age/Gender",
      payload: {
        metrics: ["spend", "clicks", "ctr", "reach"],
        dimensions: ["age", "gender"],
        level: "AUCTION_ADVERTISER",
        dateRangeEnum: "last30"
      }
    }
  ];

  // Test Meta API
  for (const test of metaTests) {
    try {
      const response = await fetch('https://bizdev.newform.ai/sample-data/meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.payload)
      });

      const result = {
        name: test.name,
        platform: "Meta",
        status: response.status,
        success: response.ok,
        payload: test.payload
      };

      if (response.ok) {
        const data = await response.json();
        result.dataCount = data.data ? data.data.length : 0;
        result.sampleData = data.data ? data.data.slice(0, 2) : null;
      } else {
        result.error = await response.text();
      }

      results.tests.push(result);
    } catch (error) {
      results.tests.push({
        name: test.name,
        platform: "Meta",
        success: false,
        error: error.message,
        payload: test.payload
      });
    }
  }

  // Test TikTok API
  for (const test of tiktokTests) {
    try {
      const response = await fetch('https://bizdev.newform.ai/sample-data/tiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.payload)
      });

      const result = {
        name: test.name,
        platform: "TikTok",
        status: response.status,
        success: response.ok,
        payload: test.payload
      };

      if (response.ok) {
        const data = await response.json();
        result.dataCount = data.data ? data.data.length : 0;
        result.sampleData = data.data ? data.data.slice(0, 2) : null;
      } else {
        result.error = await response.text();
      }

      results.tests.push(result);
    } catch (error) {
      results.tests.push({
        name: test.name,
        platform: "TikTok",
        success: false,
        error: error.message,
        payload: test.payload
      });
    }
  }

  // Generate summary
  results.summary = {
    totalTests: results.tests.length,
    successful: results.tests.filter(t => t.success).length,
    failed: results.tests.filter(t => !t.success).length,
    metaTests: results.tests.filter(t => t.platform === "Meta").length,
    tiktokTests: results.tests.filter(t => t.platform === "TikTok").length
  };

  res.json(results);
});

app.listen(port, () => {
  console.log(`API tester running at http://localhost:${port}`);
});
