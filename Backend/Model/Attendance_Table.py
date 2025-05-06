from pydantic import BaseModel, Field
from datetime import date, datetime
from Gateway.MySQL_Gateway import query, fetch

class AttendanceTable(BaseModel):
    event_name: str = Field(..., min_length=6, description="Event Name cannot be empty")
    date_start: str = Field(..., description="Start date in YYYY-MM-DD format")
    date_end: str = Field(..., description="End date in YYYY-MM-DD format")
    start_time: str = Field(..., description="Start time in HH:MM:SS format")
    end_time: str = Field(..., description="End time in HH:MM:SS format")
    expired: bool = Field(default=False, description="Whether the event has expired")
    
    def create(self):
        try:
            checkIfExists = AttendanceTable.get(self.event_name)

            if checkIfExists["statusCode"] == 200:
                return {"statusCode": 400, "message": "Attendance Record already exists"}
            
            response = query(
                "INSERT INTO attendance_records (event_name, date_start, date_end, start_time, end_time, expired) VALUES (%s, %s, %s, %s, %s, %s)",
                (self.event_name, self.date_start, self.date_end, self.start_time, self.end_time, self.expired)
            )

            if response["statusCode"] == 200:
                create_table = query(f"""
                                CREATE TABLE IF NOT EXISTS {self.event_name.replace(" ", "_")} (
                                    id INT AUTO_INCREMENT PRIMARY KEY,
                                    student_id VARCHAR(255),
                                    name VARCHAR(255),
                                    login_date VARCHAR(255) NULL,
                                    login_time VARCHAR(255) NULL,      
                                    logout_time VARCHAR(255) NULL,
                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    course VARCHAR(255) NULL
                                )
                                """)
                
                if create_table["statusCode"] != 200:
                    return {"statusCode": 500, "message": create_table["message"]}
                
            if response["statusCode"] != 200:
                return {"statusCode": 500, "message": "Failed to create attendance record"}
            
            return {"statusCode": 200, "message": "Attendance Record created successfully"}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}
        
    @staticmethod
    def delete(event_name: str):
        try:
            checkIfExists = AttendanceTable.get(event_name)

            if checkIfExists["statusCode"] != 200:
                return {"statusCode": 405, "message": "Attendance Record not found"}
            
            response = query("DELETE FROM attendance_records WHERE event_name = %s", (event_name.replace("%", " "),))

            if response["statusCode"] == 200:
                delete_table = query(f"DROP TABLE IF EXISTS {event_name.replace(' ', '_')}")
                    
                if delete_table["statusCode"] != 200:
                    return {"statusCode": 500, "message": "Failed to delete records table"}

            if response["statusCode"] != 200:
                return {"statusCode": 500, "message": "Failed to delete attendance record"}
            
            return {"statusCode": 200, "message": "Attendance Record deleted successfully"}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}
        
    @staticmethod
    def get_all():
        try:
            response = fetch("attendance_records")

            if not response:
                return {"statusCode": 404, "message": "Table not found"}
            
            return {"statusCode": 200, "data": response}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}
    
    @staticmethod
    def get(event_name: str):
        try:
            response = fetch("attendance_records", {"event_name": event_name})

            if not response:
                return {"statusCode": 404, "message": "Table not found"}
            
            return {"statusCode": 200, "data": response}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}

    @staticmethod
    def check_and_delete_expired_events():
        try:
            # Get current date and time
            now = datetime.now()
            current_date = now.strftime("%Y-%m-%d")
            current_time = now.strftime("%H:%M:%S")

            # Get all events
            events = AttendanceTable.get_all()
            if events["statusCode"] != 200:
                return {"statusCode": 500, "message": "Failed to get events"}

            deleted_events = []
            for event in events["data"]:
                # Check if event has ended
                if (event["date_end"] < current_date) or \
                   (event["date_end"] == current_date and event["end_time"] <= current_time):
                    # Delete the event and its attendance table
                    result = AttendanceTable.delete(event["event_name"])
                    if result["statusCode"] == 200:
                        deleted_events.append(event["event_name"])

            return {
                "statusCode": 200,
                "message": f"Successfully deleted {len(deleted_events)} expired events",
                "deleted_events": deleted_events
            }
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}

    @staticmethod
    def mark_expired_events():
        try:
            # Get current date and time
            now = datetime.now()
            current_date = now.strftime("%Y-%m-%d")
            current_time = now.strftime("%H:%M:%S")

            # Get all events
            events = AttendanceTable.get_all()
            if events["statusCode"] != 200:
                return {"statusCode": 500, "message": "Failed to get events"}

            expired_events = []
            for event in events["data"]:
                # Format the event's date to ensure consistent format
                event_date = datetime.strptime(event["date_end"], "%Y-%m-%d").strftime("%Y-%m-%d")
                
                # Check if event has ended and is not already marked as expired
                if not event.get("expired", False) and \
                   ((event_date < current_date) or \
                   (event_date == current_date and event["end_time"] <= current_time)):
                    # Mark the event as expired
                    result = query(
                        "UPDATE attendance_records SET expired = TRUE WHERE event_name = %s",
                        (event["event_name"],)
                    )
                    if result["statusCode"] == 200:
                        expired_events.append(event["event_name"])

            return {
                "statusCode": 200,
                "message": f"Successfully marked {len(expired_events)} events as expired",
                "expired_events": expired_events
            }
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}
