from typing import List
from fastapi import FastAPI
from app.api import embed, score, scrape, analyze
from app.embeddings import generate_scores
from schemas import requests

app = FastAPI(title="Narrative Risk Engine")

app.include_router(embed.router, prefix="/embed")
app.include_router(score.router, prefix="/score")
app.include_router(analyze.router, prefix="/analyze")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze_text(request: requests.CompanyTextRequest):
    scores = generate_scores(request.text_samples)
    return {"company": request.company_name, "topic": request.topic, "scores": scores}