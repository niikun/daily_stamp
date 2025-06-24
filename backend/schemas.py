from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import List, Optional
from models import CharacterStage

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProfileBase(BaseModel):
    character_name: str = "ぴよちゃん"

class ProfileUpdate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: int
    user_id: int
    current_stage: CharacterStage
    stage_start_date: date
    total_days_brushed: int
    consecutive_days_brushed: int
    last_brush_date: Optional[date]
    
    class Config:
        from_attributes = True

class BrushCreate(BaseModel):
    date: date
    stamps: List[str]

class Brush(BaseModel):
    id: int
    user_id: int
    date: date
    stamps: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    message: str
    context: Optional[str] = None

class Conversation(BaseModel):
    id: int
    user_id: int
    request_text: str
    response_text: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ChatResponse(BaseModel):
    response: str
    character_stage: CharacterStage