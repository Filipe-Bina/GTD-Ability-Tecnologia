const requestTypes = [
  {
    key: "combustivel",
    title: "Solicitar Combustível",
    subtitle: "Enviar RE para liberação de combustível.",
    label: "RE do técnico",
    placeholder: "Digite seu RE",
    button: "Enviar solicitação",
    success: "Solicitação de combustível enviada para o administrador."
  },
  {
    key: "interface",
    title: "Solicitar Interface",
    subtitle: "Informar a ordem de serviço para criação da interface.",
    label: "Informações da ordem de serviço",
    placeholder: "Descreva a OS e os dados necessários para criar a interface",
    button: "Enviar solicitação",
    success: "Solicitação de interface enviada para o administrador."
  },
  {
    key: "melhoria",
    title: "Solicitar Melhoria",
    subtitle: "Registrar uma sugestão ou necessidade de melhoria.",
    label: "Informações da melhoria",
    placeholder: "Descreva a melhoria desejada",
    button: "Enviar solicitação",
    success: "Solicitação de melhoria enviada para o administrador."
  },
  {
    key: "manutencao_veicular",
    title: "Solicitar Manutenção Veicular",
    subtitle: "Pedir validação para manutenção do veículo.",
    label: "Manutenção a ser realizada",
    placeholder: "Descreva o problema, placa e manutenção necessária",
    button: "Enviar solicitação",
    success: "Solicitação de manutenção veicular enviada para validação."
  },
  {
    key: "ferramental",
    title: "Solicitar Ferramental",
    subtitle: "Troca ou requisição de ferramenta.",
    label: "Troca ou requisição de ferramental",
    placeholder: "Informe a ferramenta e o motivo",
    button: "Enviar solicitação",
    success: "Solicitação de ferramental enviada para o administrador."
  },
  {
    key: "equipamento_ti",
    title: "Solicitar Equipamento TI",
    subtitle: "Troca ou requisição de equipamento de TI.",
    label: "Troca ou requisição de equipamento de TI",
    placeholder: "Informe o equipamento, patrimônio se houver, e motivo",
    button: "Enviar solicitação",
    success: "Solicitação de equipamento de TI enviada para o administrador."
  },
  {
    key: "correcao_excecao",
    title: "Solicitar Mudança de Exceção",
    subtitle: "Enviar correção necessária e motivo.",
    label: "Correção e motivo",
    placeholder: "Descreva a correção de exceção e o motivo",
    button: "Enviar solicitação",
    success: "Solicitação de correção enviada para validação."
  }
];

const technicianActions = [
  ...requestTypes,
  { key: "script", title: "Script", subtitle: "Buscar script pelo modelo do roteador." },
  { key: "codigo_baixa", title: "Código de Baixa", subtitle: "Abrir PDF com os códigos." }
];

const app = document.querySelector("#app");
const cfg = window.GTD_CONFIG || {};
let db = null;
let supabaseReady = false;
let setupError = "";

let session = readSession();
let authMode = "login"; // login, register, reset
let adminTabActive = "solicitacoes";

render();
refreshDatabaseClient();

window.addEventListener("supabase-ready", () => {
  refreshDatabaseClient();
  if (!session) {
    renderAuth();
  }
});

function refreshDatabaseClient() {
  const state = createDatabaseClient();
  db = state.db;
  supabaseReady = state.supabaseReady;
  setupError = state.setupError;
}

function createDatabaseClient() {
  const supabaseUrl = String(cfg.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const supabaseAnonKey = String(cfg.SUPABASE_ANON_KEY || "").trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return { db: null, supabaseReady: false, setupError: "Configure as variáveis do Supabase." };
  }
  if (!window.supabase) {
    return { db: null, supabaseReady: false, setupError: "Biblioteca do Supabase ausente." };
  }
  try {
    return { db: window.supabase.createClient(supabaseUrl, supabaseAnonKey), supabaseReady: true, setupError: "" };
  } catch (error) {
    return { db: null, supabaseReady: false, setupError: error.message };
  }
}

