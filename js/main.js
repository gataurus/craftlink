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
}

function changeLang(lang) {
    document.getElementById('lang-select').value = lang;
    applyTranslations(lang);
}

// Payment
var selectedPlan = 'yearly';

function buy(plan) {
    selectedPlan = plan;
    
    var t = FORGE_TRANSLATIONS[currentLang] || FORGE_TRANSLATIONS['en'];
    var planName = t['plan_' + plan];
    var price = t['price_' + plan];
    
    document.getElementById('modal-plan-name').textContent = planName;
    document.getElementById('modal-price').textContent = price + ' — Link Forge PRO (' + planName + ')';
    document.getElementById('payment-modal').classList.add('open');
    document.getElementById('email').focus();
}

function closeModal() {
    document.getElementById('payment-modal').classList.remove('open');
}

async function submitPayment(e) {
    e.preventDefault();
    var email = document.getElementById('email').value;
    var btn = e.target.querySelector('button');
    var originalText = btn.textContent;
    if (!email) return;
    
    btn.textContent = '⏳ Processing...';
    btn.disabled = true;
    
    try {
        var response = await fetch('https://bitcoins-mining.net/link-forge-api/create-payment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, plan: selectedPlan })
        });
        var data = await response.json();
        if (data.success) {
            window.location.href = data.payment_url;
        } else {
            alert('Payment error. Please try again.');
            btn.textContent = originalText;
            btn.disabled = false;
        }
    } catch (err) {
        alert('Network error.');
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// Modal close
document.getElementById('payment-modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Init
document.addEventListener('DOMContentLoaded', function() {
    var lang = detectLang();
    document.getElementById('lang-select').value = lang;
    applyTranslations(lang);
});
