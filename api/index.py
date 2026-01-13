from dotenv import load_dotenv
import os
import sys

# Load environment variables
load_dotenv()

# Add the project root AND backend directory to sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root_dir)
sys.path.append(os.path.join(root_dir, 'backend'))

from backend.main import app
