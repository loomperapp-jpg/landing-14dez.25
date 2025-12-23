/**
 * =========================================================
 * LOOMPER — CORE JS MASTER
 * Todas as funcionalidades concebidas até aqui
 * Blindado • Defensivo • Escalável • Sem exceções
 * =========================================================
 */

(function () {
  'use strict';

  /* =========================================================
     CONFIGURAÇÕES GLOBAIS
     ========================================================= */
  const CONFIG = {
    WA_NUMBER: '5511965858142',
    PIX_KEY: 'contato@loomper.com.br',
    CONTACT_EMAIL: 'contato@loomper.com.br',
    DOMAIN: window.location.origin || 'https://www.loomper.com.br'
  };

  /* =========================================================
     UTILITÁRIOS BASE
     ========================================================= */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);

  function safe(fn) {
    try { fn(); } catch (e) { console.warn('[LOOMPER]', e); }
  }

  /* =========================================================
     USER ID + REFERRER
     ========================================================= */
  function generateUserId() {
    try {
      if (crypto.randomUUID) {
        return 'LMP-' + crypto.randomUUID().split('-')[0].toUpperCase();
      }
    } catch (_) {}
    return 'LMP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  function getUserId() {
    let id = localStorage.getItem('loomper_user_id');
    if (!id) {
      id = generateUserId();
      localStorage.setItem('loomper_user_id', id);
    }
    return id;
  }

  function getReferrer() {
    return new URLSearchParams(location.search).get('ref') || 'direct';
  }

  /* =========================================================
     TRACKING (JORNADA DO USUÁRIO)
     ========================================================= */
  const Tracking = {
    journey: [],
    load() {
      const saved = localStorage.getItem('loomper_journey');
      if (saved) this.journey = JSON.parse(saved);
    },
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
        id: getUserId(),
        referrer: getReferrer(),
        profile: profiles.at(-1) || 'não identificado',
        total_interactions: this.journey.length,
        actions: [...new Set(this.journey.map(j => j.action))]
      };
    }
  };

  /* =========================================================
     HEADER + MENU MOBILE
     ========================================================= */
  function initHeader() {
    const header = $('#header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  function initMobileMenu() {
    const toggle = $('#menuToggle');
    const nav = $('#navMobile');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      nav.classList.toggle('active');
      Tracking.track('menu-toggle');
    });
  }

  /* =========================================================
     PERFIL SELECIONADO (CTA → FORM)
     ========================================================= */
  function initProfileSelection() {
    $$('[data-profile]').forEach(btn => {
      btn.addEventListener('click', () => {
        localStorage.setItem('loomper_profile', btn.dataset.profile);
        Tracking.track('profile-selected', { profile: btn.dataset.profile });
      });
    });

    const select = $('#waitlist-profile');
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

  /* =========================================================
     FORMULÁRIO (NETLIFY + TRACKING)
     ========================================================= */
  function initForm() {
    const form = $('#waitlistForm');
    if (!form) return;

    form.addEventListener('submit', () => {
      $('#id_user') && ($('#id_user').value = getUserId());
      $('#referrer_id') && ($('#referrer_id').value = getReferrer());
      $('#user_journey') && ($('#user_journey').value = JSON.stringify(Tracking.summary()));
      $('#terms_accepted_at') && ($('#terms_accepted_at').value = new Date().toISOString());
      Tracking.track('form-submit');
    });
  }

  /* =========================================================
     SIMULADOR (MODAL COMPLETO)
     ========================================================= */
  function initSimulator() {
    const modal = $('#simulatorModal');
    if (!modal) return;

    const title = $('#simulatorTitle');
    const closeBtn = $('#simulatorClose');

    const panels = {
      motorista: $('#simMotorista'),
      chapa: $('#simChapa'),
      transportadora: $('#simTransportadora')
    };

    function open(profile) {
      Object.values(panels).forEach(p => p && (p.style.display = 'none'));
      panels[profile] && (panels[profile].style.display = 'block');

      title && (title.textContent = `Simulador — ${profile}`);
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      Tracking.track('simulator-open', { profile });
    }

    function close() {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    $$('[data-action="simulate"]').forEach(btn => {
      btn.addEventListener('click', () => open(btn.dataset.profile));
    });

    closeBtn && closeBtn.addEventListener('click', close);
    $('.simulator-overlay') && $('.simulator-overlay').addEventListener('click', close);
  }

  /* =========================================================
     SIMULADOR — MOTORISTA (MOCK FUNCIONAL)
     ========================================================= */
  function initMotoristaSim() {
    const form = $('#simMotoristaForm');
    const result = $('#motoristaResult');
    if (!form || !result) return;

    form.addEventListener('submit', e => {
      e.preventDefault();

      const mock = [
        { name: 'João Silva', rating: 4.8, city: 'São Bernardo do Campo' },
        { name: 'Carlos Santos', rating: 4.6, city: 'Diadema' },
        { name: 'Lucas Oliveira', rating: 4.5, city: 'Santo André' }
      ];

      result.innerHTML = mock.map((c, i) => `
        <div class="sim-candidate">
          <div>
            <strong>${c.name}</strong><br>
            ⭐ ${c.rating} • ${c.city}
          </div>
          <button class="btn select-candidate" data-i="${i}">Selecionar</button>
        </div>
      `).join('');

      $$('.select-candidate').forEach(btn => {
        btn.addEventListener('click', () => {
          const code = Math.floor(1000 + Math.random() * 9000);
          result.innerHTML = `
            <div class="sim-confirm">
              <h4>✅ Chapa selecionado</h4>
              <p>Código de validação:</p>
              <strong style="font-size:24px;color:var(--gold)">${code}</strong>
            </div>
          `;
        });
      });
    });
  }

  /* =========================================================
     SIMULADOR — CHAPA (MOCK FUNCIONAL)
     ========================================================= */
  function initChapaSim() {
    const list = $('#chapaVagas');
    if (!list) return;

    const vagas = [
      { title: 'Carregar 2 veículos', local: 'Zona Leste SP', valor: 'R$ 200' },
      { title: 'Descarregar 1 veículo', local: 'Diadema', valor: 'R$ 150' }
    ];

    list.innerHTML = vagas.map(v => `
      <div class="vac-item">
        <strong>${v.title}</strong><br>
        ${v.local} • <span style="color:var(--gold)">${v.valor}</span>
        <button class="btn apply">Candidatar</button>
      </div>
    `).join('');

    $$('.apply').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.textContent = '✅ Enviado';
        btn.disabled = true;
      });
    });
  }

  /* =========================================================
     PIX / DOAÇÕES
     ========================================================= */
  function initPix() {
    $('#pixKey') && ($('#pixKey').textContent = CONFIG.PIX_KEY);

    $('#copyPix') && $('#copyPix').addEventListener('click', () => {
      navigator.clipboard.writeText(CONFIG.PIX_KEY);
      alert('PIX copiado!');
    });

    $('#showQr') && $('#showQr').addEventListener('click', () => {
      const qr = $('#pixQr');
      if (!qr) return;
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${CONFIG.PIX_KEY}`;
      qr.innerHTML = `<img src="${url}" alt="QR Code PIX">`;
      qr.style.display = 'block';
    });
  }

  /* =========================================================
     WHATSAPP FAB
     ========================================================= */
  function initWhatsApp() {
    const btn = $('#whatsappFab');
    if (!btn) return;

    btn.addEventListener('click', e => {
      e.preventDefault();
      const msg = `Olá! Me cadastrei no Beta LOOMPER. Meu ID é ${getUserId()}`;
      window.open(`https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  /* =========================================================
     INIT MASTER
     ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    safe(Tracking.load.bind(Tracking));
    safe(initHeader);
    safe(initMobileMenu);
    safe(initProfileSelection);
    safe(initForm);
    safe(initSimulator);
    safe(initMotoristaSim);
    safe(initChapaSim);
    safe(initPix);
    safe(initWhatsApp);

    console.log('%cLOOMPER CORE JS ATIVO', 'color:#d4a847;font-weight:bold');
  });

})();