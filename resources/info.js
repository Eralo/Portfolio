const elements = [
  document.querySelector('.info-logo'),
  document.querySelector('.info-separator'),
  document.querySelector('.info-desc')
];

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      elements.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('info-visible');
        }, i * 200); // cascade 0ms, 200ms, 400ms
      });
    } else {
      elements.forEach(el => el.classList.remove('info-visible'));
    }
  });
}, {
  threshold: 0.02
});

elements.forEach(el => observer.observe(el));
