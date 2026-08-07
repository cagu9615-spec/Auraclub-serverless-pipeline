-- Flattening nested product purchases into clean relational rows
SELECT 
  email,
  source_platform,
  amount_paid,
  transaction_date,
  single_product_name
FROM 
  `my-project-12345-503409.auraclub_analytics.revenue_staging`,
  UNNEST(products_purchased) AS single_product_name;
