from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
  API_PREFIX: str = "/api"
  DEBUG: bool = False
  ALLOWED_ORIGINS: str = "http://localhost:5173"

  # I don't think this is necessary but it's in the tutorial im following
  @field_validator("ALLOWED_ORIGINS")
  def parse_allowed_origins(cls, v: str) -> List[str]:
    return v.split(",") if v else []

  class Config:
    env_file = ".env"
    env_file_encoding = "utf-8"
    case_sensitive = True

settings = Settings()
