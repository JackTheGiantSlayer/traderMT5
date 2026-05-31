import os
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from backend.database import SessionLocal
from backend.models import NewsRecord

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NewsAgent")

load_dotenv()

# RSS Feeds List
RSS_FEEDS = {
    "BBC World News": {
        "url": "http://feeds.bbci.co.uk/news/world/rss.xml",
        "category_default": "geopolitical"
    },
    "BBC Business": {
        "url": "http://feeds.bbci.co.uk/news/business/rss.xml",
        "category_default": "economic"
    },
    "CNBC Economy": {
        "url": "https://www.cnbc.com/id/20910258/device/rss/rss.xml",
        "category_default": "economic"
    }
}

# Geopolitical (War/Conflict) Keywords
GEOPOLITICAL_KEYWORDS = [
    r"\bwar\b", r"\bconflict\b", r"\bmilitary\b", r"\bgeopolitical\b", r"\bsanctions\b",
    r"\btensions\b", r"\bmissile\b", r"\bcombat\b", r"\binvasion\b", r"\bstrike\b",
    r"\barms\b", r"\bnuclear\b", r"\bdefense\b", r"\btroops\b", r"\bbombing\b",
    r"\bclash\b", r"\battack\b", r"\bhostage\b", r"\bceasefire\b", r"\bgaza\b",
    r"\bukraine\b", r"\brussia\b", r"\bmiddle east\b", r"\bisrael\b"
]

# Macroeconomic Keywords
ECONOMIC_KEYWORDS = [
    r"\bfed\b", r"\binflation\b", r"\binterest rate\b", r"\binterest rates\b", r"\bcpi\b",
    r"\bgdp\b", r"\btariffs\b", r"\bdeficit\b", r"\bgold\b", r"\bxauusd\b", r"\boil\b",
    r"\beconomy\b", r"\beconomic\b", r"\btreasury\b", r"\brecession\b", r"\bemployment\b",
    r"\bjobs\b", r"\bpowell\b", r"\bjolts\b", r"\bpmi\b", r"\bcentral bank\b"
]


