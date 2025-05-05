from datetime import datetime
from pydantic import BaseModel, Field
from Gateway.MySQL_Gateway import query, fetch


class Attendance(BaseModel):
    student_id: str = Field(..., min_length=6, description="Student ID cannot be empty")
    
    @staticmethod
    def get_active_events_today():
        try:
            # Get current date
            current_date = datetime.now().strftime("%Y-%m-%d")
            
            # Get all events
            events = fetch("attendance_records", {})
            if not events:
                return {"statusCode": 404, "message": "No events found"}
            
            # Filter events that are active today
            active_events = []
            for event in events:
                if event.get("expired", False):
                    continue
                    
                event_start = datetime.strptime(event["date_start"], "%Y-%m-%d")
                event_end = datetime.strptime(event["date_end"], "%Y-%m-%d")
                current = datetime.strptime(current_date, "%Y-%m-%d")
                
                if event_start <= current <= event_end:
                    active_events.append(event)
            
            if not active_events:
                return {"statusCode": 404, "message": "No active events found for today"}
            
            return {"statusCode": 200, "data": active_events}
            
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}

    def log_attendance(self, event_name: str):
        try:
            # First check if student exists
            student_check = fetch("students", {"student_id": self.student_id})

            if not student_check:
                return {"statusCode": 404, "message": "Student not found"}
            

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
                INSERT INTO {event_name} (student_id, name, login_date, login_time, logout_time, course) 
                VALUES (%s, %s, %s, %s, NULL, %s)
                """,
                (self.student_id, student_check[0]["name"], current_date, current_time, student_check[0]["course"])
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
                table=event_name
            )

            if not response:
                return {"statusCode": 404, "message": "No attendance records found"}
            
            return {"statusCode": 200, "data": response}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}
