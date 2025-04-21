from Gateway.MySQL_Gateway import get_connection


db = get_connection()
cursor = db.cursor()

def create_students_table():
    cursor.execute("""
                CREATE TABLE IF NOT EXISTS students (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id VARCHAR(255),
                    name VARCHAR(255),
                    email VARCHAR(255),
                    course VARCHAR(255),
                    section VARCHAR(255),
                    birth_date VARCHAR(255),
                    phone_number VARCHAR(20),
                    address VARCHAR(255),
                    gender VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)


    print("✅ Students table created")
    cursor.close()
    db.close()