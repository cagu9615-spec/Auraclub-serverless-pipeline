/**
 * AuraClub Data Warehouse Ingestion Pipeline
 * Core Stack: Google Workspace Staging Area -> GCP BigQuery OLAP Target
 * Data Volume Strategy: Zero-Cost Serverless Bulk Batch Loading (NDJSON format)
 */

function loadUnifiedAuraClubData() {
  const projectId = 'my-project-12345-503409'; 
  const datasetId = 'auraclub_analytics';

  // 1. Ingestion Layer: User Cohort Applications (Form Responses 1)
  try {
    const memberSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form Responses 1');
    const memberData = memberSheet ? memberSheet.getDataRange().getValues() : [];
    
    if (memberData.length > 1) {
      // Process ALL rows (skipping header) to backfill your warehouse completely from your actual sheet
      let ndjsonContent = "";
      for (let i = 1; i < memberData.length; i++) {
        const row = memberData[i];
        if (!row[0] && !row[4]) continue; // Skip empty rows

        const record = {
          signup_timestamp: row[0] ? String(row[0]).trim() : "N/A",
          full_name:        row[1] ? String(row[1]).trim() : "N/A",
          country:         row[2] ? String(row[2]).trim() : "N/A",
          membership_type:  row[3] ? String(row[3]).trim() : "N/A",
          email:            row[4] ? String(row[4]).trim().toLowerCase() : "N/A"
        };
        ndjsonContent += JSON.stringify(record) + "\n";
      }

      if (ndjsonContent.length > 0) {
        const blob = Utilities.newBlob(ndjsonContent, 'application/x-ndjson');
        triggerBigQueryBatchLoad(projectId, datasetId, 'members_staging', blob, 'NEWLINE_DELIMITED_JSON');
      }
    }
  } catch (err) {
    Logger.log("Cohort applications ingestion failure: " + err.toString());
  }

  // 2. Ingestion Layer: Multi-Platform Sales Ledger (auraclub_revenue)
  try {
    const revenueSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('auraclub_revenue');
    const revenueData = revenueSheet ? revenueSheet.getDataRange().getValues() : [];

    if (revenueData.length > 1) {
      let ndjsonContent = "";
      
      for (let i = 1; i < revenueData.length; i++) {
        const row = revenueData[i];
        if (!row[0]) continue; // Skip empty rows

        const email     = String(row[0]).trim().toLowerCase();
        const platform  = String(row[1]).trim();
        const amount    = parseFloat(row[2]) || 0.00;
        const rawDate   = row[3];
        let rawProducts = String(row[4]).trim();

        // Standardize Date format to YYYY-MM-DD
        let formattedDate = "";
        if (rawDate instanceof Date) {
          formattedDate = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
        } else {
          const dateStr = String(rawDate).trim();
          formattedDate = dateStr.includes(" ") ? dateStr.split(" ")[0] : dateStr.split("T")[0];
        }

        // Clean and handle your exact product string styles
        let productsArray = [];
        if (rawProducts.startsWith("[") && rawProducts.endsWith("]")) {
          try {
            // Parses formatting like: ["Coaching","eBook","VIP Event"]
            productsArray = JSON.parse(rawProducts);
          } catch(e) {
            // Fallback parsing if JSON parsing hits string formatting quirks
            productsArray = rawProducts.replace(/[\[\]"]/g, '').split(',').map(item => item.trim());
          }
        } else {
          // Handles unbracketed formatting like: "Monthly Substack, Mindset eBook" or single products
          productsArray = rawProducts.split(',').map(item => item.trim());
        }

        // Exclude blank string fragments from filtering arrays
        productsArray = productsArray.filter(item => item.length > 0);

        const record = {
          email: email,
          source_platform: platform,
          amount_paid: amount,
          transaction_date: formattedDate,
          products_purchased: productsArray // Map clean array objects to production columns
        };
        
        ndjsonContent += JSON.stringify(record) + "\n";
      }

      if (ndjsonContent.length > 0) {
        const blob = Utilities.newBlob(ndjsonContent, 'application/x-ndjson');
        triggerBigQueryBatchLoad(projectId, datasetId, 'revenue_staging', blob, 'NEWLINE_DELIMITED_JSON');
      }
    }
  } catch (err) {
    Logger.log("Multi-platform revenue ingestion failure: " + err.toString());
  }
}

function triggerBigQueryBatchLoad(projectId, datasetId, tableId, dataBlob, sourceFormat) {
  const job = {
    configuration: {
      load: {
        destinationTable: { projectId, datasetId, tableId },
        sourceFormat: sourceFormat,
        writeDisposition: 'WRITE_TRUNCATE' // Replaces tables cleanly with your entire sheet snapshot to prevent duplicates
      }
    }
  };
  const runJob = BigQuery.Jobs.insert(job, projectId, dataBlob);
  Logger.log('BigQuery NDJSON load job generated for table: ' + tableId + '. ID: ' + runJob.jobReference.jobId);
}
