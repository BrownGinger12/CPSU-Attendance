from pydantic import BaseModel, Field
from Gateway.MySQL_Gateway import query, fetch

class Student(BaseModel):
    student_id: str = Field(..., min_length=6, description="Student ID cannot be empty")
    name: str = Field(..., min_length=3, description="Name cannot be empty")
    email: str = Field(..., min_length=5, description="Email cannot be empty")
    course: str = Field(..., min_length=3, description="Course cannot be empty")
    section: str = Field(..., min_length=1, description="Student ID cannot be empty")
    birth_date: str = Field(..., min_length=5, description="Birth date cannot be empty")
    email: str = Field(..., min_length=5, description="Email cannot be empty")
    phone_number: str = Field(..., min_length=10, description="Phone number cannot be empty")
    address: str = Field(..., min_length=5, description="Address cannot be empty")
    gender: str = Field(..., min_length=4, description="Gender cannot be empty")

    def create(self):
        try:
            checkIfExists = self.get(self.student_id)

            if checkIfExists["statusCode"] == 200:
                return {"statusCode": 400, "message": "Student already exists"}
            
            response = query(
                            """
                            INSERT INTO students (
                                student_id, name, email, course, section,
                                birth_date, phone_number, address, gender
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """,
                            (
                                self.student_id, self.name, self.email, self.course, self.section,
                                self.birth_date, self.phone_number, self.address, self.gender
                            )
                        )

            if response["statusCode"] != 200:
                return {"statusCode": response["statusCode"], "message": response["message"]}
            
            return {"statusCode": 200, "message": "Student created successfully"}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}
    
    @staticmethod
    def delete(student_id: str):
        try:
            checkIfExists = Student.get(student_id)

            if checkIfExists["statusCode"] != 200:
                return {"statusCode": 405, "message": "Student not found"}
            
            response = query("DELETE FROM students WHERE student_id = %s", (student_id,))

            if response["statusCode"] != 200:
                return {"statusCode": 500, "message": "Failed to delete student"}
            
            return {"statusCode": 200, "message": "Student deleted successfully"}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}
    
    def update(self):
        try:
            checkIfExists = self.get(self.student_id)

            if checkIfExists["statusCode"] != 200:
                return {"statusCode": 405, "message": "Student not found"}

            response = query(
                            """
                            UPDATE students 
                            SET 
                                name = %s,
                                email = %s,
                                course = %s,
                                section = %s,
                                birth_date = %s,
                                phone_number = %s,
                                address = %s,
                                gender = %s
                            WHERE student_id = %s
                            """,
                            (
                                self.name,
                                self.email,
                                self.course,
                                self.section,
                                self.birth_date,
                                self.phone_number,
                                self.address,
                                self.gender,
                                self.student_id  # condition
                            )
                        )

            if response["statusCode"] != 200:
                return {"statusCode": 500, "message": "Failed to update student"}
            
            return {"statusCode": 200, "message": "Student updated successfully"}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}
        
    @staticmethod
    def get_all():
        try:
            response = fetch("students")
            if not response:
                return {"statusCode": 404, "message": "Student not found"}
            return {"statusCode": 200, "data": response}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}

    @staticmethod
    def get(student_id: str):
        try:
            response = fetch("students", {"student_id": student_id})
            if not response:
                return {"statusCode": 404, "message": "Student not found"}
            return {"statusCode": 200, "data": response}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}