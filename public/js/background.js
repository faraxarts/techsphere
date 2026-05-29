// public/js/background.js

const background = document.getElementById('background');

// List of background images (relative to /public folder)
const images = [
  '/images/download (2).jpg',
  '/images/download (3).jpg',
  '/images/download (4).jpg',
  '/images/download (5).jpg',
  '/images/download (6).jpg'
];

// Start with the first image
let current = 0;

// Function to change background image
function changeBackground() {
  background.style.backgroundImage = `url('${images[current]}')`;
  background.style.transition = 'background-image 1s ease-in-out';
  
  // Move to next image, loop back if at the end
  current = (current + 1) % images.length;
}

// Change every 6 seconds (6000 ms)
setInterval(changeBackground, 6000);

// Initialize first image
changeBackground();



// Horizontal Scroll Buttons for Tech News
const newsContainer = document.getElementById("newsContainer");
const leftBtn = document.querySelector(".left-btn");
const rightBtn = document.querySelector(".right-btn");

rightBtn.addEventListener("click", () => {
    newsContainer.scrollBy({ left: 300, behavior: "smooth" });
});

leftBtn.addEventListener("click", () => {
    newsContainer.scrollBy({ left: -300, behavior: "smooth" });
});