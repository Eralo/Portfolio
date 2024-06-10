
const lerpFactor1 = 0.01
const lerpFactor2= 0.01

const animSpeed= 10000;

const rotateSpeed=2000;
const animAmplitude=5;

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


// Initial mouse position
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

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

      logo.style.transform = `translateY(${getTranslateYValue()}px) rotate(${angle}deg)`;

      if (t < 1) { //while not finished animate
          requestAnimationFrame(animate);
      }
      else {
        isSpinning = false; //free mutex
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
document.querySelector('.interact').addEventListener('mousedown', spinLogo);
  
  

  updateElements();
  startColorUpdates();
  anime();