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
  {
    key: "script",
    title: "Script",
    subtitle: "Buscar script pelo modelo do roteador."
  },
  {
    key: "codigo_baixa",
    title: "Código de Baixa",
    subtitle: "Abrir PDF com os códigos."
  }
];

const app = document.querySelector("#app");
const cfg = window.GTD_CONFIG || {};
let db = null;
let supabaseReady = false;
let setupError = "";

let session = readSession();
let authMode = "login";

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
    return {
      db: null,
      supabaseReady: false,
      setupError: "Configure o Supabase no arquivo config.js antes de usar o sistema."
    };
  }

  if (!window.supabase) {
    return {
      db: null,
      supabaseReady: false,
      setupError: "A biblioteca do Supabase não carregou. Verifique sua conexão com a internet."
    };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    parsedUrl = null;
  }

  if (!parsedUrl || parsedUrl.protocol !== "https:" || !parsedUrl.hostname.endsWith(".supabase.co")) {
    return {
      db: null,
      supabaseReady: false,
      setupError: "Use a Project URL do Supabase, no formato https://seu-projeto.supabase.co. Não use a conexão postgresql do banco."
    };
  }

  try {
    return {
      db: window.supabase.createClient(supabaseUrl, supabaseAnonKey),
      supabaseReady: true,
      setupError: ""
    };
  } catch (error) {
    return {
      db: null,
      supabaseReady: false,
      setupError: error.message
    };
  }
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem("gtd_session"));
  } catch {
    return null;
  }
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

  renderTechnicianHome();
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
          <p>Acesso inicial dos técnicos autorizado por RE cadastrado.</p>
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
        <p class="helper">${isLogin ? "Informe seu RE e senha para acessar." : "O cadastro será aceito somente para RE autorizado."}</p>
      </div>
      <label>
        RE
        <input name="re" inputmode="numeric" autocomplete="username" required placeholder="Ex.: 30981" />
      </label>
      <label>
        Senha
        <input name="password" type="password" autocomplete="${isLogin ? "current-password" : "new-password"}" maxlength="8" required placeholder="8 caracteres com letra e número" />
      </label>
      <div class="message" id="auth-message"></div>
      <button class="primary-btn" type="submit">${isLogin ? "Entrar" : "Cadastrar"}</button>
    </form>
  `;

  document.querySelector("#auth-form").addEventListener("submit", handleAuthSubmit);
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const re = String(form.get("re")).trim();
  const password = String(form.get("password")).trim();
  const message = document.querySelector("#auth-message");

  if (!supabaseReady) {
    showMessage(message, "error", setupError);
    return;
  }

  if (!/^\d+$/.test(re)) {
    showMessage(message, "error", "O RE deve conter somente números.");
    return;
  }

  if (authMode === "register" && !isValidPassword(password)) {
    showMessage(message, "error", "A senha deve ter exatamente 8 caracteres, com pelo menos uma letra e um número.");
    return;
  }

  setFormBusy(event.currentTarget, true);
  const rpcName = authMode === "login" ? "login_technician" : "register_technician";
  const { data, error } = await db.rpc(rpcName, { p_re: re, p_password: password });
  setFormBusy(event.currentTarget, false);

  if (error) {
    showMessage(message, "error", error.message);
    return;
  }

  if (!data?.ok) {
    showMessage(message, "error", data?.message || "Não foi possível concluir a operação.");
    return;
  }

  if (authMode === "register") {
    authMode = "login";
    renderAuth();
    showMessage(document.querySelector("#auth-message"), "ok", "Cadastro realizado. Agora faça login com seu RE e senha.");
    return;
  }

  saveSession(data.user);
  render();
}

function isValidPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8}$/.test(password);
}

function renderTechnicianHome() {
  app.innerHTML = `
    <section class="app-shell">
      ${topbar()}
      <main class="content">
        <div class="section-head">
          <div>
            <h2>Painel do Técnico</h2>
            <p>Escolha uma ação para enviar solicitação ou consultar material técnico.</p>
          </div>
        </div>
        <section class="grid">
          ${technicianActions.map(actionTile).join("")}
        </section>
        <section class="panel" style="margin-top: 22px;">
          <div class="section-head">
            <div>
              <h2>Minhas solicitações</h2>
              <p>Acompanhe as respostas enviadas pelo administrador.</p>
            </div>
            <button class="secondary-btn" id="refresh-requests">Atualizar</button>
          </div>
          <div id="request-list" class="request-list"></div>
        </section>
      </main>
    </section>
  `;

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => openAction(button.dataset.action));
  });
  document.querySelector("#logout").addEventListener("click", () => {
    clearSession();
    render();
  });
  document.querySelector("#refresh-requests").addEventListener("click", loadRequests);
  loadRequests();
}

function topbar() {
  return `
    <header class="topbar">
      <div class="topbar-inner">
        <div class="app-title"><span class="mini-mark">GTD</span> GTD-Ability Tecnologia</div>
        <div class="user-chip">
          <strong>${escapeHtml(session.name)}</strong>
          <span>RE ${escapeHtml(session.re)} • ${escapeHtml(session.role)}</span>
          <button class="ghost-btn" id="logout">Sair</button>
        </div>
      </div>
    </header>
  `;
}

function actionTile(action) {
  return `
    <button class="tile" data-action="${action.key}">
      <div>
        ${escapeHtml(action.title)}
        <span>${escapeHtml(action.subtitle)}</span>
      </div>
      <span class="icon">${iconFor(action.key)}</span>
    </button>
  `;
}

function iconFor(key) {
  const icons = {
    combustivel: "⛽",
    interface: "↔",
    melhoria: "+",
    manutencao_veicular: "⚙",
    ferramental: "◧",
    equipamento_ti: "▣",
    correcao_excecao: "!",
    script: "{ }",
    codigo_baixa: "PDF"
  };
  return icons[key] || "•";
}

function openAction(key) {
  if (key === "script") {
    renderScriptView();
    return;
  }

  if (key === "codigo_baixa") {
    renderPdfView();
    return;
  }

  const type = requestTypes.find((item) => item.key === key);
  renderRequestForm(type);
}

function renderRequestForm(type) {
  app.innerHTML = `
    <section class="app-shell">
      ${topbar()}
      <main class="content">
        <div class="view-actions">
          <button class="secondary-btn" id="back-home">Voltar</button>
        </div>
        <section class="panel">
          <form class="form" id="request-form">
            <div>
              <h2>${escapeHtml(type.title)}</h2>
              <p class="helper">${escapeHtml(type.subtitle)}</p>
            </div>
            <label>
              ${escapeHtml(type.label)}
              ${type.key === "combustivel"
                ? `<input name="details" inputmode="numeric" required value="${escapeHtml(session.re)}" placeholder="${escapeHtml(type.placeholder)}" />`
                : `<textarea name="details" required placeholder="${escapeHtml(type.placeholder)}"></textarea>`}
            </label>
            <div class="message" id="request-message"></div>
            <button class="primary-btn" type="submit">${escapeHtml(type.button)}</button>
          </form>
        </section>
      </main>
    </section>
  `;

  document.querySelector("#logout").addEventListener("click", () => {
    clearSession();
    render();
  });
  document.querySelector("#back-home").addEventListener("click", renderTechnicianHome);
  document.querySelector("#request-form").addEventListener("submit", (event) => submitRequest(event, type));
}

async function submitRequest(event, type) {
  event.preventDefault();
  const form = event.currentTarget;
  const details = String(new FormData(form).get("details")).trim();
  const message = document.querySelector("#request-message");

  if (!details) {
    showMessage(message, "error", "Preencha as informações da solicitação.");
    return;
  }

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

  if (error) {
    showMessage(message, "error", error.message);
    return;
  }

  form.reset();
  showMessage(message, "ok", type.success);
}

async function loadRequests() {
  const list = document.querySelector("#request-list");
  list.innerHTML = `<div class="empty">Carregando solicitações...</div>`;

  if (!supabaseReady) {
    list.innerHTML = `<div class="empty">${escapeHtml(setupError)}</div>`;
    return;
  }

  const { data, error } = await db
    .from("requests")
    .select("id,title,type,status,admin_response,created_at,updated_at")
    .eq("technician_re", session.re)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    list.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
    return;
  }

  if (!data.length) {
    list.innerHTML = `<div class="empty">Nenhuma solicitação enviada ainda.</div>`;
    return;
  }

  list.innerHTML = data.map((item) => {
    const badgeClass = item.status === "ok" ? "done" : item.status === "nao_ok" ? "denied" : "pending";
    const response = item.admin_response ? `<p>${escapeHtml(item.admin_response)}</p>` : `<p>Aguardando resposta do administrador.</p>`;
    return `
      <article class="request-item">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          ${response}
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
        <div class="view-actions">
          <button class="secondary-btn" id="back-home">Voltar</button>
        </div>
        <section class="panel">
          <form class="form" id="script-form">
            <div>
              <h2>Buscar Script</h2>
              <p class="helper">Digite o modelo do roteador para consultar o arquivo cadastrado.</p>
            </div>
            <label>
              Modelo do roteador
              <input name="model" required placeholder="Ex.: Huawei EG8145V5" />
            </label>
            <button class="primary-btn" type="submit">Buscar</button>
          </form>
          <div id="script-result" class="script-result"></div>
        </section>
      </main>
    </section>
  `;

  document.querySelector("#logout").addEventListener("click", () => {
    clearSession();
    render();
  });
  document.querySelector("#back-home").addEventListener("click", renderTechnicianHome);
  document.querySelector("#script-form").addEventListener("submit", searchScript);
}

// Correção aplicada: busca defensiva limitando linhas antes de tratar o array do Supabase
async function searchScript(event) {
  event.preventDefault();
  const result = document.querySelector("#script-result");
  const model = String(new FormData(event.currentTarget).get("model")).trim();

  result.innerHTML = `<div class="empty">Buscando...</div>`;

  const { data, error } = await db
    .from("scripts")
    .select("router_model,content")
    .ilike("router_model", `%${model}%`)
    .limit(1);

  if (error) {
    result.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    result.innerHTML = `<div class="empty">Não encontrado.</div>`;
    return;
  }

  const scriptData = data[0];
  result.innerHTML = `
    <h3>${escapeHtml(scriptData.router_model)}</h3>
    <pre class="script-box">${escapeHtml(scriptData.content)}</pre>
  `;
}

function renderPdfView() {
  app.innerHTML = `
    <section class="app-shell">
      ${topbar()}
      <main class="content">
        <div class="view-actions">
          <button class="secondary-btn" id="back-home">Voltar</button>
        </div>
        <section class="panel">
          <h2>Código de Baixa</h2>
          <p class="helper">Arquivo PDF para consulta dos códigos.</p>
          <iframe class="pdf-frame" src="assets/codigos-baixa.pdf" title="Código de Baixa"></iframe>
        </section>
      </main>
    </section>
  `;

  document.querySelector("#logout").addEventListener("click", () => {
    clearSession();
    render();
  });
  document.querySelector("#back-home").addEventListener("click", renderTechnicianHome);
}

function showMessage(element, type, text) {
  element.className = `message show ${type}`;
  element.textContent = text;
}

function setFormBusy(form, busy) {
  form.querySelectorAll("button, input, textarea").forEach((field) => {
    field.disabled = busy;
  });
}

function labelStatus(status) {
  const labels = {
    pendente: "Pendente",
    ok: "OK",
    nao_ok: "Não OK"
  };
  return labels[status] || status;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}