#!/usr/bin/env python3
"""Inlines styles/site.css into every visitor-facing HTML.

Source of truth remains styles/site.css. Re-run this whenever you edit it.

Replaces:
    <link rel="stylesheet" href=".../site.css?v=NN" />
or any prior
    <style data-inline-css>...</style>

Idempotent — safe to re-run.
"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]


def minify_css(css: str) -> str:
    """Conservative minifier: strips comments + collapses whitespace, but keeps
    single spaces around value operators (calc()'s `-`/`+` need them)."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)  # comments
    css = re.sub(r"\s+", " ", css)  # whitespace runs -> single space
    css = re.sub(r"\s*([{}:;,>])\s*", r"\1", css)  # drop space around structural tokens
    css = css.replace(";}", "}")  # trailing semicolons
    return css.strip()


# self-check: calc spaces survive, structural whitespace goes
assert minify_css("a { color: red; }") == "a{color:red}"
assert "calc(100svh - var(--nav-h))" in minify_css(".x{h:calc(100svh - var(--nav-h))}")

CSS = minify_css((ROOT / "styles/site.css").read_text())

FILES = [
    "index.html", "impressum.html", "datenschutz.html",
    "de/index.html", "de/menu.html",
    "en/index.html", "en/menu.html",
    "es/index.html", "es/menu.html",
    "fr/index.html", "fr/menu.html",
    "it/index.html", "it/menu.html",
]

pattern = re.compile(
    r'<link rel="stylesheet" href="[^"]*site\.css\?v=\d+"\s*/?>'
    r'|<style data-inline-css>.*?</style>',
    re.DOTALL,
)
replacement = f"<style data-inline-css>{CSS}</style>"

for rel in FILES:
    p = ROOT / rel
    text = p.read_text()
    new = pattern.sub(lambda _m: replacement, text)
    if new != text:
        p.write_text(new)
        print(f"✓ {rel}")
    else:
        print(f"— {rel} (no change)")
