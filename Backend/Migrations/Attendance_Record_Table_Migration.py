from Gateway.MySQL_Gateway import get_connection

def create_attendance_records_table():
    db = get_connection()
    cursor = db.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_name VARCHAR(255),
        date_start VARCHAR(10),
        date_end VARCHAR(10),
        start_time VARCHAR(8),
        end_time VARCHAR(8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    print("✅ Attendance Record table created")

    cursor.close()
    db.close()