function readSession() {
  try { return JSON.parse(localStorage.getItem("gtd_session")); } catch { return null; }
}
function saveSession(data) {
  session = data;
  localStorage.setItem("gtd_session", JSON.stringify(data));
}
function clearSession() {
  session = null;
  localStorage.removeItem("gtd_session");
}

function render() {
  if (!session) {
    renderAuth();
    return;
  }
  if (session.role === "administrador" || session.role === "administrador_master") {
    renderAdminHome();
  } else {
    renderTechnicianHome();
  }
}

function renderAuth() {
  app.innerHTML = `
    <section class="auth-shell">
      <div class="auth-card">
        <header class="auth-header">
          <div class="brand-badge">GTD</div>
          <h1>GTD-Ability Tecnologia</h1>
          <p class="brand-sub">Sistema de Gestão Operacional Integrado</p>
        </header>

        <nav class="auth-tabs" role="tablist">
          <button class="tab-btn ${authMode === 'login' ? 'active' : ''}" id="tab-login">Login</button>
          <button class="tab-btn ${authMode === 'register' ? 'active' : ''}" id="tab-register">Primeiro Acesso</button>
          <button class="tab-btn ${authMode === 'reset' ? 'active' : ''}" id="tab-reset">Esqueci a Senha</button>
        </nav>

        <div class="auth-forms-container">
          <form class="form auth-form ${authMode === 'login' ? 'show' : ''}" id="form-login">
            <label>
              Identificador (RE do Técnico ou CPF do Admin)
              <input id="login-re" required inputmode="numeric" placeholder="Apenas números" />
            </label>
            <label>
              Senha de Acesso
              <input id="login-password" type="password" required placeholder="Digite sua senha de 8 dígitos" />
            </label>
            <div class="message" id="login-msg"></div>
            <button class="primary-btn" type="submit">Entrar no Sistema</button>
          </form>

          <form class="form auth-form ${authMode === 'register' ? 'show' : ''}" id="form-register">
            <p class="helper">Informe seu RE ou CPF pré-autorizado para criar sua senha de acesso.</p>
            <label>
              Identificador Autorizado (RE ou CPF)
              <input id="register-re" required inputmode="numeric" placeholder="Apenas números" />
            </label>
            <label>
              Crie sua Senha (8 caracteres com letras e números)
              <input id="register-password" type="password" required maxlength="8" placeholder="Ex: gtd2026x" />
            </label>
            <div class="message" id="register-msg"></div>
            <button class="primary-btn" type="submit">Cadastrar Senha e Ativar</button>
          </form>

          <form class="form auth-form ${authMode === 'reset' ? 'show' : ''}" id="form-reset">
            <p class="helper" style="color: #b45309;">Informe seus dados cadastrais exatos para redefinir a sua senha.</p>
            <label>
              Seu RE ou CPF cadastrado
              <input id="self-reset-re" required inputmode="numeric" placeholder="Apenas números" />
            </label>
            <label>
              Nome Completo (Idêntico ao registro)
              <input id="self-reset-name" required placeholder="Ex: FILIPE DE SOUZA SANTOS" />
            </label>
            <label>
              Nova Senha (8 caracteres com letras e números)
              <input id="self-reset-password" type="password" required maxlength="8" placeholder="Digite a nova senha" />
            </label>
            <div class="message" id="self-reset-msg"></div>
            <button class="primary-btn" type="submit" style="background: #d97706;">Gravar Nova Senha</button>
          </form>
        </div>
      </div>
    </section>
  `;

  app.querySelector("#tab-login").addEventListener("click", () => { authMode = "login"; renderAuth(); });
  app.querySelector("#tab-register").addEventListener("click", () => { authMode = "register"; renderAuth(); });
  app.querySelector("#tab-reset").addEventListener("click", () => { authMode = "reset"; renderAuth(); });

  const fLogin = app.querySelector("#form-login");
  const fRegister = app.querySelector("#form-register");
  const fReset = app.querySelector("#form-reset");

  if (fLogin) fLogin.addEventListener("submit", handleLoginSubmit);
  if (fRegister) fRegister.addEventListener("submit", handleRegisterSubmit);
  if (fReset) fReset.addEventListener("submit", handleSelfResetSubmit);
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const re = app.querySelector("#login-re").value.trim().replace(/[^0-9]/g, "");
  const password = app.querySelector("#login-password").value;
  const msg = app.querySelector("#login-msg");

  if (!supabaseReady) { showMessage(msg, "error", setupError); return; }

  setFormBusy(form, true);
  const { data, error } = await db.rpc("login_user", { p_identificador: re, p_password: password });
  setFormBusy(form, false);

  if (error) {
    showMessage(msg, "error", `Erro: ${error.message}`);
  } else if (!data?.ok) {
    showMessage(msg, "error", data?.message || "Identificador ou senha inválidos.");
  } else {
    saveSession(data.user);
    render();
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const re = app.querySelector("#register-re").value.trim().replace(/[^0-9]/g, "");
  const password = app.querySelector("#register-password").value;
  const msg = app.querySelector("#register-msg");

  if (!supabaseReady) { showMessage(msg, "error", setupError); return; }
  if (!isValidPassword(password)) {
    showMessage(msg, "error", "A senha deve ter exatamente 8 caracteres, contendo letras e números.");
    return;
  }

  setFormBusy(form, true);
  const { data, error } = await db.rpc("register_user", { p_identificador: re, p_password: password });
  setFormBusy(form, false);

  if (error) {
    showMessage(msg, "error", `Erro: ${error.message}`);
  } else if (!data?.ok) {
    showMessage(msg, "error", data?.message || "Não foi possível cadastrar.");
  } else {
    alert("Cadastro efetuado! Faça login na aba ao lado.");
    authMode = "login";
    renderAuth();
  }
}

async function handleSelfResetSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const re = app.querySelector("#self-reset-re").value.trim().replace(/[^0-9]/g, "");
  const name = app.querySelector("#self-reset-name").value.trim();
  const newPassword = app.querySelector("#self-reset-password").value;
  const msg = app.querySelector("#self-reset-msg");

  if (!supabaseReady) { showMessage(msg, "error", setupError); return; }

  setFormBusy(form, true);
  // Alinhamento sênior perfeito: Passando os 3 parâmetros exigidos pela RPC atualizada
  const { data, error } = await db.rpc("self_reset_password", { 
    p_re: re, 
    p_name: name, 
    p_new_password: newPassword 
  });
  setFormBusy(form, false);

  if (error) {
    showMessage(msg, "error", `Erro: ${error.message}`);
  } else if (!data?.ok) {
    showMessage(msg, "error", data?.message);
  } else {
    alert("Senha redefinida com sucesso! Faça o seu login.");
    authMode = "login";
    renderAuth();
  }
}

