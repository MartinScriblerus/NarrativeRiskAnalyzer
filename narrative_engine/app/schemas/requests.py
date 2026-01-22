from typing import List
from pydantic import BaseModel

class CompanyTextRequest(BaseModel):
    company_name: str
    topic: str
    text_samples: List[str] = []