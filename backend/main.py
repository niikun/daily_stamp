from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os

from database import SessionLocal, engine, get_db
from models import Base, User, Profile, Brush, Conversation, CharacterStage
import schemas
import crud
import auth

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Daily Stamp API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth endpoints
@app.post("/auth/signup", response_model=schemas.Token)
async def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return await crud.create_user(db=db, user=user)

@app.post("/auth/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return await crud.authenticate_user(db=db, email=form_data.username, password=form_data.password)

# Profile endpoints
@app.get("/profile", response_model=schemas.Profile)
async def get_profile(current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return crud.get_profile(db=db, user_id=current_user.id)

@app.put("/profile", response_model=schemas.Profile)
async def update_profile(profile: schemas.ProfileUpdate, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return crud.update_profile(db=db, user_id=current_user.id, profile=profile)

# Brush endpoints
@app.get("/brushes")
async def get_brushes(month: str, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return crud.get_brushes_by_month(db=db, user_id=current_user.id, month=month)

@app.post("/brushes", response_model=schemas.Brush)
async def create_brush(brush: schemas.BrushCreate, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return await crud.create_brush(db=db, user_id=current_user.id, brush=brush)

# Chat endpoint
@app.post("/chat", response_model=schemas.ChatResponse)
async def chat(conversation: schemas.ConversationCreate, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return await crud.create_conversation(db=db, user_id=current_user.id, conversation=conversation)

@app.get("/")
async def root():
    return {"message": "Daily Stamp API"}