from flask import Blueprint, request, jsonify
from config import get_connection

billing_bp = Blueprint('billing', __name__)

@billing_bp.route('/report', methods=['GET'])
def billing_report():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT b.bill_id,
               p.first_name || ' ' || p.last_name AS patient_name,
               d.first_name || ' ' || d.last_name AS doctor_name,
               TO_CHAR(b.bill_date,'YYYY-MM-DD'),
               b.consultation_fee, b.tax_amount,
               b.discount_amount, b.total_amount,
               b.payment_status
        FROM BILLING b
        JOIN APPOINTMENT a ON b.appt_id   = a.appt_id
        JOIN PATIENT p     ON a.patient_id = p.patient_id
        JOIN DOCTOR d      ON a.doctor_id  = d.doctor_id
        ORDER BY b.bill_date DESC
    """)
    rows = cur.fetchall()
    keys = ['bill_id','patient_name','doctor_name','bill_date',
            'consultation_fee','tax_amount','discount_amount',
            'total_amount','payment_status']
    result = [dict(zip(keys, row)) for row in rows]
    cur.close(); conn.close()
    return jsonify(result)

@billing_bp.route('/', methods=['POST'])
def create_bill():
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO BILLING (
                bill_id, appt_id, consultation_fee,
                tax_amount, discount_amount, total_amount
            ) VALUES (
                seq_bill.NEXTVAL, :1, :2, :3, :4, :5
            )
        """, [
            data['appt_id'], data['consultation_fee'],
            data.get('tax_amount', 0), data.get('discount_amount', 0),
            data['total_amount']
        ])
        conn.commit()
        return jsonify({"message": "Bill created"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()

@billing_bp.route('/summary', methods=['GET'])
def billing_summary():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT payment_status, COUNT(*) AS count,
               SUM(total_amount) AS total
        FROM BILLING
        GROUP BY payment_status
    """)
    rows = cur.fetchall()
    keys = ['payment_status','count','total']
    result = [dict(zip(keys, row)) for row in rows]
    cur.close(); conn.close()
    return jsonify(result)

@billing_bp.route('/pay', methods=['POST'])
def make_payment():
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Insert payment transaction
        cur.execute("""
            INSERT INTO PAYMENT_TRANSACTION (
                txn_id, bill_id, policy_id, payment_mode,
                amount_paid, txn_reference
            ) VALUES (
                seq_txn.NEXTVAL, :1, :2, :3, :4, :5
            )
        """, [
            data['bill_id'], data.get('policy_id'),
            data['payment_mode'], data['amount_paid'],
            data.get('txn_reference')
        ])
        # Calculate total paid so far vs bill total
        cur.execute("""
            SELECT b.total_amount,
                   NVL((SELECT SUM(t.amount_paid)
                        FROM PAYMENT_TRANSACTION t
                        WHERE t.bill_id = b.bill_id), 0)
            FROM BILLING b
            WHERE b.bill_id = :1
        """, [data['bill_id']])
        row = cur.fetchone()
        total_amount = float(row[0])
        total_paid   = float(row[1])

        if total_paid >= total_amount:
            new_status = 'PAID'
        elif total_paid > 0:
            new_status = 'PARTIAL'
        else:
            new_status = 'PENDING'

        cur.execute("""
            UPDATE BILLING SET payment_status = :1 WHERE bill_id = :2
        """, [new_status, data['bill_id']])

        conn.commit()
        remaining = max(0, total_amount - total_paid)
        return jsonify({
            "message": f"Payment recorded. Status: {new_status}",
            "total_amount": total_amount,
            "total_paid": total_paid,
            "remaining": remaining,
            "status": new_status
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()

@billing_bp.route('/pending', methods=['GET'])
def pending_bills():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT b.bill_id,
               p.first_name || ' ' || p.last_name AS patient_name,
               b.total_amount, b.payment_status,
               TO_CHAR(b.bill_date,'YYYY-MM-DD'),
               NVL((SELECT SUM(t.amount_paid) FROM PAYMENT_TRANSACTION t WHERE t.bill_id = b.bill_id),0) AS paid_so_far
        FROM BILLING b
        JOIN APPOINTMENT a ON b.appt_id = a.appt_id
        JOIN PATIENT p ON a.patient_id = p.patient_id
        WHERE b.payment_status IN ('PENDING','PARTIAL')
        ORDER BY b.bill_date DESC
    """)
    rows = cur.fetchall()
    result = []
    for r in rows:
        result.append({
            'bill_id': r[0],
            'patient_name': r[1],
            'total_amount': float(r[2]),
            'payment_status': r[3],
            'bill_date': r[4],
            'paid_so_far': float(r[5]),
            'remaining': float(r[2]) - float(r[5])
        })
    cur.close(); conn.close()
    return jsonify(result)

@billing_bp.route('/all', methods=['GET'])
def all_bills():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT b.bill_id,
               p.first_name || ' ' || p.last_name AS patient_name,
               TO_CHAR(b.bill_date,'YYYY-MM-DD'),
               b.consultation_fee, b.tax_amount,
               b.discount_amount, b.total_amount,
               NVL((SELECT SUM(t.amount_paid) FROM PAYMENT_TRANSACTION t WHERE t.bill_id = b.bill_id),0) AS amount_paid,
               b.payment_status
        FROM BILLING b
        JOIN APPOINTMENT a ON b.appt_id = a.appt_id
        JOIN PATIENT p ON a.patient_id = p.patient_id
        ORDER BY b.bill_date DESC
    """)
    rows = cur.fetchall()
    keys = ['bill_id','patient_name','bill_date','consultation_fee',
            'tax_amount','discount_amount','total_amount','amount_paid','payment_status']
    cur.close(); conn.close()
    return jsonify([dict(zip(keys, r)) for r in rows])

@billing_bp.route('/revenue', methods=['GET'])
def revenue():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT
            NVL(SUM(b.total_amount),0) AS total_billed,
            NVL(SUM(CASE WHEN b.payment_status='PAID' THEN b.total_amount ELSE 0 END),0) AS total_collected,
            NVL(SUM(CASE WHEN b.payment_status='PENDING' THEN b.total_amount ELSE 0 END),0) AS total_pending,
            COUNT(CASE WHEN b.payment_status='PAID' THEN 1 END) AS paid_count,
            COUNT(CASE WHEN b.payment_status='PENDING' THEN 1 END) AS pending_count
        FROM BILLING b
    """)
    row = cur.fetchone()
    cur.close(); conn.close()
    return jsonify({
        'total_billed': float(row[0]),
        'total_collected': float(row[1]),
        'total_pending': float(row[2]),
        'paid_count': row[3],
        'pending_count': row[4]
    })

