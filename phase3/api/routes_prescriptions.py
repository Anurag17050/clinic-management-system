from flask import Blueprint, request, jsonify
from config import get_connection

prescriptions_bp = Blueprint('prescriptions', __name__)

@prescriptions_bp.route('/medications', methods=['GET'])
def get_medications():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT med_id, med_name, med_type FROM MEDICATION ORDER BY med_name")
    rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify([{"med_id": r[0], "med_name": r[1], "med_type": r[2]} for r in rows])

@prescriptions_bp.route('/<int:appt_id>', methods=['GET'])
def get_prescription(appt_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT r.rx_id, TO_CHAR(r.issued_date,'YYYY-MM-DD'),
               r.validity_days, DBMS_LOB.SUBSTR(r.notes, 4000, 1)
        FROM PRESCRIPTION r WHERE r.appt_id = :1
        ORDER BY r.rx_id DESC
    """, [appt_id])
    rows = cur.fetchall()
    if not rows:
        cur.close(); conn.close()
        return jsonify({"error": "No prescription found"}), 404
    result = []
    for row in rows:
        rx = dict(zip(['rx_id','issued_date','validity_days','notes'], row))
        cur.execute("""
            SELECT m.med_name, m.med_type, i.dosage,
                   i.frequency, i.duration_days, i.instructions
            FROM PRESCRIPTION_ITEM i
            JOIN MEDICATION m ON i.med_id = m.med_id
            WHERE i.rx_id = :1
        """, [rx['rx_id']])
        items = cur.fetchall()
        keys = ['med_name','med_type','dosage','frequency','duration_days','instructions']
        rx['items'] = [dict(zip(keys, item)) for item in items]
        result.append(rx)
    cur.close(); conn.close()
    return jsonify(result)

@prescriptions_bp.route('/', methods=['POST'])
def create_prescription():
    data = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    try:
        rx_id_var = cur.var(__import__('oracledb').NUMBER)
        cur.execute("""
            INSERT INTO PRESCRIPTION (rx_id, appt_id, validity_days, notes)
            VALUES (seq_rx.NEXTVAL, :1, :2, :3)
            RETURNING rx_id INTO :4
        """, [data['appt_id'], data.get('validity_days', 30),
              data.get('notes'), rx_id_var])
        rx_id = int(rx_id_var.getvalue()[0])
        for item in data.get('items', []):
            cur.execute("""
                INSERT INTO PRESCRIPTION_ITEM
                    (item_id, rx_id, med_id, dosage, frequency,
                     duration_days, instructions)
                VALUES (seq_rx_item.NEXTVAL, :1, :2, :3, :4, :5, :6)
            """, [rx_id, item['med_id'], item['dosage'],
                  item['frequency'], item.get('duration_days'),
                  item.get('instructions')])
        conn.commit()
        return jsonify({"message": "Prescription created", "rx_id": rx_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close(); conn.close()
