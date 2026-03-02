#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "httpx>=0.27",
#     "beautifulsoup4>=4.12",
#     "readability-lxml>=0.8",
#     "ebooklib>=0.18",
#     "tqdm>=4.66",
# ]
# ///

"""
Web-to-EPUB converter: Fetches URLs, extracts article content using reader mode,
and builds a single EPUB with automatic table of contents.
"""

import argparse
import html
import sys
import os
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from readability import Document
from ebooklib import epub
from tqdm import tqdm


def fetch_page(url: str, timeout: int = 20, verify: bool = True) -> Optional[BeautifulSoup]:
    """Fetch a URL and return parsed HTML."""
    try:
        with httpx.Client(timeout=timeout, follow_redirects=True, verify=verify) as client:
            response = client.get(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Reader Bot/1.0; +https://github.com/travisennis/read-later-epub)"
                },
            )
            response.raise_for_status()
        
        return BeautifulSoup(response.content, "html.parser")
    except httpx.HTTPError as e:
        print(f"  ✗ Failed to fetch {url}: {e}", file=sys.stderr)
        return None


def extract_article(url: str, timeout: int = 20, verify: bool = True) -> Optional[dict]:
    """
    Extract article content from URL using reader mode.
    Returns dict with title, content (HTML), author, and url.
    """
    soup = fetch_page(url, timeout, verify)
    if not soup:
        return None
    
    # Use readability to extract article
    try:
        doc = Document(str(soup))
        
        title = doc.title()
        content = doc.summary(html_partial=True)
        author = doc.author()
        
        if not title or not content:
            print(f"  ✗ Reader mode failed for {url}: no content extracted", file=sys.stderr)
            return None
        
        return {
            "title": title,
            "content": content,
            "author": author,
            "url": url,
        }
    except Exception as e:
        print(f"  ✗ Extraction failed for {url}: {e}", file=sys.stderr)
        return None


def make_chapter_html(article: dict) -> str:
    """Build the HTML content for an EPUB chapter."""
    safe_title = html.escape(article["title"])
    markup = f'<h1>{safe_title}</h1>\n'
    
    if article.get("author"):
        markup += f'<p><em>{html.escape(article["author"])}</em></p>\n'
    
    safe_url = html.escape(article["url"])
    markup += f'<p><a href="{safe_url}">{safe_url}</a></p>\n'
    markup += article["content"]
    
    return markup


def create_epub(articles: list[dict], output_path: str, title: str = "Collected Articles", author: str = "Web Reader", lang: str = "en") -> None:
    """Create an EPUB from a list of articles."""
    book = epub.EpubBook()
    
    # Set metadata
    book.set_identifier(f"read-later-{Path(output_path).stem}")
    book.set_title(title)
    book.set_language(lang)
    book.add_author(author)
    
    chapters = []
    
    for i, article in enumerate(articles):
        # Create chapter
        chapter = epub.EpubHtml(
            title=article["title"],
            file_name=f"chapter_{i + 1}.xhtml",
            lang=lang
        )
        chapter.content = make_chapter_html(article)
        chapter.add_link(
            href="style.css",
            rel="stylesheet",
            type="text/css"
        )
        
        book.add_item(chapter)
        chapters.append(chapter)
    
    # Add CSS
    css_content = """
    body {
        font-family: Georgia, serif;
        line-height: 1.6;
        margin: 1em;
    }
    h1 {
        font-size: 1.5em;
        margin-bottom: 0.5em;
    }
    img {
        max-width: 100%;
        height: auto;
    }
    a {
        color: #0066cc;
    }
    """
    style = epub.EpubItem(
        uid="style_css",
        file_name="style.css",
        media_type="text/css",
        content=css_content
    )
    book.add_item(style)
    
    # Add navigation files
    book.toc = tuple(chapters)
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    
    # Add spine
    book.spine = ["nav"] + chapters
    
    # Write EPUB
    epub.write_epub(output_path, book, {})


