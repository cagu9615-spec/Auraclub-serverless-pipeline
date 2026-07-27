function onFormSubmit(e) {
  try {
    const rawValues = e ? e.values : null;
    if (!rawValues || rawValues.length === 0) {
      Logger.log("Awaiting live automated trigger event.");
      return;
    }

    const signupTimestamp = rawValues[0];
    const fullName = rawValues[1] ? rawValues[1].toString().trim() : "N/A";
    const country = rawValues[2] ? rawValues[2].toString().trim() : "N/A";
    const membershipType = rawValues[3] ? rawValues[3].toString().trim() : "N/A";
    const emailAddress = rawValues[4] ? rawValues[4].toString().trim().toLowerCase() : "N/A";

    executeSandboxBatchLoad(signupTimestamp, fullName, country, membershipType, emailAddress);

  } catch (error) {
    Logger.log("Pipeline extraction error: " + error.toString());
  }
}

function executeSandboxBatchLoad(signupTimestamp, fullName, country, membershipType, emailAddress) {
  const projectId = 'my-project-12345-503409';
  const datasetId = 'creator_pipeline';
  const tableId = 'members_staging';

  const cleanTime = String(signupTimestamp || "").replace(/"/g, '""');
  const cleanName = String(fullName || "").replace(/"/g, '""');
  const cleanCountry = String(country || "").replace(/"/g, '""');
  const cleanType = String(membershipType || "").replace(/"/g, '""');
  const cleanEmail = String(emailAddress || "").replace(/"/g, '""');

  const csvRow = `"${cleanTime}","${cleanName}","${cleanCountry}","${cleanType}","${cleanEmail}"\n`;
  const csvBlob = Utilities.newBlob(csvRow, 'text/csv');

  const job = {
    configuration: {
      load: {
        destinationTable: {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId
        },
        sourceFormat: 'CSV',
        writeDisposition: 'WRITE_APPEND'
      }
    }
  };

  const runJob = BigQuery.Jobs.insert(job, projectId, csvBlob);
  Logger.log('BigQuery batch job successfully started. ID: ' + runJob.jobReference.jobId);
}


