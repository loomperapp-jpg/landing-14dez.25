// Loomper prototype JS (module) - improved
const WA_NUMBER = "5511965858142";
const DOMAIN = window.location.origin || 'https://loomper.app';
const PIX_KEY = "loomper.app@gmail.com";

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
  const fd = new FormData(form);
  if(!fd.get('id_user')) fd.set('id_user', getOrCreateUserId());
  const payload = {};
  for(const pair of fd.entries()) payload[pair[0]] = pair[1];
  payload['form-name'] = form.getAttribute('name') || 'waitlist';

  // Try fetch POST first, fallback to native submit to ensure Netlify Forms capture
  try{
    const res = await fetch('/', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: toURLEncoded(payload) });
    if(res.ok || res.status === 200 || res.status === 204){ showSuccessModal(payload); return; }
  }catch(err){ console.warn('Fetch submit failed, falling back to native submit', err); }

  // fallback
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

async function copyToClipboard(text){ try{ await navigator.clipboard.writeText(text); alert('PIX copiado!'); }catch(err){ const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); alert('PIX copiado (fallback)!'); }finally{ document.body.removeChild(ta); } } }

function initPix(){ const copyPix = document.getElementById('copy-pix'); const pixKeyEl = document.getElementById('pix-key'); if(pixKeyEl) pixKeyEl.textContent = PIX_KEY; if(copyPix) copyPix.addEventListener('click', ()=> copyToClipboard(PIX_KEY)); const showQr = document.getElementById('show-qr'); if(showQr) showQr.addEventListener('click', ()=>{ const qr = document.getElementById('pix-qr'); const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(PIX_KEY)}`; qr.innerHTML = `<a href="${qrUrl}" target="_blank" rel="noopener"><img src="${qrUrl}" alt="QR PIX"/></a>`; qr.setAttribute('aria-hidden','false'); }); document.querySelectorAll('.donate').forEach(btn=> btn.addEventListener('click', ()=>{ const amount = btn.getAttribute('data-amount'); copyToClipboard(PIX_KEY).then(()=> alert(`PIX copiado. Valor sugerido: R$ ${amount}.`)); })); }

function initSimulador(){ document.querySelectorAll('.tab').forEach(t=> t.addEventListener('click', ()=>{ document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); document.querySelectorAll('.sim-view').forEach(v=>v.classList.remove('active')); t.classList.add('active'); document.getElementById(t.dataset.target).classList.add('active'); }));
  const simForm = document.getElementById('simMotoristaForm'); const resultEl = document.getElementById('motorista-result'); simForm.addEventListener('submit', (e)=>{ e.preventDefault(); const mockChapas = [ { name: 'João (Chapa)', rating: 4.8, phone: '11987654321' }, { name: 'Carlos (Chapa)', rating: 4.6, phone: '11976543210' }, { name: 'Lucas (Chapa)', rating: 4.5, phone: '11965432109' } ]; let html = `<div class="sim-result-list">`; mockChapas.forEach((c, idx)=>{ html += `<div class="sim-candidate"><strong>${c.name}</strong> — avaliação ${c.rating} <button class="btn select-candidate" data-idx="${idx}">Selecionar</button></div>`; }); html += `</div>`; resultEl.innerHTML = html; resultEl.querySelectorAll('.select-candidate').forEach(btn=> btn.addEventListener('click', ()=>{ const idx = btn.getAttribute('data-idx'); const chapa = mockChapas[idx]; const code = String(Math.floor(1000 + Math.random()*9000)); resultEl.innerHTML = `<div class="sim-confirm">Candidato selecionado: <strong>${chapa.name}</strong><p>Código de validação gerado: <strong>${code}</strong></p><p>O código foi enviado ao app do chapa (simulado). Agenda bloqueada para este período.</p></div>`; })); });
  const chapaList = document.getElementById('chapa-list'); const vacs = [ { id: 'V-001', title: 'Carregar 2 veículos - Zona Leste SP', when: 'Hoje 14:00' }, { id: 'V-002', title: 'Descarregar 1 veículo - Diadema', when: 'Amanhã 09:00' } ]; chapaList.innerHTML = vacs.map(v=> `<div class="vac-item"><strong>${v.title}</strong><div>${v.when}</div><button class="btn apply" data-id="${v.id}">Candidatar</button></div>`).join(''); chapaList.querySelectorAll('.apply').forEach(b=> b.addEventListener('click', ()=> alert('Candidatura enviada (simulado). Aguarde aprovação do motorista.')));
}

function init(){ fillReferrerFromURL(); fillIdUserField(); initPix(); initSimulador(); const waitForm = document.getElementById('waitlist-form'); if(waitForm) waitForm.addEventListener('submit', handleWaitlistSubmit); const modal = document.getElementById('success-modal'); if(modal) modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.setAttribute('aria-hidden','true'); }); const closeBtn = document.getElementById('modal-close'); if(closeBtn) closeBtn.addEventListener('click', ()=> { const modal = document.getElementById('success-modal'); if(modal) modal.setAttribute('aria-hidden','true'); }); }

document.addEventListener('DOMContentLoaded', init);