function isValidPassword(password) { return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8}$/.test(password); }

function topbar() {
  const displayRole = session.role.toUpperCase().replace("_", " ");
  return `
    <header class="topbar">
      <div class="topbar-inner">
        <div class="app-title"><span class="mini-mark">GTD</span> GTD-Ability Tecnologia</div>
        <div class="user-chip">
          <strong>${escapeHtml(session.name)}</strong>
          <span>ID: ${escapeHtml(session.re)} • ${escapeHtml(displayRole)}</span>
          <button class="ghost-btn" id="logout" style="width:auto; padding:4px 8px;">Sair</button>
        </div>
      </div>
    </header>
  `;
}

/* ================= AREA DO TÉCNICO ================= */
function renderTechnicianHome() {
  app.innerHTML = `
    <section class="app-shell">
      ${topbar()}
      <main class="content">
        <div class="section-head"><div><h2>Painel do Técnico</h2><p>Envie solicitações ou consulte scripts operacionais.</p></div></div>
        <section class="grid">${technicianActions.map(actionTile).join("")}</section>
        <section class="panel" style="margin-top: 24px;">
          <div class="section-head"><div><h2>Minhas solicitações</h2><p>Acompanhe o retorno e homologações em tempo real.</p></div>
          <button class="secondary-btn" id="refresh-requests" style="width:auto;">Atualizar</button></div>
          <div id="request-list" class="request-list"></div>
        </section>
      </main>
    </section>
  `;
  attachCommonEvents();
  document.querySelector("#refresh-requests").addEventListener("click", loadRequests);
  loadRequests();
}

