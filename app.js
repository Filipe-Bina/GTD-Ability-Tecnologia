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
    title: "Solicitar Correção de Exceção",
    subtitle: "Enviar correção necessária e motivo.",
    label: "Correção e motivo",
    placeholder: "Descreva a correção de exceção e o motivo",
    button: "Enviar solicitação",
    success: "Solicitação de correção de exceção enviada para validação."
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
let authMode = "login";
let adminTabActive = "solicitacoes";

render();
refreshDatabaseClient();

window.addEventListener("supabase-ready", () => {
  refreshDatabaseClient();
  if (!session) {
    renderAuthForm();
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
    return { db: null, supabaseReady: false, setupError: "Configure o Supabase no arquivo config.js." };
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
      <div class="auth-panel">
        <aside class="brand-side">
          <div>
            <div class="brand-mark">GTD</div>
            <h1>GTD-Ability Tecnologia</h1>
            <p>Sistema operacional para solicitações técnicas, scripts e códigos de baixa.</p>
          </div>
          <p>Acesso unificado para Técnicos (RE) e Administradores (CPF).</p>
        </aside>
        <section class="auth-form-side">
          <div class="tabs" role="tablist">
            <button class="tab ${authMode === "login" ? "active" : ""}" data-auth-tab="login">Login</button>
            <button class="tab ${authMode === "register" ? "active" : ""}" data-auth-tab="register">Cadastro</button>
          </div>
          <div id="auth-content"></div>
        </section>
      </div>
    </section>
  `;

  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      authMode = button.dataset.authTab;
      renderAuth();
    });
  });
  renderAuthForm();
}

function renderAuthForm() {
  const content = document.querySelector("#auth-content");
  const isLogin = authMode === "login";

  content.innerHTML = `
    <form class="form" id="auth-form">
      <div>
        <h2>${isLogin ? "Entrar no sistema" : "Primeiro acesso"}</h2>
        <p class="helper">${isLogin ? "Informe seu Identificador e senha para acessar." : "O cadastro será aceito somente para RE ou CPF autorizado."}</p>
      </div>
      <label>
        RE do Técnico ou CPF do Admin (somente números)
        <input name="identificador" inputmode="numeric" required placeholder="Ex.: 35383 ou 35036423828" />
      </label>
      <label>
        Senha
        <input name="password" type="password" maxlength="8" required placeholder="8 caracteres com letra e número" />
      </label>
      <div class="message" id="auth-message"></div>
      <button class="primary-btn" type="submit">${isLogin ? "Entrar" : "Cadastrar"}</button>
    </form>
  `;

  document.querySelector("#auth-form").addEventListener("submit", handleAuthSubmit);
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const identificador = String(form.get("identificador")).trim().replace(/[^0-9]/g, "");
  const password = String(form.get("password")).trim();
  const message = document.querySelector("#auth-message");

  if (!supabaseReady) { showMessage(message, "error", setupError); return; }
  if (authMode === "register" && !isValidPassword(password)) {
    showMessage(message, "error", "A senha deve ter exatamente 8 caracteres, com letra e número.");
    return;
  }

  try {
    setFormBusy(formElement, true);
    const rpcName = authMode === "login" ? "login_user" : "register_user";
    const { data, error } = await db.rpc(rpcName, { p_identificador: identificador, p_password: password });
    setFormBusy(formElement, false);

    if (error) { showMessage(message, "error", `Erro: ${error.message}`); return; }
    if (!data?.ok) { showMessage(message, "error", data?.message || "Operação inválida."); return; }

    if (authMode === "register") {
      authMode = "login";
      renderAuth();
      showMessage(document.querySelector("#auth-message"), "ok", "Cadastro realizado! Faça login agora.");
      return;
    }

    saveSession(data.user);
    render();
  } catch (err) {
    setFormBusy(formElement, false);
    showMessage(message, "error", err.message);
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
          <button class="ghost-btn" id="logout">Sair</button>
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
        <div class="section-head"><div><h2>Painel do Técnico</h2><p>Envie solicitações ou consulte scripts.</p></div></div>
        <section class="grid">${technicianActions.map(actionTile).join("")}</section>
        <section class="panel" style="margin-top: 22px;">
          <div class="section-head"><div><h2>Minhas solicitações</h2><p>Acompanhe o retorno do administrador.</p></div>
          <button class="secondary-btn" id="refresh-requests">Atualizar</button></div>
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
        <div class="view-actions"><button class="secondary-btn" id="back-home">Voltar</button></div>
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
        <div class="view-actions"><button class="secondary-btn" id="back-home">Voltar</button></div>
        <section class="panel">
          <form class="form" id="script-form">
            <div><h2>Buscar Script</h2><p class="helper">Digite o modelo do roteador.</p></div>
            <label>Modelo<input name="model" required placeholder="Ex.: Huawei" /></label>
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
        <div class="view-actions"><button class="secondary-btn" id="back-home">Voltar</button></div>
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
        <div class="section-head"><div><h2>Painel Administrativo</h2><p>Gestão de solicitações e scripts do sistema.</p></div></div>
        <div class="tabs" role="tablist">
          <button class="tab ${adminTabActive === "solicitacoes" ? "active" : ""}" id="tab-sol">Solicitações Técnicas</button>
          <button class="tab ${adminTabActive === "scripts" ? "active" : ""}" id="tab-scr">Cadastrar Script</button>
          ${isMaster ? `<button class="tab ${adminTabActive === "usuarios" ? "active" : ""}" id="tab-usr">Controle de Usuários (Master)</button>` : ""}
        </div>
        <div id="admin-panel-content" style="margin-top:18px;"></div>
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
  container.innerHTML = `<div class="empty">Buscando solicitações dos técnicos...</div>`;

  const { data, error } = await db.from("requests").select("*").order("created_at", { ascending: false });
  if (error) { container.innerHTML = `<div class="empty">Erro: ${error.message}</div>`; return; }
  if (!data.length) { container.innerHTML = `<div class="empty">Nenhuma solicitação no momento.</div>`; return; }

  container.innerHTML = `
    <div class="request-list">
      ${data.map(req => {
        const hasAction = req.status === "pendente";
        return `
          <div class="panel" style="border-left: 5px solid ${req.status === 'ok' ? 'var(--success)' : req.status === 'nao_ok' ? 'var(--danger)' : 'var(--warning)'}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
              <div>
                <strong>${escapeHtml(req.title)} (${escapeHtml(req.type.toUpperCase())})</strong>
                <p style="margin:6px 0;"><strong>Técnico:</strong> ${escapeHtml(req.technician_name)} (RE: ${escapeHtml(req.technician_re)})</p>
                <p style="background:var(--surface-2); padding:10px; border-radius:6px; margin:6px 0;">"${escapeHtml(req.details)}"</p>
                <small>${formatDate(req.created_at)} • Status atual: <strong>${req.status.toUpperCase()}</strong></small>
                ${req.admin_response ? `<p style="margin:6px 0; color:var(--muted)"><strong>Resposta enviada:</strong> ${escapeHtml(req.admin_response)}</p>` : ""}
              </div>
              ${hasAction ? `
                <div style="display:grid; gap:8px; min-width:150px;">
                  <input id="resp-${req.id}" placeholder="Escreva um feedback..." style="padding:6px; font-size:0.85rem;" />
                  <button class="primary-btn" onclick="handleProcessRequest('${req.id}', 'ok')" style="min-height:32px; font-size:0.85rem;">Liberar / OK</button>
                  <button class="secondary-btn" onclick="handleProcessRequest('${req.id}', 'nao_ok')" style="min-height:32px; font-size:0.85rem; color:var(--danger)">Recusar / Não OK</button>
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
        <div><h2>Cadastrar Script Técnico</h2><p class="helper">O arquivo ficará disponível na aba de pesquisas dos técnicos em formato .txt</p></div>
        <label>Modelo do Roteador / Equipamento<input name="model" required placeholder="Ex.: Huawei EG8145V5" /></label>
        <label>Conteúdo do Script (.txt)<textarea name="content" required placeholder="Cole a estrutura de comandos do script aqui..."></textarea></label>
        <div class="message" id="script-admin-message"></div>
        <button class="primary-btn" type="submit">Publicar Script</button>
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
    showMessage(msg, "ok", "Script cadastrado com sucesso no banco de dados.");
  });
}

function renderAdminUsersForm() {
  const container = document.querySelector("#admin-panel-content");
  
  // Estrutura base da interface de gerenciamento
  container.innerHTML = `
    <section class="panel">
      <div>
        <h2>Controle de Usuários Autorizados (Whitelist & Perfis)</h2>
        <p class="helper">Consulte pelo RE ou CPF para verificar o status, cadastrar, alterar funções ou deletar de forma definitiva.</p>
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 22px; max-width: 500px;">
        <input id="search-identificador" inputmode="numeric" placeholder="Digite RE ou CPF (somente números)" style="padding: 10px;" />
        <button class="primary-btn" id="btn-search-user" style="min-width: 120px; min-height: 44px;">Consultar</button>
      </div>

      <div id="management-workarea">
        <div class="empty">Insira um identificador acima para iniciar a gestão.</div>
      </div>
    </section>
  `;

  // Evento de clique para o botão de busca
  document.querySelector("#btn-search-user").addEventListener("click", async () => {
    const identificador = document.querySelector("#search-identificador").value.trim().replace(/[^0-9]/g, "");
    const workarea = document.querySelector("#management-workarea");

    if (!identificador) {
      alert("Por favor, informe o RE ou CPF.");
      return;
    }

    workarea.innerHTML = `<div class="empty">Consultando base de dados do Supabase...</div>`;

    try {
      const { data, error } = await db.rpc("check_user_status", { p_identificador: identificador });
      
      if (error) {
        workarea.innerHTML = `<div class="message show error">Erro na consulta: ${error.message}</div>`;
        return;
      }

      // Renderização dinâmica baseada no status retornado pelo banco
      let statusLabel = "";
      let alertClass = "pending";
      
      if (data.status === "cadastrado") {
        statusLabel = "CONTA ATIVA E CADASTRADA NO SISTEMA";
        alertClass = "done";
      } else if (data.status === "na_whitelist") {
        statusLabel = "AUTORIZADO NA WHITELIST (Aguardando primeiro acesso do usuário)";
        alertClass = "pending";
      } else {
        statusLabel = "NÃO AUTORIZADO (Inexistente no sistema)";
        alertClass = "denied";
      }

      workarea.innerHTML = `
        <div class="badge ${alertClass}" style="margin-bottom: 16px; font-size: 0.85rem; padding: 6px 12px;">
          Status: ${statusLabel}
        </div>

        <form class="form" id="user-mutation-form" style="margin-top: 10px;">
          <label>
            Nome Completo do Colaborador
            <input id="mutation-name" required value="${escapeHtml(data.name)}" placeholder="Ex.: NOMES SOBRENOME" ${data.status === 'cadastrado' ? 'disabled' : ''} />
            ${data.status === 'cadastrado' ? '<small style="color:var(--muted); font-weight:normal;">Para usuários já cadastrados, o nome é gerenciado pelo próprio login.</small>' : ''}
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
            <button class="primary-btn" type="submit" style="flex: 1; min-width: 180px;">
              ${data.status === 'cadastrado' ? 'Atualizar Função' : 'Salvar e Autorizar na Whitelist'}
            </button>
            
            ${data.status !== 'nao_autorizado' ? `
              <button class="secondary-btn" type="button" id="btn-delete-user" style="color: var(--danger); border-color: var(--danger); min-width: 180px;">
                Excluir Definitivamente
              </button>
            ` : ""}
          </div>
        </form>
      `;

      // Evento de Gravação / Atualização (Upsert manual baseado no perfil escolhido)
      document.querySelector("#user-mutation-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const inputName = document.querySelector("#mutation-name").value.trim().toUpperCase();
        const selectedRole = document.querySelector("#mutation-role").value;
        const msg = document.querySelector("#mutation-msg");

        setFormBusy(form, true);
        let saveError = null;

        if (data.status === "cadastrado") {
          // Cenário A: Usuário já tem conta, apenas atualiza a role na tabela users
          const { error } = await db.from("users").update({ role: selectedRole }).eq("re", identificador);
          saveError = error;
        } else {
          // Cenário B: Ajustando Whitelists. Remove das duas para evitar resíduos e insere na correta
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

        if (saveError) {
          showMessage(msg, "error", `Erro ao salvar: ${saveError.message}`);
        } else {
          showMessage(msg, "ok", "Alterações gravadas com absoluto sucesso!");
          setTimeout(renderAdminUsersForm, 1500); // Dá um refresh na tela após sucesso
        }
      });

      // Evento de Exclusão Definitiva (Chama o RPC unificado)
      if (data.status !== "nao_autorizado") {
        document.querySelector("#btn-delete-user").addEventListener("click", async () => {
          if (!confirm(`ATENÇÃO MASTER:\nTem certeza que deseja apagar DEFINITIVAMENTE o ID ${identificador} do sistema?\nIsso removerá o acesso e todo o registro de autorização.`)) {
            return;
          }

          const form = document.querySelector("#user-mutation-form");
          setFormBusy(form, true);

          const { error } = await db.rpc("delete_user_completely", { p_identificador: identificador });
          
          setFormBusy(form, false);

          if (error) {
            alert(`Erro ao deletar: ${error.message}`);
          } else {
            alert("Usuário totalmente expurgado da base!");
            renderAdminUsersForm();
          }
        });
      }

    } catch (err) {
      workarea.innerHTML = `<div class="message show error">Erro na execução: ${err.message}</div>`;
    }
  });
}

/* ================= AUXILIARES DE SUPORTE ================= */
function showMessage(element, type, text) { element.className = `message show ${type}`; element.textContent = text; }
function setFormBusy(form, busy) { form.querySelectorAll("button, input, textarea").forEach(f => f.disabled = busy); }
function labelStatus(status) { const labels = { pendente: "Pendente", ok: "OK", nao_ok: "Não OK" }; return labels[status] || status; }
function formatDate(v) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(v)); }
function escapeHtml(v) { return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }