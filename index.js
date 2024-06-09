
const lerpFactor1 = 0.01
const lerpFactor2= 0.01


// Fonction utilitaire pour l'interpolation linéaire
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }

// Fonction utilitaire pour obtenir une valeur aléatoire dans une plage
function getRandom(min, max) {
    return Math.random() * (min - max) + max;
}

// Sélectionner tous les éléments avec la classe .cls-18
const stroke = document.querySelectorAll('.cls-18');
const cristal = document.querySelectorAll('.cristal');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Mettre à jour les positions des éléments en fonction du mouvement de la souris
function updateElements() {
    stroke.forEach(element => {
        // Obtenir la position actuelle de l'élément
        const rect = element.getBoundingClientRect();
        const elementX = rect.left + rect.width / 2;
        const elementY = rect.top + rect.height / 2;

        // Calculer la nouvelle position avec lerp en fonction de la position de la souris
        const newX = lerp(elementX, mouseX, lerpFactor1);
        const newY = lerp(elementY, mouseY, lerpFactor1);

        // Appliquer la transformation de translation
        element.style.transform = `translate(${newX - elementX}px, ${newY - elementY}px)`;
    });

    requestAnimationFrame(updateElements);
}

function updateElementColor(element) {
    // Appliquer la transition pour une transformation douce
    element.style.transition = 'filter 0.3s, transform 0.3s'; // Ajoute une transition douce

    // Modifier la couleur pour la rendre plus claire ou sombre de manière aléatoire
    const brightness = getRandom(0.8, 1.2);
    const saturation = getRandom(1., 1.2);
    element.style.filter = `brightness(${brightness}) saturate(${saturation})`;

    // Planifier le prochain changement de couleur avec une durée aléatoire
    const randomDelay = getRandom(2000, 7000);

    // Remettre la couleur d'origine après un certain temps
    setTimeout(() => {
        element.style.filter = 'brightness(1) saturate(1)';
    }, randomDelay-20/100); // Correspond à la durée de la transition
    setTimeout(() => updateElementColor(element), randomDelay);
}

function startColorUpdates() {
    cristal.forEach(element => {
        updateElementColor(element);
    });
}

var tail = document.getElementById('tail');
var tailTo = document.getElementById('tailTo');
  // Utiliser flubber pour créer une fonction d'interpolation entre les chemins
  var interpolator = flubber.interpolate(tail.getAttribute('d'), tailTo.getAttribute('d'));

  anime({
    targets: { d: 0 },
    d: 1,
    easing: 'easeInOutQuad',
    duration: 10000,
    loop: true,
    direction: 'alternate',
    update: function(anim) {
      tail.setAttribute('d', interpolator(anim.animatables[0].target.d));
    }
  });
  
  // Écouter les mouvements de la souris
  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });
  
  // Démarrer l'animation
  updateElements();
  startColorUpdates();
  anime();