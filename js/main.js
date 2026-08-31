var currentLang = 'en';

function detectLang() {
    var saved = localStorage.getItem('forge_lang');
    if (saved && FORGE_TRANSLATIONS[saved]) return saved;
    
    var browserLang = (navigator.language || navigator.userLanguage || 'en').substring(0, 2);
    var supported = { en: 'en', ru: 'ru', de: 'de', fr: 'fr', es: 'es', it: 'it', zh: 'zh', ja: 'ja', pt: 'pt', ko: 'ko' };
    
    return supported[browserLang] || 'en';
}

function applyTranslations(lang) {
    var t = FORGE_TRANSLATIONS[lang] || FORGE_TRANSLATIONS['en'];
    currentLang = lang;
    localStorage.setItem('forge_lang', lang);
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.type === 'submit' || el.type === 'button') {
                    el.value = t[key];
                } else {
                    el.placeholder = t[key];
                }
            } else {
                el.textContent = t[key];
            }
        }
    });
    
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
        var key = el.getAttribute('data-i18n-html');
        if (t[key]) {
            el.innerHTML = t[key];
        }
    });
}

function changeLang(lang) {
    document.getElementById('lang-select').value = lang;
    applyTranslations(lang);
}

document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var lang = detectLang();
    var langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.value = lang;
    }
    applyTranslations(lang);
});
