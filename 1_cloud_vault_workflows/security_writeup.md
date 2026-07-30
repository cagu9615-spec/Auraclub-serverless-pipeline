# 1_cloud_vault_workflows

## Day 5: IAM Infrastructure Hardening & Least Privilege Governance

### Security Architecture Configuration
To protect core data archives from operational risk or script credential leaks, the data ingestion pipeline has been hardened using Google Cloud IAM (Identity & Access Management) governance frameworks.

1. **Isolated Service Account**: Created a non-human identity entity (`vault-backup-worker`) specifically designated for automated serverless pipeline authentications.
2. **Principle of Least Privilege Applied**: The service account is explicitly bound to the **Storage Object Creator** (`roles/storage.objectCreator`) IAM role. 
3. **Privilege Boundaries Enforced**: 
   * **Allowed Actions:** Write metadata and stream raw data objects into the designated storage layer.
   * **Restricted Actions:** Completely blocked from reading historical files, listing bucket directories, altering existing object shapes, or executing destructive deletion commands.

### Objective
Enforcing strict data immutability at rest. If the upstream execution script environment is ever compromised, the exposed cryptographic JSON keys cannot be leveraged to read or destroy historical corporate archive backups.
