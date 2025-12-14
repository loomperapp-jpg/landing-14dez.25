cat > assets/loomper-app.js <<'EOF'
// Loomper prototype JS (module)
// - Gera id_user, preenche referrer, envia formulário via fetch para Netlify, mostra modal de sucesso
// - Simulador Motorista: cria vaga simulada, mostra chapas fictícios, permite "selecionar" e gerar código
// - Funções de copiar PIX, gerar QR (via API pública), copiar invite link

const WA_NUMBER = "5511965858142"; // formato sem +
const DOMAIN = "https://loomper.com.br"; // placeholder
const PIX_KEY = "loomper.app@gmail.com";

function uuidv4() {
  return 'LMP-' + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  ).slice(0, 10);
}

function getOrCreateUserId(){
  try {
    let id = localStorage.getItem('loomper_user_id');
    if(!id){
      id = uuidv4();
      localStorage.setItem('loomper_user_id', id);
    }
    return id;
  } catch(e){
    return uuidv4();
  }
}

function fillReferrerFromURL(){
  const params = new URLSearchParams(location.search);
  const ref = params.get('ref');
  if(ref){
    const el = document.getElementById('referrer_id');
    if(el) el.value = ref;
  }
}

function fillIdUserField(){
  const id = getOrCreateUserId();
  const el = document.getElementById('id_user');
  if(el) el.value = id;
}

function toURLEncoded(obj){
  return Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
}

async function handleWaitlistSubmit(e){
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  if(!fd.get('id_user')){
    fd.set('id_user', getOrCreateUserId());
  }
  const payload = {};
  for(const pair of fd.entries()){
    payload[pair[0]] = pair[1];
  }
  payload['form-name'] = form.getAttribute('name') || 'waitlist';
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: toURLEncoded(payload)
    });
    if(res.ok || res.status === 200 || res.status === 204){
      showSuccessModal(payload);
    } else {
      alert('Erro ao enviar formulário. Por favor tente novamente.');
      console.error('netlify submit error', res.status, await res.text());
    }
  } catch(err){
    console.error(err);
    alert('Erro de rede ao enviar. Verifique sua conexão.');
  }
}

function showSuccessModal(payload){
  const modal = document.getElementById('success-modal');
  modal.setAttribute('aria-hidden','false');
  const enterBtn = document.getElementById('enter-whatsapp');
  const inviteBtn = document.getElementById('invite-friends');
  const closeBtn = document.getElementById('modal-close');
  const name = payload.name || '';
  const id = payload.id_user || getOrCreateUserId();
  enterBtn.onclick = () => {
    const text = `Olá, sou ${name} — quero participar do Beta LOOMPER. Meu id: ${id}`;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  inviteBtn.onclick = () => {
    const inviteLink = `${DOMAIN}?ref=${id}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert('Link de convite copiado! Cole no WhatsApp ou envie por e‑mail.');
      const shareUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Participe do LOOMPER — acesso antecipado: ' + inviteLink)}`;
      if(confirm('Abrir WhatsApp para compartilhar agora?')) window.open(shareUrl, '_blank');
    });
  };
  closeBtn.onclick = () => { modal.setAttribute('aria-hidden','true'); };
}

function initPix(){
  const copyPix = document.getElementById('copy-pix');
  const pixKeyEl = document.getElementById('pix-key');
  if(pixKeyEl) pixKeyEl.textContent = PIX_KEY;
  copyPix.onclick = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      alert('PIX copiado para a área de transferência. Cole no app do seu banco.');
    } catch(e){
      alert('Não foi possível copiar automaticamente. Selecionar e copiar manualmente: ' + PIX_KEY);
    }
  };
  const showQr = document.getElementById('show-qr');
  showQr.onclick = () => {
    const qr = document.getElementById('pix-qr');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(PIX_KEY)}`;
    qr.innerHTML = `<img src="${qrUrl}" alt="QR PIX" />`;
    qr.setAttribute('aria-hidden','false');
  };
  document.querySelectorAll('.donate').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.getAttribute('data-amount');
      navigator.clipboard.writeText(PIX_KEY).then(() => {
        alert(`PIX copiado. Valor sugerido: R$ ${amount}. Cole no app do banco.`);
      });
    });
  });
}

function initSimulador(){
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.sim-view').forEach(v => v.classList.remove('active'));
      t.classList.add('active');
      document.getElementById(t.dataset.target).classList.add('active');
    });
  });

  const simForm = document.getElementById('simMotoristaForm');
  const resultEl = document.getElementById('motorista-result');
  simForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const mockChapas = [
      { name: 'João (Chapa)', rating: 4.8, phone: '11987654321' },
      { name: 'Carlos (Chapa)', rating: 4.6, phone: '11976543210' },
      { name: 'Lucas (Chapa)', rating: 4.5, phone: '11965432109' },
    ];
    let html = `<div class="sim-result-list">`;
    mockChapas.forEach((c, idx) => {
      html += `<div class="sim-candidate">
        <strong>${c.name}</strong> — avaliação ${c.rating}
        <button class="btn select-candidate" data-idx="${idx}">Selecionar</button>
      </div>`;
    });
    html += `</div>`;
    resultEl.innerHTML = html;
    resultEl.querySelectorAll('.select-candidate').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.getAttribute('data-idx');
        const chapa = mockChapas[idx];
        const code = chapa.phone.slice(-4);
        resultEl.innerHTML = `<div class="sim-confirm">Candidato selecionado: <strong>${chapa.name}</strong>
          <p>Código de validação gerado: <strong>${code}</strong></p>
          <p>O código foi enviado ao app do chapa (simulado). Agenda bloqueada para este período.</p>
        </div>`;
      });
    });
  });

  const chapaList = document.getElementById('chapa-list');
  const vacs = [
    { id: 'V-001', title: 'Carregar 2 veículos - Zona Leste SP', when: 'Hoje 14:00' },
    { id: 'V-002', title: 'Descarregar 1 veículo - Diadema', when: 'Amanhã 09:00' }
  ];
  chapaList.innerHTML = vacs.map(v => `<div class="vac-item"><strong>${v.title}</strong><div>${v.when}</div><button class="btn apply" data-id="${v.id}">Candidatar</button></div>`).join('');
  chapaList.querySelectorAll('.apply').forEach(b => {
    b.addEventListener('click', () => {
      alert('Candidatura enviada (simulado). Aguarde aprovação do motorista.');
    });
  });
}

function init(){
  fillReferrerFromURL();
  fillIdUserField();
  initPix();
  initSimulador();

  const waitForm = document.getElementById('waitlist-form');
  waitForm.addEventListener('submit', handleWaitlistSubmit);

  const modal = document.getElementById('success-modal');
  modal.addEventListener('click', (e)=> {
    if(e.target === modal){
      modal.setAttribute('aria-hidden','true');
    }
  });

  const closeBtn = document.getElementById('modal-close');
  if(closeBtn) closeBtn.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
}

document.addEventListener('DOMContentLoaded', init);
EOF