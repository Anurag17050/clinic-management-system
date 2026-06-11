from flask import Flask
from flask_cors import CORS

from routes_patients     import patients_bp
from routes_doctors      import doctors_bp        # moved to own file
from routes_appointments import appointments_bp
from routes_prescriptions import prescriptions_bp
from routes_billing      import billing_bp
from routes_medical      import medical_bp
from routes_staff        import staff_bp
from routes_departments  import departments_bp    # cleaned up

app = Flask(__name__)
CORS(app)

# ── Register all blueprints ───────────────────────────────
# URLs are IDENTICAL to before — nothing in React needs to change
app.register_blueprint(patients_bp,       url_prefix='/api/patients')
app.register_blueprint(doctors_bp,        url_prefix='/api/doctors')
app.register_blueprint(appointments_bp,   url_prefix='/api/appointments')
app.register_blueprint(prescriptions_bp,  url_prefix='/api/prescriptions')
app.register_blueprint(staff_bp,          url_prefix='/api/staff')
app.register_blueprint(departments_bp,    url_prefix='/api/departments')
app.register_blueprint(departments_bp,    url_prefix='/api/departments2',
                        name='departments_admin')   # keeps /api/departments2 working too
app.register_blueprint(medical_bp,        url_prefix='/api/medical-records')
app.register_blueprint(billing_bp,        url_prefix='/api/billing')


@app.route('/api/health')
def health():
    return {"status": "ok", "message": "Clinic API running"}


if __name__ == '__main__':
    app.run(debug=True, port=5000)
