from datetime import datetime
from pydantic import BaseModel, Field
from Gateway.MySQL_Gateway import query, fetch


class Attendance(BaseModel):
    student_id: str = Field(..., min_length=6, description="Student ID cannot be empty")
    name: str = Field(..., min_length=6, description="Name cannot be empty")

    def log_attendance(self, event_name: str):
        try:
            # Get the latest record for this student
            existing = Attendance.get_latest_record(self.student_id, event_name)
            now = datetime.now()
            current_date = now.strftime("%Y-%m-%d")
            current_time = now.strftime("%H:%M:%S")

            print(existing)

            # Check if there's an existing record
            if existing["statusCode"] == 200 and existing["data"]:
                latest_record = existing["data"]
                
                # If the latest record has no logout time, this is a logout
                if latest_record["logout_time"] is None:
                    # Update the existing record with logout time
                    response = query(
                        f"""
                        UPDATE {event_name}
                        SET logout_time = %s
                        WHERE student_id = %s AND login_time = %s AND logout_time IS NULL
                        """,
                        (current_time, self.student_id, latest_record["login_time"])
                    )

                    if response["statusCode"] != 200:
                        return {"statusCode": 500, "message": "Failed to log out"}
                    return {"statusCode": 200, "message": "Logout time recorded"}

            # If we get here, either there's no record or the latest record has a logout time
            # So we create a new login record
            response = query(
                f"""
                INSERT INTO {event_name} (student_id, name, login_date, login_time, logout_time) 
                VALUES (%s, %s, %s, %s, NULL)
                """,
                (self.student_id, self.name, current_date, current_time)
            )

            if response["statusCode"] != 200:
                return {"statusCode": 500, "message": "Failed to log attendance"}
            return {"statusCode": 200, "message": "Login time recorded"}

        except Exception as e:
            return {"statusCode": 500, "message": str(e)}

    @staticmethod
    def get_latest_record(student_id: str, event_name: str):
        try:
            # Fetch all records that match student_id
            response = fetch(
                table=event_name,
                conditions={"student_id": student_id}
            )

            # Sort them here if needed (ideally do it in SQL)
            response = sorted(
                response,
                key=lambda x: (x["login_date"], x["login_time"]),
                reverse=True
            )

            latest_record = response[0] if response else None

            return {"statusCode": 200, "data": latest_record}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}

    

    @staticmethod
    def get_all_attendance(event_name: str):
        try:
            response = fetch(
                f"""
                SELECT * FROM {event_name}
                ORDER BY login_date DESC, login_time DESC
                """
            )

            if not response:
                return {"statusCode": 404, "message": "No attendance records found"}
            
            return {"statusCode": 200, "data": response}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}
