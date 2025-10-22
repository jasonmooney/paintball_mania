# 🎨 Paintball Mania

A fun, colorful web-based paintball game where you shoot at moving emoji targets with satisfying paint splats!

## 🎮 Features

- **3D Paintball Gun**: Rotating barrel that follows your mouse cursor
- **Animated Paintballs**: Colorful projectiles with realistic physics and trails
- **Moving Emoji Targets**: Various emojis that bounce around the screen
- **Bonus Targets**: Special targets worth extra points
- **Progressive Difficulty**: 
  - More targets spawn each level
  - Timer reduces by 5 seconds each level
  - Emojis speed up when hitting walls
- **High Score System**: Local leaderboard with top 10 scores
- **3D Visual Effects**: Shadows, gradients, and depth on all elements
- **Colorful Paint Splats**: Multi-layered splat effects when hitting targets

## 🕹️ How to Play

1. **Aim**: Move your mouse to aim the paintball gun
2. **Shoot**: Click to fire colorful paintballs at emoji targets
3. **Hit Targets**: Score points by hitting emojis (3 points normal, 10 points bonus)
4. **Clear Levels**: Eliminate all targets to advance to the next level
5. **Race Against Time**: Each level reduces your timer by 5 seconds
6. **Avoid Wall Bounces**: Emojis speed up when they hit walls!

## 🚀 Getting Started

1. Open `index.html` in any modern web browser
2. Start playing immediately - no installation required!
3. Add your own splat sound file to `assets/splat.mp3` for audio effects

## 🛠️ Technology

- **HTML5 Canvas** for graphics rendering
- **Vanilla JavaScript** for game logic
- **CSS3** with 3D transforms and animations
- **Local Storage** for persistent high scores

## 📁 Project Structure

```
paintball_mania/
├── index.html      # Main HTML file
├── style.css       # 3D styling and animations
├── game.js         # Game logic and mechanics
├── assets/
│   └── splat.mp3   # Sound effect (add your own)
├── CHANGE.md       # Development changelog
└── README.md       # This file
```

## 🎯 Game Mechanics

- **Timer**: Start with 60 seconds, lose 5 seconds each level (minimum 10s)
- **Targets**: 5 + level number of targets spawn each level
- **Speed**: Base speed increases with level, wall collisions add +0.2 speed
- **Scoring**: Normal targets = 3 points, Bonus targets = 10 points
- **High Scores**: Top 10 scores saved locally in browser

## 🎨 Created by Rosa

A colorful, fun paintball game built with love for emoji targets and paint splatting action!

Enjoy the game! 🎉