from flask import Blueprint, request, jsonify
from config import get_connection

patients_bp = Blueprint('patients', __name__)


# ── GET all patients ──────────────────────────────────────
@patients_bp.route('/', methods=['GET'])
def get_all_patients():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT patient_id, first_name, last_name,
               TO_CHAR(dob, 'YYYY-MM-DD'), gender, blood_group,
               email, phone, address, emergency_contact,
               TO_CHAR(registration_date, 'YYYY-MM-DD')
        FROM PATIENT
        ORDER BY patient_id
    """)
    rows = cur.fetchall()
    keys = ['patient_id', 'first_name', 'last_name', 'dob', 'gender',
            'blood_group', 'email', 'phone', 'address',
            'emergency_contact', 'registration_date']
    result = [dict(zip(keys, row)) for row in rows]
    cur.close(); conn.close()
    return jsonify(result)


# ── GET single patient ────────────────────────────────────
@patients_bp.route('/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT patient_id, first_name, last_name,
               TO_CHAR(dob, 'YYYY-MM-DD'), gender, blood_group,
               email, phone, address, emergency_contact,
               TO_CHAR(registration_date, 'YYYY-MM-DD')
        FROM PATIENT
        WHERE patient_id = :1
    """, [patient_id])
    row = cur.fetchone()
    cur.close(); conn.close()
    if not row:
        return jsonify({"error": "Patient not found"}), 404
    keys = ['patient_id', 'first_name', 'last_name', 'dob', 'gender',
            'blood_group', 'email', 'phone', 'address',
            'emergency_contact', 'registration_date']
    return jsonify(dict(zip(keys, row)))


# ── Register patient ──────────────────────────────────────
@patients_bp.route('/', methods=['POST'])
def register_patient():
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO PATIENT (
                patient_id, first_name, last_name, dob, gender,
                blood_group, email, phone, address, emergency_contact
            ) VALUES (
                seq_patient.NEXTVAL, :1, :2, TO_DATE(:3, 'YYYY-MM-DD'),
                :4, :5, :6, :7, :8, :9
            )
        """, [
            data['first_name'], data['last_name'], data['dob'],
            data.get('gender'), data.get('blood_group'),
            data.get('email'), data['phone'],
            data.get('address'), data.get('emergency_contact')
        ])
        conn.commit()
        return jsonify({"message": "Patient registered successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()


# ── Update patient ────────────────────────────────────────
@patients_bp.route('/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE PATIENT SET
                first_name        = :1,
                last_name         = :2,
                phone             = :3,
                address           = :4,
                emergency_contact = :5
            WHERE patient_id = :6
        """, [
            data['first_name'], data['last_name'],
            data['phone'], data.get('address'),
            data.get('emergency_contact'), patient_id
        ])
        conn.commit()
        return jsonify({"message": "Patient updated"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()
