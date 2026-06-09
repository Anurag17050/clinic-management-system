from flask import Blueprint, request, jsonify
from config import get_connection

departments_bp2 = Blueprint('departments2', __name__)

@departments_bp2.route('/', methods=['GET'])
def get_departments():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT d.dept_id, d.dept_name, d.location,
               d.head_doctor_id,
               doc.first_name || ' ' || doc.last_name AS head_name,
               doc.specialization,
               COUNT(s.staff_id) AS staff_count
        FROM DEPARTMENT d
        LEFT JOIN DOCTOR doc ON d.head_doctor_id = doc.doctor_id
        LEFT JOIN STAFF s ON s.dept_id = d.dept_id
        GROUP BY d.dept_id, d.dept_name, d.location,
                 d.head_doctor_id, doc.first_name, doc.last_name, doc.specialization
        ORDER BY d.dept_id
    """)
    rows = cur.fetchall()
    keys = ['dept_id','dept_name','location','head_doctor_id',
            'head_name','specialization','staff_count']
    cur.close(); conn.close()
    return jsonify([dict(zip(keys, r)) for r in rows])

@departments_bp2.route('/add', methods=['POST'])
def add_department():
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO DEPARTMENT (dept_id, dept_name, location, head_doctor_id)
            VALUES (seq_dept.NEXTVAL, :1, :2, :3)
        """, [
            data['dept_name'],
            data.get('location'),
            data.get('head_doctor_id') or None
        ])
        conn.commit()
        return jsonify({"message": "Department added"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()

@departments_bp2.route('/<int:dept_id>', methods=['PUT'])
def update_department(dept_id):
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE DEPARTMENT
            SET dept_name = :1, location = :2, head_doctor_id = :3
            WHERE dept_id = :4
        """, [
            data['dept_name'],
            data.get('location'),
            data.get('head_doctor_id') or None,
            dept_id
        ])
        conn.commit()
        return jsonify({"message": "Department updated"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()

@departments_bp2.route('/<int:dept_id>', methods=['DELETE'])
def delete_department(dept_id):
    conn = get_connection()
    cur = conn.cursor()
    try:
        # Check if any doctors are assigned
        cur.execute("SELECT COUNT(*) FROM DOCTOR WHERE dept_id = :1", [dept_id])
        doc_count = cur.fetchone()[0]
        if doc_count > 0:
            return jsonify({"error": f"Cannot delete — {doc_count} doctor(s) still assigned to this department."}), 400

        # Check if any staff are assigned
        cur.execute("SELECT COUNT(*) FROM STAFF WHERE dept_id = :1", [dept_id])
        staff_count = cur.fetchone()[0]
        if staff_count > 0:
            return jsonify({"error": f"Cannot delete — {staff_count} staff member(s) still assigned to this department."}), 400

        # Safe to delete
        cur.execute("DELETE FROM DEPARTMENT WHERE dept_id = :1", [dept_id])
        if cur.rowcount == 0:
            return jsonify({"error": "Department not found"}), 404
        conn.commit()
        return jsonify({"message": "Department deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()
