from flask import Blueprint, request, jsonify
from config import get_connection

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/', methods=['GET'])
def get_all_appointments():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT a.appt_id, 
               p.first_name || ' ' || p.last_name AS patient_name,
               d.first_name || ' ' || d.last_name AS doctor_name,
               t.slot_label, TO_CHAR(a.appt_date,'YYYY-MM-DD'),
               a.status, a.reason
        FROM APPOINTMENT a
        JOIN PATIENT p     ON a.patient_id = p.patient_id
        JOIN DOCTOR d      ON a.doctor_id  = d.doctor_id
        JOIN TIME_SLOT t   ON a.slot_id    = t.slot_id
        ORDER BY a.appt_date DESC
    """)
    rows = cur.fetchall()
    keys = ['appt_id','patient_name','doctor_name',
            'slot_label','appt_date','status','reason']
    result = [dict(zip(keys, row)) for row in rows]
    cur.close(); conn.close()
    return jsonify(result)

@appointments_bp.route('/', methods=['POST'])
def book_appointment():
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO APPOINTMENT (
                appt_id, patient_id, doctor_id,
                slot_id, appt_date, reason
            ) VALUES (
                seq_appt.NEXTVAL, :1, :2, :3,
                TO_DATE(:4,'YYYY-MM-DD'), :5
            )
        """, [
            data['patient_id'], data['doctor_id'],
            data['slot_id'], data['appt_date'],
            data.get('reason')
        ])
        conn.commit()
        return jsonify({"message": "Appointment booked"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()

@appointments_bp.route('/<int:appt_id>/status', methods=['PUT'])
def update_status(appt_id):
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE APPOINTMENT SET status = :1 WHERE appt_id = :2
    """, [data['status'], appt_id])
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"message": "Status updated"})

@appointments_bp.route('/doctor/<int:doctor_id>', methods=['GET'])
def get_by_doctor(doctor_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT a.appt_id,
               p.first_name || ' ' || p.last_name,
               t.slot_label, TO_CHAR(a.appt_date,'YYYY-MM-DD'),
               a.status, a.reason
        FROM APPOINTMENT a
        JOIN PATIENT p   ON a.patient_id = p.patient_id
        JOIN TIME_SLOT t ON a.slot_id    = t.slot_id
        WHERE a.doctor_id = :1
        ORDER BY a.appt_date DESC
    """, [doctor_id])
    rows = cur.fetchall()
    keys = ['appt_id','patient_name','slot_label',
            'appt_date','status','reason']
    result = [dict(zip(keys, row)) for row in rows]
    cur.close(); conn.close()
    return jsonify(result)
