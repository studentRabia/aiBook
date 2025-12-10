#!/usr/bin/env python3
"""
Readability validation script for textbook chapters
Checks Flesch-Kincaid grade level (target: 10-14)
"""
import sys
import textstat
from pathlib import Path


def check_readability(file_path: str) -> dict:
    """
    Check readability score of markdown file

    Args:
        file_path: Path to markdown file

    Returns:
        dict with readability metrics and pass/fail status
    """
    path = Path(file_path)

    if not path.exists():
        return {"error": f"File not found: {file_path}"}

    # Read file content
    content = path.read_text(encoding='utf-8')

    # Remove markdown frontmatter (YAML between ---)
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            content = parts[2]

    # Calculate Flesch-Kincaid grade level
    fk_grade = textstat.flesch_kincaid_grade(content)
    flesch_reading_ease = textstat.flesch_reading_ease(content)

    # Target: Flesch-Kincaid grade 10-14 (high school to early college)
    passed = 10 <= fk_grade <= 14

    return {
        "file": file_path,
        "flesch_kincaid_grade": round(fk_grade, 1),
        "flesch_reading_ease": round(flesch_reading_ease, 1),
        "target_range": "10-14",
        "passed": passed,
        "status": "✓ PASS" if passed else "✗ FAIL"
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_readability.py <markdown_file>")
        sys.exit(1)

    result = check_readability(sys.argv[1])

    if "error" in result:
        print(result["error"])
        sys.exit(1)

    print(f"\nReadability Check: {result['file']}")
    print(f"Flesch-Kincaid Grade: {result['flesch_kincaid_grade']} {result['status']}")
    print(f"Flesch Reading Ease: {result['flesch_reading_ease']}")
    print(f"Target Range: {result['target_range']}")

    sys.exit(0 if result['passed'] else 1)
