#!/usr/bin/env python3
"""
Utility script that rewrites Hatena Blog articles so that only a short summary
and a link to the migrated site remain.
"""

from __future__ import annotations

import argparse
import base64
import datetime as dt
import hashlib
import html
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional
from xml.dom import minidom

import requests
import yaml

ATOM_NS = "http://www.w3.org/2005/Atom"


def log(msg: str) -> None:
    now = dt.datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] {msg}")


@dataclass
class HatenaEntry:
    """Representation of a single Hatena Blog entry."""

    title: str
    edit_url: str
    alternate_url: str
    entry_id: str

    @staticmethod
    def _get_text(node, name: str) -> str:
        elems = node.getElementsByTagNameNS(ATOM_NS, name)
        if not elems:
            return ""
        elem = elems[0]
        if elem.firstChild:
            return elem.firstChild.nodeValue
        return ""

    @staticmethod
    def _find_link(node, rel: str) -> str:
        links = node.getElementsByTagNameNS(ATOM_NS, "link")
        for link in links:
            if link.getAttribute("rel") == rel:
                return link.getAttribute("href")
        return ""

    @classmethod
    def from_dom(cls, node) -> "HatenaEntry":
        return cls(
            title=cls._get_text(node, "title"),
            edit_url=cls._find_link(node, "edit"),
            alternate_url=cls._find_link(node, "alternate"),
            entry_id=cls._get_text(node, "id"),
        )


class HatenaClient:
    """Minimal client for the Hatena Blog AtomPub API."""

    def __init__(self, hatena_id: str, blog_domain: str, api_key: str):
        self.hatena_id = hatena_id
        self.blog_domain = blog_domain
        self.api_key = api_key
        self.feed_url = (
            f"https://blog.hatena.ne.jp/{hatena_id}/{blog_domain}/atom/entry"
        )

    def _wsse_header(self) -> Dict[str, str]:
        nonce = os.urandom(16)
        created = dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
        sha1 = hashlib.sha1()
        sha1.update(nonce)
        sha1.update(created.encode("utf-8"))
        sha1.update(self.api_key.encode("utf-8"))
        password_digest = base64.b64encode(sha1.digest()).decode("utf-8")
        header = (
            'UsernameToken Username="{user}", PasswordDigest="{digest}", '
            'Nonce="{nonce}", Created="{created}"'
        ).format(
            user=self.hatena_id,
            digest=password_digest,
            nonce=base64.b64encode(nonce).decode("utf-8"),
            created=created,
        )
        return {
            "X-WSSE": header,
            "Accept": "application/xml",
        }

    def _headers(self, content_type: Optional[str] = None) -> Dict[str, str]:
        headers = self._wsse_header()
        if content_type:
            headers["Content-Type"] = content_type
        return headers

    def iter_entries(self, limit: Optional[int] = None) -> Iterable[HatenaEntry]:
        """Yield Hatena entries newest first."""
        fetched = 0
        next_url = self.feed_url
        while next_url:
            resp = requests.get(next_url, headers=self._headers(), timeout=30)
            resp.raise_for_status()
            doc = minidom.parseString(resp.text)
            nodes = doc.getElementsByTagNameNS(ATOM_NS, "entry")
            for node in nodes:
                yield HatenaEntry.from_dom(node)
                fetched += 1
                if limit and fetched >= limit:
                    return
            next_url = ""
            for link in doc.getElementsByTagNameNS(ATOM_NS, "link"):
                if link.getAttribute("rel") == "next":
                    next_url = link.getAttribute("href")
                    break

    def fetch_entry_xml(self, edit_url: str) -> str:
        resp = requests.get(edit_url, headers=self._headers(), timeout=30)
        resp.raise_for_status()
        return resp.text

    def update_entry(self, edit_url: str, payload: bytes) -> None:
        resp = requests.put(
            edit_url,
            data=payload,
            headers=self._headers("application/xml"),
            timeout=30,
        )
        resp.raise_for_status()


def parse_post(path: Path) -> Dict[str, str]:
    """Parse a Jekyll post and return metadata + body."""
    text = path.read_text(encoding="utf-8")
    if text.startswith("---"):
        _, fm, body = text.split("---", 2)
        meta = yaml.safe_load(fm) or {}
        content = body.strip()
    else:
        meta = {}
        content = text.strip()
    return {"meta": meta, "body": content}


def slug_from_filename(path: Path) -> str:
    """Convert YYYY-MM-DD-title.md -> title."""
    stem = path.stem
    if len(stem) > 11 and re.match(r"\d{4}-\d{2}-\d{2}-", stem):
        return stem[11:]
    return stem


def strip_html(raw: str) -> str:
    text = re.sub(r"<[^>]+>", " ", raw)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def pick_summary_points(text: str, max_points: int, max_chars: int) -> List[str]:
    plain = strip_html(text)
    if not plain:
        return []
    sentences = re.split(r"(?<=[。．！？!?])\s*", plain)
    cleaned = [s.strip() for s in sentences if s.strip()]
    points: List[str] = []
    for sentence in cleaned:
        clipped = sentence if len(sentence) <= max_chars else sentence[: max_chars - 1] + "…"
        points.append(clipped)
        if len(points) >= max_points:
            break
    if not points:
        points = [plain[: max_chars]]
    return points


