
const lerpFactor1 = 0.01
const lerpFactor2= 0.01

const animSpeed= 10000;


const timerName = 2000;
const nameSpeed = 5000;

const rotateSpeed=2000;
const animAmplitude=3;

let isSpinning = false; // Flag for rotation



//Lerp function
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }

//Random function
function getRandom(min, max) {
    return Math.random() * (min - max) + max;
}
//ease-in/out
function easeInOutQuad(t, acceleration = 2, deceleration = 2) {
  return t < 0.5 
      ? Math.pow(2 * t, acceleration) / 2 
      : 1 - Math.pow(-2 * t + 2, deceleration) / 2;
}

//Select all logo components to animate
const stroke = document.querySelectorAll('.cls-18');
const cristal = document.querySelectorAll('.cristal');
const logo = document.querySelector('.logo');
const rect = document.getElementById('movingRect');
const clipRect = document.getElementById('clip');
const title1 = document.querySelector('.part1');
const title2 = document.querySelector('.part2');

// Initial mouse position
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

  // Name animation
  function moveRectangle() {
    
    var startX = rect.getBBox().x;
    var startY = rect.getBBox().y;
    var polygonWidth = rect.getBBox().width;
    var polygonHeight = rect.getBBox().height; 
    var nameBBox = title1.getBBox();
    var nameBBox2 = title2.getBBox();
    var nameElementWidth = nameBBox.width + nameBBox2.width;
    var endX = (2*startX + nameElementWidth)*1.1;
    var endY = startY;
    var skew = 120;

    var startTime;

    function animate(time) {
      if (!startTime) startTime = time;
      var elapsed = time - startTime;
      var t = Math.min(elapsed / nameSpeed, 1);
      var easedT = easeInOutQuad(t, 1, 1.2);
      var currentX = lerp(startX, endX, easedT);
      var currentY = lerp(startY, endY, easedT);

      //Update points
      var points = [
        { x: currentX, y: currentY },
        { x: currentX + polygonWidth, y: currentY },
        { x: currentX + polygonWidth + skew, y: currentY + polygonHeight },
        { x: currentX + skew, y: currentY + polygonHeight }
      ];
      var pointsString = points.map(point => `${point.x},${point.y}`).join(' ');

      rect.setAttribute('points', pointsString);
      clipRect.setAttribute('points', pointsString);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // If rectangle has reached end
        if (currentX >= endX) {
          // reset after delay
          setTimeout(function() {
            rect.setAttribute('x', startX);
            clipRect.setAttribute('x', startX);
            startTime = null;
            requestAnimationFrame(animate);
          }, timerName); //timer for reset here
        } else {
          startTime = null;
          requestAnimationFrame(animate);
        }
      }
    }

    requestAnimationFrame(animate);
  }

//Strokes of hair animation following mouse
function updateElements() {
    stroke.forEach(element => {
        // Get current position of stroke
        const rect = element.getBoundingClientRect();
        const elementX = rect.left + rect.width / 2;
        const elementY = rect.top + rect.height / 2;

        // lerp it's position to target (mouse)
        const newX = lerp(elementX, mouseX, lerpFactor1);
        const newY = lerp(elementY, mouseY, lerpFactor1);

        // Apply to element
        element.style.transform = `translate(${newX - elementX}px, ${newY - elementY}px)`;
    });

    // executed at each frame
    requestAnimationFrame(updateElements);
}

function updateElementColor(element) {
    //apply progressive transition
    element.style.transition = 'filter 2s, transform 2s';

    //randomly brightens or saturates the color
    const brightness = getRandom(0.8, 1.2);
    const saturation = getRandom(1., 1.2);
    element.style.filter = `brightness(${brightness}) saturate(${saturation})`;

    //random duration
    const randomDelay = getRandom(3000, 8000);

    //fade out timoe out
    setTimeout(() => {
        element.style.filter = 'brightness(1) saturate(1)';
    }, randomDelay-20/100); //fades out until some time before changing again

    setTimeout(() => updateElementColor(element), randomDelay);
}
function startColorUpdates() {
  //launch color edition for each cristal
    cristal.forEach(element => {
        updateElementColor(element);
    });
}

//tail movement
var tail = document.getElementById('tail');
var tailTo = document.getElementById('tailTo');
  //flubber to interpolate ! (important : simple morph doesn't work cause illustrator)
var interpolator = flubber.interpolate(tail.getAttribute('d'), tailTo.getAttribute('d'));
anime({
  targets: { d: 0 },
  d: 1,
  easing: 'easeInOutQuad',
  duration: animSpeed,
  loop: true,
  direction: 'alternate',
  update: function(anim) {
    tail.setAttribute('d', interpolator(anim.animatables[0].target.d));
  }
});

//Bounce animation for the logo
anime({
  targets: '.logo',
  translateY: [
    { value: `-${animAmplitude}%`, duration: animSpeed },
    { value: `+${animAmplitude}%`, duration: animSpeed }
  ],
  easing: 'easeInOutQuad',
  loop: true, 
  direction: 'alternate',
});

//spin animation for the logo
function spinLogo() {

    if (isSpinning) return; //mutex if already spinning
    isSpinning = true;

    let startTime = null;
    const duration = 3000; //duration here

    function animate(time) {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const easeT = easeInOutQuad(t, 10, 10);
      const angle = lerp(0, 720, easeT);

      logo.style.transformOrigin = "40% 45%"; // recenter rotation
      logo.style.transform = `translateY(${getTranslateYValue()}px) rotate(${angle}deg)`;

      if (t > .9) isSpinning = false; //free mutex
      if (t < 1) { //while not finished animate
          requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
}


//get the current bounce value ! otherwise when spinning might clip (override of the transform)
function getTranslateYValue() {
  const computedStyle = window.getComputedStyle(document.querySelector('.logo'));
  const matrix = new WebKitCSSMatrix(computedStyle.transform);
  return matrix.m42; // m42 is translateY in transform matrix
}

//Listeners
document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});
window.addEventListener('resize', function() {
  moveRectangle();
});
document.querySelector('.interact').addEventListener('mousedown', spinLogo);


updateElements();
startColorUpdates();
moveRectangle();
anime();