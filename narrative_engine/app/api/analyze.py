from fastapi import APIRouter
import torch
from app.core.embeddings import embed_text, tick_embeddings

router = APIRouter(prefix="/analyze", tags=["analysis"])

@router.post("/")
def analyze_text(text: str):
    text_embedding = embed_text(text)

    scores = {}
    for tick, tick_embeds in tick_embeddings.items():
        similarity = torch.cosine_similarity(
            text_embedding.unsqueeze(0),
            tick_embeds
        ).mean().item()
        scores[tick] = similarity

    return {
        "scores": scores,
        "top_ticks": sorted(scores, key=scores.get, reverse=True)[:5]
    }