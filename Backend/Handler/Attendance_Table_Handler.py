from flask import jsonify
from pydantic import ValidationError
from Model.Attendance_Table import AttendanceTable

def create_attendance_table(request):
    try:
        attendance_table = AttendanceTable(**request.json)

        response = attendance_table.create()

        if not request:
            return jsonify({"message": "No data provided"}), 400
        
        return jsonify({"message": response["message"]}), response["statusCode"]

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def delete_attendance_table(event_name):
    try:
        attendance_table = AttendanceTable.delete(event_name)

        if not attendance_table:
            return jsonify({"message": "Attendance Record not found"}), 404

        return jsonify({"message": attendance_table["message"]}), attendance_table["statusCode"]

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_attendance_table(event_name):
    try:
        attendance_table = AttendanceTable.get(event_name)

        if not attendance_table:
            return jsonify({"message": "Attendance Record not found"}), 404

        return jsonify({"attendance_record": attendance_table}), attendance_table["statusCode"]

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
def get_all_attendance_table():
    try:
        attendance_table = AttendanceTable.get_all()

        if not attendance_table:
            return jsonify({"message": "Attendance Record not found"}), 404

        return jsonify({"attendance_record": attendance_table}), attendance_table["statusCode"]

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500