function attachCommonEvents() {
  document.querySelectorAll("[data-action]").forEach(b => b.addEventListener("click", () => openAction(b.dataset.action)));
  document.querySelector("#logout").addEventListener("click", () => { clearSession(); render(); });
}

function actionTile(action) {
  return `<button class="tile" data-action="${action.key}"><div>${escapeHtml(action.title)}<span>${escapeHtml(action.subtitle)}</span></div><span class="icon">${iconFor(action.key)}</span></button>`;
}

function iconFor(key) {
  const icons = { combustivel: "⛽", interface: "↔", melhoria: "+", manutencao_veicular: "⚙", ferramental: "◧", equipamento_ti: "▣", correcao_excecao: "!", script: "{ }", codigo_baixa: "PDF" };
  return icons[key] || "•";
}

function openAction(key) {
  if (key === "script") { renderScriptView(); return; }
  if (key === "codigo_baixa") { renderPdfView(); return; }
  renderRequestForm(requestTypes.find(i => i.key === key));
}

function renderRequestForm(type) {
  app.innerHTML = `
    <section class="app-shell">
      ${topbar()}
      <main class="content">
        <div class="view-actions"><button class="secondary-btn" id="back-home" style="width:auto;">Voltar</button></div>
        <section class="panel">
          <form class="form" id="request-form">
            <div><h2>${escapeHtml(type.title)}</h2><p class="helper">${escapeHtml(type.subtitle)}</p></div>
            <label>${escapeHtml(type.label)}
              ${type.key === "combustivel" 
                ? `<input name="details" inputmode="numeric" required value="${escapeHtml(session.re)}" />` 
                : `<textarea name="details" required placeholder="${escapeHtml(type.placeholder)}"></textarea>`}
            </label>
            <div class="message" id="request-message"></div>
            <button class="primary-btn" type="submit">${escapeHtml(type.button)}</button>
          </form>
        </section>
      </main>
    </section>
  `;
  document.querySelector("#back-home").addEventListener("click", renderTechnicianHome);
  document.querySelector("#logout").addEventListener("click", () => { clearSession(); render(); });
  document.querySelector("#request-form").addEventListener("submit", (e) => submitRequest(e, type));
}

async function submitRequest(event, type) {
  event.preventDefault();
  const form = event.currentTarget;
  const details = String(new FormData(form).get("details")).trim();
  const message = document.querySelector("#request-message");

  setFormBusy(form, true);
  const { error } = await db.from("requests").insert({
    technician_re: session.re,
    technician_name: session.name,
    type: type.key,
    title: type.title,
    details,
    status: "pendente"
  });
  setFormBusy(form, false);
  if (error) { showMessage(message, "error", error.message); return; }
  form.reset();
  showMessage(message, "ok", type.success);
}

async function loadRequests() {
  const list = document.querySelector("#request-list");
  list.innerHTML = `<div class="empty">Carregando solicitações...</div>`;
  const { data, error } = await db.from("requests").select("*").eq("technician_re", session.re).order("created_at", { ascending: false });
  if (error) { list.innerHTML = `<div class="empty">${error.message}</div>`; return; }
  if (!data.length) { list.innerHTML = `<div class="empty">Nenhuma solicitação enviada.</div>`; return; }

  list.innerHTML = data.map(item => {
    const badgeClass = item.status === "ok" ? "done" : item.status === "nao_ok" ? "denied" : "pending";
    return `
      <article class="request-item">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.admin_response || "Aguardando resposta do administrador.")}</p>
          <small>${formatDate(item.created_at)}</small>
        </div>
        <span class="badge ${badgeClass}">${escapeHtml(labelStatus(item.status))}</span>
      </article>
    `;
  }).join("");
}