def build_redirect_html(new_url: str, summary_points: List[str]) -> str:
    escaped_url = html.escape(new_url)
    lines = [
        f'<p>この記事は <a href="{escaped_url}">{escaped_url}</a> に移転しました。</p>'
    ]
    if summary_points:
        lines.append("<p>要点メモ:</p>")
        lines.append("<ul>")
        for point in summary_points:
            lines.append(f"  <li>{html.escape(point)}</li>")
        lines.append("</ul>")
    lines.append(
        f'<p><a href="{escaped_url}" rel="nofollow noopener">▶︎ 続きを読む</a></p>'
    )
    return "\n".join(lines)


def replace_content(xml_text: str, new_html: str) -> bytes:
    doc = minidom.parseString(xml_text)
    content_nodes = doc.getElementsByTagNameNS(ATOM_NS, "content")
    if not content_nodes:
        raise RuntimeError("content node not found")
    content = content_nodes[0]
    while content.firstChild:
        content.removeChild(content.firstChild)
    content.setAttribute("type", "text/html")
    content.appendChild(doc.createCDATASection(new_html))
    updated_nodes = doc.getElementsByTagNameNS(ATOM_NS, "updated")
    stamp = dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    if updated_nodes:
        updated_node = updated_nodes[0]
        if updated_node.firstChild:
            updated_node.firstChild.nodeValue = stamp
        else:
            updated_node.appendChild(doc.createTextNode(stamp))
    else:
        updated_node = doc.createElementNS(ATOM_NS, "updated")
        updated_node.appendChild(doc.createTextNode(stamp))
        doc.documentElement.appendChild(updated_node)
    return doc.toxml(encoding="utf-8")


def load_posts(posts_dir: Path, site_url: str) -> Dict[str, Dict[str, str]]:
    posts: Dict[str, Dict[str, str]] = {}
    for path in sorted(posts_dir.glob("*.md")):
        parsed = parse_post(path)
        meta = parsed["meta"]
        title = meta.get("title")
        if not title:
            continue
        slug = slug_from_filename(path)
        new_url = f"{site_url.rstrip('/')}/{slug}/"
        posts[title] = {
            "path": str(path),
            "body": parsed["body"],
            "slug": slug,
            "new_url": new_url,
        }
    return posts


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Replace Hatena Blog articles with summaries that link to this site.",
    )
    parser.add_argument("--hatena-id", default=os.getenv("HATENA_BLOG_ID"), help="Hatena ID")
    parser.add_argument(
        "--blog-domain",
        default=os.getenv("HATENA_BLOG_DOMAIN"),
        help="Hatena Blog domain (e.g. example.hatenablog.com)",
    )
    parser.add_argument(
        "--api-key",
        default=os.getenv("HATENA_API_KEY"),
        help="Hatena API key (AtomPub).",
    )
    parser.add_argument(
        "--site-url",
        default=os.getenv("NEW_SITE_URL", "https://aoma23.com"),
        help="Destination site base URL.",
    )
    parser.add_argument(
        "--posts-dir",
        default="_posts",
        help="Directory that contains migrated Jekyll posts.",
    )
    parser.add_argument(
        "--max-sentences",
        type=int,
        default=3,
        help="How many summary sentences to keep.",
    )
    parser.add_argument(
        "--sentence-length",
        type=int,
        default=80,
        help="Maximum length per summary sentence.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Only rewrite the newest N entries (debugging helper).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Do not call the API. Print diff previews instead.",
    )
    return parser.parse_args(argv)


def ensure_args(args: argparse.Namespace) -> None:
    missing = [name for name in ("hatena_id", "blog_domain", "api_key") if not getattr(args, name)]
    if missing:
        raise SystemExit(f"Missing required args/env: {', '.join(missing)}")


def main(argv: Optional[List[str]] = None) -> None:
    args = parse_args(argv)
    ensure_args(args)
    posts_dir = Path(args.posts_dir)
    if not posts_dir.exists():
        raise SystemExit(f"Posts dir not found: {posts_dir}")
    posts = load_posts(posts_dir, args.site_url)
    if not posts:
        raise SystemExit(f"No posts found in {posts_dir}")
    client = HatenaClient(args.hatena_id, args.blog_domain, args.api_key)
    processed = 0
    skipped = 0

    for entry in client.iter_entries(limit=args.limit):
        post = posts.get(entry.title)
        if not post:
            skipped += 1
            log(f"SKIP  : '{entry.title}' (no matching local post)")
            continue
        summary_points = pick_summary_points(
            post["body"], args.max_sentences, args.sentence_length
        )
        new_html = build_redirect_html(post["new_url"], summary_points)
        log(f"READY : {entry.title} -> {post['new_url']}")
        if args.dry_run:
            print("-" * 80)
            print(f"Would update: {entry.title}")
            print(new_html)
            continue
        xml_text = client.fetch_entry_xml(entry.edit_url)
        payload = replace_content(xml_text, new_html)
        client.update_entry(entry.edit_url, payload)
        processed += 1
        log(f"DONE  : {entry.title}")

    log(f"Processed: {processed}, skipped (not found locally): {skipped}")


if __name__ == "__main__":
    main(sys.argv[1:])
