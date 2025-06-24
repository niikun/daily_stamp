export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  character_name: string;
  current_stage: CharacterStage;
  stage_start_date: string;
  total_days_brushed: number;
  consecutive_days_brushed: number;
  last_brush_date: string | null;
}

export interface Brush {
  id: number;
  user_id: number;
  date: string;
  stamps: string[];
  created_at: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  request_text: string;
  response_text: string;
  timestamp: string;
}

export enum CharacterStage {
  EGG = "egg",
  CHICK = "chick",
  CHICKEN = "chicken",
  HAWK = "hawk",
  PHOENIX = "phoenix"
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ChatResponse {
  response: string;
  character_stage: CharacterStage;
}

export interface StampType {
  id: string;
  name: string;
  emoji: string;
  color: string;
}