# 🚚 LOOMPER Landing Page

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-BADGE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE/deploys)

**LOOMPER** — A evolução da conexão logística no Brasil. Plataforma que conecta motoristas, chapas/ajudantes e transportadoras no setor de transporte de veículos.

---

## 📋 Sobre o Projeto

Esta é a landing page oficial do LOOMPER, desenvolvida para capturar leads, apresentar o ecossistema da plataforma e permitir que usuários se cadastrem para acesso antecipado (waitlist).

### 🎯 Principais Funcionalidades

- ✅ **Waitlist com Netlify Forms**: Captura de leads com geração automática de ID único
- ✅ **Simuladores Interativos**: Demonstração prática para Motorista, Chapa e Transportadora
- ✅ **Sistema de Indicação**: Rastreamento de referências via URL (`?ref=ID`)
- ✅ **Doações PIX**: QR Code dinâmico e valores sugeridos
- ✅ **Stakeholder Benefits**: Modal informativo com email templates
- ✅ **WhatsApp Integration**: FAB com animação pulsante
- ✅ **Páginas Legais**: Termos de Uso e Política de Privacidade

---

## 📁 Estrutura de Arquivos

```
/
├── index.html                  # Landing page principal
├── privacy.html                # Política de Privacidade
├── terms.html                  # Termos de Uso
├── validate.js                 # Script de validação
├── assets/
│   ├── loomper-app.css        # Estilos principais
│   ├── loomper-app.js         # Lógica do frontend
│   └── images/                # Assets visuais
│       ├── logo-horizontal.jpg
│       ├── hero-truck.png
│       ├── icon-l.png
│       └── caminhao-heroi.png
├── netlify/
│   └── functions/             # Serverless functions (skeleton)
│       ├── sendInvite.js
│       └── sendNDA.js
├── docs/                      # Documentação legal (markdown)
│   ├── privacy.md
│   └── terms.md
└── netlify.toml               # Configuração Netlify
```

---

## 🚀 Deploy

### Netlify (Recomendado)

1. **Conecte o repositório ao Netlify:**
   ```bash
   # Via Netlify CLI
   netlify init
   ```
   Ou conecte através do painel web: https://app.netlify.com

2. **Configure as variáveis de ambiente** (se necessário):
   - Não há variáveis de ambiente obrigatórias para a versão atual

3. **Deploy automático:**
   - Cada push para a branch principal faz deploy automático
   - Preview deploys são criados para Pull Requests

### Build Settings

```toml
[build]
  publish = "."
  command = ""

[functions]
  directory = "netlify/functions"
```

---

## 🧪 Validação & Testes

Execute o script de validação para verificar a integridade do projeto:

```bash
node validate.js
```

O script verifica:
- ✅ Existência de arquivos essenciais
- ✅ Presença de seções obrigatórias
- ✅ Configuração do Netlify Forms
- ✅ Funções JavaScript necessárias
- ✅ Estilos CSS principais
- ✅ Imagens e assets

---

## 🎨 Customização

### Cores (CSS Variables)

Edite em `assets/loomper-app.css`:

```css
:root {
  --bg: #071226;          /* Background principal */
  --bg-soft: #0b1220;     /* Background suave */
  --orange: #ff7a2d;      /* CTA principal */
  --gold: #cfa34a;        /* Acentos dourados */
  --muted: #a1b0c5;       /* Texto secundário */
  --text: #ffffff;        /* Texto principal */
}
```

### Configuração JavaScript

Edite em `assets/loomper-app.js`:

```javascript
const WA_NUMBER = "5511965858142";              // WhatsApp para contato
const PIX_KEY = "loomper.app@gmail.com";        // Chave PIX
const CONTACT_EMAIL = "loomper.app@gmail.com";  // Email de contato
```

---

## 📝 Formulário Waitlist

### Campos Capturados

- Nome completo
- WhatsApp (com validação)
- E-mail
- UF (estado)
- Cidade
- Tipo de usuário (Motorista, Chapa, Transportadora, Investidor, Outro)
- E-mail de convite (opcional)
- `referrer_id` (hidden - rastreamento de indicações)
- `id_user` (hidden - ID único gerado localmente)

### Netlify Forms

