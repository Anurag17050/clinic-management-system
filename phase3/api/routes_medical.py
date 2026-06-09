from flask import Blueprint, request, jsonify
from config import get_connection

medical_bp = Blueprint('medical', __name__)

@medical_bp.route('/', methods=['POST'])
def create_medical_record():
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Insert medical record
        cur.execute("""
            INSERT INTO MEDICAL_RECORD (
                record_id, appt_id, symptoms, diagnosis,
                treatment_notes, follow_up_date
            ) VALUES (
                seq_record.NEXTVAL, :1, :2, :3, :4,
                TO_DATE(:5, 'YYYY-MM-DD')
            )
        """, [
            data['appt_id'],
            data.get('symptoms'),
            data['diagnosis'],
            data.get('treatment_notes'),
            data.get('follow_up_date')
        ])
        # Mark appointment as COMPLETED
        cur.execute("""
            UPDATE APPOINTMENT
            SET status = 'COMPLETED'
            WHERE appt_id = :1
        """, [data['appt_id']])
        conn.commit()
        return jsonify({"message": "Medical record created, appointment completed"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()

@medical_bp.route('/', methods=['GET'])
def get_all_records():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT mr.record_id, mr.appt_id,
               p.first_name || ' ' || p.last_name AS patient_name,
               d.first_name || ' ' || d.last_name AS doctor_name,
               mr.symptoms, mr.diagnosis, mr.treatment_notes,
               TO_CHAR(mr.follow_up_date,'YYYY-MM-DD'),
               TO_CHAR(mr.created_at,'YYYY-MM-DD')
        FROM MEDICAL_RECORD mr
        JOIN APPOINTMENT a ON mr.appt_id = a.appt_id
        JOIN PATIENT p ON a.patient_id = p.patient_id
        JOIN DOCTOR d ON a.doctor_id = d.doctor_id
        ORDER BY mr.record_id DESC
    """)
    rows = cur.fetchall()
    keys = ['record_id','appt_id','patient_name','doctor_name',
            'symptoms','diagnosis','treatment_notes','follow_up_date','created_at']
    cur.close(); conn.close()
    return jsonify([dict(zip(keys, r)) for r in rows])
