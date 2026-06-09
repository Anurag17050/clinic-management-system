-- ============================================================
-- CLINIC MANAGEMENT SYSTEM — DDL (Oracle SQL)
-- ============================================================

-- 1. DEPARTMENT (no FK to DOCTOR yet — circular, added later)
CREATE TABLE DEPARTMENT (
    dept_id       NUMBER PRIMARY KEY,
    dept_name     VARCHAR2(100) NOT NULL UNIQUE,
    location      VARCHAR2(150),
    head_doctor_id NUMBER   -- FK added after DOCTOR table
);

-- 2. DOCTOR
CREATE TABLE DOCTOR (
    doctor_id      NUMBER PRIMARY KEY,
    first_name     VARCHAR2(50)  NOT NULL,
    last_name      VARCHAR2(50)  NOT NULL,
    email          VARCHAR2(100) NOT NULL UNIQUE,
    phone          VARCHAR2(15)  UNIQUE,
    license_no     VARCHAR2(50)  NOT NULL UNIQUE,
    specialization VARCHAR2(100) NOT NULL,
    dept_id        NUMBER        NOT NULL,
    hire_date      DATE          DEFAULT SYSDATE,
    status         VARCHAR2(10)  DEFAULT 'ACTIVE'
                   CHECK (status IN ('ACTIVE','ON_LEAVE','INACTIVE')),
    CONSTRAINT fk_doctor_dept FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id)
);

-- Add the circular FK now that DOCTOR exists
ALTER TABLE DEPARTMENT
    ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_doctor_id) REFERENCES DOCTOR(doctor_id);

-- 3. PATIENT
CREATE TABLE PATIENT (
    patient_id        NUMBER PRIMARY KEY,
    first_name        VARCHAR2(50)  NOT NULL,
    last_name         VARCHAR2(50)  NOT NULL,
    dob               DATE          NOT NULL,
    gender            CHAR(1)       CHECK (gender IN ('M','F','O')),
    blood_group       VARCHAR2(5),
    email             VARCHAR2(100) UNIQUE,
    phone             VARCHAR2(15)  NOT NULL UNIQUE,
    address           VARCHAR2(255),
    emergency_contact VARCHAR2(15),
    registration_date DATE          DEFAULT SYSDATE
);

-- 4. INSURANCE_POLICY
CREATE TABLE INSURANCE_POLICY (
    policy_id     NUMBER PRIMARY KEY,
    patient_id    NUMBER        NOT NULL,
    provider_name VARCHAR2(100) NOT NULL,
    policy_number VARCHAR2(50)  NOT NULL UNIQUE,
    coverage_pct  NUMBER(5,2)   CHECK (coverage_pct BETWEEN 0 AND 100),
    expiry_date   DATE          NOT NULL,
    CONSTRAINT fk_ins_patient FOREIGN KEY (patient_id) REFERENCES PATIENT(patient_id)
);

-- 5. TIME_SLOT
CREATE TABLE TIME_SLOT (
    slot_id    NUMBER PRIMARY KEY,
    slot_label VARCHAR2(20)  NOT NULL UNIQUE,
    start_time VARCHAR2(8)   NOT NULL,
    end_time   VARCHAR2(8)   NOT NULL,
    slot_type  VARCHAR2(10)  CHECK (slot_type IN ('MORNING','AFTERNOON','EVENING')),
    CONSTRAINT uq_slot_time UNIQUE (start_time, end_time)
);

-- 6. DOCTOR_SCHEDULE
CREATE TABLE DOCTOR_SCHEDULE (
    schedule_id  NUMBER PRIMARY KEY,
    doctor_id    NUMBER      NOT NULL,
    working_day  VARCHAR2(3) NOT NULL CHECK (working_day IN ('MON','TUE','WED','THU','FRI','SAT','SUN')),
    slot_id      NUMBER      NOT NULL,
    is_available CHAR(1)     DEFAULT 'Y' CHECK (is_available IN ('Y','N')),
    CONSTRAINT fk_sched_doctor FOREIGN KEY (doctor_id) REFERENCES DOCTOR(doctor_id),
    CONSTRAINT fk_sched_slot   FOREIGN KEY (slot_id)   REFERENCES TIME_SLOT(slot_id),
    CONSTRAINT uq_sched        UNIQUE (doctor_id, working_day, slot_id)
);

-- 7. APPOINTMENT
CREATE TABLE APPOINTMENT (
    appt_id    NUMBER PRIMARY KEY,
    patient_id NUMBER       NOT NULL,
    doctor_id  NUMBER       NOT NULL,
    slot_id    NUMBER       NOT NULL,
    appt_date  DATE         NOT NULL,
    status     VARCHAR2(10) DEFAULT 'SCHEDULED'
               CHECK (status IN ('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW')),
    reason     VARCHAR2(255),
    created_at DATE         DEFAULT SYSDATE,
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES PATIENT(patient_id),
    CONSTRAINT fk_appt_doctor  FOREIGN KEY (doctor_id)  REFERENCES DOCTOR(doctor_id),
    CONSTRAINT fk_appt_slot    FOREIGN KEY (slot_id)    REFERENCES TIME_SLOT(slot_id),
    CONSTRAINT uq_no_double_book UNIQUE (doctor_id, appt_date, slot_id)
);

