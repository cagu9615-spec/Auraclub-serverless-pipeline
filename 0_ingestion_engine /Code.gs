/**
 * Core Data Pipeline: Ingestion Stage
 * This function triggers automatically when a user submits the Google Form.
 * It normalizes the data inputs and logs the structured payload.
 */
function onFormSubmitTrigger(e) {
  try {
    // 1. Capture the raw values submitted from the form response array
    // [Timestamp, Email, Full Name, Country, Membership Type]
    const rawValues = e.values; 
    
    if (!rawValues) {
      Logger.log("No event values detected. Make sure to run this via a live Form Submit event.");
      return;
    }

    // 2. Data Normalization Step (Cleaning the stream)
    const email = rawValues[1].toString().trim().toLowerCase();
    const fullName = rawValues[2].toString().trim();
    const country = rawValues[3].toString().trim();
    const membershipType = rawValues[4].toString().trim();
    const timestamp = rawValues[0];

    // 3. Structure into a clean JSON payload for cloud compatibility
    const processedPayload = {
      ingestion_timestamp: timestamp,
      user_email: email,
      user_full_name: fullName,
      user_country: country,
      membership_tier: membershipType,
      pipeline_status: "INGESTED_NORMALIZED"
    };

    // 4. Print logs to verify successful data capture
    Logger.log("🎉 Successfully intercepted incoming form submission!");
    Logger.log("Processed Payload: " + JSON.stringify(processedPayload, null, 2));

    // Future Stage: This is where we will add UrlFetchApp or BigQuery APIs to send this payload out!

  } catch (error) {
    Logger.log("❌ Pipeline Ingestion Error: " + error.toString());
  }
}
