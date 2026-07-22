function onFormSubmitTrigger(e) {
  try {
    const rawValues = e ? e.values : null;
    
    if (!rawValues) {
      Logger.log("Error: Missing event data");
      return;
    }

    const timestamp = rawValues[0];
    const email = rawValues[1] ? rawValues[1].toString().trim().toLowerCase() : "";
    const fullName = rawValues[2] ? rawValues[2].toString().trim() : "";
    const country = rawValues[3] ? rawValues[3].toString().trim() : "";
    const membershipType = rawValues[4] ? rawValues[4].toString().trim() : "";

    const processedPayload = {
      event_type: "NEW_MEMBER_REGISTRATION",
      ingestion_timestamp: timestamp,
      user_email: email,
      user_full_name: fullName,
      user_country: country,
      membership_tier: membershipType,
      source: "AuraClub_Form"
    };

    const webhookUrl = "https://webhook.site/d29b8420-40bf-47ef-8b4c-4b33429740e1";

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(processedPayload),
      muteHttpExceptions: true
    };

    Logger.log("Sending payload...");
    const response = UrlFetchApp.fetch(webhookUrl, options);
    
    Logger.log("Status Code: " + response.getResponseCode());

  } catch (error) {
    Logger.log("Pipeline error: " + error.toString());
  }
}

function testPipeline() {
  const mockData = {
    values: ["07/22/2026 12:00:00", "bestie@analytics.com", "Alex Newman", "Nigeria", "Premium"]
  };
  onFormSubmitTrigger(mockData);
}
