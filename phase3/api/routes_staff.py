from flask import Blueprint, request, jsonify
from config import get_connection

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/', methods=['GET'])
def get_all_staff():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT s.staff_id, s.first_name, s.last_name, s.email,
               s.phone, s.role, d.dept_name, s.hire_date, s.salary, s.status
        FROM STAFF s
        JOIN DEPARTMENT d ON s.dept_id = d.dept_id
        ORDER BY s.staff_id
    """)
    rows = cur.fetchall()
    keys = ['staff_id','first_name','last_name','email','phone',
            'role','dept_name','hire_date','salary','status']
    cur.close(); conn.close()
    return jsonify([dict(zip(keys, r)) for r in rows])

@staff_bp.route('/add', methods=['POST'])
def add_staff():
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    try:
        username = (data['first_name'] + '_' + data['last_name']).lower()
        cur.execute("""
            INSERT INTO STAFF (
                staff_id, first_name, last_name, email, phone,
                role, dept_id, hire_date, salary, username, password, status
            ) VALUES (
                seq_staff.NEXTVAL, :1, :2, :3, :4,
                :5, :6, SYSDATE, :7, :8, 'staff123', 'ACTIVE'
            )
        """, [
            data['first_name'], data['last_name'],
            data.get('email'), data.get('phone'),
            data['role'], int(data['dept_id']),
            data.get('salary', 0),
            username
        ])
        conn.commit()
        return jsonify({"message": f"Staff added. Username: {username}, Password: staff123"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()

@staff_bp.route('/login', methods=['POST'])
def staff_login():
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT s.staff_id, s.first_name, s.last_name,
               s.role, d.dept_name, s.username
        FROM STAFF s
        JOIN DEPARTMENT d ON s.dept_id = d.dept_id
        WHERE s.username = :1 AND s.password = :2 AND s.status = 'ACTIVE'
    """, [data.get('username'), data.get('password')])
    row = cur.fetchone()
    cur.close(); conn.close()
    if not row:
        return jsonify({"error": "Invalid credentials or staff is inactive"}), 401
    keys = ['staff_id','first_name','last_name','role','dept_name','username']
    return jsonify(dict(zip(keys, row)))

@staff_bp.route('/<int:staff_id>/toggle', methods=['PUT'])
def toggle_staff(staff_id):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE STAFF
            SET status = CASE WHEN status = 'ACTIVE' THEN 'INACTIVE' ELSE 'ACTIVE' END
            WHERE staff_id = :1
        """, [staff_id])
        conn.commit()
        return jsonify({"message": "Status toggled"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()

@staff_bp.route('/<int:staff_id>', methods=['DELETE'])
def delete_staff(staff_id):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM STAFF WHERE staff_id = :1", [staff_id])
        if cur.rowcount == 0:
            return jsonify({"error": "Staff not found"}), 404
        conn.commit()
        return jsonify({"message": "Staff deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()
