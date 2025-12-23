/**
 * LOOMPER V2 - JavaScript (FINAL LIMPO)
 * Tracking, simulador e Netlify Forms
 */

(function () {
  'use strict';

  /* ===============================
     USER ID — GARANTIA ABSOLUTA
     =============================== */
  function getOrCreateUserId() {
    let id = localStorage.getItem('loomper_user_id');
    if (!id) {
      id = 'LMP-' + crypto.randomUUID().split('-')[0].toUpperCase();
      localStorage.setItem('loomper_user_id', id);
    }
    return id;
  }

  const USER_ID = getOrCreateUserId();

  /* ===============================
     REFERRER
     =============================== */
  function getReferrer() {
    return new URLSearchParams(window.location.search).get('ref') || 'direct';
  }

  /* ===============================
     TRACKING SIMPLES E CONFIÁVEL
     =============================== */
  const Tracking = {
    journey: [],
    track(action, data = {}) {
      this.journey.push({
        action,
        data,
        at: new Date().toISOString()
      });
      localStorage.setItem('loomper_journey', JSON.stringify(this.journey));
    },
    summary() {
      const profiles = this.journey.map(j => j.data.profile).filter(Boolean);
      return {
        profile: profiles.at(-1) || 'não identificado',
        total_interactions: this.journey.length,
        actions: [...new Set(this.journey.map(j => j.action))]
      };
    }
  };

  /* ===============================
     HEADER / MENU MOBILE
     =============================== */
  function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('navMobile');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      nav.classList.toggle('active');
    });
  }

  /* ===============================
     PERFIL SELECIONADO
     =============================== */
  function initProfileSelection() {
    document.querySelectorAll('[data-profile]').forEach(btn => {
      btn.addEventListener('click', () => {
        localStorage.setItem('loomper_profile', btn.dataset.profile);
        Tracking.track('profile-selected', { profile: btn.dataset.profile });
      });
    });
  }

  function applyProfileToForm() {
    const select = document.getElementById('waitlist-profile');
    if (!select) return;

    const map = {
      motorista: 'Motorista',
      chapa: 'Chapa / Ajudante',
      transportadora: 'Transportadora',
      investidor: 'Investidor / Parceiro'
    };

    const saved = localStorage.getItem('loomper_profile');
    if (map[saved]) select.value = map[saved];
  }

  /* ===============================
     FORM NETLIFY
     =============================== */
  function initForm() {
    const form = document.getElementById('waitlistForm');
    if (!form) return;

    form.addEventListener('submit', () => {
      document.getElementById('id_user').value = USER_ID;
      document.getElementById('referrer_id').value = getReferrer();
      document.getElementById('user_journey').value =
        JSON.stringify(Tracking.summary());
      document.getElementById('terms_accepted_at').value =
        new Date().toISOString();

      Tracking.track('form-submit');
    });
  }

  /* ===============================
     SIMULADOR
     =============================== */
  function initSimulator() {
    const modal = document.getElementById('simulatorModal');
    if (!modal) return;

    const open = profile => {
      modal.setAttribute('aria-hidden', 'false');
      document
        .querySelectorAll('.sim-panel')
        .forEach(p => (p.style.display = 'none'));

      document.getElementById(`sim${profile}`)?.style.setProperty('display', 'block');
      document.getElementById('simulatorTitle').innerText =
        `Simulador — ${profile}`;

      Tracking.track('simulator-open', { profile });
    };

    document.querySelectorAll('[data-action="simulate"]').forEach(btn => {
      btn.addEventListener('click', () => open(btn.dataset.profile));
    });

    document.getElementById('simulatorClose')?.addEventListener('click', () => {
      modal.setAttribute('aria-hidden', 'true');
    });
  }

  /* ===============================
     WHATSAPP FAB
     =============================== */
  function initWhatsApp() {
    const btn = document.getElementById('whatsappFab');
    if (!btn) return;

    btn.addEventListener('click', e => {
      e.preventDefault();
      const summary = Tracking.summary();
      const msg = `Olá! Sou ${summary.profile} e me cadastrei no Beta LOOMPER. Meu ID é ${USER_ID}`;
      window.open(
        `https://wa.me/5511965858142?text=${encodeURIComponent(msg)}`,
        '_blank'
      );
    });
  }

  /* ===============================
     INIT
     =============================== */
  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initProfileSelection();
    applyProfileToForm();
    initForm();
    initSimulator();
    initWhatsApp();

    console.log('%cLOOMPER pronto.', 'color:#d4a847;font-weight:bold');
  });
})();
