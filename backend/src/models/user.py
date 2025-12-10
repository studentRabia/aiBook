"""
Pydantic models for user profiles and progress tracking
"""
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
from datetime import datetime


class UserBackground(BaseModel):
    """User background questionnaire data"""
    prior_ros_experience: bool = Field(..., description="Has prior ROS/ROS 2 experience")
    robotics_level: str = Field(..., description="Robotics knowledge level: beginner, intermediate, advanced")
    programming_languages: List[str] = Field(..., description="Known programming languages")
    ml_experience: bool = Field(default=False, description="Has machine learning experience")
    goals: Optional[str] = Field(None, max_length=500, description="Learning goals")


class UserProfile(BaseModel):
    """User profile creation request"""
    email: EmailStr = Field(..., description="User email address")
    background: UserBackground = Field(..., description="User background information")


class UserProfileResponse(BaseModel):
    """User profile creation response"""
    user_id: str = Field(..., description="Generated user ID")
    email: str = Field(..., description="User email")
    created_at: datetime = Field(..., description="Profile creation timestamp")
    personalization_ready: bool = Field(..., description="Whether personalization is enabled")


class ChapterProgress(BaseModel):
    """Chapter completion progress"""
    chapter_id: str = Field(..., description="Chapter ID (e.g., '1.1', '2.3')")
    completed: bool = Field(..., description="Whether chapter is completed")
    completion_time_minutes: Optional[int] = Field(None, description="Time taken to complete in minutes")


class UserProgressUpdate(BaseModel):
    """Update user chapter progress"""
    user_id: str = Field(..., description="User ID")
    progress: List[ChapterProgress] = Field(..., description="List of chapter progress updates")


class UserProgressResponse(BaseModel):
    """User progress update response"""
    user_id: str = Field(..., description="User ID")
    total_chapters_completed: int = Field(..., description="Total number of chapters completed")
    updated_at: datetime = Field(..., description="Last update timestamp")
