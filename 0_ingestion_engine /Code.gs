function onFormSubmitTrigger(e) {
  try {
    const rawValues = e.values; 
    
    if (!rawValues) {
      Logger.log("No data found in event.");
      return;
    }

    // clean up the inputs
    const email = rawValues[1].toString().trim().toLowerCase();
    const fullName = rawValues[2].toString().trim();
    const country = rawValues[3].toString().trim();
    const membershipType = rawValues[4].toString().trim();
    const timestamp = rawValues[0];

    // map to schema
    const processedPayload = {
      ingestion_timestamp: timestamp,
      user_email: email,
      full_name: fullName,
      country: country,
      membership_type: membershipType
    };

    Logger.log(processedPayload);
    return processedPayload;

  } catch (err) {
    Logger.log("Failed to process submission: " + err.message);
  }
}