@billing_bp.route('/invoice/<int:bill_id>', methods=['GET'])
def get_invoice(bill_id):
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Bill + patient + doctor info
        cur.execute("""
            SELECT b.bill_id, TO_CHAR(b.bill_date,'YYYY-MM-DD'),
                   b.consultation_fee, b.tax_amount, b.discount_amount,
                   b.total_amount, b.payment_status,
                   p.first_name || ' ' || p.last_name,
                   p.phone, p.email, p.blood_group, p.gender,
                   TO_CHAR(p.dob,'YYYY-MM-DD'),
                   d.first_name || ' ' || d.last_name,
                   d.specialization, dept.dept_name, d.license_no,
                   a.appt_id, TO_CHAR(a.appt_date,'YYYY-MM-DD'), a.reason
            FROM BILLING b
            JOIN APPOINTMENT a ON b.appt_id = a.appt_id
            JOIN PATIENT p ON a.patient_id = p.patient_id
            JOIN DOCTOR d ON a.doctor_id = d.doctor_id
            JOIN DEPARTMENT dept ON d.dept_id = dept.dept_id
            WHERE b.bill_id = :1
        """, [bill_id])
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Bill not found"}), 404

        invoice = {
            'bill_id': row[0], 'bill_date': row[1],
            'consultation_fee': float(row[2]), 'tax_amount': float(row[3]),
            'discount_amount': float(row[4]), 'total_amount': float(row[5]),
            'payment_status': row[6],
            'patient_name': row[7], 'patient_phone': row[8],
            'patient_email': row[9], 'blood_group': row[10],
            'gender': row[11], 'dob': row[12],
            'doctor_name': row[13], 'specialization': row[14],
            'dept_name': row[15], 'license_no': row[16],
            'appt_id': row[17], 'appt_date': row[18], 'reason': row[19]
        }

        # Medical record (diagnosis)
        cur.execute("""
            SELECT DBMS_LOB.SUBSTR(symptoms,4000,1),
                   DBMS_LOB.SUBSTR(diagnosis,4000,1),
                   DBMS_LOB.SUBSTR(treatment_notes,4000,1),
                   TO_CHAR(follow_up_date,'YYYY-MM-DD')
            FROM MEDICAL_RECORD WHERE appt_id = :1
        """, [invoice['appt_id']])
        med = cur.fetchone()
        invoice['medical'] = {
            'symptoms': med[0], 'diagnosis': med[1],
            'treatment_notes': med[2], 'follow_up_date': med[3]
        } if med else None

        # Prescriptions
        cur.execute("""
            SELECT pr.rx_id, TO_CHAR(pr.issued_date,'YYYY-MM-DD'), pr.validity_days,
                   DBMS_LOB.SUBSTR(pr.notes,4000,1)
            FROM PRESCRIPTION pr WHERE pr.appt_id = :1
            ORDER BY pr.rx_id
        """, [invoice['appt_id']])
        rxs = cur.fetchall()
        prescriptions = []
        for rx in rxs:
            cur.execute("""
                SELECT m.med_name, m.med_type, i.dosage,
                       i.frequency, i.duration_days, i.instructions
                FROM PRESCRIPTION_ITEM i
                JOIN MEDICATION m ON i.med_id = m.med_id
                WHERE i.rx_id = :1
            """, [rx[0]])
            items = cur.fetchall()
            keys = ['med_name','med_type','dosage','frequency','duration_days','instructions']
            prescriptions.append({
                'rx_id': rx[0], 'issued_date': rx[1],
                'validity_days': rx[2], 'notes': rx[3],
                'items': [dict(zip(keys, i)) for i in items]
            })
        invoice['prescriptions'] = prescriptions

        # Payments made
        cur.execute("""
            SELECT TO_CHAR(txn_date,'YYYY-MM-DD'), payment_mode,
                   amount_paid, txn_reference
            FROM PAYMENT_TRANSACTION WHERE bill_id = :1
            ORDER BY txn_date
        """, [bill_id])
        txns = cur.fetchall()
        keys = ['txn_date','payment_mode','amount_paid','txn_reference']
        invoice['payments'] = [dict(zip(keys, t)) for t in txns]

        return jsonify(invoice)
    finally:
        cur.close(); conn.close()

@billing_bp.route('/daily-revenue', methods=['GET'])
def daily_revenue():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT TO_CHAR(t.txn_date,'YYYY-MM-DD') AS day,
               SUM(t.amount_paid) AS collected
        FROM PAYMENT_TRANSACTION t
        WHERE t.txn_date >= SYSDATE - 30
        GROUP BY TO_CHAR(t.txn_date,'YYYY-MM-DD')
        ORDER BY day
    """)
    rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify([{"day": r[0], "collected": float(r[1])} for r in rows])
