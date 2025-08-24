# 🎮 Pacman Paradox

A retro-style Pac-Man clone with a unique **time loop twist**! Your past movements become enemies that you must avoid while collecting dots and surviving the maze.

## 🌟 Unique Gameplay Feature

**Time Loop Mechanic**: The game records your movements for the first 30 seconds, then spawns a "clone ghost" that replays your exact path. Each loop adds more clone ghosts, creating an increasingly challenging experience where you must avoid both the original ghosts AND your past selves!

## 🎯 Game Features

- **Classic Pac-Man gameplay** with modern twists
- **Time loop recording system** - your past becomes your enemy
- **Retro pixel-art styling** with neon colors and 8-bit aesthetics
- **Cross-platform controls** - PC (arrow keys) and mobile (swipe)
- **Responsive design** that works on all screen sizes
- **Smooth animations** with animated Pac-Man mouth and ghost movements
- **Score system** with bonus points for clearing all dots

## 🎮 Controls

### PC Controls
- **Arrow Keys**: Move Pac-Man in four directions
- **Escape**: Pause/Resume game
- **Mouse**: Click buttons for menu navigation

### Mobile Controls
- **Swipe Up**: Move Pac-Man up
- **Swipe Down**: Move Pac-Man down
- **Swipe Left**: Move Pac-Man left
- **Swipe Right**: Move Pac-Man right
- **Touch**: Tap buttons for menu navigation

## 🚀 How to Play

1. **Start the Game**: Click "START GAME" from the main menu
2. **Collect Dots**: Move Pac-Man around the maze to collect yellow dots
3. **Avoid Ghosts**: Stay away from the red ghost that moves randomly
4. **Time Loop Begins**: After 30 seconds, a clone ghost spawns and replays your exact movements
5. **Survive**: Avoid both the original ghost and your clone(s) while collecting dots
6. **Score Points**: Each dot = 10 points, clearing all dots = 1000 bonus points

## 🛠️ Technical Details

- **Built with**: HTML5, CSS3, JavaScript (ES6+)
- **Graphics**: HTML5 Canvas API for smooth rendering
- **Architecture**: Object-oriented design with modular game systems
- **Performance**: 60 FPS game loop with optimized collision detection
- **Responsive**: Mobile-first design with touch controls

## 📁 Project Structure

```
pacman-paradox/
├── index.html          # Main HTML file
├── style.css           # Retro styling and responsive design
├── game.js             # Core game logic and mechanics
├── assets/             # Game assets directory
│   ├── README.md       # Asset information
│   ├── pacman.png      # Pac-Man sprite (optional)
│   ├── ghost.png       # Ghost sprite (optional)
│   ├── dot.png         # Dot sprite (optional)
│   └── sounds/         # Audio files directory
│       ├── chomp.wav   # Dot collection sound
│       └── gameover.wav # Game over sound
└── README.md           # This file
```

## 🚀 Deployment

### Local Development
1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. No build process required - pure HTML/CSS/JS!

### Web Hosting
1. Upload all files to your web server
2. Ensure the server supports HTML5 and modern JavaScript
3. The game works on any static hosting service (GitHub Pages, Netlify, Vercel, etc.)

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Customization

### Game Settings
Modify these values in `game.js`:
- `recordingTime`: How long to record before spawning clones (default: 30 seconds)
- `cellSize`: Size of each maze cell (default: 20 pixels)
- `mazeWidth/mazeHeight`: Maze dimensions (default: 28x31)

### Visual Customization
- Colors and styling in `style.css`
- Game object appearances in `game.js` draw methods
- Fonts and animations in CSS

## 🎨 Future Enhancements

The code includes TODO comments for these planned features:
- Power pellets and energizer mechanics
- Different ghost AI patterns
- Sound effects and background music
- Multiple maze layouts
- High score system with localStorage
- Difficulty levels
- Particle effects and visual polish
- Level progression system
- Achievements and unlockables
- Ghost house and bonus rounds

## 🤝 Contributing

Feel free to fork this project and add your own features! Some ideas:
- New maze layouts
- Additional game modes
- Sound effects and music
- Visual improvements
- Performance optimizations

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

- **Game Concept**: Inspired by classic Pac-Man with a time paradox twist
- **Graphics**: Canvas-drawn sprites for optimal performance
- **Font**: "Press Start 2P" from Google Fonts for authentic retro feel
- **Design**: Retro arcade aesthetic with modern responsive principles

---

**Enjoy the paradox!** 🕰️👻