def fetch_articles(urls: list[str], concurrency: int = 3, timeout: int = 20, verify: bool = True) -> list[dict]:
    """Fetch multiple URLs with controlled concurrency. Preserves input URL order."""
    import concurrent.futures
    
    results: dict[int, Optional[dict]] = {}
    
    with tqdm(total=len(urls), desc="Fetching articles", unit="url") as pbar:
        with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
            future_to_index = {
                executor.submit(extract_article, url, timeout, verify): i
                for i, url in enumerate(urls)
            }
            
            for future in concurrent.futures.as_completed(future_to_index):
                idx = future_to_index[future]
                try:
                    article = future.result()
                    if article:
                        results[idx] = article
                        print(f"  ✓ Extracted: {article['title'][:50]}...")
                    else:
                        print(f"  ✗ Skipped: {urls[idx]}")
                except Exception as e:
                    print(f"  ✗ Error processing {urls[idx]}: {e}", file=sys.stderr)
                pbar.update(1)
    
    return [results[i] for i in sorted(results)]


def read_urls_from_file(filepath: str) -> list[str]:
    """Read URLs from a file (one per line)."""
    with open(filepath, "r") as f:
        urls = [line.strip() for line in f if line.strip() and not line.startswith("#")]
    return urls


def main():
    parser = argparse.ArgumentParser(
        description="Convert web articles to EPUB using reader mode",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s https://example.com/article1 https://example.com/article2 -o mybook.epub
  %(prog)s -f urls.txt -o reading.epub
  %(prog)s -f urls.txt -c 5 --title "My Reading List" --author "Me"
        """
    )
    
    parser.add_argument(
        "urls",
        nargs="*",
        help="URLs to convert"
    )
    parser.add_argument(
        "-f", "--file",
        help="File containing URLs (one per line, lines starting with # are comments)"
    )
    parser.add_argument(
        "-o", "--output",
        default="output.epub",
        help="Output EPUB filename (default: output.epub)"
    )
    parser.add_argument(
        "-c", "--concurrency",
        type=int,
        default=3,
        help="Number of concurrent fetches (default: 3)"
    )
    parser.add_argument(
        "-t", "--timeout",
        type=int,
        default=20,
        help="Request timeout in seconds (default: 20)"
    )
    parser.add_argument(
        "--title",
        default="Collected Articles",
        help="EPUB title (default: Collected Articles)"
    )
    parser.add_argument(
        "--author",
        default="Web Reader",
        help="EPUB author (default: Web Reader)"
    )
    parser.add_argument(
        "--lang",
        default="en",
        help="EPUB language code (default: en)"
    )
    parser.add_argument(
        "--insecure",
        action="store_true",
        help="Skip SSL certificate verification (use with caution)"
    )
    
    args = parser.parse_args()
    
    # Collect URLs
    urls = list(args.urls)
    
    if args.file:
        urls.extend(read_urls_from_file(args.file))
    
    # Deduplicate while preserving order
    seen = set()
    unique_urls = []
    for url in urls:
        if url not in seen and url.startswith("http"):
            seen.add(url)
            unique_urls.append(url)
    
    urls = unique_urls
    
    if not urls:
        print("Error: No URLs provided. Use --help for usage information.", file=sys.stderr)
        sys.exit(1)
    
    print(f"Processing {len(urls)} URLs...")
    
    # Fetch and extract articles
    verify = not args.insecure
    articles = fetch_articles(urls, args.concurrency, args.timeout, verify)
    
    if not articles:
        print("Error: No articles could be extracted.", file=sys.stderr)
        sys.exit(1)
    
    print(f"Extracted {len(articles)} articles, building EPUB...")
    
    # Create EPUB
    try:
        create_epub(articles, args.output, args.title, args.author, args.lang)
        print(f"✓ EPUB created: {os.path.abspath(args.output)}")
    except Exception as e:
        print(f"Error creating EPUB: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
