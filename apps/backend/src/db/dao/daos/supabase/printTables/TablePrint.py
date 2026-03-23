import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")


class BaseTableDAO:
    def __init__(self, table_name):
        self.table_name = table_name

    def get_all(self):
        try:
            if not self.table_name.replace("_", "").isalnum():
                raise ValueError("Invalid table name")

            print(f"Connecting to database to retrieve all records from {self.table_name} table...")
            connection = psycopg2.connect(
                user=USER,
                password=PASSWORD,
                host=HOST,
                port=PORT,
                dbname=DBNAME
            )

            cursor = connection.cursor()

            query = f'SELECT * FROM public."{self.table_name}"'
            cursor.execute(query)

            result = cursor.fetchall()

            print(f"{self.table_name} table contents:")
            for row in result:
                print(row)

            cursor.close()
            connection.close()

        except Exception as e:
            print(f"Failed to connect: {e}")
