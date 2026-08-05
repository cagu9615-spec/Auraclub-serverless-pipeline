-- 1.Members table with multi-field clustering
CREATE TABLE `my-project-12345-503409.auraclub_analytics.members_staging` (
  signup_timestamp STRING,
  full_name STRING,
  country STRING,
  membership_type STRING,
  status STRING
)
CLUSTER BY status, membership_type;

-- 2.Revenue table with DAY Partitioning, Clustering, and Native ARRAY Support
CREATE TABLE `my-project-12345-503409.auraclub_analytics.revenue_staging` (
  email STRING,
  source_platform STRING,
  amount_paid FLOAT64,
  transaction_date DATE,
  products_purchased ARRAY<STRING>
)
PARTITION BY transaction_date
CLUSTER BY source_platform;
