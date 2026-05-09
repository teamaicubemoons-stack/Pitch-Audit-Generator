from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["Authentication"])

# User Schema
class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    username: str
    role: str
    success: bool

# Mock Database from Spreadsheet Screenshot
USERS_DB = {
    "Ghanshyam": {"password": "Ghanshyam123", "role": "Intern"},
    "Admin": {"password": "Admin@123", "role": "Admin"}
}

@router.post("/login", response_model=UserResponse)
async def login(data: LoginRequest):
    user = USERS_DB.get(data.username)
    
    if not user or user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {
        "username": data.username,
        "role": user["role"],
        "success": True
    }
