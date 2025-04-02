
async function loadLang(lang = 'fr') {
    try {
        const res = await fetch(`./lang/${lang}.json`);
        if (!res.ok) throw new Error("Fichier introuvable");
        const translations = await res.json();

        document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.textContent = translations[key];
        }
        });
    } catch (err) {
        console.warn(`Erreur de chargement de la langue ${lang} :`, err);
        if (lang !== 'fr') loadLang('en'); // fallback en
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const userLang = navigator.language.startsWith("fr") ? "fr" : "en";
    loadLang(userLang);
});