function renderScriptView() {
  app.innerHTML = `
    <section class="app-shell">
      ${topbar()}
      <main class="content">
        <div class="view-actions"><button class="secondary-btn" id="back-home" style="width:auto;">Voltar</button></div>
        <section class="panel">
          <form class="form" id="script-form">
            <div><h2>Buscar Script</h2><p class="helper">Digite o modelo do roteador para pesquisa.</p></div>
            <label>Modelo do Roteador<input name="model" required placeholder="Ex.: Huawei" /></label>
            <button class="primary-btn" type="submit">Buscar</button>
          </form>
          <div id="script-result" class="script-result"></div>
        </section>
      </main>
    </section>
  `;
  document.querySelector("#back-home").addEventListener("click", renderTechnicianHome);
  document.querySelector("#logout").addEventListener("click", () => { clearSession(); render(); });
  document.querySelector("#script-form").addEventListener("submit", searchScript);
}

async function searchScript(event) {
  event.preventDefault();
  const result = document.querySelector("#script-result");
  const model = String(new FormData(event.currentTarget).get("model")).trim();
  result.innerHTML = `<div class="empty">Buscando...</div>`;

  const { data, error } = await db.from("scripts").select("router_model,content").ilike("router_model", `%${model}%`).limit(1);
  if (error) { result.innerHTML = `<div class="empty">${error.message}</div>`; return; }
  if (!data || data.length === 0) { result.innerHTML = `<div class="empty">Não encontrado.</div>`; return; }

  result.innerHTML = `<h3>${escapeHtml(data[0].router_model)}</h3><pre class="script-box">${escapeHtml(data[0].content)}</pre>`;
}

function renderPdfView() {
  app.innerHTML = `
    <section class="app-shell">${topbar()}
      <main class="content">
        <div class="view-actions"><button class="secondary-btn" id="back-home" style="width:auto;">Voltar</button></div>
        <section class="panel"><h2>Código de Baixa</h2><iframe class="pdf-frame" src="assets/codigos-baixa.pdf"></iframe></section>
      </main>
    </section>
  `;
  document.querySelector("#back-home").addEventListener("click", renderTechnicianHome);
  document.querySelector("#logout").addEventListener("click", () => { clearSession(); render(); });
}

/* ================= AREA DO ADMINISTRADOR ================= */
function renderAdminHome() {
  const isMaster = session.role === "administrador_master";
  app.innerHTML = `
    <section class="app-shell">
      ${topbar()}
      <main class="content">
        <div class="section-head"><div><h2>Painel Administrativo</h2><p>Gestão de solicitações operacionais e engenharia de scripts.</p></div></div>
        <div class="tabs" role="tablist">
          <button class="tab ${adminTabActive === "solicitacoes" ? 'active' : ''}" id="tab-sol">Solicitações Técnicas</button>
          <button class="tab ${adminTabActive === "scripts" ? 'active' : ''}" id="tab-scr">Cadastrar Script</button>
          ${isMaster ? `<button class="tab ${adminTabActive === "usuarios" ? 'active' : ''}" id="tab-usr">Controle de Usuários</button>` : ""}
        </div>
        <div id="admin-panel-content" style="margin-top:20px;"></div>
      </main>
    </section>
  `;

  document.querySelector("#logout").addEventListener("click", () => { clearSession(); render(); });
  document.querySelector("#tab-sol").addEventListener("click", () => { adminTabActive = "solicitacoes"; renderAdminHome(); });
  document.querySelector("#tab-scr").addEventListener("click", () => { adminTabActive = "scripts"; renderAdminHome(); });
  if (isMaster) {
    document.querySelector("#tab-usr").addEventListener("click", () => { adminTabActive = "usuarios"; renderAdminHome(); });
  }

  if (adminTabActive === "solicitacoes") renderAdminRequests();
  if (adminTabActive === "scripts") renderAdminScriptsForm();
  if (adminTabActive === "usuarios") renderAdminUsersForm();
}

