# 🎨 Doodle Challenge Portal

A web-based portal hosting a collection of fun, interactive, and minimalist mini-games inspired by classic browser "Doodles". Built entirely with **Vanilla HTML, CSS, and JavaScript**.

## 🏀 Featured Games

### 1. Basketball Doodle
Fling the ball through the hoop in this satisfying, physics-based basketball shootout.
Features:
- **Responsive HTML5 Canvas**: Scales gracefully across desktop and mobile devices.
- **Slingshot Mechanics**: Drag and release to launch the ball, complete with a visual trajectory line.
- **2D Rigid Body Physics**: Features realistic gravity, aerodynamic drag, bounce dampening, and collision reflections against the backboard and rim.
- **Visual "Juice"**: Implements subtle ball-tracking trails and a fun particle explosion effect upon scoring a basket.
- **Persistent High Scores**: Saves your highest score directly to your browser's local storage.


---

## 🛠️ Tech Stack & Constraints
The ultimate goal of this project is ultimate portability and zero build-steps.
- **0 external dependencies** (No React, Vue, NPM packages, or Canvas libraries like Pixi.js).
- **Mobile-first inputs** bridging `touchstart` and `mousedown` events smoothly.
- Designed with Google's soft primary color palette (`#4285F4`, `#EA4335`, `#FBBC05`, `#34A853`).

## 🚀 How to Run Locally

Since this project has absolutely no dependencies, you do not need to install Node or any packages.

1. Clone or download this repository.
2. Open the root `index.html` file directly in any modern web browser.
3. Click **"Play Now"** on the Basketball Doodle card to begin playing.

## 📂 Folder Structure

```
├── index.html                  # The main Challenge Portal Grid
├── README.md                   # Project documentation
└── basketball-doodle/          # The Basketball Mini-Game
    ├── index.html              # Game layout and canvas hook
    ├── style.css               # Fullscreen responsive canvas styling
    └── game.js                 # The requestAnimationFrame physics engine
```

## 🎮 How to Play Basketball Doodle
1. **Aim**: Click and physically drag *away* from the hoop to build tension (like a slingshot). The dotted blue line shows your tension angle.
2. **Shoot**: Release the mouse or your finger to launch the ball.
3. **Score**: The ball must follow a downward trajectory directly between the front and back rim. 
4. **Repeat**: Missing or making a shot will automatically reset the ball at a random location on the left side of the screen.
