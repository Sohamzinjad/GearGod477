import dotenv
import os

dotenv.load_dotenv()

POSTGRES_URL = os.getenv("POSTGRES_URL")