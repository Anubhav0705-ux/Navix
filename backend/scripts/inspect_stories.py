import json

with open('data/demo/stories.json', 'r', encoding='utf-8') as f:
    stories = json.load(f)

print(f"Total stories: {len(stories)}")
for i, s in enumerate(stories, 1):
    dest = s.get('destination') or s.get('destination_name')
    slug = s.get('slug')
    dest_slug = s.get('destination_slug')
    title = s.get('title')
    print(f"{i:02d}. {slug} | Dest: {dest} ({dest_slug}) | Title: {title}")
