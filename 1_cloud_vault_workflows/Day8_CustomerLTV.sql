 --Calculating running Customer Lifetime Value (LTV) via Analytic Window Functions
SELECT 
  email,
  transaction_date,
  source_platform,
  amount_paid,
  SUM(amount_paid) OVER (
    PARTITION BY email 
    ORDER BY transaction_date ASC
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS customer_rolling_ltv
FROM 
  `my-project-12345-503409.auraclub_analytics.revenue_staging`
ORDER BY 
  email, 
  transaction_date ASC;
