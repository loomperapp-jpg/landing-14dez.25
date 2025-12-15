// Loomper prototype JS (module) - improved
const WA_NUMBER = "5511965858142";
const DOMAIN = window.location.origin || 'https://loomper.app';
const PIX_KEY = "loomper.app@gmail.com";
const CONTACT_EMAIL = "loomper.app@gmail.com";

const STAKEHOLDER_BENEFITS = {
  motorista: {
    title: "🚚 Benefícios para Motoristas",
    benefits: [
      "✅ Encontre chapas qualificados em segundos",
      "✅ Reduza tempo de espera e ociosidade",
      "✅ Sistema de avaliações para escolher os melhores profissionais",
      "✅ Histórico completo de todos os serviços",
      "✅ Pagamentos rastreados e documentados",
      "✅ Suporte 24/7 para resolução de problemas",
      "✅ Aumente sua produtividade em até 40%",
      "✅ Códigos de validação para segurança máxima"
    ],
    emailSubject: "Interesse em LOOMPER - Motorista",
    emailBody: "Olá equipe LOOMPER,\n\nSou motorista e tenho interesse em conhecer melhor a plataforma LOOMPER.\n\nGostaria de receber mais informações sobre:\n- Como funciona o sistema\n- Custos e planos\n- Prazo para lançamento\n- Programa beta\n\nAguardo retorno.\n\nAtenciosamente,"
  },
  chapa: {
    title: "👷 Benefícios para Chapas/Ajudantes",
    benefits: [
      "✅ Acesso 100% GRATUITO à plataforma",
      "✅ Receba notificações de vagas na sua região",
      "✅ Escolha os melhores horários e locais",
      "✅ Construa sua reputação com avaliações",
      "✅ Pagamentos transparentes e garantidos",
      "✅ Dignidade e valorização profissional",
      "✅ Aumente sua renda mensal",
      "✅ Calendário inteligente para organizar agenda"
    ],
    emailSubject: "Interesse em LOOMPER - Chapa/Ajudante",
    emailBody: "Olá equipe LOOMPER,\n\nSou chapa/ajudante e tenho interesse em participar da plataforma LOOMPER.\n\nGostaria de saber:\n- Como me cadastrar\n- Quais áreas serão atendidas primeiro\n- Como funciona o sistema de avaliações\n- Prazo para lançamento\n\nAguardo retorno.\n\nAtenciosamente,"
  },
  transportadora: {
    title: "🏢 Benefícios para Transportadoras",
    benefits: [
      "✅ Gestão centralizada de toda a frota",
      "✅ Dashboards em tempo real com KPIs",
      "✅ Reduza custos operacionais em até 30%",
      "✅ Minimize ociosidade e maximize produtividade",
      "✅ Relatórios detalhados para tomada de decisão",
      "✅ Priorização automática de demandas",
      "✅ Controle de créditos e pagamentos",
      "✅ Integração com sistemas existentes (API)"
    ],
    emailSubject: "Interesse em LOOMPER - Transportadora",
    emailBody: "Olá equipe LOOMPER,\n\nRepresento uma transportadora e tenho interesse em conhecer o LOOMPER.\n\nGostaria de agendar uma apresentação para entender:\n- Funcionalidades da plataforma\n- Modelos de contratação\n- Integração com nossos sistemas\n- Cases de sucesso\n- ROI esperado\n\nAguardo contato.\n\nAtenciosamente,"
  },
  investidor: {
    title: "💼 Oportunidade para Investidores/Parceiros",
    benefits: [
      "✅ Mercado bilionário pouco explorado digitalmente",
      "✅ Impacto social mensurável e escalável",
      "✅ Modelo de negócio multi-receita validado",
      "✅ Equipe experiente e comprometida",
      "✅ Tecnologia própria e escalável",
      "✅ Potencial de expansão nacional e LATAM",
      "✅ Network effect e efeitos de rede",
      "✅ Defensibilidade através de dados e comunidade"
    ],
    emailSubject: "Interesse em Investimento/Parceria - LOOMPER",
    emailBody: "Olá equipe LOOMPER,\n\nTenho interesse em conhecer melhor a oportunidade de investimento/parceria no LOOMPER.\n\nGostaria de receber:\n- Pitch deck\n- Projeções financeiras\n- Informações sobre a rodada atual\n- Agendar reunião\n\nAguardo retorno.\n\nAtenciosamente,"
  }
};

function uuidv4(){
  return 'LMP-' + Math.random().toString(36).substring(2,10).toUpperCase();
}

function getOrCreateUserId(){
  try{let id = localStorage.getItem('loomper_user_id'); if(!id){id = uuidv4(); localStorage.setItem('loomper_user_id', id);} return id;}catch(e){return uuidv4();}
}