O formulário está configurado para captura automática pelo Netlify:

```html
<form name="waitlist" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="waitlist" />
  <!-- campos do formulário -->
</form>
```

**Acesse submissões em:** Netlify Dashboard → Forms

---

## 🎭 Simuladores

### Motorista
Demonstra o fluxo de:
1. Criação de vaga
2. Visualização de chapas disponíveis
3. Seleção de candidato
4. Geração de código de validação

### Chapa/Ajudante
Mostra:
1. Lista de vagas disponíveis
2. Candidatura a vagas
3. Feedback de sucesso

### Transportadora
Exibe:
1. Dashboard com KPIs
2. Métricas de performance
3. Visão consolidada

---

## 💰 Sistema de Doações PIX

### Funcionalidades

- **Valores Sugeridos**: R$ 20, R$ 50, R$ 75
- **Valor Livre**: Prompt para inserir valor customizado
- **QR Code Dinâmico**: Gerado via API pública
- **Copy to Clipboard**: Suporte nativo + fallback

### API QR Code

Utiliza: `https://api.qrserver.com/v1/create-qr-code/`

---

## 👥 Stakeholders

Benefícios detalhados para cada tipo de usuário:

1. **🚚 Motorista**: Produtividade, avaliações, rastreamento
2. **👷 Chapa/Ajudante**: Gratuito, oportunidades, dignidade
3. **🏢 Transportadora**: Gestão, dashboards, ROI
4. **💼 Investidor**: Mercado, impacto social, escalabilidade

Cada modal inclui:
- Lista de benefícios
- Botão para contato via email (mailto: com template pré-preenchido)

---

## 📱 Responsividade

Breakpoint principal: `@media(max-width:900px)`

Mobile-first design com:
- Grid adaptativo para cards
- Botões full-width em mobile
- Modal otimizado para telas pequenas
- Header colapsável
- WhatsApp FAB com animação

---

## 🔗 Links Importantes

- **WhatsApp**: https://wa.me/5511965858142
- **E-mail**: loomper.app@gmail.com
- **CNPJ**: 59.150.688/0001-39 (Ajud.ai Brasil Inova Simples)
- **Localização**: São Bernardo do Campo | SP | BRASIL

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Semântico e acessível (ARIA)
- **CSS3**: Custom Properties, Flexbox, Grid
- **JavaScript**: ES6+, Async/Await, Fetch API
- **Netlify**: Hosting + Forms + Functions
- **QR Code API**: Geração dinâmica de QR Codes

---

## 📊 Analytics & Tracking

### ID do Usuário

Gerado automaticamente no primeiro acesso:
- Formato: `LMP-XXXXXXXX`
- Armazenado em `localStorage`
- Persistente entre sessões

### Sistema de Referência

- URL: `?ref=ID_DO_USUARIO`
- Capturado automaticamente
- Enviado no formulário como `referrer_id`

---

## 🐛 Troubleshooting

### Formulário retorna 404

**Solução**: Verifique se o deploy foi feito no Netlify e se a detecção de forms está ativa.

### Imagens não carregam

**Solução**: Confirme que os arquivos estão em `/assets/images/` com os nomes corretos:
- `logo-horizontal.jpg`
- `hero-truck.png`
- `icon-l.png`

### PIX não copia

**Solução**: Verifique permissões do navegador para clipboard. O sistema tem fallback automático.

### Modal não abre

**Solução**: Verifique console do navegador. Certifique-se de que o JavaScript está carregando corretamente.

---

## 📄 Licença

© 2025 LOOMPER — Ajud.ai Brasil Inova Simples (I.S.)  
Todos os direitos reservados. FROM BRAZIL TO WORLD 🇧🇷

---

## 🤝 Contribuindo

Este é um projeto privado em desenvolvimento. Para sugestões ou reportar bugs:

1. Abra uma Issue descrevendo o problema/sugestão
2. Aguarde feedback da equipe
3. Se aprovado, faça um fork e envie um Pull Request

---

## 📞 Contato

- **E-mail**: loomper.app@gmail.com
- **WhatsApp**: +55 11 96585-8142
- **Website**: https://loomper.app (em breve)

---

**Feito com ❤️ pela equipe LOOMPER**