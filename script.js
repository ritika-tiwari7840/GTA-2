const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const mapImage = new Image();
mapImage.src = 'map.jpg';
const characterImage = new Image();
characterImage.src = 'character.png';

const canvasWidth = 800;
const canvasHeight = 600;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let angle = 0;
let position = { x: 0, y: 0 };
let zoomLevel = 1; // Add zoom level, starting at 1 (no zoom)
const step = 2;
const keys = {};

const characterScale = 0.07;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel); // Apply zoom scaling

    // Calculate the boundaries to prevent the map from showing areas outside its dimensions
    const mapX = Math.max(Math.min(-position.x + canvasWidth / (2 * zoomLevel), 0), -(mapImage.width - canvasWidth / zoomLevel));
    const mapY = Math.max(Math.min(-position.y + canvasHeight / (2 * zoomLevel), 0), -(mapImage.height - canvasHeight / zoomLevel));
    
    // Draw the clipped map image
    ctx.drawImage(mapImage, mapX, mapY);

    ctx.restore();

    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate(angle);

    const characterWidth = characterImage.width * characterScale * zoomLevel;
    const characterHeight = characterImage.height * characterScale * zoomLevel;
    ctx.drawImage(characterImage, -characterWidth / 2, -characterHeight / 2, characterWidth, characterHeight);
    ctx.restore();
}

function update() {
    let newX = position.x;
    let newY = position.y;

    if (keys['a']) {
        angle -= 0.05;
    }
    if (keys['d']) {
        angle += 0.05;
    }
    if (keys['w']) {
        newX += Math.sin(angle) * step;
        newY -= Math.cos(angle) * step;
    }
    if (keys['s']) {
        newX -= Math.sin(angle) * step;
        newY += Math.cos(angle) * step;
    }

    // Ensure the character doesn't move out of the map bounds
    const halfCanvasWidth = (canvasWidth / 2) / zoomLevel;
    const halfCanvasHeight = (canvasHeight / 2) / zoomLevel;

    newX = Math.max(halfCanvasWidth, Math.min(newX, mapImage.width - halfCanvasWidth));
    newY = Math.max(halfCanvasHeight, Math.min(newY, mapImage.height - halfCanvasHeight));

    position.x = newX;
    position.y = newY;
}

// Listen for zoom key presses (e.g., + to zoom in, - to zoom out)
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;

    // Zoom in with '+' key and zoom out with '-' key
    if (event.key === '+') {
        zoomLevel = Math.min(zoomLevel + 0.1, 3); // Cap the max zoom
    } else if (event.key === '-') {
        zoomLevel = Math.max(zoomLevel - 0.1, 0.5); // Cap the minimum zoom
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

let imagesLoaded = 0;
const totalImages = 2;

mapImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};

characterImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};