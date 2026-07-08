// ================================================================
// Link Forge PRO — Main Script
// ================================================================

let currentLang = 'en';

// ================================================================
// LANGUAGE
// ================================================================

function detectLang() {
    // 1. Проверяем сохранённый язык
    const saved = localStorage.getItem('forge_lang');
    if (saved && typeof FORGE_TRANSLATIONS !== 'undefined' && FORGE_TRANSLATIONS[saved]) {
        return saved;
    }
    
    // 2. Определяем язык браузера
    const browserLang = (navigator.language || navigator.userLanguage || 'en').substring(0, 2);
    const supported = {
        en: 'en', ru: 'ru', de: 'de', fr: 'fr', es: 'es',
        it: 'it', zh: 'zh', ja: 'ja', pt: 'pt', ko: 'ko'
    };
    
    return supported[browserLang] || 'en';
}

function applyTranslations(lang) {
    // Проверяем, загружены ли переводы
    if (typeof FORGE_TRANSLATIONS === 'undefined') {
        console.error('FORGE_TRANSLATIONS not loaded! Check js/translations.js');
        return;
    }
    
    const t = FORGE_TRANSLATIONS[lang];
    if (!t) {
        console.warn('Language not found:', lang, 'falling back to en');
        return applyTranslations('en');
    }
    
    currentLang = lang;
    localStorage.setItem('forge_lang', lang);
    document.documentElement.lang = lang;
    
    // Применяем переводы
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
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
    
    console.log('Translations applied:', lang, Object.keys(t).length, 'keys');
}

function changeLang(lang) {
    document.getElementById('lang-select').value = lang;
    applyTranslations(lang);
}

// ================================================================
// PAYMENT
// ================================================================

let selectedPlan = 'yearly';
let planPrice = '$29';

function buy(plan) {
    selectedPlan = plan;
    
    switch (plan) {
        case 'monthly': planPrice = '$4.99'; break;
        case 'yearly': planPrice = '$29'; break;
        case 'lifetime': planPrice = '$79'; break;
    }
    
    const t = (typeof FORGE_TRANSLATIONS !== 'undefined' && FORGE_TRANSLATIONS[currentLang]) 
        ? FORGE_TRANSLATIONS[currentLang] 
        : { plan_monthly: 'Monthly', plan_yearly: 'Yearly', plan_lifetime: 'Lifetime' };
    
    const planNames = {
        monthly: t.plan_monthly,
        yearly: t.plan_yearly,
        lifetime: t.plan_lifetime
    };
    
    document.getElementById('modal-plan-name').textContent = planNames[plan];
    document.getElementById('modal-price').textContent = `${planPrice} — Link Forge PRO (${planNames[plan]})`;
    document.getElementById('payment-modal').classList.add('open');
    document.getElementById('email').focus();
}

function closeModal() {
    document.getElementById('payment-modal').classList.remove('open');
}

async function submitPayment(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const btn = e.target.querySelector('button');
    const originalText = btn.textContent;
    
    if (!email) return;
    
    btn.textContent = '⏳ Processing...';
    btn.disabled = true;
    
    try {
        const response = await fetch('https://bitcoins-mining.net/link-forge-api/create-payment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, plan: selectedPlan })
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = data.payment_url;
        } else {
            alert('Payment error. Please try again or contact support.');
            btn.textContent = originalText;
            btn.disabled = false;
        }
    } catch (err) {
        alert('Network error. Please check your connection and try again.');
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// ================================================================
// MODAL CLOSE
// ================================================================

document.getElementById('payment-modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// ================================================================
// SMOOTH SCROLL
// ================================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ================================================================
// INIT
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
    const lang = detectLang();
    document.getElementById('lang-select').value = lang;
    applyTranslations(lang);
});
