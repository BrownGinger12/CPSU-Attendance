from Gateway.MySQL_Gateway import get_connection

def create_attendance_records_table():
    db = get_connection()
    cursor = db.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_name VARCHAR(255),
        event_date VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    print("✅ Attendance Record table created")

    cursor.close()
    db.close()