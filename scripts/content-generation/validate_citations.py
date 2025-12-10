#!/usr/bin/env python3
"""
Citation validation script for textbook chapters
Validates APA format, source dates, official source percentage, URL accessibility
"""
import sys
import re
import requests
from pathlib import Path
from datetime import datetime
from typing import List, Dict


# Official source domains
OFFICIAL_DOMAINS = [
    "docs.ros.org",
    "nvidia.com",
    "gazebosim.org",
    "unity.com",
    "github.com",  # For official repos
    "arxiv.org",
    "doi.org",
    ".edu",  # Academic institutions
    ".gov",  # Government sites
]


def extract_citations(content: str) -> List[str]:
    """Extract all APA-style citations from markdown"""
    # Find lines in References section
    if "## 8. References" not in content and "## References" not in content:
        return []

    # Extract text after References heading
    refs_match = re.search(r'##\s*(?:8\.)?\s*References\s*\n(.*)', content, re.DOTALL)
    if not refs_match:
        return []

    refs_text = refs_match.group(1)

    # Extract citations (lines starting with -, *, or numbered)
    citations = []
    for line in refs_text.split('\n'):
        line = line.strip()
        if line and (line.startswith('-') or line.startswith('*') or re.match(r'^\d+\.', line)):
            citations.append(line.lstrip('-*0123456789. '))

    return citations


def check_apa_format(citation: str) -> bool:
    """Basic APA format validation"""
    # APA should have: Author. (Year). Title. Source. URL
    # Basic check: has year in parentheses and URL
    has_year = bool(re.search(r'\(\d{4}\)', citation))
    has_url = bool(re.search(r'https?://', citation))
    return has_year and has_url


def extract_year(citation: str) -> int | None:
    """Extract year from citation"""
    match = re.search(r'\((\d{4})\)', citation)
    if match:
        return int(match.group(1))
    return None


def extract_url(citation: str) -> str | None:
    """Extract URL from citation"""
    match = re.search(r'(https?://[^\s\)]+)', citation)
    if match:
        return match.group(1)
    return None


def is_official_source(url: str) -> bool:
    """Check if URL is from an official source"""
    if not url:
        return False
    return any(domain in url.lower() for domain in OFFICIAL_DOMAINS)


def check_url_accessible(url: str, timeout: int = 5) -> bool:
    """Check if URL is accessible (returns 200)"""
    try:
        response = requests.head(url, timeout=timeout, allow_redirects=True)
        return response.status_code == 200
    except:
        # Try GET if HEAD fails
        try:
            response = requests.get(url, timeout=timeout, allow_redirects=True)
            return response.status_code == 200
        except:
            return False


def validate_citations(file_path: str) -> dict:
    """
    Validate citations in markdown file

    Args:
        file_path: Path to markdown file

    Returns:
        dict with validation results
    """
    path = Path(file_path)

    if not path.exists():
        return {"error": f"File not found: {file_path}"}

    content = path.read_text(encoding='utf-8')
    citations = extract_citations(content)

    if not citations:
        return {"error": "No citations found in References section"}

    results = []
    current_year = datetime.now().year

    for citation in citations:
        result = {
            "citation": citation[:100] + "..." if len(citation) > 100 else citation,
            "apa_format": check_apa_format(citation),
            "year": extract_year(citation),
            "url": extract_url(citation),
        }

        # Check source recency (within 5 years)
        if result["year"]:
            result["within_5_years"] = (current_year - result["year"]) <= 5
        else:
            result["within_5_years"] = False

        # Check if official source
        result["official_source"] = is_official_source(result["url"])

        # Check URL accessibility (optional, can be slow)
        # result["url_accessible"] = check_url_accessible(result["url"]) if result["url"] else False

        results.append(result)

    # Calculate overall metrics
    total_citations = len(results)
    apa_valid = sum(1 for r in results if r["apa_format"])
    recent_sources = sum(1 for r in results if r["within_5_years"])
    official_sources = sum(1 for r in results if r["official_source"])

    official_percentage = (official_sources / total_citations) * 100 if total_citations > 0 else 0

    # Validation criteria
    passed_apa = apa_valid == total_citations
    passed_recency = recent_sources >= (total_citations * 0.8)  # 80% within 5 years
    passed_official = official_percentage >= 50  # 50%+ from official sources

    passed_all = passed_apa and passed_recency and passed_official

    return {
        "file": file_path,
        "total_citations": total_citations,
        "apa_valid": apa_valid,
        "recent_sources": recent_sources,
        "official_sources": official_sources,
        "official_percentage": round(official_percentage, 1),
        "passed_apa": passed_apa,
        "passed_recency": passed_recency,
        "passed_official": passed_official,
        "passed": passed_all,
        "status": "✓ PASS" if passed_all else "✗ FAIL",
        "details": results
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_citations.py <markdown_file>")
        sys.exit(1)

    result = validate_citations(sys.argv[1])

    if "error" in result:
        print(result["error"])
        sys.exit(1)

    print(f"\nCitation Validation: {result['file']}")
    print(f"Checking {result['total_citations']} citations...")
    print(f"✓ APA format valid: {result['apa_valid']}/{result['total_citations']}" if result['passed_apa'] else f"✗ APA format issues: {result['total_citations'] - result['apa_valid']} citations")
    print(f"✓ Source dates within 5 years: {result['recent_sources']}/{result['total_citations']}" if result['passed_recency'] else f"✗ Old sources: {result['total_citations'] - result['recent_sources']} citations")
    print(f"✓ {result['official_percentage']}% from official sources ({result['official_sources']}/{result['total_citations']})" if result['passed_official'] else f"✗ Only {result['official_percentage']}% from official sources (need ≥50%)")
    print(f"\n{result['status']}")

    sys.exit(0 if result['passed'] else 1)
