#!/usr/bin/env python3
"""Build index.html from src/. Order matters: later files wrap or extend earlier ones."""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDER = ['engine', 'rpg', 'content', 'content3', 'combat', 'careers', 'family', 'economy', 'travel',
         'housing', 'royal', 'adventure', 'disease', 'elder', 'morality', 'heir', 'relic', 'arms']
src = lambda f: open(os.path.join(ROOT, 'src', f), encoding='utf-8').read()
js = ''.join(f'// ---- {f}.js ----\n' + src(f + '.js') + '\n' for f in ORDER)
html = src('shell.html').replace('/*ENGINE*/', js).replace('/*MAP*/', src('map.js'))
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(html)
os.makedirs(os.path.join(ROOT, 'build'), exist_ok=True)
# engine only, for node tests
open(os.path.join(ROOT, 'build', 'engine.js'), 'w', encoding='utf-8').write(js)
# every inline script, for a syntax check
open(os.path.join(ROOT, 'build', 'check.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', html, re.S)))
print('built index.html', len(html) // 1024, 'KB')