def fetch_rss_articles():
    """Fetches articles from configured RSS feeds, returns list of parsed dicts."""
    articles = []
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    
    for feed_name, feed_info in RSS_FEEDS.items():
        try:
            logger.info(f"Fetching RSS feed: {feed_name}")
            req = urllib.request.Request(feed_info["url"], headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response:
                xml_data = response.read()
                
            root = ET.fromstring(xml_data)
            channel = root.find("channel")
            if channel is None:
                continue
                
            for item in channel.findall("item"):
                title = item.find("title")
                description = item.find("description")
                link = item.find("link")
                pubDate = item.find("pubDate")
                
                title_text = title.text if title is not None else ""
                desc_text = description.text if description is not None else ""
                link_text = link.text if link is not None else ""
                
                # Parse date
                pub_time = datetime.utcnow()
                if pubDate is not None and pubDate.text:
                    try:
                        # Standard RSS pubDate looks like: Sun, 31 May 2026 06:00:00 GMT
                        # Strip timezone/offset if necessary
                        date_str = pubDate.text.strip()
                        if date_str.endswith(" GMT"):
                            pub_time = datetime.strptime(date_str[:-4], "%a, %d %b %Y %H:%M:%S")
                        elif date_str.endswith(" +0000"):
                            pub_time = datetime.strptime(date_str[:-6], "%a, %d %b %Y %H:%M:%S")
                        else:
                            # Fallback standard parsing
                            pub_time = datetime.strptime(date_str[:25].strip(), "%a, %d %b %Y %H:%M:%S")
                    except Exception:
                        pass
                
                articles.append({
                    "title": title_text,
                    "summary": desc_text,
                    "source": feed_name,
                    "url": link_text,
                    "published_at": pub_time,
                    "default_category": feed_info["category_default"]
                })
        except Exception as e:
            logger.error(f"Error fetching/parsing feed {feed_name}: {e}")
            
    return articles


def is_relevant_article(title, summary):
    """Filters articles that contain geopolitical or economic key terms."""
    full_text = f"{title} {summary}".lower()
    
    # Check war/geopolitical terms
    for kw in GEOPOLITICAL_KEYWORDS:
        if re.search(kw, full_text):
            return "geopolitical"
            
    # Check economic terms
    for kw in ECONOMIC_KEYWORDS:
        if re.search(kw, full_text):
            return "economic"
            
    return None


def run_rule_based_fallback(title, summary, category):
    """Fallback rule-based intelligence generator when LLM is unavailable."""
    full_text = f"{title} {summary}".lower()
    
    impact_level = "low"
    sentiment = "neutral"
    
    # Assess Impact
    high_trigger = ["war", "invasion", "nuclear", "conflict", "bomb", "fed", "inflation", "cpi", "rate cut", "interest rate"]
    medium_trigger = ["tensions", "sanctions", "tariffs", "strike", "clash", "gdp", "oil", "jobs", "employment"]
    
    if any(trigger in full_text for trigger in high_trigger):
        impact_level = "high"
    elif any(trigger in full_text for trigger in medium_trigger):
        impact_level = "medium"
        
    # Assess Sentiment for Gold (Safe-haven / Dollar alternative)
    if category == "geopolitical":
        if impact_level in ["high", "medium"]:
            sentiment = "bullish"
            analysis = (
                f"ความขัดแย้งทางภูมิรัฐศาสตร์ระดับ {impact_level.upper()} กระตุ้นแรงซื้อสินทรัพย์ปลอดภัย (Safe-Haven inflow) "
                f"หนุนราคาทองคำ (XAUUSD) ให้ปรับตัวสูงขึ้นอย่างมีนัยสำคัญ"
            )
        else:
            sentiment = "neutral"
            analysis = "ข่าวความขัดแย้งทั่วไปในระดับสากล ยังส่งผลกระทบในวงจำกัดต่อแรงขับเคลื่อนทองคำในฐานะสินทรัพย์ปลอดภัย"
            
    else: # Economic
        # Inflation / rate cuts are bullish for Gold
        if any(w in full_text for w in ["rate cut", "cuts rate", "cut rates", "inflation", "cpi"]):
            sentiment = "bullish"
            analysis = (
                f"สัญญาณเงินเฟ้อหรือการเตรียมปรับลดอัตราดอกเบี้ยนโยบายของ Fed ถือเป็นปัจจัยเชิงบวก (Bullish) ต่อราคาทองคำ "
                f"เนื่องจากกดดันค่าเงินดอลลาร์สหรัฐและอัตราผลตอบแทนพันธบัตรให้ลดลง"
            )
        elif any(w in full_text for w in ["rate hike", "hikes rate", "raise rate", "hawkish"]):
            sentiment = "bearish"
            analysis = (
                f"สัญญาณ Hawkish หรือการพิจารณาคงดอกเบี้ยระดับสูง/ปรับขึ้นดอกเบี้ยเพื่อต้านทานเงินเฟ้อ กดดันราคาทองคำ (Bearish) "
                f"เนื่องจากหนุนดัชนีพันธบัตรและดอลลาร์สหรัฐให้แข็งแกร่งขึ้น"
            )
        else:
            sentiment = "neutral"
            analysis = "รายงานตัวเลขและข่าวสารทางเศรษฐกิจโดยรวมยังคงอยู่ในกรอบคาดการณ์ ส่งผลกระทบเชิงกลางๆ ต่อโมเมนตัมตลาดทองคำและดอลลาร์"
            
    return {
        "category": category,
        "sentiment": sentiment,
        "impact_level": impact_level,
        "title_th": title,
        "summary_th": summary,
        "analysis": analysis
    }


def analyze_article_with_llm(title, summary, category):
    """Attempts to analyze news impact using LLM API cascading sequence."""
    
    # Retrieve API Keys / Settings
    local_llm_url = os.getenv("LOCAL_LLM_URL", "").strip()
    local_llm_model = os.getenv("LOCAL_LLM_MODEL", "qwen3:14b").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
    anthropic_key = os.getenv("ANTHROPIC_KEY", "").strip()
    anthropic_model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20240620").strip()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    
    system_instruction = (
        "You are an expert algorithmic financial analyst and geopolitical risk strategist. "
        "Analyze the provided news headline and description, then output a JSON object with this exact structure:\n"
        "{\n"
        '  "category": "geopolitical" or "economic" or "general",\n'
        '  "sentiment": "bullish" or "bearish" or "neutral",\n'
        '  "impact_level": "high" or "medium" or "low",\n'
        '  "title_th": "Accurate and natural Thai translation of the news headline",\n'
        '  "summary_th": "Accurate and natural Thai translation of the news description/summary",\n'
        '  "analysis": "A concise explanation in Thai (2-3 sentences) explaining how this news impacts Gold (XAUUSD), the USD (Forex), and Crypto assets."\n'
        "}\n"
        "Rules: Focus specifically on the safe-haven properties of Gold, Dollar strength, and macro liquidity. Do not include any markdown format blocks or introductory text, output pure JSON only."
    )
    
    prompt = (
        f"Headline: {title}\n"
        f"Summary: {summary}\n"
        f"Default Category Assessment: {category}\n"
    )
    
    # --- Helper to extract and sanitize JSON from LLM output ---
    def parse_json_response(text):
        try:
            # Clean possible markdown blocks
            clean = text.strip()
            if clean.startswith("```json"):
                clean = clean[7:]
            if clean.endswith("```"):
                clean = clean[:-3]
            clean = clean.strip()
            
            import json
            data = json.loads(clean)
            
            # Validation
            data["category"] = data.get("category", category).lower()
            data["sentiment"] = data.get("sentiment", "neutral").lower()
            data["impact_level"] = data.get("impact_level", "low").lower()
            data["title_th"] = data.get("title_th", "").strip()
            data["summary_th"] = data.get("summary_th", "").strip()
            data["analysis"] = data.get("analysis", "วิเคราะห์ผลกระทบระดับปกติ").strip()
            
            if data["category"] not in ["geopolitical", "economic", "general"]:
                data["category"] = category
            if data["sentiment"] not in ["bullish", "bearish", "neutral"]:
                data["sentiment"] = "neutral"
            if data["impact_level"] not in ["high", "medium", "low"]:
                data["impact_level"] = "low"
                
            return data
        except Exception as err:
            logger.error(f"JSON Parse error from LLM output: {err}. Raw text: {text}")
            return None

    # Cascade Option 1: Local LLM
    if local_llm_url:
        try:
            import requests
            base_url = local_llm_url.rstrip('/')
            url = f"{base_url}/chat/completions"
            payload = {
                "model": local_llm_model,
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2
            }
            res = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=90)
            if res.status_code == 200:
                text = res.json()["choices"][0]["message"]["content"]
                result = parse_json_response(text)
                if result:
                    logger.info("Successfully analyzed news via Local LLM.")
                    return result
            else:
                logger.error(f"Local LLM returned status code {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Local LLM analysis failed: {e}")

    # Cascade Option 2: OpenAI
    if openai_key:
        try:
            import requests
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {openai_key}"
            }
            payload = {
                "model": openai_model,
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2
            }
            res = requests.post(url, json=payload, headers=headers, timeout=12)
            if res.status_code == 200:
                text = res.json()["choices"][0]["message"]["content"]
                result = parse_json_response(text)
                if result:
                    logger.info("Successfully analyzed news via OpenAI.")
                    return result
        except Exception as e:
            logger.error(f"OpenAI analysis failed: {e}")

    # Cascade Option 3: Anthropic
    if anthropic_key:
        try:
            import requests
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "content-type": "application/json",
                "x-api-key": anthropic_key,
                "anthropic-version": "2023-06-01"
            }
            payload = {
                "model": anthropic_model,
                "max_tokens": 1000,
                "system": system_instruction,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2
            }
            res = requests.post(url, json=payload, headers=headers, timeout=12)
            if res.status_code == 200:
                text = res.json()["content"][0]["text"]
                result = parse_json_response(text)
                if result:
                    logger.info("Successfully analyzed news via Anthropic.")
                    return result
        except Exception as e:
            logger.error(f"Anthropic analysis failed: {e}")

    # Cascade Option 4: Gemini
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_instruction
            )
            response = model.generate_content(prompt)
            result = parse_json_response(response.text)
            if result:
                logger.info("Successfully analyzed news via Gemini.")
                return result
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            
    # Fallback to local rule-based parsing
    logger.info("All LLM APIs unavailable. Running native rule-based analysis.")
    return run_rule_based_fallback(title, summary, category)


