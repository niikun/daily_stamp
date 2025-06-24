from sqlalchemy import Column, Integer, String, DateTime, Date, Text, JSON, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class CharacterStage(enum.Enum):
    EGG = "egg"
    CHICK = "chick"
    CHICKEN = "chicken"
    HAWK = "hawk"
    PHOENIX = "phoenix"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship("Profile", back_populates="user", uselist=False)
    brushes = relationship("Brush", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    character_name = Column(String, default="ぴよちゃん")
    current_stage = Column(Enum(CharacterStage), default=CharacterStage.EGG)
    stage_start_date = Column(Date, default=datetime.utcnow().date)
    total_days_brushed = Column(Integer, default=0)
    consecutive_days_brushed = Column(Integer, default=0)
    last_brush_date = Column(Date, nullable=True)
    
    user = relationship("User", back_populates="profile")

class Brush(Base):
    __tablename__ = "brushes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    stamps = Column(JSON, default=list)  # ["brushing_completed", "gargle_completed", "time_check"]
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="brushes")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    request_text = Column(Text, nullable=False)
    response_text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="conversations")