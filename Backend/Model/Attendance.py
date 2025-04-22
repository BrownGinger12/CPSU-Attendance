from datetime import datetime
from pydantic import BaseModel, Field
from Gateway.MySQL_Gateway import query, fetch


class Attendance(BaseModel):
    student_id: str = Field(..., min_length=6, description="Student ID cannot be empty")
    name: str = Field(..., min_length=6, description="Name cannot be empty")

    def log_attendance(self, event_name: str):
        try:
            existing = Attendance.get_latest_record(self.student_id, event_name)

            now = datetime.now().strftime("%H:%M:%S")  # Only time, no date

            # CASE 1: No existing record -> create new with login_time
            if existing["statusCode"] != 200 or not existing["data"]:
                response = query(
                    f"""
                    INSERT INTO {event_name} (student_id, name, login_time, logout_time) 
                    VALUES (%s, %s, %s, %s)
                    """,
                    (self.student_id, self.name, now, None)
                )

                if response["statusCode"] != 200:
                    return {"statusCode": 500, "message": "Failed to log attendance"}
                return {"statusCode": 200, "message": "Login time recorded"}

            record = existing["data"][0]
            if record["logout_time"] is None:
                # CASE 2: Login exists, but no logout -> update logout
                response = query(
                    f"""
                    UPDATE {event_name}
                    SET logout_time = %s
                    WHERE student_id = %s AND login_time = %s
                    """,
                    (now, self.student_id, record["login_time"])
                )

                if response["statusCode"] != 200:
                    return {"statusCode": 500, "message": "Failed to log out"}
                return {"statusCode": 200, "message": "Logout time recorded"}

            # CASE 3: Already logged in and logged out -> create a new record
            response = query(
                f"""
                INSERT INTO {event_name} (student_id, name, login_time, logout_time) 
                VALUES (%s, %s, %s, %s)
                """,
                (self.student_id, self.name, now, None)
            )

            if response["statusCode"] != 200:
                return {"statusCode": 500, "message": "Failed to log new attendance"}
            return {"statusCode": 200, "message": "New attendance logged"}

        except Exception as e:
            return {"statusCode": 500, "message": str(e)}

    @staticmethod
    def get_latest_record(student_id: str, event_name: str):
        try:
            response = fetch(
                f"""
                SELECT * FROM {event_name}
                WHERE student_id = %s
                ORDER BY login_time DESC
                LIMIT 1
                """,
                (student_id,)
            )

            return {"statusCode": 200, "data": response}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}