function fillReferrerFromURL(){
  const params = new URLSearchParams(location.search);
  const ref = params.get('ref');
  if(ref){ const el = document.getElementById('referrer_id'); if(el) el.value = ref; }
}

function fillIdUserField(){ const id = getOrCreateUserId(); const el = document.getElementById('id_user'); if(el) el.value = id; }

function toURLEncoded(obj){ return Object.keys(obj).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(obj[k])).join('&'); }

async function handleWaitlistSubmit(e){
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Store original button text to restore later if needed
  const originalBtnText = submitBtn ? submitBtn.textContent : 'ENTRAR NA LISTA';
  
  // Disable submit button to prevent double submission
  if(submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'ENVIANDO...';
  }
  
  const fd = new FormData(form);
  if(!fd.get('id_user')) fd.set('id_user', getOrCreateUserId());
  const payload = {};
  for(const pair of fd.entries()) payload[pair[0]] = pair[1];
  payload['form-name'] = form.getAttribute('name') || 'waitlist';

  // Try fetch POST first, fallback to native submit to ensure Netlify Forms capture
  try{
    const res = await fetch('/', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: toURLEncoded(payload) });
    if(res.ok || res.status === 200 || res.status === 204){ 
      showSuccessModal(payload); 
      form.reset();
      return; 
    }
  }catch(err){ 
    console.warn('Fetch submit failed, falling back to native submit', err); 
  }

  // fallback - re-enable button and do native submit
  if(submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
  form.removeEventListener('submit', handleWaitlistSubmit);
  form.submit();
}

function showSuccessModal(payload){
  const modal = document.getElementById('success-modal');
  modal.setAttribute('aria-hidden','false');
  const enterBtn = document.getElementById('enter-whatsapp');
  const inviteBtn = document.getElementById('invite-friends');
  const closeBtn = document.getElementById('modal-close');
  const name = payload.name || '';
  const id = payload.id_user || getOrCreateUserId();
  enterBtn.onclick = ()=>{ const text = `Olá, sou ${name} — quero participar do Beta LOOMPER. Meu id: ${id}`; const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`; window.open(url,'_blank'); };
  inviteBtn.onclick = ()=>{ const inviteLink = `${DOMAIN}?ref=${id}`; navigator.clipboard.writeText(inviteLink).then(()=>{ alert('Link de convite copiado!'); const shareUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Participe do LOOMPER — acesso antecipado: ' + inviteLink)}`; if(confirm('Abrir WhatsApp para compartilhar agora?')) window.open(shareUrl,'_blank'); }).catch(()=>{ alert('Copie este link manualmente: ' + inviteLink); }); };
  closeBtn.onclick = ()=>{ modal.setAttribute('aria-hidden','true'); };
}

async function copyToClipboard(text, amount = null){ 
  try{ 
    await navigator.clipboard.writeText(text); 
    if(amount) {
      trackEvent('donation_copy', { amount: amount, method: 'pix' });
      alert(`PIX copiado!\n\nValor sugerido: R$ ${amount}\n\nCole no seu app bancário e insira o valor.\n\n💚 Obrigado por apoiar quem move o Brasil!`); 
    } else {
      trackEvent('donation_copy', { method: 'pix' });
      alert('PIX copiado! Cole no seu app bancário.\n\n💚 Obrigado por apoiar o LOOMPER!');
    }
  } catch(err){ 
    const ta = document.createElement('textarea'); 
    ta.value = text; 
    document.body.appendChild(ta); 
    ta.select(); 
    try{ 
      document.execCommand('copy'); 
      if(amount) {
        trackEvent('donation_copy_fallback', { amount: amount, method: 'pix' });
        alert(`PIX copiado (fallback)!\n\nValor sugerido: R$ ${amount}\n\nCole no seu app bancário.\n\n💚 Obrigado por apoiar quem move o Brasil!`); 
      } else {
        trackEvent('donation_copy_fallback', { method: 'pix' });
        alert('PIX copiado (fallback)!\n\n💚 Obrigado por apoiar o LOOMPER!'); 
      }
    } finally { 
      document.body.removeChild(ta); 
    } 
  } 
}

