/**
 * LOOMPER V2 - JavaScript (PATCH FINAL)
 * Estável, previsível, compatível e rastreável
 */

/* =========================================================
   USER ID – ÚNICO, IMUTÁVEL, SEGURO
   ========================================================= */
function getOrCreateUserId() {
  let id = localStorage.getItem('loomper_user_id');
  if (!id) {
    id = 'LMP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    localStorage.setItem('loomper_user_id', id);
  }
  return id;
}

window.LOOMPER_USER_ID = getOrCreateUserId();

/* =========================================================
   APP
   ========================================================= */
(function () {
  'use strict';

  let validCities = [];

  const CONFIG = {
    whatsapp: '5511965858142',
    email: 'contato@loomper.com.br',
    pixKey: 'contato@loomper.com.br',
    domain: window.location.origin || 'https://loomper.com.br'
  };

  /* ================= TRACKING ================= */
  const Tracking = {
    journey: [],

    load() {
      try {
        const saved = localStorage.getItem('loomper_journey');
        if (saved) this.journey = JSON.parse(saved);
      } catch (_) {}
    },

    track(action, data = {}) {
      const event = {
        action,
        data,
        timestamp: new Date().toISOString(),
        page: location.pathname,
        referrer: document.referrer
      };
      this.journey.push(event);
      try {
        localStorage.setItem('loomper_journey', JSON.stringify(this.journey));
      } catch (_) {}
    },

    summary() {
      const profiles = this.journey
        .filter(e => e.data.profile)
        .map(e => e.data.profile);
      return {
        profile: profiles.at(-1) || 'não identificado',
        actions: [...new Set(this.journey.map(e => e.action))],
        total_interactions: this.journey.length
      };
    }
  };

  /* ================= UTIL ================= */
  function validatePhone(v) {
    const n = v.replace(/\D/g, '');
    return n.length >= 10 && n.length <= 11;
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function formatPhone(v) {
    return v.replace(/\D/g, '').slice(0, 11);
  }

  function getReferrer() {
    return new URLSearchParams(location.search).get('ref') || '';
  }

  /* ================= IBGE ================= */
  async function loadCities(uf, datalistId, input) {
    try {
      const res = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
      );
      const data = await res.json();
      validCities = data.map(c => c.nome.toLowerCase());

      const list = document.getElementById(datalistId);
      list.innerHTML = '';
      data.forEach(c => {
        const o = document.createElement('option');
        o.value = c.nome;
        list.appendChild(o);
      });

      input.placeholder = 'Digite para buscar…';
    } catch {
      validCities = [];
    }
  }

  /* ================= FORM ================= */
  function initForm() {
    const form = document.getElementById('waitlistForm');
    if (!form) return;

    Tracking.load();

    form.addEventListener('submit', async e => {
      e.preventDefault();

      let ok = true;

      const name = waitlistName.value.trim();
      const phone = waitlistWhatsapp.value;
      const email = waitlistEmail.value;
      const uf = waitlistUf.value;
      const city = waitlistCity.value.trim();
      const profile = waitlistProfile.value;
      const terms = waitlistTerms.checked;

      if (name.length < 3) ok = false;
      if (!validatePhone(phone)) ok = false;
      if (!validateEmail(email)) ok = false;
      if (!uf) ok = false;
      if (!city || !validCities.includes(city.toLowerCase())) ok = false;
      if (!profile) ok = false;
      if (!terms) ok = false;

      if (!ok) {
        Tracking.track('form-error');
        alert('Verifique os campos obrigatórios.');
        return;
      }

      id_user.value = getOrCreateUserId();
      referrer_id.value = getReferrer();
      user_journey.value = JSON.stringify(Tracking.summary());
      terms_accepted_at.value = new Date().toISOString();

      const data = new FormData(form);
      data.append('form-name', 'waitlist');

      try {
        const res = await fetch('/', {
          method: 'POST',
          body: new URLSearchParams(data).toString(),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (res.ok) {
          Tracking.track('form-success', { profile });
          document.getElementById('successModal')?.setAttribute('aria-hidden', 'false');
          form.reset();
        } else {
          throw new Error();
        }
      } catch {
        Tracking.track('form-fail');
        alert('Erro ao enviar. Tente novamente.');
      }
    });

    waitlistWhatsapp.addEventListener('input', e => {
      e.target.value = formatPhone(e.target.value);
    });

    waitlistUf.addEventListener('change', e => {
      loadCities(e.target.value, 'city-list', waitlistCity);
    });
  }

  /* ================= WHATSAPP FAB ================= */
  function initWhatsapp() {
    const fab = document.getElementById('whatsappFab');
    if (!fab) return;

    fab.addEventListener('click', () => {
      const s = Tracking.summary();
      const msg = `Olá! Sou ${s.profile}. Meu ID: ${getOrCreateUserId()}`;
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`);
      Tracking.track('whatsapp-click');
    });
  }

  /* ================= INIT ================= */
  function init() {
    initForm();
    initWhatsapp();
    console.log('🚀 LOOMPER JS carregado com sucesso');
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
