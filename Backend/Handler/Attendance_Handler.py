from flask import jsonify
from pydantic import ValidationError
from Model.Attendance import Attendance

def log_attendance(request, event_name):
    try:
        attendance = Attendance(
            student_id=request.json.get('student_id'),
            name=request.json.get('name')
        )

        response = attendance.log_attendance(event_name)
        return jsonify({"message": response["message"]}), response["statusCode"]

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_all_attendance(event_name):
    try:
        response = Attendance.get_all_attendance(event_name)
        if response["statusCode"] != 200:
            return jsonify({"message": response["message"]}), response["statusCode"]
        return jsonify({"attendance_records": response["data"]}), response["statusCode"]
    except Exception as e:
        return jsonify({"message": str(e)}), 500