def refresh_news_intelligence(db: Session = None):
    """Fetches, filters, and analyzes economic/war news from RSS feeds and saves to database."""
    own_session = False
    if db is None:
        db = SessionLocal()
        own_session = True
        
    try:
        articles = fetch_rss_articles()
        logger.info(f"Fetched {len(articles)} raw articles from RSS feeds.")
        
        new_records_added = 0
        
        for art in articles:
            # Check if this article exists in db already (match title)
            existing = db.query(NewsRecord).filter(NewsRecord.title == art["title"]).first()
            if existing:
                continue
                
            # Filter relevance
            category = is_relevant_article(art["title"], art["summary"])
            if not category:
                # Skip irrelevant articles to avoid overloading Ollama/LLM and triggering 500 errors
                logger.info(f"Skipping irrelevant article: {art['title']}")
                continue
                
            # Run AI or rule-based analysis
            analysis_data = analyze_article_with_llm(art["title"], art["summary"], category)
            
            # Save News Record
            record = NewsRecord(
                title=art["title"],
                title_th=analysis_data.get("title_th") or art["title"],
                summary=art["summary"],
                summary_th=analysis_data.get("summary_th") or art["summary"],
                source=art["source"],
                url=art["url"],
                published_at=art["published_at"],
                category=analysis_data["category"],
                sentiment=analysis_data["sentiment"],
                impact_level=analysis_data["impact_level"],
                analysis=analysis_data["analysis"]
            )
            db.add(record)
            new_records_added += 1
            
        db.commit()
        logger.info(f"Successfully processed news update. Added {new_records_added} new analyzed articles.")
        return new_records_added
    except Exception as e:
        logger.error(f"Failed to refresh news intelligence: {e}")
        if db:
            db.rollback()
        return 0
    finally:
        if own_session and db:
            db.close()


if __name__ == "__main__":
    # Test script standalone
    print("Testing News Agent stand-alone...")
    refresh_news_intelligence()