function initPix(){ 
  const copyPix = document.getElementById('copy-pix'); 
  const pixKeyEl = document.getElementById('pix-key'); 
  if(pixKeyEl) pixKeyEl.textContent = PIX_KEY; 
  if(copyPix) copyPix.addEventListener('click', ()=> copyToClipboard(PIX_KEY)); 
  
  const showQr = document.getElementById('show-qr'); 
  if(showQr) showQr.addEventListener('click', ()=>{ 
    trackEvent('qr_code_viewed', { method: 'pix' });
    const qr = document.getElementById('pix-qr'); 
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(PIX_KEY)}`; 
    qr.innerHTML = `<a href="${qrUrl}" target="_blank" rel="noopener"><img src="${qrUrl}" alt="QR Code PIX - Escaneie para doar"/></a>`; 
    qr.setAttribute('aria-hidden','false'); 
  }); 
  
  // Handle donation buttons with amount suggestions
  document.querySelectorAll('.donate').forEach(btn=> btn.addEventListener('click', ()=>{ 
    const amount = btn.getAttribute('data-amount'); 
    copyToClipboard(PIX_KEY, amount); 
  }));
  
  // Handle "other amount" button - show inline input instead of prompt
  const otherBtn = document.getElementById('donate-other');
  const customField = document.getElementById('custom-amount-field');
  const customAmountInput = document.getElementById('custom-amount');
  const confirmBtn = document.getElementById('confirm-custom-amount');
  
  if(otherBtn && customField) {
    otherBtn.addEventListener('click', ()=>{
      const isVisible = customField.style.display !== 'none';
      customField.style.display = isVisible ? 'none' : 'block';
      if(!isVisible) {
        customAmountInput.focus();
        trackEvent('custom_donation_opened');
      }
    });
  }
  
  if(confirmBtn && customAmountInput) {
    confirmBtn.addEventListener('click', ()=>{
      const amount = customAmountInput.value;
      if(amount && !isNaN(amount) && parseFloat(amount) > 0) {
        copyToClipboard(PIX_KEY, amount);
        customField.style.display = 'none';
        customAmountInput.value = '';
      } else {
        customAmountInput.setCustomValidity('Por favor, digite um valor válido maior que zero.');
        customAmountInput.reportValidity();
      }
    });
    
    // Also allow Enter key to confirm
    customAmountInput.addEventListener('keypress', (e)=>{
      if(e.key === 'Enter') {
        e.preventDefault();
        confirmBtn.click();
      }
    });
  }
}

function initSimulador(){ 
  // Tab switching logic
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      // Deactivate all tabs and views
      document.querySelectorAll('.tab').forEach(x => {
        x.classList.remove('active');
        x.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.sim-view').forEach(v => v.classList.remove('active'));
      
      // Activate selected tab and view
      t.classList.add('active');
      t.setAttribute('aria-selected', 'true');
      document.getElementById(t.dataset.target).classList.add('active');
    });
  });
  
  // Motorista simulator
  const simForm = document.getElementById('simMotoristaForm');
  const resultEl = document.getElementById('motorista-result');
  
  if (simForm) {
    simForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const mockChapas = [
        { name: 'João Silva', rating: 4.8, phone: '11987654321', location: 'São Bernardo do Campo' },
        { name: 'Carlos Santos', rating: 4.6, phone: '11976543210', location: 'Diadema' },
        { name: 'Lucas Oliveira', rating: 4.5, phone: '11965432109', location: 'Santo André' }
      ];
      
      let html = '<div class="sim-result-list">';
      mockChapas.forEach((c, idx) => {
        html += `
          <div class="sim-candidate">
            <div>
              <strong>${c.name}</strong>
              <div style="color: var(--muted); font-size: 14px;">⭐ ${c.rating} • ${c.location}</div>
            </div>
            <button class="btn select-candidate" data-idx="${idx}">Selecionar</button>
          </div>
        `;
      });
      html += '</div>';
      
      resultEl.innerHTML = html;
      
      // Handle candidate selection
      resultEl.querySelectorAll('.select-candidate').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = btn.getAttribute('data-idx');
          const chapa = mockChapas[idx];
          const code = String(Math.floor(1000 + Math.random() * 9000));
          
          resultEl.innerHTML = `
            <div class="sim-confirm">
              <h4>✅ Candidato selecionado!</h4>
              <p><strong>${chapa.name}</strong></p>
              <p>Código de validação: <strong style="color: var(--gold); font-size: 24px;">${code}</strong></p>
              <p style="color: var(--muted);">O código foi enviado ao app do chapa (simulado).<br>Agenda bloqueada para este período.</p>
            </div>
          `;
        });
      });
    });
  }
  
  // Chapa simulator
  const chapaList = document.getElementById('chapa-list');
  
  if (chapaList) {
    const vacs = [
      { id: 'V-001', title: 'Carregar 2 veículos', location: 'Zona Leste SP', when: 'Hoje 14:00', price: 'R$ 200' },
      { id: 'V-002', title: 'Descarregar 1 veículo', location: 'Diadema', when: 'Amanhã 09:00', price: 'R$ 150' }
    ];
    
    chapaList.innerHTML = vacs.map(v => `
      <div class="vac-item">
        <div>
          <strong>${v.title}</strong>
          <div style="color: var(--muted); font-size: 14px;">${v.location} • ${v.when}</div>
          <div style="color: var(--gold); font-weight: 600; margin-top: 4px;">${v.price}</div>
        </div>
        <button class="btn apply" data-id="${v.id}">Candidatar</button>
      </div>
    `).join('');
    
    chapaList.querySelectorAll('.apply').forEach(b => {
      b.addEventListener('click', (e) => {
        const btn = e.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Enviado!';
        btn.disabled = true;
        btn.style.background = 'var(--gold)';
        
        // Show confirmation message below the button
        const vacItem = btn.closest('.vac-item');
        let confirmMsg = vacItem.querySelector('.confirm-msg');
        if (!confirmMsg) {
          confirmMsg = document.createElement('div');
          confirmMsg.className = 'confirm-msg';
          confirmMsg.style.cssText = 'margin-top:8px;padding:8px;background:rgba(207,163,74,0.1);border-radius:6px;color:var(--gold);font-size:14px;';
          vacItem.appendChild(confirmMsg);
        }
        confirmMsg.textContent = '✅ Candidatura enviada! Aguarde aprovação do motorista.';
      });
    });
  }
}

function showStakeholderModal(stakeholderType) {
  const modal = document.getElementById('stakeholder-modal');
  const titleEl = document.getElementById('stakeholder-title');
  const contentEl = document.getElementById('stakeholder-content');
  const contactBtn = document.getElementById('contact-stakeholder');
  
  const data = STAKEHOLDER_BENEFITS[stakeholderType];
  if (!data) return;
  
  titleEl.textContent = data.title;
  
  let html = '<ul style="text-align: left; line-height: 2; color: var(--muted); margin: 20px 0;">';
  data.benefits.forEach(benefit => {
    html += `<li style="margin-bottom: 8px;">${benefit}</li>`;
  });
  html += '</ul>';
  
  contentEl.innerHTML = html;
  
  contactBtn.onclick = () => {
    const subject = encodeURIComponent(data.emailSubject);
    const body = encodeURIComponent(data.emailBody);
    const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };
  
  modal.setAttribute('aria-hidden', 'false');
}

function initStakeholders() {
  const stakeholderBtns = document.querySelectorAll('.stakeholder-btn');
  stakeholderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const stakeholderType = btn.getAttribute('data-stakeholder');
      showStakeholderModal(stakeholderType);
    });
  });
  
  const closeBtn = document.getElementById('stakeholder-modal-close');
  const modal = document.getElementById('stakeholder-modal');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.setAttribute('aria-hidden', 'true');
    });
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  }
}

function init(){ 
  fillReferrerFromURL(); 
  fillIdUserField(); 
  initPix(); 
  initSimulador(); 
  initStakeholders(); 
  
  const waitForm = document.getElementById('waitlist-form'); 
  if(waitForm) waitForm.addEventListener('submit', handleWaitlistSubmit); 
  
  const modal = document.getElementById('success-modal'); 
  if(modal) modal.addEventListener('click', (e)=>{ 
    if(e.target === modal) modal.setAttribute('aria-hidden','true'); 
  }); 
  
  const closeBtn = document.getElementById('modal-close'); 
  if(closeBtn) closeBtn.addEventListener('click', ()=> { 
    const modal = document.getElementById('success-modal'); 
    if(modal) modal.setAttribute('aria-hidden','true'); 
  });
  
  // Track page views and interactions
  trackPageView();
}

/**
 * Track page view for analytics
 */
function trackPageView() {
  try {
    const userId = getOrCreateUserId();
    const pageData = {
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      userId: userId,
      referrer: document.referrer
    };
    
    // Store in localStorage for future analytics
    const views = JSON.parse(localStorage.getItem('loomper_page_views') || '[]');
    views.push(pageData);
    // Keep only last 50 views
    if (views.length > 50) views.shift();
    localStorage.setItem('loomper_page_views', JSON.stringify(views));
  } catch (e) {
    console.warn('Failed to track page view', e);
  }
}

/**
 * Track custom events
 * @param {string} eventName - Name of the event
 * @param {Object} eventData - Additional data for the event
 */
function trackEvent(eventName, eventData = {}) {
  try {
    const userId = getOrCreateUserId();
    const event = {
      event: eventName,
      timestamp: new Date().toISOString(),
      userId: userId,
      ...eventData
    };
    
    const events = JSON.parse(localStorage.getItem('loomper_events') || '[]');
    events.push(event);
    // Keep only last 100 events
    if (events.length > 100) events.shift();
    localStorage.setItem('loomper_events', JSON.stringify(events));
  } catch (e) {
    console.warn('Failed to track event', e);
  }
}

document.addEventListener('DOMContentLoaded', init);
