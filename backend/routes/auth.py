import os
import gspread
from google.oauth2.service_account import Credentials
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

router = APIRouter(tags=["Authentication"])
logger = logging.getLogger(__name__)

# User Schema
class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    username: str
    role: str
    success: bool

def get_users_from_sheet():
    """Fetches users from the 'Users' tab of the Google Sheet."""
    try:
        scope = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
        creds_path = os.path.join(os.getcwd(), "service_account.json")
        creds = Credentials.from_service_account_file(creds_path, scopes=scope)
        client = gspread.authorize(creds)
        
        spreadsheet_url = "https://docs.google.com/spreadsheets/d/1fMbZzsr6tvTXc70cjs9rR3CPvqW6zPILr4DIJV0EFDY/edit"
        doc = client.open_by_url(spreadsheet_url)
        
        # Look for "Users" sheet
        all_sheets = doc.worksheets()
        sheet = next((s for s in all_sheets if "Users" in s.title), all_sheets[0])
        
        records = sheet.get_all_records()
        users = {}
        for row in records:
            # Normalize headers and values
            row_clean = {str(k).strip().lower(): str(v).strip() for k, v in row.items()}
            name = row_clean.get("name")
            password = row_clean.get("password")
            role = row_clean.get("role", "Intern")
            
            if name and password:
                users[name.lower()] = {"password": password, "role": role, "display_name": name}
        
        logger.info(f"✅ Loaded {len(users)} users from sheet.")
        return users
    except Exception as e:
        logger.error(f"Failed to fetch users from sheet: {e}")
        return {}

@router.post("/login", response_model=UserResponse)
async def login(data: LoginRequest):
    users_db = get_users_from_sheet()
    input_username = data.username.strip().lower()
    input_password = data.password.strip()
    
    user = users_db.get(input_username)
    
    if not user or user["password"] != input_password:
        logger.warning(f"❌ Login failed for: {input_username}")
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    logger.info(f"✅ Login successful: {user['display_name']} ({user['role']})")
    return {
        "username": user["display_name"],
        "role": user["role"],
        "success": True
    }
