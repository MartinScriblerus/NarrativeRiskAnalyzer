from typing import List
from fastapi import FastAPI
from app.embeddings import generate_scores
from app.schemas.requests import CompanyTextRequest

app = FastAPI(title="Narrative Risk Engine")
## API 
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze_text(request: CompanyTextRequest):
    scores = generate_scores(request.text_samples)
    return {"company": request.company_name, "topic": request.topic, "scores": scores}