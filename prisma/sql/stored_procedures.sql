-- =====================================================
-- HEALIX STORED PROCEDURES
-- =====================================================

-- Stored Procedure 1: Place Order
CREATE OR REPLACE FUNCTION sp_place_order(
  p_customer_id INTEGER,
  p_prescription_id INTEGER DEFAULT NULL,
  p_items JSONB DEFAULT '[]'
)
RETURNS INTEGER AS $$
DECLARE
  v_order_id INTEGER;
  v_subtotal NUMERIC(10,2) := 0;
  v_discount NUMERIC(10,2) := 0;
  v_total NUMERIC(10,2) := 0;
  v_item JSONB;
  v_price NUMERIC(10,2);
  v_membership VARCHAR(20);
BEGIN
  -- Get customer membership for discount
  SELECT membership_tier INTO v_membership FROM customer WHERE customer_id = p_customer_id;
  
  -- Create order
  INSERT INTO orders (customer_id, prescription_id, order_date, order_status, subtotal, discount, total_amount)
  VALUES (p_customer_id, p_prescription_id, NOW(), 'Pending', 0, 0, 0)
  RETURNING order_id INTO v_order_id;
  
  -- Add order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT price INTO v_price FROM medicine WHERE medicine_id = (v_item->>'medicine_id')::INTEGER;
    
    INSERT INTO order_items (order_id, medicine_id, quantity, unit_price, item_total)
    VALUES (
      v_order_id,
      (v_item->>'medicine_id')::INTEGER,
      (v_item->>'quantity')::INTEGER,
      v_price,
      v_price * (v_item->>'quantity')::INTEGER
    );
    
    v_subtotal := v_subtotal + (v_price * (v_item->>'quantity')::INTEGER);
  END LOOP;
  
  -- Calculate discount based on membership
  IF v_membership = 'Premium' THEN
    v_discount := v_subtotal * 0.10;
  ELSIF v_membership = 'Gold' THEN
    v_discount := v_subtotal * 0.05;
  END IF;
  
  v_total := v_subtotal - v_discount;
  
  -- Update order totals
  UPDATE orders SET subtotal = v_subtotal, discount = v_discount, total_amount = v_total
  WHERE order_id = v_order_id;
  
  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- Stored Procedure 2: Verify Prescription
CREATE OR REPLACE FUNCTION sp_verify_prescription(
  p_prescription_id INTEGER,
  p_status VARCHAR DEFAULT 'Verified'
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE prescription
  SET verification_status = p_status
  WHERE prescription_id = p_prescription_id;
  
  INSERT INTO audit_log (action_type, table_name, performed_by, action_time, description)
  VALUES ('VERIFY', 'prescription', 'admin', NOW(), 
          FORMAT('Prescription %s verification status changed to %s', p_prescription_id, p_status));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Stored Procedure 3: Update Inventory
CREATE OR REPLACE FUNCTION sp_update_inventory(
  p_medicine_id INTEGER,
  p_quantity_change INTEGER,
  p_new_reorder_level INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE inventory
  SET stock_quantity = GREATEST(0, stock_quantity + p_quantity_change),
      reorder_level = COALESCE(p_new_reorder_level, reorder_level),
      last_updated = NOW()
  WHERE medicine_id = p_medicine_id;
  
  IF NOT FOUND THEN
    INSERT INTO inventory (medicine_id, stock_quantity, reorder_level, last_updated)
    VALUES (p_medicine_id, GREATEST(0, p_quantity_change), COALESCE(p_new_reorder_level, 10), NOW());
  END IF;
  
  INSERT INTO audit_log (action_type, table_name, performed_by, action_time, description)
  VALUES ('INVENTORY_UPDATE', 'inventory', 'admin', NOW(),
          FORMAT('Medicine %s inventory changed by %s units', p_medicine_id, p_quantity_change));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Stored Procedure 4: Process Payment
CREATE OR REPLACE FUNCTION sp_process_payment(
  p_order_id INTEGER,
  p_payment_mode VARCHAR DEFAULT 'Online',
  p_status VARCHAR DEFAULT 'Successful'
)
RETURNS INTEGER AS $$
DECLARE
  v_payment_id INTEGER;
  v_amount NUMERIC(10,2);
BEGIN
  SELECT total_amount INTO v_amount FROM orders WHERE order_id = p_order_id;
  
  INSERT INTO payment (order_id, payment_mode, payment_amount, payment_status, payment_date)
  VALUES (p_order_id, p_payment_mode, v_amount, p_status, NOW())
  ON CONFLICT (order_id) DO UPDATE SET
    payment_status = p_status,
    payment_mode = p_payment_mode,
    payment_date = NOW()
  RETURNING payment_id INTO v_payment_id;
  
  IF p_status = 'Successful' THEN
    UPDATE orders SET order_status = 'Confirmed' WHERE order_id = p_order_id;
    
    INSERT INTO delivery (order_id, delivery_address, delivery_fee, delivery_status)
    SELECT p_order_id, c.address, 49.00, 'Processing'
    FROM orders o JOIN customer c ON o.customer_id = c.customer_id
    WHERE o.order_id = p_order_id
    ON CONFLICT (order_id) DO NOTHING;
  END IF;
  
  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql;

-- Stored Procedure 5: Generate Sales Report
CREATE OR REPLACE FUNCTION sp_generate_sales_report(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  report_date DATE,
  total_orders BIGINT,
  total_revenue NUMERIC,
  successful_payments BIGINT,
  failed_payments BIGINT,
  avg_order_value NUMERIC,
  top_medicine VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.order_date::DATE AS report_date,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_revenue,
    COUNT(DISTINCT CASE WHEN p.payment_status = 'Successful' THEN p.payment_id END) AS successful_payments,
    COUNT(DISTINCT CASE WHEN p.payment_status = 'Failed' THEN p.payment_id END) AS failed_payments,
    COALESCE(AVG(o.total_amount), 0) AS avg_order_value,
    (SELECT m.medicine_name FROM order_items oi2 
     JOIN medicine m ON oi2.medicine_id = m.medicine_id
     WHERE oi2.order_id = ANY(ARRAY_AGG(o.order_id))
     GROUP BY m.medicine_name ORDER BY SUM(oi2.quantity) DESC LIMIT 1
    )::VARCHAR AS top_medicine
  FROM orders o
  LEFT JOIN payment p ON o.order_id = p.order_id
  WHERE o.order_date::DATE BETWEEN p_start_date AND p_end_date
  GROUP BY o.order_date::DATE
  ORDER BY report_date DESC;
END;
$$ LANGUAGE plpgsql;
