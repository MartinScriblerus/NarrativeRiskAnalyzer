import json
from pathlib import Path
from sentence_transformers import SentenceTransformer, util

# Load ticks dataset - use path relative to this file
data_path = Path(__file__).parent / "data" / "ticks_dataset.json"
with open(data_path) as f:
    tick_examples = json.load(f)

# Initialize embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Precompute tick embeddings
tick_embeddings = {tick: model.encode(sentences) for tick, sentences in tick_examples.items()}

def generate_scores(text_samples):
    """
    Given a list of text samples, compute similarity to each tick category
    and return a normalized score per tick.
    """
    if not text_samples:
        return {}

    sample_embeddings = model.encode(text_samples)
    scores = {}

    for tick, embeddings in tick_embeddings.items():
        # Compute max similarity of any sentence to the tick category
        sim = util.cos_sim(sample_embeddings, embeddings).max().item()
        scores[tick] = round(sim, 4)  # Rounded for readability

    return scores