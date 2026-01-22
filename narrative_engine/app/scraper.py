import subprocess
import json

def scrape_company_topic(company, topic):
    """Call Node Puppeteer script to scrape text."""
    cmd = ["node", "backend/app/scraper.js", company, topic]
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        data = json.loads(result.stdout)
        return data  # List of text samples
    except:
        return []
