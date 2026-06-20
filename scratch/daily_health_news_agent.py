import urllib.request
import xml.etree.ElementTree as ET
import html
import re
import json

def fetch_rss_feed(url):
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.read()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def parse_xml_feed(xml_data, source_name):
    articles = []
    if not xml_data:
        return articles
        
    try:
        root = ET.fromstring(xml_data)
        for item in root.findall('.//item'):
            title = item.find('title')
            link = item.find('link')
            desc = item.find('description')
            pub_date = item.find('pubDate')
            
            title_text = title.text if title is not None else ""
            link_text = link.text if link is not None else ""
            desc_text = desc.text if desc is not None else ""
            
            # Clean HTML tags from description
            desc_text = html.unescape(desc_text)
            desc_text = re.sub('<[^<]+?>', '', desc_text).strip()
            
            articles.append({
                "source": source_name,
                "title": title_text,
                "link": link_text,
                "description": desc_text,
                "date": pub_date.text if pub_date is not None else ""
            })
    except Exception as e:
        print(f"Error parsing feed for {source_name}: {e}")
        
    return articles

def harvest_latest_news():
    feeds = {
        "ScienceDaily Longevity": "https://www.sciencedaily.com/rss/health_medicine/longevity.xml",
        "Nature Medicine": "https://www.nature.com/nm.rss",
        "Harvard Health Blog": "https://www.health.harvard.edu/blog/feed"
    }
    
    all_articles = []
    for source, url in feeds.items():
        print(f"Fetching {source}...")
        xml_data = fetch_rss_feed(url)
        articles = parse_xml_feed(xml_data, source)
        print(f"Found {len(articles)} articles.")
        all_articles.extend(articles[:3]) # Get top 3 from each
        
    print("\n--- HARVESTED LATEST HEALTH & LONGEVITY DEVELOPMENTS ---\n")
    print(json.dumps(all_articles, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    harvest_latest_news()