-- 8. PATIENT_VITAL
CREATE TABLE PATIENT_VITAL (
    vital_id     NUMBER PRIMARY KEY,
    appt_id      NUMBER NOT NULL UNIQUE,
    bp_systolic  NUMBER(3),
    bp_diastolic NUMBER(3),
    temperature  NUMBER(4,1),
    pulse_rate   NUMBER(3),
    weight_kg    NUMBER(5,2),
    height_cm    NUMBER(5,2),
    recorded_at  DATE DEFAULT SYSDATE,
    CONSTRAINT fk_vital_appt FOREIGN KEY (appt_id) REFERENCES APPOINTMENT(appt_id)
);

-- 9. MEDICAL_RECORD
CREATE TABLE MEDICAL_RECORD (
    record_id       NUMBER PRIMARY KEY,
    appt_id         NUMBER NOT NULL UNIQUE,
    symptoms        CLOB,
    diagnosis       CLOB,
    treatment_notes CLOB,
    follow_up_date  DATE,
    CONSTRAINT fk_record_appt FOREIGN KEY (appt_id) REFERENCES APPOINTMENT(appt_id)
);

-- 10. PRESCRIPTION
CREATE TABLE PRESCRIPTION (
    rx_id         NUMBER PRIMARY KEY,
    appt_id       NUMBER NOT NULL UNIQUE,
    issued_date   DATE   DEFAULT SYSDATE,
    validity_days NUMBER DEFAULT 30,
    notes         CLOB,
    CONSTRAINT fk_rx_appt FOREIGN KEY (appt_id) REFERENCES APPOINTMENT(appt_id)
);

-- 11. MEDICATION
CREATE TABLE MEDICATION (
    med_id       NUMBER PRIMARY KEY,
    med_name     VARCHAR2(100) NOT NULL,
    med_type     VARCHAR2(10)  CHECK (med_type IN ('TABLET','SYRUP','INJECTION','CAPSULE','TOPICAL')),
    manufacturer VARCHAR2(100),
    unit         VARCHAR2(20)  NOT NULL,
    CONSTRAINT uq_med UNIQUE (med_name, manufacturer)
);

-- 12. PRESCRIPTION_ITEM
CREATE TABLE PRESCRIPTION_ITEM (
    item_id       NUMBER PRIMARY KEY,
    rx_id         NUMBER        NOT NULL,
    med_id        NUMBER        NOT NULL,
    dosage        VARCHAR2(50)  NOT NULL,
    frequency     VARCHAR2(50)  NOT NULL,
    duration_days NUMBER        NOT NULL,
    instructions  VARCHAR2(255),
    CONSTRAINT fk_item_rx  FOREIGN KEY (rx_id)  REFERENCES PRESCRIPTION(rx_id),
    CONSTRAINT fk_item_med FOREIGN KEY (med_id) REFERENCES MEDICATION(med_id),
    CONSTRAINT uq_rx_med   UNIQUE (rx_id, med_id)
);

-- 13. BILLING
CREATE TABLE BILLING (
    bill_id          NUMBER PRIMARY KEY,
    appt_id          NUMBER         NOT NULL UNIQUE,
    consultation_fee NUMBER(10,2)   NOT NULL,
    tax_amount       NUMBER(10,2)   DEFAULT 0,
    discount_amount  NUMBER(10,2)   DEFAULT 0,
    total_amount     NUMBER(10,2)   NOT NULL,
    bill_date        DATE           DEFAULT SYSDATE,
    payment_status   VARCHAR2(10)   DEFAULT 'PENDING'
                     CHECK (payment_status IN ('PENDING','PARTIAL','PAID','WAIVED')),
    CONSTRAINT fk_bill_appt FOREIGN KEY (appt_id) REFERENCES APPOINTMENT(appt_id)
);

-- 14. PAYMENT_TRANSACTION
CREATE TABLE PAYMENT_TRANSACTION (
    txn_id        NUMBER PRIMARY KEY,
    bill_id       NUMBER        NOT NULL,
    policy_id     NUMBER,
    payment_mode  VARCHAR2(10)  CHECK (payment_mode IN ('CASH','CARD','UPI','INSURANCE','CHEQUE')),
    amount_paid   NUMBER(10,2)  NOT NULL CHECK (amount_paid > 0),
    txn_date      DATE          DEFAULT SYSDATE,
    txn_reference VARCHAR2(100),
    CONSTRAINT fk_txn_bill   FOREIGN KEY (bill_id)   REFERENCES BILLING(bill_id),
    CONSTRAINT fk_txn_policy FOREIGN KEY (policy_id) REFERENCES INSURANCE_POLICY(policy_id)
);

-- 15. STAFF
CREATE TABLE STAFF (
    staff_id   NUMBER PRIMARY KEY,
    first_name VARCHAR2(50)  NOT NULL,
    last_name  VARCHAR2(50)  NOT NULL,
    email      VARCHAR2(100) NOT NULL UNIQUE,
    phone      VARCHAR2(15),
    role       VARCHAR2(50)  NOT NULL,
    dept_id    NUMBER        NOT NULL,
    hire_date  DATE          DEFAULT SYSDATE,
    salary     NUMBER(10,2)  CHECK (salary > 0),
    CONSTRAINT fk_staff_dept FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id)
);