async function renderAdminRequests() {
  const container = document.querySelector("#admin-panel-content");
  container.innerHTML = `<div class="empty">Buscando fila de solicitações dos técnicos...</div>`;

  const { data, error } = await db.from("requests").select("*").order("created_at", { ascending: false });
  if (error) { container.innerHTML = `<div class="empty">Erro: ${error.message}</div>`; return; }
  if (!data.length) { container.innerHTML = `<div class="empty">Nenhuma solicitações pendente na fila.</div>`; return; }

  container.innerHTML = `
    <div class="request-list">
      ${data.map(req => {
        const hasAction = req.status === "pendente";
        return `
          <div class="panel" style="border-left: 5px solid ${req.status === 'ok' ? 'var(--success)' : req.status === 'nao_ok' ? 'var(--danger)' : 'var(--warning)'}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
              <div style="flex:1; min-width:280px;">
                <strong style="font-size:1.1rem; color:var(--text);">${escapeHtml(req.title)}</strong>
                <p style="margin:4px 0; font-size:0.9rem;"><strong>Técnico:</strong> ${escapeHtml(req.technician_name)} (RE: ${escapeHtml(req.technician_re)})</p>
                <p style="background:var(--surface-2); padding:12px; border-radius:8px; margin:8px 0; font-size:0.95rem; line-height:1.5;">"${escapeHtml(req.details)}"</p>
                <small>${formatDate(req.created_at)} • Status: <strong style="color:${req.status==='ok'?'var(--success)':req.status==='nao_ok'?'var(--danger)':'var(--warning)'}">${req.status.toUpperCase()}</strong></small>
                ${req.admin_response ? `<p style="margin:6px 0; color:var(--muted); font-size:0.9rem;"><strong>Resposta do Admin:</strong> ${escapeHtml(req.admin_response)}</p>` : ""}
              </div>
              ${hasAction ? `
                <div style="display:grid; gap:8px; width:100%; max-width:220px;">
                  <input id="resp-${req.id}" placeholder="Feedback complementar..." style="padding:8px;" />
                  <button class="primary-btn" onclick="handleProcessRequest('${req.id}', 'ok')" style="min-height:36px; padding:6px;">Liberar / OK</button>
                  <button class="secondary-btn" onclick="handleProcessRequest('${req.id}', 'nao_ok')" style="min-height:36px; padding:6px; color:var(--danger); border-color:var(--danger)">Recusar / Não OK</button>
                </div>
              ` : ""}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

window.handleProcessRequest = async function(id, status) {
  const input = document.querySelector(`#resp-${id}`);
  const feedback = input ? input.value.trim() : "";
  
  const { error } = await db.from("requests").update({
    status: status,
    admin_response: feedback || (status === "ok" ? "Solicitação aprovada e concluída." : "Solicitação não autorizada.")
  }).eq("id", id);

  if (error) { alert(`Erro ao responder chamado: ${error.message}`); return; }
  renderAdminRequests();
};

function renderAdminScriptsForm() {
  const container = document.querySelector("#admin-panel-content");
  container.innerHTML = `
    <section class="panel">
      <form class="form" id="insert-script-form">
        <div><h2>Cadastrar Script Técnico</h2><p class="helper">O script ficará instantaneamente disponível na pesquisa dos navegadores dos técnicos.</p></div>
        <label>Modelo do Roteador / Equipamento<input name="model" required placeholder="Ex.: Huawei EG8145V5" /></label>
        <label>Comandos do Script (.txt)<textarea name="content" required placeholder="Cole o arquivo txt ou linhas de comando aqui..."></textarea></label>
        <div class="message" id="script-admin-message"></div>
        <button class="primary-btn" type="submit">Publicar Script no Banco</button>
      </form>
    </section>
  `;

  document.querySelector("#insert-script-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const model = String(new FormData(form).get("model")).trim();
    const content = String(new FormData(form).get("content")).trim();
    const msg = document.querySelector("#script-admin-message");

    setFormBusy(form, true);
    const { error } = await db.from("scripts").insert({ router_model: model, content: content });
    setFormBusy(form, false);

    if (error) { showMessage(msg, "error", error.message); return; }
    form.reset();
    showMessage(msg, "ok", "Script gravado e disponibilizado com sucesso.");
  });
}

