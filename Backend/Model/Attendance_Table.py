
from pydantic import BaseModel, Field
from datetime import date
from Gateway.MySQL_Gateway import query, fetch

class AttendanceTable(BaseModel):
    event_name: str = Field(..., min_length=6, description="Event Name cannot be empty")
    event_date: date = Field(..., description="Date cannot be empty")
    
    def create(self):
        try:
            response = query(
                "INSERT INTO attendance_records (event_name, event_date) VALUES (%s, %s)",
                (self.event_name, self.event_date)
            )

            if response["statusCode"] == 200:
                create_table = query(f"""
                                CREATE TABLE IF NOT EXISTS {self.event_name} (
                                    id INT AUTO_INCREMENT PRIMARY KEY,
                                    student_id VARCHAR(255),
                                    name VARCHAR(255),
                                    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    logout_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
            
            response = query("DELETE FROM attendance_records WHERE event_name = %s", (event_name,))

            if response["statusCode"] == 200:
                delete_table = query(f"DROP TABLE IF EXISTS {event_name}")
                    
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
