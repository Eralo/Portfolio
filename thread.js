document.addEventListener("DOMContentLoaded", () => {
    const polygon = document.getElementById("thread");
    const offset = 0.4; // Adjust this value to change the offset between upper and lower waves
    const speed = 0.002; // Speed of the animation
    const amplitudeBase = 1;
    const frequencyBase = 0.1;
    const waveCount = 5; // Number of waves
    const turbulenceDecay = 0.98; // Decay factor for the turbulence effect
    const turbulence = Array(101).fill(0); // Initialize turbulence array
    const maxDistance = 10; // Maximum distance from the mouse to apply turbulence
    const turbulenceAmplitude = 0.5; // Initial amplitude of the turbulence effect
  
    let startTime = null;
    let mouseX = -1;
    let mouseY = -1;
  
    // Generate initial waves with fixed amplitude and frequency but random initial phase
    const waves = generateWaves();
  
    function generateWaves() {
      return Array.from({ length: waveCount }, () => ({
        amplitude: amplitudeBase + (Math.random() * 0.4 - 0.2), // Vary amplitude slightly
        frequency: frequencyBase + (Math.random() * 0.02 - 0.01), // Vary frequency slightly
        phase: Math.random() * Math.PI * 2 // Random initial phase
      }));
    }
  
    function animate(time) {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
  
      // Apply decay to the turbulence array
      for (let i = 0; i < turbulence.length; i++) {
        turbulence[i] *= turbulenceDecay;
      }
  
      const points = generateWavePoints(elapsed, offset, speed, waves);
      polygon.setAttribute("points", points);
  
      requestAnimationFrame(animate);
    }
  
    function generateWavePoints(elapsed, offset, speed, waves) {
      const upperPoints = [];
      const lowerPoints = [];
      for (let i = 0; i <= 100; i++) {
        let upperY = 5;
        for (const wave of waves) {
          upperY += Math.sin((i * wave.frequency) + (elapsed * speed) + wave.phase) * wave.amplitude;
        }
  
        // Apply the turbulence effect
        upperY += turbulence[i];
  
        const lowerY = upperY + offset;
        upperPoints.push(`${i},${upperY}`);
        lowerPoints.push(`${i},${lowerY}`);
      }
  
      // Combine the points to create a continuous shape
      return upperPoints.concat(lowerPoints.reverse()).join(" ");
    }
  
    // Start the animation
    requestAnimationFrame(animate);
  
    // Mouse move event to adjust the waves based on mouse position
    polygon.addEventListener("mousemove", (event) => {
      const rect = polygon.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 100; // Scale mouseX to viewbox coordinates
      mouseY = ((event.clientY - rect.top) / rect.height) * 10; // Scale mouseY to viewbox coordinates
  
      // Apply a local turbulence effect
      for (let i = 0; i < turbulence.length; i++) {
        const distance = Math.abs(mouseX - i);
        if (distance < maxDistance) {
          turbulence[i] += (maxDistance - distance) / maxDistance * turbulenceAmplitude; // Adjust the multiplier as needed
        }
      }
    });
  
    // Mouse leave event to reset the mouse position
    polygon.addEventListener("mouseleave", () => {
      mouseX = -1;
      mouseY = -1;
    });
  });
  