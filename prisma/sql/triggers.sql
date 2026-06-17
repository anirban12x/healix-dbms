-- =====================================================
-- HEALIX DATABASE TRIGGERS
-- =====================================================

-- Trigger 1: Automatically reduce inventory after successful order
CREATE OR REPLACE FUNCTION fn_reduce_inventory()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_status = 'Confirmed' AND (OLD.order_status IS NULL OR OLD.order_status != 'Confirmed') THEN
    UPDATE inventory
    SET stock_quantity = stock_quantity - oi.quantity,
        last_updated = NOW()
    FROM order_items oi
    WHERE oi.order_id = NEW.order_id
      AND inventory.medicine_id = oi.medicine_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reduce_inventory ON orders;
CREATE TRIGGER trg_reduce_inventory
AFTER UPDATE OF order_status ON orders
FOR EACH ROW
EXECUTE FUNCTION fn_reduce_inventory();

-- Trigger 2: Increase reward points after successful payment
CREATE OR REPLACE FUNCTION fn_increase_rewards()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id INTEGER;
  v_points INTEGER;
BEGIN
  IF NEW.payment_status = 'Successful' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'Successful') THEN
    SELECT customer_id INTO v_customer_id FROM orders WHERE order_id = NEW.order_id;
    v_points := FLOOR(NEW.payment_amount / 10);
    
    UPDATE customer
    SET reward_points = reward_points + v_points
    WHERE customer_id = v_customer_id;
    
    INSERT INTO reward_transaction (customer_id, points_earned, points_used, transaction_date)
    VALUES (v_customer_id, v_points, 0, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increase_rewards ON payment;
CREATE TRIGGER trg_increase_rewards
AFTER UPDATE OF payment_status ON payment
FOR EACH ROW
EXECUTE FUNCTION fn_increase_rewards();

-- Trigger 3: Add audit logs whenever medicine is updated
CREATE OR REPLACE FUNCTION fn_audit_medicine_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (action_type, table_name, performed_by, action_time, description)
  VALUES (
    'UPDATE',
    'medicine',
    'system',
    NOW(),
    FORMAT('Medicine ID %s (%s) was updated. Price: %s -> %s', 
           OLD.medicine_id, OLD.medicine_name, OLD.price, NEW.price)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_medicine ON medicine;
CREATE TRIGGER trg_audit_medicine
AFTER UPDATE ON medicine
FOR EACH ROW
EXECUTE FUNCTION fn_audit_medicine_update();

-- Trigger 4: Mark medicine expired automatically when expiry date crossed
CREATE OR REPLACE FUNCTION fn_check_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date < CURRENT_DATE THEN
    INSERT INTO audit_log (action_type, table_name, performed_by, action_time, description)
    VALUES (
      'EXPIRY_ALERT',
      'medicine',
      'system',
      NOW(),
      FORMAT('Medicine %s (ID: %s) has expired on %s', NEW.medicine_name, NEW.medicine_id, NEW.expiry_date)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_expiry ON medicine;
CREATE TRIGGER trg_check_expiry
AFTER INSERT OR UPDATE ON medicine
FOR EACH ROW
EXECUTE FUNCTION fn_check_expiry();
