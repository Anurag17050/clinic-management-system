-- ============================================================
-- TRIGGER 1: Prevent Double Booking
-- Fires BEFORE INSERT on APPOINTMENT
-- Checks if doctor already has a SCHEDULED/COMPLETED appt
-- for that date+slot (belt-and-suspenders over UNIQUE constraint)
-- ============================================================
CREATE OR REPLACE TRIGGER trg_prevent_double_booking
BEFORE INSERT ON APPOINTMENT
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM   APPOINTMENT
    WHERE  doctor_id = :NEW.doctor_id
    AND    appt_date = :NEW.appt_date
    AND    slot_id   = :NEW.slot_id
    AND    status NOT IN ('CANCELLED','NO_SHOW');

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001,
            'Double booking! Doctor already has an appointment in this slot.');
    END IF;
END;
/

-- ============================================================
-- TRIGGER 2: Auto-update Payment Status on BILLING
-- Fires AFTER INSERT on PAYMENT_TRANSACTION
-- Compares total paid vs total_amount and sets PARTIAL or PAID
-- ============================================================
CREATE OR REPLACE TRIGGER trg_update_payment_status
AFTER INSERT ON PAYMENT_TRANSACTION
FOR EACH ROW
DECLARE
    v_total_amount  NUMBER(10,2);
    v_total_paid    NUMBER(10,2);
BEGIN
    -- Get the bill's total amount
    SELECT total_amount INTO v_total_amount
    FROM   BILLING
    WHERE  bill_id = :NEW.bill_id;

    -- Sum all payments made so far for this bill
    SELECT NVL(SUM(amount_paid), 0) INTO v_total_paid
    FROM   PAYMENT_TRANSACTION
    WHERE  bill_id = :NEW.bill_id;

    -- Update status accordingly
    IF v_total_paid >= v_total_amount THEN
        UPDATE BILLING
        SET    payment_status = 'PAID'
        WHERE  bill_id = :NEW.bill_id;
    ELSIF v_total_paid > 0 THEN
        UPDATE BILLING
        SET    payment_status = 'PARTIAL'
        WHERE  bill_id = :NEW.bill_id;
    END IF;
END;
/

-- ============================================================
-- TRIGGER 3 (Bonus): Auto-set Appointment status to COMPLETED
-- when a Medical Record is inserted for that appointment
-- ============================================================
CREATE OR REPLACE TRIGGER trg_complete_appointment
AFTER INSERT ON MEDICAL_RECORD
FOR EACH ROW
BEGIN
    UPDATE APPOINTMENT
    SET    status = 'COMPLETED'
    WHERE  appt_id = :NEW.appt_id
    AND    status  = 'SCHEDULED';
END;
/
