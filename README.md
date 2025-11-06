# Classic Snake (HTML5 Canvas)

This repository contains a small, dependency-free implementation of the classic Snake game using HTML5 Canvas and vanilla JavaScript.

## Features

- Classic snake movement on a 30x30 grid rendered on a canvas.
- Arrow keys or WASD for control. Space toggles start/pause.
- Food placement that avoids the snake's body.
- Score and localStorage-backed high score.
- Edge wrapping toggle (checkbox).
- Speed increases gradually as you eat more food.

## Files

- `index.html` — main page, canvas and UI controls.
- `style.css` — minimal styling and layout.
- `script.js` — full game logic, rendering, input handling.
- `LICENSE` — MIT license.

## How to run

1. Easiest: Open `index.html` in your browser (double-click or `Open File…`).

2. Recommended: serve the folder with a small HTTP server (so localStorage and some browsers behave normally). Example using Python 3:

```bash
# from project root
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

## Controls

- Arrow keys or WASD: change direction (can't instantly reverse).
- Start / Pause / Restart buttons in the UI.
- Space toggles start/pause.
- Toggle "Wrap edges" to switch between wrapping and wall collisions.

## Customization ideas

- Add levels or obstacles.
- Different food types (power-ups, slow-downs).
- Mobile touch controls or swipe support.

## License

This project is MIT licensed — see the `LICENSE` file.

Enjoy! If you want, I can add features like obstacles, multiple food types, or a mobile-friendly control scheme.

# snake-game
