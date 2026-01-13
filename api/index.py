from dotenv import load_dotenv
import os
import sys

# Load environment variables
load_dotenv()

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
