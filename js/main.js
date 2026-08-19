var currentLang = 'en';
var FORGE_API_URL = 'https://bitcoins-mining.net/link-forge-api';

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

var selectedPlan = 'lifetime';

function buy(plan) {
    selectedPlan = 'lifetime';
    var t = FORGE_TRANSLATIONS[currentLang] || FORGE_TRANSLATIONS['en'];
    var planName = 'Lifetime PRO';
    var price = currentLang === 'ru' ? '₽4 900' : '$49';
    
    document.getElementById('modal-plan-name').textContent = planName;
    document.getElementById('modal-price').textContent = price + ' — Link Forge PRO';
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
    
    btn.textContent = 'Processing...';
    btn.disabled = true;
    
    try {
        var apiUrl = FORGE_API_URL + '/create-payment.php';
        
        var response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, plan: 'lifetime' })
        });
        
        var data = await response.json();
        
        if (data.success && data.payment_url) {
            window.location.href = data.payment_url;
        } else {
            alert('Payment error: ' + (data.message || 'Unknown error'));
            btn.textContent = originalText;
            btn.disabled = false;
        }
    } catch (err) {
        console.error('Payment error:', err);
        alert('Network error. Check console for details.');
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

document.getElementById('payment-modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var lang = detectLang();
    document.getElementById('lang-select').value = lang;
    applyTranslations(lang);
});
