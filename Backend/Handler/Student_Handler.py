from flask import jsonify
from Model.Student import Student

from pydantic import ValidationError

def register_student(request):
    try:
        student = Student(**request.json)

        response = student.create()

        if not request:
            return jsonify({"message": "No data provided"}), 400
        
        return jsonify({"message": response["message"]}), response["statusCode"]

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def delete_student(student_id):
    try:
        student = Student.delete(student_id)

        if not student:
            return jsonify({"message": "Student not found"}), 404

        return jsonify({"message": student["message"]}), student["statusCode"]

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def update_student(request):
    try:
        student = Student(**request.json)

        response = student.update()

        if not request:
            return jsonify({"message": "No data provided"}), 400

        return jsonify({"message": response["message"]}), response["statusCode"]

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_student(student_id):
    try:
        student = Student.get(student_id)

        if not student:
            return jsonify({"message": "Student not found"}), 404

        return jsonify({"student": student}), 200

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_all_students():
    try:
        students = Student.get_all()

        if not students:
            return jsonify({"message": "No students found"}), 404

        return jsonify({"students": students}), 200

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
    