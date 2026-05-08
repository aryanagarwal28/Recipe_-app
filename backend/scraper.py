import requests
from bs4 import BeautifulSoup
from typing import Tuple
import re


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

TIMEOUT = 15


def scrape_recipe_page(url: str) -> Tuple[str, str]:
    """
    Scrape the recipe page and return (raw_html, cleaned_text).
    Raises exception if URL is unreachable or not a valid page.
    """
    try:
        response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise Exception("Request timed out. The website took too long to respond.")
    except requests.exceptions.ConnectionError:
        raise Exception("Could not connect to the URL. Please check the URL and try again.")
    except requests.exceptions.HTTPError as e:
        raise Exception(f"HTTP error: {e.response.status_code}")

    raw_html = response.text
    soup = BeautifulSoup(raw_html, "html.parser")

    # Remove script, style, nav, footer, ads
    for tag in soup(["script", "style", "nav", "footer", "header",
                     "aside", "advertisement", "noscript", "iframe"]):
        tag.decompose()

    # Try to find main recipe content area first
    recipe_content = (
        soup.find("article")
        or soup.find(class_=re.compile(r"recipe|ingredient|instruction", re.I))
        or soup.find(id=re.compile(r"recipe|ingredient|instruction", re.I))
        or soup.find("main")
        or soup.body
    )

    if recipe_content:
        text = recipe_content.get_text(separator="\n", strip=True)
    else:
        text = soup.get_text(separator="\n", strip=True)

    # Clean up excessive whitespace
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    cleaned_text = "\n".join(lines)

    # Limit to 8000 chars to stay within LLM context limits
    if len(cleaned_text) > 8000:
        cleaned_text = cleaned_text[:8000]

    return raw_html, cleaned_text
