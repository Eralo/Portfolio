

document.addEventListener("DOMContentLoaded", () => {
    const svgCanvas = document.getElementById("animated-thread");
    const polygon = document.getElementById("thread");
    let isDragging = false;
    let points = [];
    let thickness = 0.2; // Contrôle de l'épaisseur du thread
    const tension = 0.1; // Contrôle la fluidité du thread
    const lerpFactor = 0.2; // Facteur d'interpolation linéaire
    let localLerpFactor = 0.01; // Facteur d'interpolation pour la déformation locale

    // Paramètres pour les vagues
    let waveAmplitude = 0.05;
    let waveFrequency = 0.03;
    let wavePhase = 0;

    let mouseX = null;
    let mouseY = null;

    const setThickness = (newThickness) => {
        thickness = newThickness;
        generatePoints();
    };

    const setTension = (newTension) => {
        tension = newTension;
    };

    const setLerpFactor = (newLerpFactor) => {
        lerpFactor = newLerpFactor;
    };

    const setLocalLerpFactor = (newLocalLerpFactor) => {
        localLerpFactor = newLocalLerpFactor;
    };

    const generatePoints = () => {
        const pointCount = 100;
        const width = 100;
        points = [];
        for (let i = 0; i <= pointCount; i++) {
            const x = (width / pointCount) * i;
            const y = 5; // Départ au milieu de la viewBox
            points.push({ x, y, originalY: y });
        }
        updatePolygon();
    };

    const updatePolygon = () => {
        let pointStr = points.map(p => `${p.x},${p.y - thickness}`).join(" ");
        pointStr += " " + points.slice().reverse().map(p => `${p.x},${p.y + thickness}`).join(" ");
        polygon.setAttribute("points", pointStr);
    };

    const lerp = (a, b, t) => (1 - t) * a + t * b;

    const startDrag = (e) => {
        isDragging = true;
        drag(e); // Pour capturer immédiatement le déplacement
    };

    const drag = (e) => {
        if (!isDragging) return;
        const rect = svgCanvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width * 100;
        mouseY = (e.clientY - rect.top) / rect.height * 10;
        points.forEach((point, index) => {
            if (Math.abs(point.x - mouseX) < 5) {
                const offsetY = mouseY - point.y;
                point.y = lerp(point.y, mouseY, lerpFactor);
                if (index === 0) {
                    points[points.length - 1].y = lerp(points[points.length - 1].y, points[points.length - 1].y + offsetY, lerpFactor);
                } else if (index === points.length - 1) {
                    points[0].y = lerp(points[0].y, points[0].y + offsetY, lerpFactor);
                }
            }
        });
        updatePolygon();
    };

    const endDrag = () => {
        isDragging = false;
    };

    const handleMouseMove = (e) => {
        const rect = svgCanvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width * 100;
        mouseY = (e.clientY - rect.top) / rect.height * 10;
    };

    const handleMouseLeave = () => {
        mouseX = null;
        mouseY = null;
        points.forEach(point => {
            point.y = lerp(point.y, point.originalY, localLerpFactor); // Réinitialiser la position des points
        });
        isDragging=false;
        updatePolygon();
    };

    const animate = () => {
        if (!isDragging) {
            for (let i = 1; i < points.length - 1; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                const next = points[i + 1];
                
                const dy1 = prev.y - curr.y;
                const dy2 = next.y - curr.y;
                curr.y += (dy1 + dy2) * tension * 0.5;

                // Restoring original position slightly for a more natural look
                curr.y += (curr.originalY - curr.y) * tension * 0.1;
            }
        }

        // Ajout de l'animation de la vague
        wavePhase += waveFrequency;
        points.forEach((point, index) => {
            point.y += Math.sin(point.x * waveFrequency + wavePhase) * waveAmplitude;

            // Déformation locale si la souris est proche
            if (mouseX !== null && mouseY !== null && Math.abs(point.x - mouseX) < 5) {
                point.y = lerp(point.y, mouseY, localLerpFactor); // Lerp pour une déformation douce
            }
        });

        updatePolygon();
        requestAnimationFrame(animate);
    };

    svgCanvas.addEventListener("mousedown", startDrag);
    svgCanvas.addEventListener("mousemove", handleMouseMove);
    svgCanvas.addEventListener("mousemove", drag);
    svgCanvas.addEventListener("mouseup", endDrag);
    svgCanvas.addEventListener("mouseleave", handleMouseLeave);

    generatePoints();
    animate();

    // Exposer les fonctions de configuration pour permettre un changement des paramètres
    window.setThickness = setThickness;
    window.setTension = setTension;
    window.setLerpFactor = setLerpFactor;
    window.setLocalLerpFactor = setLocalLerpFactor;
});
