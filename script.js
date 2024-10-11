const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const mapImage = new Image();
mapImage.src = 'map.jpg'; // Path to the uploaded map image
const characterImage = new Image();
characterImage.src = 'character.png'; // Path to your character image

const canvasWidth = 800;
const canvasHeight = 600;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let angle = 0; // Angle for rotation
let position = { x: canvas.width/2, y: canvas.height/2}; // Character's position relative to the map
const step = 5; // Movement speed
const keys = {}; // Track key states

// Set character scale
const characterScale = 0.1; // Scale down to 50% of original size

// Create an offscreen canvas for pixel collision detection
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');

// Function to check if a pixel is walkable
function isWalkablePixel(x, y) {
    // Get pixel data from the offscreen canvas
    const pixelData = offscreenCtx.getImageData(x, y, 1, 1).data;

    // Assuming walkable areas are light (not walls), and walls are dark (e.g., grayscale)
    // Example: If the pixel color is close to black (a wall), return false
    const [r, g, b] = pixelData;
    
    // Simple rule: if the pixel is dark (close to black), it is a wall (non-walkable)
    return !(r < 50 && g < 50 && b < 50); // True if not a wall
}

// Function to draw the map and the character
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the map image with offsets to simulate panning
    ctx.drawImage(mapImage, -position.x + canvasWidth / 2, -position.y + canvasHeight / 2);

    // Save the current context state
    ctx.save();

    // Move to the center of the canvas for the character
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate(angle); // Rotate by the current angle

    // Draw character at the center with scaling
    const characterWidth = characterImage.width * characterScale;
    const characterHeight = characterImage.height * characterScale;
    ctx.drawImage(characterImage, -characterWidth / 2, -characterHeight / 2, characterWidth, characterHeight);

    // Restore the context to its original state
    ctx.restore();
}

// Function to update position and angle based on key states
function update() {
    let newX = position.x;
    let newY = position.y;

    if (keys['a']) {
        angle -= 0.05; // Rotate left
    }
    if (keys['d']) {
        angle += 0.05; // Rotate right
    }
    if (keys['w']) {
        // Move forward
        newX += Math.sin(angle) * step;
        newY -= Math.cos(angle) * step;
    }
    if (keys['s']) {
        // Move backward
        newX -= Math.sin(angle) * step;
        newY += Math.cos(angle) * step;
    }

    // Get the projected future position on the map
    const mapX = Math.floor(newX + canvasWidth / 2);
    const mapY = Math.floor(newY + canvasHeight / 2);

    // Check if the new position is walkable based on pixel color
    if (isWithinMap(newX, newY) && isWalkablePixel(mapX, mapY)) {
        position.x = newX;
        position.y = newY;
    }
}

// Check if the character is within the map boundaries
function isWithinMap(x, y) {
    const mapWidth = mapImage.width; // Get map width
    const mapHeight = mapImage.height; // Get map height

    // Check if the position is within the bounds of the map
    return x >= 0 && x <= mapWidth && y >= 0 && y <= mapHeight;
}

// Event listeners for key down and up
document.addEventListener('keydown', (event) => {
    keys[event.key] = true; // Mark the key as pressed
});
document.addEventListener('keyup', (event) => {
    keys[event.key] = false; // Mark the key as released
});

// Main loop to update position and redraw
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop); // Repeat the loop
}

// Load images and start the game loop
let imagesLoaded = 0;
const totalImages = 2;

mapImage.onload = () => {
    imagesLoaded++;
    offscreenCanvas.width = mapImage.width;
    offscreenCanvas.height = mapImage.height;
    offscreenCtx.drawImage(mapImage, 0, 0); // Draw map to offscreen canvas for pixel data

    if (imagesLoaded === totalImages) {
        gameLoop(); // Start the main loop after both images load
    }
};

characterImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop(); // Start the main loop after both images load
    }
};
