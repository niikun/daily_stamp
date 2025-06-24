from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta, date
import openai
import os

from models import User, Profile, Brush, Conversation, CharacterStage
import schemas
import auth

openai.api_key = os.getenv("OPENAI_API_KEY")

# User operations
async def create_user(db: Session, user: schemas.UserCreate):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = auth.get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create profile
    db_profile = Profile(user_id=db_user.id)
    db.add(db_profile)
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not auth.verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Profile operations
def get_profile(db: Session, user_id: int):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        # Create profile if not exists
        profile = Profile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

def update_profile(db: Session, user_id: int, profile: schemas.ProfileUpdate):
    db_profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    db_profile.character_name = profile.character_name
    db.commit()
    db.refresh(db_profile)
    return db_profile

# Brush operations
def get_brushes_by_month(db: Session, user_id: int, month: str):
    # Parse month (YYYY-MM format)
    try:
        year, month_num = map(int, month.split('-'))
        start_date = date(year, month_num, 1)
        if month_num == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month_num + 1, 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")
    
    brushes = db.query(Brush).filter(
        Brush.user_id == user_id,
        Brush.date >= start_date,
        Brush.date < end_date
    ).all()
    
    return brushes

async def create_brush(db: Session, user_id: int, brush: schemas.BrushCreate):
    # Check if brush record already exists for this date
    existing_brush = db.query(Brush).filter(
        Brush.user_id == user_id,
        Brush.date == brush.date
    ).first()
    
    if existing_brush:
        # Update existing record
        existing_brush.stamps = brush.stamps
        db.commit()
        db.refresh(existing_brush)
        brush_record = existing_brush
    else:
        # Create new record
        db_brush = Brush(
            user_id=user_id,
            date=brush.date,
            stamps=brush.stamps
        )
        db.add(db_brush)
        db.commit()
        db.refresh(db_brush)
        brush_record = db_brush
    
    # Update profile progress
    await update_progress(db, user_id, brush.date)
    
    return brush_record

async def update_progress(db: Session, user_id: int, brush_date: date):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        return
    
    # Update total days brushed
    profile.total_days_brushed += 1
    
    # Update consecutive days
    if profile.last_brush_date:
        if brush_date == profile.last_brush_date + timedelta(days=1):
            profile.consecutive_days_brushed += 1
        elif brush_date != profile.last_brush_date:
            profile.consecutive_days_brushed = 1
    else:
        profile.consecutive_days_brushed = 1
    
    profile.last_brush_date = brush_date
    
    # Check for stage upgrade
    new_stage = check_stage_upgrade(profile)
    if new_stage != profile.current_stage:
        profile.current_stage = new_stage
        profile.stage_start_date = brush_date
    
    db.commit()

def check_stage_upgrade(profile: Profile) -> CharacterStage:
    consecutive = profile.consecutive_days_brushed
    total = profile.total_days_brushed
    
    if consecutive >= 30 or total >= 40:
        return CharacterStage.PHOENIX
    elif consecutive >= 14 or total >= 20:
        return CharacterStage.HAWK
    elif consecutive >= 7 or total >= 10:
        return CharacterStage.CHICKEN
    elif consecutive >= 3 or total >= 5:
        return CharacterStage.CHICK
    else:
        return CharacterStage.EGG

# Conversation operations
async def create_conversation(db: Session, user_id: int, conversation: schemas.ConversationCreate):
    profile = get_profile(db, user_id)
    
    # Create system prompt based on character stage
    system_prompt = f"""あなたは子供向けの優しいガイドキャラクター「{profile.character_name}」です。
現在のステージ: {profile.current_stage.value}
連続歯磨き日数: {profile.consecutive_days_brushed}日
累計歯磨き日数: {profile.total_days_brushed}日

以下のルールに従って会話してください：
1. 子供にとって親しみやすく、優しい口調で話す
2. 歯磨きを褒めたり、励ましたりする
3. 短く、分かりやすい言葉を使う
4. キャラクターの成長段階に応じた特徴を表現する
5. 日本語で応答する"""
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": conversation.message}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content
        
        # Save conversation
        db_conversation = Conversation(
            user_id=user_id,
            request_text=conversation.message,
            response_text=response_text
        )
        db.add(db_conversation)
        db.commit()
        
        return {
            "response": response_text,
            "character_stage": profile.current_stage
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")