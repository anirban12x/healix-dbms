-- =====================================================
-- HEALIX DATABASE VIEWS
-- =====================================================

-- View 1: Customer Orders
CREATE OR REPLACE VIEW vw_customer_orders AS
SELECT 
  o.order_id,
  c.customer_id,
  c.full_name,
  c.email,
  o.order_date,
  o.order_status,
  o.subtotal,
  o.discount,
  o.total_amount,
  p.payment_status,
  d.delivery_status
FROM orders o
JOIN customer c ON o.customer_id = c.customer_id
LEFT JOIN payment p ON o.order_id = p.order_id
LEFT JOIN delivery d ON o.order_id = d.order_id
ORDER BY o.order_date DESC;

-- View 2: Inventory Status
CREATE OR REPLACE VIEW vw_inventory_status AS
SELECT 
  m.medicine_id,
  m.medicine_name,
  m.manufacturer,
  m.price,
  i.stock_quantity,
  i.reorder_level,
  i.last_updated,
  CASE 
    WHEN i.stock_quantity = 0 THEN 'Out of Stock'
    WHEN i.stock_quantity < i.reorder_level THEN 'Low Stock'
    ELSE 'In Stock'
  END AS stock_status,
  cat.category_name
FROM medicine m
LEFT JOIN inventory i ON m.medicine_id = i.medicine_id
LEFT JOIN category cat ON m.category_id = cat.category_id
ORDER BY i.stock_quantity ASC;

-- View 3: Expiring Medicines (within 90 days)
CREATE OR REPLACE VIEW vw_expiring_medicines AS
SELECT 
  m.medicine_id,
  m.medicine_name,
  m.manufacturer,
  m.expiry_date,
  m.price,
  i.stock_quantity,
  (m.expiry_date - CURRENT_DATE) AS days_until_expiry,
  CASE 
    WHEN m.expiry_date < CURRENT_DATE THEN 'Expired'
    WHEN m.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'Critical'
    WHEN m.expiry_date < CURRENT_DATE + INTERVAL '90 days' THEN 'Warning'
    ELSE 'Safe'
  END AS expiry_status
FROM medicine m
LEFT JOIN inventory i ON m.medicine_id = i.medicine_id
WHERE m.expiry_date < CURRENT_DATE + INTERVAL '90 days'
ORDER BY m.expiry_date ASC;

-- View 4: Supplier Medicines
CREATE OR REPLACE VIEW vw_supplier_medicines AS
SELECT 
  s.supplier_id,
  s.supplier_name,
  s.email AS supplier_email,
  s.phone AS supplier_phone,
  m.medicine_id,
  m.medicine_name,
  m.price AS selling_price,
  sm.purchase_price,
  (m.price - sm.purchase_price) AS profit_margin
FROM supplier_medicine sm
JOIN supplier s ON sm.supplier_id = s.supplier_id
JOIN medicine m ON sm.medicine_id = m.medicine_id
ORDER BY s.supplier_name, m.medicine_name;

-- View 5: Revenue Report
CREATE OR REPLACE VIEW vw_revenue_report AS
SELECT 
  DATE_TRUNC('month', o.order_date) AS month,
  COUNT(o.order_id) AS total_orders,
  SUM(o.total_amount) AS total_revenue,
  AVG(o.total_amount) AS avg_order_value,
  SUM(o.discount) AS total_discounts,
  COUNT(CASE WHEN p.payment_status = 'Successful' THEN 1 END) AS successful_payments,
  COUNT(CASE WHEN p.payment_status = 'Failed' THEN 1 END) AS failed_payments
FROM orders o
LEFT JOIN payment p ON o.order_id = p.order_id
GROUP BY DATE_TRUNC('month', o.order_date)
ORDER BY month DESC;

-- View 6: Low Stock Medicines
CREATE OR REPLACE VIEW vw_low_stock_medicines AS
SELECT 
  m.medicine_id,
  m.medicine_name,
  m.manufacturer,
  m.price,
  i.stock_quantity,
  i.reorder_level,
  (i.reorder_level - i.stock_quantity) AS units_needed,
  cat.category_name
FROM medicine m
JOIN inventory i ON m.medicine_id = i.medicine_id
LEFT JOIN category cat ON m.category_id = cat.category_id
WHERE i.stock_quantity < i.reorder_level
ORDER BY (i.reorder_level - i.stock_quantity) DESC;
