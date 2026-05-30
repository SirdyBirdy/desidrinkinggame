# Sharaabi Shaam 🥂

A desi drinking game for legends. Mobile-first, vibrant, built for open bars.

## Games

1. **Never Have I Ever** — Desi Edition with 30+ SFW + 16 risque cards
2. **Majority Rules** — Vote & Drink with 20 SFW + 10 risque rounds  
3. **Bollywood Blitz** — Speed Trivia with 15s timer, 25 SFW + 8 risque Q&As

All games have a **Dare pile** for when someone refuses. Toggle **Risque Mode** on the home screen to unlock spicy content.

## Files

```
index.html      — App shell and all screen layouts
style.css       — All styles (mobile-first)
game.js         — Game logic, state, timers
content.js      — ALL game content (edit this to add/remove/modify cards)
netlify.toml    — Netlify deployment config
```

## Editing Content

Open `content.js` — everything is clearly labelled. Each game has a `safe` array and a `risque` array. The `dares` object at the bottom is shared across all games.

Add a card: push a new string (NHIE, Majority Rules) or object `{question, answer}` (Bollywood Blitz) to the relevant array.

## Deploy to Netlify via GitHub

1. Push this folder to a GitHub repo:
```bash
git init
git add .
git commit -m "init sharaabi shaam"
git remote add origin https://github.com/YOUR_USERNAME/sharaabi-shaam.git
git push -u origin main
```

2. Go to [netlify.com](https://netlify.com) → New site → Import from GitHub
3. Select your repo, leave build settings blank (static site)
4. Deploy — done. Live in 30 seconds.

Or drag-drop the folder directly into Netlify's dashboard.
