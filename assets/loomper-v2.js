/**
 * LOOMPER V2 - JavaScript
 * Landing Page com tracking, validação e integrações
 * 
 * Dados oficiais:
 * - Email: contato@loomper.com.br
 * - WhatsApp: +55 11 96585-8142
 * - Razão Social: Ajud.ai Brasil Inova Simples (I.S.)
 * - CNPJ: 59.150.688/0001-39
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURAÇÕES
  // ============================================
  const CONFIG = {
    whatsapp: '5511965858142',
    email: 'contato@loomper.com.br',
    pixKey: 'contato@loomper.com.br',
    domain: window.location.origin || 'https://loomper.com.br'
  };

  // ============================================
  // TRACKING - Rastreamento de ações
  // ============================================
  const Tracking = {
    journey: [],
    
    // Registra uma ação
    track(action, data = {}) {
      const event = {
        action,
        data,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer
      };
      
      this.journey.push(event);
      
      // Salva no localStorage para persistência
      try {
        localStorage.setItem('loomper_journey', JSON.stringify(this.journey));
      } catch(e) {}
      
      console.log('[Track]', action, data);
    },
    
    // Recupera jornada salva
    loadJourney() {
      try {
        const saved = localStorage.getItem('loomper_journey');
        if (saved) {
          this.journey = JSON.parse(saved);
        }
      } catch(e) {}
    },
    
    // Retorna resumo da jornada
    getSummary() {
      const profiles = this.journey
        .filter(e => e.data.profile)
        .map(e => e.data.profile);
      
      const actions = this.journey.map(e => e.action);
      
      return {
        profile: profiles[profiles.length - 1] || 'não identificado',
        actions: [...new Set(actions)],
        total_interactions: this.journey.length
      };
    }
  };

  // ============================================
  // UTILITÁRIOS
  // ============================================
  function generateUserId() {
    return 'LMP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  function getOrCreateUserId() {
    try {
      let id = localStorage.getItem('loomper_user_id');
      if (!id) {
        id = generateUserId();
        localStorage.setItem('loomper_user_id', id);
      }
      return id;
    } catch(e) {
      return generateUserId();
    }
  }

  function getReferrerFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') || '';
  }

  // Validações
  function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  }

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function formatPhone(value) {
    return value.replace(/\D/g, '').substring(0, 11);
  }

  // ============================================
  // API IBGE - Cidades por UF
  // ============================================
  const IBGE = {
    cache: {},
    
    async getCities(uf) {
      if (this.cache[uf]) {
        return this.cache[uf];
      }
      
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
        );
        
        if (!response.ok) throw new Error('API error');
        
        const data = await response.json();
        const cities = data.map(city => city.nome);
        
        this.cache[uf] = cities;
        return cities;
      } catch(e) {
        console.error('Erro ao carregar cidades:', e);
        return [];
      }
    },
    
    populateDatalist(datalistId, cities) {
      const datalist = document.getElementById(datalistId);
      if (!datalist) return;
      
      datalist.innerHTML = '';
      cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        datalist.appendChild(option);
      });
    }
  };

  // ============================================
  // HEADER - Scroll effects
  // ============================================
  function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    });
  }

  // ============================================
  // MOBILE MENU
  // ============================================
  function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const navMobile = document.getElementById('navMobile');
    
    if (!toggle || !navMobile) return;
    
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navMobile.classList.toggle('active');
      Tracking.track('menu-toggle');
    });
    
    // Fecha ao clicar em link
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        navMobile.classList.remove('active');
      });
    });
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (!target) return;
        
        e.preventDefault();
        
        const headerHeight = document.getElementById('header')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  }

  // ============================================
  // TRACKING - Event listeners
  // ============================================
  function initTracking() {
    Tracking.loadJourney();
    
    // Track clicks em botões com data-action
    document.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', () => {
        const action = el.dataset.action;
        const profile = el.dataset.profile || '';
        Tracking.track(action, { profile });
        
        // Se clicou em perfil, salva para pré-selecionar no form
        if (profile) {
          sessionStorage.setItem('selected_profile', profile);
        }
      });
    });
  }

  // ============================================
  // PRÉ-SELECIONAR PERFIL NO FORM
  // ============================================
  function preselectProfile() {
    const savedProfile = sessionStorage.getItem('selected_profile');
    if (!savedProfile) return;
    
    const profileSelect = document.getElementById('waitlist-profile');
    if (!profileSelect) return;
    
    const profileMap = {
      'motorista': 'Motorista',
      'chapa': 'Chapa / Ajudante',
      'transportadora': 'Transportadora'
    };
    
    const value = profileMap[savedProfile];
    if (value) {
      profileSelect.value = value;
    }
  }

  // ============================================
  // CIDADES - UF change handler
  // ============================================
  function initCitySelect() {
    const ufSelects = document.querySelectorAll('#waitlist-uf, #sim-uf');
    
    ufSelects.forEach(ufSelect => {
      ufSelect.addEventListener('change', async (e) => {
        const uf = e.target.value;
        if (!uf) return;
        
        // Determina qual datalist popular
        const isSimulator = e.target.id === 'sim-uf';
        const datalistId = isSimulator ? 'sim-city-list' : 'city-list';
        const cityInput = isSimulator 
          ? document.getElementById('sim-city')
          : document.getElementById('waitlist-city');
        
        if (cityInput) {
          cityInput.value = '';
          cityInput.placeholder = 'Carregando cidades...';
        }
        
        const cities = await IBGE.getCities(uf);
        IBGE.populateDatalist(datalistId, cities);
        
        if (cityInput) {
          cityInput.placeholder = 'Digite para buscar...';
        }
      });
    });
  }

  // ============================================
  // FORM VALIDATION
  // ============================================
  function initFormValidation() {
    const form = document.getElementById('waitlistForm');
    if (!form) return;
    
    // Phone formatting
    const phoneInput = document.getElementById('waitlist-whatsapp');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        e.target.value = formatPhone(e.target.value);
      });
    }
    
    // Invite phone formatting
    const inviteInput = document.getElementById('waitlist-invite');
    if (inviteInput) {
      inviteInput.addEventListener('input', (e) => {
        e.target.value = formatPhone(e.target.value);
      });
    }
    
    // Form submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Clear previous errors
      form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      
      let isValid = true;
      
      // Validate name
      const nameInput = document.getElementById('waitlist-name');
      if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
        showError('name', 'Digite seu nome completo');
        isValid = false;
      }
      
      // Validate phone
      const phone = document.getElementById('waitlist-whatsapp').value;
      if (!validatePhone(phone)) {
        showError('whatsapp', 'Digite um WhatsApp válido (DDD + número)');
        isValid = false;
      }
      
      // Validate email
      const email = document.getElementById('waitlist-email').value;
      if (!validateEmail(email)) {
        showError('email', 'Digite um e-mail válido');
        isValid = false;
      }
      
      // Validate UF
      const uf = document.getElementById('waitlist-uf').value;
      if (!uf) {
        showError('uf', 'Selecione o estado');
        isValid = false;
      }
      
      // Validate city
      const city = document.getElementById('waitlist-city').value;
      if (!city.trim()) {
        showError('city', 'Digite a cidade');
        isValid = false;
      }
      
      // Validate profile
      const profile = document.getElementById('waitlist-profile').value;
      if (!profile) {
        showError('profile', 'Selecione seu perfil');
        isValid = false;
      }
      
      // Validate terms
      const terms = document.getElementById('waitlist-terms').checked;
      if (!terms) {
        showError('terms', 'Você precisa aceitar os termos');
        isValid = false;
      }
      
      if (!isValid) {
        Tracking.track('form-validation-error');
        return;
      }
      
      // Set hidden fields
      document.getElementById('id_user').value = getOrCreateUserId();
      document.getElementById('referrer_id').value = getReferrerFromURL();
      document.getElementById('user_journey').value = JSON.stringify(Tracking.getSummary());
      
      // Submit
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      
      try {
        const formData = new FormData(form);
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });
        
        if (response.ok) {
          Tracking.track('form-submit-success', { profile });
          showSuccessModal();
          form.reset();
        } else {
          throw new Error('Submit failed');
        }
      } catch(err) {
        console.error('Form error:', err);
        Tracking.track('form-submit-error');
        alert('Ocorreu um erro. Por favor, tente novamente.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Entrar para o Beta Loomper';
      }
    });
    
    function showError(field, message) {
      const errorEl = document.getElementById(`${field}-error`);
      const inputEl = document.getElementById(`waitlist-${field}`);
      
      if (errorEl) errorEl.textContent = message;
      if (inputEl) inputEl.classList.add('error');
    }
  }

  // ============================================
  // SUCCESS MODAL
  // ============================================
  function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (!modal) return;
    
    modal.setAttribute('aria-hidden', 'false');
    
    const closeBtn = document.getElementById('modalClose');
    const overlay = modal.querySelector('.modal-overlay');
    
    const closeModal = () => {
      modal.setAttribute('aria-hidden', 'true');
    };
    
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
    
    // WhatsApp button
    const waBtn = document.getElementById('enterWhatsapp');
    if (waBtn) {
      waBtn.addEventListener('click', () => {
        const summary = Tracking.getSummary();
        const message = `Olá! Sou ${summary.profile} e acabei de me cadastrar no Beta do LOOMPER. Meu ID: ${getOrCreateUserId()}`;
        const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        Tracking.track('whatsapp-group-click');
      });
    }
    
    // Invite button
    const inviteBtn = document.getElementById('inviteFriends');
    if (inviteBtn) {
      inviteBtn.addEventListener('click', () => {
        const inviteLink = `${CONFIG.domain}?ref=${getOrCreateUserId()}`;
        navigator.clipboard.writeText(inviteLink).then(() => {
          alert('Link de convite copiado! Compartilhe com seus amigos.');
          Tracking.track('invite-link-copied');
        }).catch(() => {
          prompt('Copie o link de convite:', inviteLink);
        });
      });
    }
  }

  // ============================================
  // SIMULATOR
  // ============================================
  function initSimulator() {
    const modal = document.getElementById('simulatorModal');
    if (!modal) return;
    
    // Open simulator
    document.querySelectorAll('[data-action="simulate"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const profile = btn.dataset.profile;
        openSimulator(profile);
        Tracking.track('simulator-open', { profile });
      });
    });
    
    // Close simulator
    document.getElementById('simulatorClose')?.addEventListener('click', closeSimulator);
    modal.querySelector('.simulator-overlay')?.addEventListener('click', closeSimulator);
    
    function openSimulator(profile) {
      modal.setAttribute('aria-hidden', 'false');
      
      // Hide all panels
      document.querySelectorAll('.sim-panel').forEach(p => p.style.display = 'none');
      
      // Show correct panel
      const title = document.getElementById('simulatorTitle');
      
      switch(profile) {
        case 'motorista':
          document.getElementById('simMotorista').style.display = 'block';
          title.textContent = 'Simulador — Motorista';
          break;
        case 'chapa':
          document.getElementById('simChapa').style.display = 'block';
          title.textContent = 'Simulador — Chapa/Ajudante';
          loadChapaVagas();
          break;
        case 'transportadora':
          document.getElementById('simTransportadora').style.display = 'block';
          title.textContent = 'Simulador — Transportadora';
          animateKPIs();
          break;
      }
    }
    
    function closeSimulator() {
      modal.setAttribute('aria-hidden', 'true');
    }
    
    // Motorista form
    const motoristaForm = document.getElementById('simMotoristaForm');
    if (motoristaForm) {
      motoristaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate form fields
        const date = document.getElementById('sim-date').value;
        const uf = document.getElementById('sim-uf').value;
        const city = document.getElementById('sim-city').value;
        
        if (!date || !uf || !city) {
          alert('Preencha todos os campos obrigatórios');
          return;
        }
        
        // Show result
        const resultEl = document.getElementById('motoristaResult');
        resultEl.style.display = 'block';
        resultEl.innerHTML = `
          <h4 style="color: var(--gold); margin-bottom: 12px;">✓ Vaga criada com sucesso!</h4>
          <p style="color: var(--text-secondary); margin-bottom: 16px;">
            Chapas disponíveis na região de ${city}/${uf}:
          </p>
          <div class="chapas-list">
            ${generateMockChapas()}
          </div>
        `;
        
        Tracking.track('simulator-create-vaga');
      });
    }
  }

  function generateMockChapas() {
    const chapas = [
      { name: 'Carlos S.', rating: 4.9, services: 127 },
      { name: 'José M.', rating: 4.7, services: 89 },
      { name: 'Pedro L.', rating: 4.8, services: 156 }
    ];
    
    return chapas.map(c => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg-primary); border-radius: 8px; margin-bottom: 8px;">
        <div>
          <strong style="color: var(--text-primary);">${c.name}</strong>
          <span style="color: var(--gold); margin-left: 8px;">★ ${c.rating}</span>
          <span style="color: var(--text-muted); font-size: 13px; margin-left: 8px;">(${c.services} serviços)</span>
        </div>
        <button class="btn btn-sm btn-outline" onclick="alert('Em breve!')">Selecionar</button>
      </div>
    `).join('');
  }

  function loadChapaVagas() {
    const container = document.getElementById('chapaVagas');
    if (!container) return;
    
    const vagas = [
      { id: 'V-001', title: 'Carga - 3 veículos', local: 'São Paulo, SP', hora: 'Hoje, 14:00', valor: 'R$ 180' },
      { id: 'V-002', title: 'Descarga - 2 veículos', local: 'Guarulhos, SP', hora: 'Amanhã, 09:00', valor: 'R$ 120' }
    ];
    
    container.innerHTML = vagas.map(v => `
      <div style="padding: 16px; background: var(--bg-card); border-radius: 10px; margin-bottom: 12px; border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <strong style="color: var(--text-primary);">${v.title}</strong>
          <span style="color: var(--gold); font-weight: 600;">${v.valor}</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 12px;">
          📍 ${v.local} • 🕐 ${v.hora}
        </p>
        <button class="btn btn-sm btn-primary" onclick="alert('Candidatura enviada (simulado)')">Candidatar</button>
      </div>
    `).join('');
  }

  function animateKPIs() {
    // Animate progress bars
    document.querySelectorAll('.kpi-progress').forEach(bar => {
      const target = bar.dataset.target || 50;
      setTimeout(() => {
        bar.style.width = `${target}%`;
      }, 100);
    });
    
    // Animate values
    const kpis = {
      servicos: { target: 1248, prefix: '', suffix: '' },
      economia: { target: 45800, prefix: 'R$ ', suffix: '' },
      atrasos: { target: 27, prefix: '', suffix: '%' }
    };
    
    Object.entries(kpis).forEach(([key, config]) => {
      const el = document.querySelector(`[data-kpi="${key}"]`);
      if (!el) return;
      
      animateValue(el, 0, config.target, 1500, config.prefix, config.suffix);
    });
    
    // Create mini chart
    const chartContainer = document.getElementById('performanceChart');
    if (chartContainer) {
      chartContainer.innerHTML = '';
      const values = [65, 78, 45, 89, 72, 95, 83, 91, 68, 87, 76, 92];
      values.forEach((v, i) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = '0';
        chartContainer.appendChild(bar);
        
        setTimeout(() => {
          bar.style.height = `${v}%`;
        }, 100 + i * 50);
      });
    }
  }

  function animateValue(el, start, end, duration, prefix = '', suffix = '') {
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      
      const current = Math.floor(start + (end - start) * eased);
      el.textContent = prefix + current.toLocaleString('pt-BR') + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }

  // ============================================
  // PIX / DONATION
  // ============================================
  function initDonation() {
    // Update PIX key display
    const pixKeyEl = document.getElementById('pixKey');
    if (pixKeyEl) {
      pixKeyEl.textContent = CONFIG.pixKey;
    }
    
    // Copy PIX
    document.getElementById('copyPix')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(CONFIG.pixKey);
        alert('Chave PIX copiada!');
        Tracking.track('pix-copied');
      } catch(e) {
        prompt('Copie a chave PIX:', CONFIG.pixKey);
      }
    });
    
    // Show QR
    document.getElementById('showQr')?.addEventListener('click', () => {
      const qrContainer = document.getElementById('pixQr');
      if (!qrContainer) return;
      
      if (qrContainer.style.display === 'none') {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(CONFIG.pixKey)}`;
        qrContainer.innerHTML = `<img src="${qrUrl}" alt="QR Code PIX" />`;
        qrContainer.style.display = 'block';
        Tracking.track('qr-shown');
      } else {
        qrContainer.style.display = 'none';
      }
    });
    
    // Donate buttons
    document.querySelectorAll('.btn-donate').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = btn.dataset.amount;
        navigator.clipboard.writeText(CONFIG.pixKey).then(() => {
          alert(`Chave PIX copiada!\nValor sugerido: R$ ${amount}`);
          Tracking.track('donate-click', { amount });
        });
      });
    });
    
    // Custom amount
    const otherBtn = document.getElementById('donateOther');
    const customContainer = document.getElementById('customAmount');
    const confirmBtn = document.getElementById('confirmAmount');
    
    otherBtn?.addEventListener('click', () => {
      customContainer.style.display = customContainer.style.display === 'none' ? 'flex' : 'none';
    });
    
    confirmBtn?.addEventListener('click', () => {
      const input = document.getElementById('customAmountInput');
      const amount = input?.value;
      if (amount && parseFloat(amount) > 0) {
        navigator.clipboard.writeText(CONFIG.pixKey).then(() => {
          alert(`Chave PIX copiada!\nValor: R$ ${amount}`);
          Tracking.track('donate-custom', { amount });
        });
      }
    });
  }

  // ============================================
  // WHATSAPP FAB
  // ============================================
  function initWhatsAppFab() {
    const fab = document.getElementById('whatsappFab');
    if (!fab) return;
    
    fab.addEventListener('click', (e) => {
      e.preventDefault();
      
      const summary = Tracking.getSummary();
      let message = `Olá! `;
      
      if (summary.profile !== 'não identificado') {
        message += `Sou ${summary.profile} e `;
      }
      
      if (summary.actions.includes('simulator-open')) {
        message += `estava vendo o simulador e gostaria de saber mais sobre o LOOMPER.`;
      } else {
        message += `tenho interesse no LOOMPER. Podem me dar mais informações?`;
      }
      
      const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      
      Tracking.track('whatsapp-fab-click', summary);
    });
  }

  // ============================================
  // ESQUELETO PARA INTEGRAÇÃO MAKE
  // ============================================
  window.LoomperWebhooks = {
    // Chamado após submit bem-sucedido do formulário
    async onFormSubmit(data) {
      // Endpoint para integração futura com Make
      // const makeWebhookUrl = 'https://hook.us1.make.com/SEU_WEBHOOK_ID';
      // await fetch(makeWebhookUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      console.log('[Webhook] Form data ready for Make integration:', data);
    },
    
    // Enviar confirmação por email (esqueleto)
    async sendConfirmationEmail(email, name) {
      // Integrar com Make para envio de email
      console.log('[Webhook] Email confirmation ready:', { email, name });
    }
  };

  // ============================================
  // INIT
  // ============================================
  function init() {
    initHeader();
    initMobileMenu();
    initSmoothScroll();
    initTracking();
    preselectProfile();
    initCitySelect();
    initFormValidation();
    initSimulator();
    initDonation();
    initWhatsAppFab();
    
    // Set hidden fields
    const userIdField = document.getElementById('id_user');
    if (userIdField) {
      userIdField.value = getOrCreateUserId();
    }
    
    const referrerField = document.getElementById('referrer_id');
    if (referrerField) {
      referrerField.value = getReferrerFromURL();
    }
    
    console.log('%c🚀 LOOMPER', 'font-size: 20px; font-weight: bold; color: #d4a847;');
    console.log('%cLogística • Tecnologia • Pessoas', 'color: #888;');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
