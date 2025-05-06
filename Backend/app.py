from flask import Flask, jsonify, make_response, request
from Handler.Student_Handler import register_student, get_student, get_all_students, update_student, delete_student
from Handler.Attendance_Table_Handler import create_attendance_table, get_attendance_table, get_all_attendance_table, delete_attendance_table
from Handler.Attendance_Handler import log_attendance, get_all_attendance, get_active_events_today
from flask_cors import CORS
from Model.Attendance import Attendance
from Model.Attendance_Table import AttendanceTable
from Model.Student import Student
from datetime import datetime, timedelta
import threading
import time
from flask_socketio import SocketIO, emit
import socket

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Enable CORS for all routes
CORS(app)

# Background task to check and mark expired events
def check_expired_events():
    while True:
        try:
            result = AttendanceTable.mark_expired_events()
            if result["statusCode"] == 200 and result["expired_events"]:
                print(f"Marked events as expired: {', '.join(result['expired_events'])}")
        except Exception as e:
            print(f"Error checking expired events: {str(e)}")
        # Check every hour
        time.sleep(3600)

# Start the background thread when the app starts
def start_background_task():
    thread = threading.Thread(target=check_expired_events)
    thread.daemon = True
    thread.start()

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_event')
def handle_join_event(event_name):
    print(f'Client joined event: {event_name}')

#Student API
@app.route('/register', methods=['POST'])
def create_student():
    return register_student(request)

@app.route('/students', methods=['GET'])
def fetch_all_student():
    return get_all_students()

@app.route('/student/<student_id>', methods=['GET'])
def fetch_student(student_id):
    return get_student(student_id)

@app.route('/student/<student_id>', methods=['DELETE'])
def remove_student(student_id):
    return delete_student(student_id)

@app.route('/student', methods=['PUT'])
def edit_student():
    return update_student(request)

@app.route('/create_record', methods=['POST'])
def create_table():
    return create_attendance_table(request)

@app.route('/attendance_record/<event_name>', methods=['DELETE'])
def remove_attendance_record(event_name):
    return delete_attendance_table(event_name)

@app.route('/attendance_record/<event_name>', methods=['GET'])
def fetch_attendance_record(event_name):
    return get_attendance_table(event_name)

@app.route('/attendance_records', methods=['GET'])
def fetch_all_attendance_record():
    return get_all_attendance_table()

@app.route('/attendance_today', methods=['GET'])
def get_events_today():
    return get_active_events_today()


# Attendance Routes
@app.route('/attendance/<event_name>', methods=['POST'])
def log_student_attendance(event_name):
    result = log_attendance(request, event_name)
    print(result)
    if result[1] == 200:
        response, status_code = get_all_attendance(event_name)
        attendance_data = response.get_json()  # ✅ extract dict from jsonify
        socketio.emit(f'attendance_update_{event_name}', attendance_data)

    return jsonify({"message": "success", "statusCode": 200}), 200

@app.route('/attendance/<event_name>', methods=['GET'])
def get_event_attendance(event_name):
    return get_all_attendance(event_name)

if __name__ == "__main__":
    # Get local IP address
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    print(f"\nServer running at: http://{local_ip}:8000")
    print("Press Ctrl+C to stop the server\n")
    
    start_background_task()
    socketio.run(app, debug=True, host='0.0.0.0', port=8000)