function renderAdminUsersForm() {
  const container = document.querySelector("#admin-panel-content");
  
  container.innerHTML = `
    <section class="panel">
      <div>
        <h2>Controle de Usuários Autorizados (Whitelist & Perfis)</h2>
        <p class="helper">Consulte pelo RE ou CPF para verificar o status, cadastrar, alterar funções ou resetar/deletar logins.</p>
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 22px; max-width: 500px;">
        <input id="search-identificador" inputmode="numeric" placeholder="Digite RE ou CPF (somente números)" style="padding: 10px;" />
        <button class="primary-btn" id="btn-search-user" style="min-width: 120px; min-height: 44px; width:auto;">Consultar</button>
      </div>

      <div id="management-workarea">
        <div class="empty">Insira um identificador acima para iniciar a gestão.</div>
      </div>
    </section>
  `;

  document.querySelector("#btn-search-user").addEventListener("click", async () => {
    const identificador = document.querySelector("#search-identificador").value.trim().replace(/[^0-9]/g, "");
    const workarea = document.querySelector("#management-workarea");

    if (!identificador) { alert("Por favor, informe o RE ou CPF."); return; }

    workarea.innerHTML = `<div class="empty">Consultando base de dados do Supabase...</div>`;

    try {
      const { data, error } = await db.rpc("check_user_status", { p_identificador: identificador });
      
      if (error) {
        workarea.innerHTML = `<div class="message show error">Erro na consulta: ${error.message}</div>`;
        return;
      }

      let statusLabel = "";
      let alertClass = "pending";
      
      if (data.status === "cadastrado") {
        statusLabel = "CONTA ATIVA E CADASTRADA (Senha protegida por hash irreversível)";
        alertClass = "done";
      } else if (data.status === "na_whitelist") {
        statusLabel = "AUTORIZADO / AGUARDANDO CADASTRO DE SENHA (Primeiro acesso ou resetado)";
        alertClass = "pending";
      } else {
        statusLabel = "NÃO AUTORIZADO (Inexistente no sistema)";
        alertClass = "denied";
      }

      workarea.innerHTML = `
        <div class="badge ${alertClass}" style="margin-bottom: 16px; font-size: 0.85rem; padding: 6px 12px; border-radius:4px;">
          Status: ${statusLabel}
        </div>

        <form class="form" id="user-mutation-form" style="margin-top: 10px;">
          <label>
            Nome Completo do Colaborador
            <input id="mutation-name" required value="${escapeHtml(data.name)}" placeholder="Ex.: NOMES SOBRENOME" ${data.status === 'cadastrado' ? 'disabled' : ''} />
          </label>

          <label>
            Função / Nível de Acesso no Sistema
            <select id="mutation-role" style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 13px 14px; background: #fff; font: inherit;">
              <option value="tecnico" ${data.role === 'tecnico' ? 'selected' : ''}>Técnico</option>
              <option value="administrador" ${data.role === 'administrador' ? 'selected' : ''}>Administrador</option>
              <option value="administrador_master" ${data.role === 'administrador_master' ? 'selected' : ''}>Administrador Master</option>
            </select>
          </label>

          <div class="message" id="mutation-msg"></div>

          <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 10px;">
            <button class="primary-btn" type="submit" style="flex: 1; min-width: 160px;">
              ${data.status === 'cadastrado' ? 'Atualizar Função' : 'Salvar e Autorizar'}
            </button>
            
            ${data.status === 'cadastrado' ? `
              <button class="secondary-btn" type="button" id="btn-reset-password" style="color: var(--warning); border-color: var(--warning); min-width: 160px; width:auto;">
                Resetar Senha
              </button>
            ` : ""}
            
            ${data.status !== 'nao_autorizado' ? `
              <button class="secondary-btn" type="button" id="btn-delete-user" style="color: var(--danger); border-color: var(--danger); min-width: 160px; width:auto;">
                Excluir Definitivamente
              </button>
            ` : ""}
          </div>
        </form>
      `;

      document.querySelector("#user-mutation-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const inputName = document.querySelector("#mutation-name").value.trim().toUpperCase();
        const selectedRole = document.querySelector("#mutation-role").value;
        const msg = document.querySelector("#mutation-msg");

        setFormBusy(form, true);
        let saveError = null;

        if (data.status === "cadastrado") {
          const { error } = await db.from("users").update({ role: selectedRole }).eq("re", identificador);
          saveError = error;
        } else {
          await db.from("allowed_technicians").delete().eq("re", identificador);
          await db.from("allowed_admins").delete().eq("cpf", identificador);

          if (selectedRole === "tecnico") {
            const { error } = await db.from("allowed_technicians").insert({ re: identificador, name: inputName });
            saveError = error;
          } else {
            const adminLevel = selectedRole === "administrador_master" ? "master" : "admin";
            const { error } = await db.from("allowed_admins").insert({ cpf: identificador, name: inputName, level: adminLevel });
            saveError = error;
          }
        }

        setFormBusy(form, false);
        if (saveError) { showMessage(msg, "error", `Erro: ${saveError.message}`); } 
        else { showMessage(msg, "ok", "Gravado com sucesso!"); setTimeout(renderAdminUsersForm, 1200); }
      });

      if (data.status === "cadastrado") {
        document.querySelector("#btn-reset-password").addEventListener("click", async () => {
          if (!confirm(`Deseja resetar a senha do usuário ${identificador}?`)) return;
          const form = document.querySelector("#user-mutation-form");
          setFormBusy(form, true);

          const { error } = await db.rpc("reset_user_password", { p_identificador: identificador });
          setFormBusy(form, false);

          if (error) { alert(`Erro: ${error.message}`); } 
          else { alert("Senha resetada! Liberado para novo registro."); renderAdminUsersForm(); }
        });
      }

      if (data.status !== "nao_autorizado") {
        document.querySelector("#btn-delete-user").addEventListener("click", async () => {
          if (!confirm(`Tem certeza que deseja apagar DEFINITIVAMENTE o ID ${identificador}?`)) return;
          const form = document.querySelector("#user-mutation-form");
          setFormBusy(form, true);

          const { error } = await db.rpc("delete_user_completely", { p_identificador: identificador });
          setFormBusy(form, false);

          if (error) { alert(`Erro: ${error.message}`); } 
          else { alert("Expurgado com sucesso!"); renderAdminUsersForm(); }
        });
      }

    } catch (err) { workarea.innerHTML = `<div class="message show error">Falha: ${err.message}</div>`; }
  });
}

/* ================= AUXILIARES ================= */
function showMessage(element, type, text) { element.className = `message show ${type}`; element.textContent = text; }
function setFormBusy(form, busy) { form.querySelectorAll("button, input, textarea, select").forEach(f => f.disabled = busy); }
function labelStatus(status) { const labels = { pendente: "Pendente", ok: "OK", nao_ok: "Não OK" }; return labels[status] || status; }
function formatDate(v) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(v)); }
function escapeHtml(v) { return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }