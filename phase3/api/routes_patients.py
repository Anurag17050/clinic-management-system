from flask import Blueprint, request, jsonify
from config import get_connection

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/', methods=['GET'])
def get_all_patients():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT patient_id, first_name, last_name, 
               TO_CHAR(dob,'YYYY-MM-DD'), gender, blood_group,
               email, phone, address, emergency_contact,
               TO_CHAR(registration_date,'YYYY-MM-DD')
        FROM PATIENT ORDER BY patient_id
    """)
    rows = cur.fetchall()
    keys = ['patient_id','first_name','last_name','dob','gender',
            'blood_group','email','phone','address',
            'emergency_contact','registration_date']
    result = [dict(zip(keys, row)) for row in rows]
    cur.close(); conn.close()
    return jsonify(result)

@patients_bp.route('/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT patient_id, first_name, last_name,
               TO_CHAR(dob,'YYYY-MM-DD'), gender, blood_group,
               email, phone, address, emergency_contact,
               TO_CHAR(registration_date,'YYYY-MM-DD')
        FROM PATIENT WHERE patient_id = :1
    """, [patient_id])
    row = cur.fetchone()
    cur.close(); conn.close()
    if not row:
        return jsonify({"error": "Patient not found"}), 404
    keys = ['patient_id','first_name','last_name','dob','gender',
            'blood_group','email','phone','address',
            'emergency_contact','registration_date']
    return jsonify(dict(zip(keys, row)))

@patients_bp.route('/', methods=['POST'])
def register_patient():
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO PATIENT (
            patient_id, first_name, last_name, dob, gender,
            blood_group, email, phone, address, emergency_contact
        ) VALUES (
            seq_patient.NEXTVAL, :1, :2, TO_DATE(:3,'YYYY-MM-DD'),
            :4, :5, :6, :7, :8, :9
        )
    """, [
        data['first_name'], data['last_name'], data['dob'],
        data.get('gender'), data.get('blood_group'),
        data.get('email'), data['phone'],
        data.get('address'), data.get('emergency_contact')
    ])
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"message": "Patient registered successfully"}), 201

@patients_bp.route('/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE PATIENT SET
            first_name = :1, last_name = :2,
            phone = :3, address = :4, emergency_contact = :5
        WHERE patient_id = :6
    """, [
        data['first_name'], data['last_name'],
        data['phone'], data.get('address'),
        data.get('emergency_contact'), patient_id
    ])
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"message": "Patient updated"})


from flask import Blueprint
doctors_bp = Blueprint('doctors', __name__)

@doctors_bp.route('/', methods=['GET'])
def get_doctors():
    from config import get_connection
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT d.doctor_id, d.first_name, d.last_name,
               d.specialization, dept.dept_name, d.email,
               d.phone, d.license_no,
               TO_CHAR(d.hire_date,'YYYY-MM-DD'), d.status
        FROM DOCTOR d JOIN DEPARTMENT dept ON d.dept_id = dept.dept_id
        ORDER BY d.doctor_id
    """)
    rows = cur.fetchall()
    keys = ['doctor_id','first_name','last_name','specialization',
            'dept_name','email','phone','license_no','hire_date','status']
    result = [dict(zip(keys, row)) for row in rows]
    cur.close(); conn.close()
    return __import__('flask').jsonify(result)

@doctors_bp.route('/<int:doctor_id>/toggle', methods=['PUT'])
def toggle_doctor(doctor_id):
    from config import get_connection
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE DOCTOR
            SET status = CASE WHEN status = 'ACTIVE' THEN 'INACTIVE' ELSE 'ACTIVE' END
            WHERE doctor_id = :1
        """, [doctor_id])
        conn.commit()
        return __import__('flask').jsonify({"message": "Status toggled"})
    except Exception as e:
        conn.rollback()
        return __import__('flask').jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()

@doctors_bp.route('/add', methods=['POST'])
def add_doctor():
    from config import get_connection
    data = __import__('flask').request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO DOCTOR (
                doctor_id, first_name, last_name, email, phone,
                license_no, specialization, dept_id, status, hire_date
            ) VALUES (
                seq_doctor.NEXTVAL, :1, :2, :3, :4,
                :5, :6, :7, 'ACTIVE', SYSDATE
            )
        """, [
            data['first_name'], data['last_name'],
            data.get('email'), data['phone'],
            data['license_no'], data['specialization'],
            int(data['dept_id'])
        ])
        conn.commit()
        return __import__('flask').jsonify({"message": "Doctor added"}), 201
    except Exception as e:
        conn.rollback()
        return __import__('flask').jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()

# ── Departments (for dynamic dropdown) ──────────────────
from flask import Blueprint as _BP
departments_bp = _BP('departments', __name__)

@departments_bp.route('/', methods=['GET'])
def get_departments():
    from config import get_connection
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT dept_id, dept_name FROM DEPARTMENT ORDER BY dept_id")
    rows = cur.fetchall()
    cur.close(); conn.close()
    return __import__('flask').jsonify([{"dept_id": r[0], "dept_name": r[1]} for r in rows])

# ── Doctor Login ─────────────────────────────────────────
@doctors_bp.route('/login', methods=['POST'])
def doctor_login():
    from config import get_connection
    data = __import__('flask').request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT d.doctor_id, d.first_name, d.last_name,
               d.specialization, dept.dept_name, d.username
        FROM DOCTOR d
        JOIN DEPARTMENT dept ON d.dept_id = dept.dept_id
        WHERE d.username = :1 AND d.password = :2 AND d.status = 'ACTIVE'
    """, [data.get('username'), data.get('password')])
    row = cur.fetchone()
    cur.close(); conn.close()
    if not row:
        return __import__('flask').jsonify({"error": "Invalid credentials or doctor is inactive"}), 401
    keys = ['doctor_id','first_name','last_name','specialization','dept_name','username']
    return __import__('flask').jsonify(dict(zip(keys, row)))

# ── Doctor's completed appointments (for prescription) ───
@doctors_bp.route('/<int:doctor_id>/my-appointments', methods=['GET'])
def doctor_appointments(doctor_id):
    from config import get_connection
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT a.appt_id,
               p.first_name || ' ' || p.last_name AS patient_name,
               p.patient_id,
               TO_CHAR(a.appt_date,'YYYY-MM-DD'),
               a.reason, a.status
        FROM APPOINTMENT a
        JOIN PATIENT p ON a.patient_id = p.patient_id
        WHERE a.doctor_id = :1
        AND a.status = 'COMPLETED'
        ORDER BY a.appt_date DESC
    """, [doctor_id])
    rows = cur.fetchall()
    keys = ['appt_id','patient_name','patient_id','appt_date','reason','status']
    cur.close(); conn.close()
    return __import__('flask').jsonify([dict(zip(keys, r)) for r in rows])

# ── Doctor's existing prescriptions ─────────────────────
@doctors_bp.route('/<int:doctor_id>/my-prescriptions', methods=['GET'])
def doctor_prescriptions(doctor_id):
    from config import get_connection
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT pr.rx_id,
               p.first_name || ' ' || p.last_name AS patient_name,
               TO_CHAR(a.appt_date,'YYYY-MM-DD') AS visit_date,
               TO_CHAR(pr.issued_date,'YYYY-MM-DD') AS issued_date,
               pr.validity_days,
               DBMS_LOB.SUBSTR(pr.notes, 4000, 1) AS notes
        FROM PRESCRIPTION pr
        JOIN APPOINTMENT a ON pr.appt_id = a.appt_id
        JOIN PATIENT p ON a.patient_id = p.patient_id
        WHERE a.doctor_id = :1
        ORDER BY pr.rx_id DESC
    """, [doctor_id])
    rows = cur.fetchall()
    result = []
    for r in rows:
        rx = {
            'rx_id': r[0], 'patient_name': r[1],
            'visit_date': r[2], 'issued_date': r[3],
            'validity_days': r[4], 'notes': r[5], 'items': []
        }
        cur.execute("""
            SELECT m.med_name, m.med_type, i.dosage,
                   i.frequency, i.duration_days, i.instructions
            FROM PRESCRIPTION_ITEM i
            JOIN MEDICATION m ON i.med_id = m.med_id
            WHERE i.rx_id = :1
        """, [r[0]])
        items = cur.fetchall()
        keys = ['med_name','med_type','dosage','frequency','duration_days','instructions']
        rx['items'] = [dict(zip(keys, item)) for item in items]
        result.append(rx)
    cur.close(); conn.close()
    return __import__('flask').jsonify(result)

@doctors_bp.route('/<int:doctor_id>', methods=['DELETE'])
def delete_doctor(doctor_id):
    from config import get_connection
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM APPOINTMENT WHERE doctor_id = :1", [doctor_id])
        count = cur.fetchone()[0]
        if count > 0:
            return __import__('flask').jsonify({"error": f"Cannot delete — {count} appointment(s) linked to this doctor."}), 400
        cur.execute("DELETE FROM DOCTOR WHERE doctor_id = :1", [doctor_id])
        if cur.rowcount == 0:
            return __import__('flask').jsonify({"error": "Doctor not found"}), 404
        conn.commit()
        return __import__('flask').jsonify({"message": "Doctor deleted"})
    except Exception as e:
        conn.rollback()
        return __import__('flask').jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()
