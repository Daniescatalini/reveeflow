const routes = [
  ["dashboard", "Dashboard"],
  ["brain", "Brain Dump"],
  ["projects", "Projetos"],
  ["tasks", "Tarefas"],
  ["events", "Eventos"],
  ["timeline", "Timeline"],
  ["notes", "Notas"],
];

const routeLabels = {
  dashboard: "Dashboard",
  brain: "Brain Dump",
  projects: "Projetos",
  tasks: "Tarefas",
  events: "Eventos",
  timeline: "Timeline",
  notes: "Notas",
  team: "Equipe",
  settings: "Configurações",
};

const eventTypeLabels = {
  reuniao: "Reunião",
  compromisso: "Compromisso",
  evento: "Evento",
  bloqueio: "Bloqueio",
  ausencia: "Ausência",
};

function eventTypeLabel(type = "evento") {
  return eventTypeLabels[type] || "Evento";
}

function eventTypeTone(type = "evento") {
  if (type === "bloqueio") return "gray";
  if (type === "reuniao") return "blue";
  if (type === "ausencia") return "rose";
  if (type === "compromisso") return "cyan";
  return "green";
}

function eventTypeOptions(selected = "evento") {
  return Object.entries(eventTypeLabels)
    .map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`)
    .join("");
}

const roles = ["Designer", "Social media", "Gestor", "Web designer", "Fotógrafo", "Editor de vídeo", "Estrategista"];
const TODAY_ISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const STORAGE_KEY = "reveeflow-state-v3";
const AUTH_KEY = "reveeflow-auth-v1";
const USERS_KEY = "reveeflow-users-v1";
const LEGACY_STORAGE_KEYS = ["reveeflow-state", "reveeflow-state-v2"];
const SUPABASE_URL = window.REVEEFLOW_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.REVEEFLOW_SUPABASE_ANON_KEY || "";
let timerTicker = null;
let authMode = "login";
let authSession = null;
let supabaseClient = null;
let supabaseSaveTimer = null;

const navIcons = {
  dashboard: `<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>`,
  brain: `<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>`,
  projects: `<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"/>`,
  tasks: `<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.2 2.2 4.8-5"/>`,
  agenda: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  calendar: `<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>`,
  events: `<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M8 3v4M16 3v4M8 11h8M8 15h5"/>`,
  timeline: `<path d="M4 7h7M15 7h5M4 17h5M13 17h7"/><circle cx="13" cy="7" r="2"/><circle cx="11" cy="17" r="2"/>`,
  files: `<path d="M6 3h7l5 5v13H6z"/><path d="M13 3v6h5"/>`,
  notes: `<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>`,
  user: `<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>`,
  team: `<path d="M16 11a4 4 0 1 0-8 0"/><circle cx="12" cy="7" r="3"/><path d="M4 20a8 8 0 0 1 16 0"/><path d="M19 10a3 3 0 0 1 2 5M5 10a3 3 0 0 0-2 5"/>`,
  settings: `<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.1 2.1 0 0 1-2.97 2.97l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.66V21a2.1 2.1 0 0 1-4.2 0v-.06a1.8 1.8 0 0 0-1.1-1.66 1.8 1.8 0 0 0-1.98.36l-.04.04a2.1 2.1 0 1 1-2.97-2.97l.04-.04A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.66-1.1H3a2.1 2.1 0 0 1 0-4.2h.06a1.8 1.8 0 0 0 1.66-1.1 1.8 1.8 0 0 0-.36-1.98l-.04-.04a2.1 2.1 0 0 1 2.97-2.97l.04.04A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1.1-1.66V3a2.1 2.1 0 0 1 4.2 0v.06a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 1.98-.36l.04-.04a2.1 2.1 0 1 1 2.97 2.97l-.04.04A1.8 1.8 0 0 0 19.4 9c.2.6.72 1.04 1.34 1.1H21a2.1 2.1 0 0 1 0 4.2h-.06A1.8 1.8 0 0 0 19.4 15Z"/>`,
  mic: `<path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3M8 21h8"/>`,
  bell: `<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>`,
};

function iconSvg(id) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${navIcons[id] || navIcons.dashboard}</svg>`;
}

function flowAiIcon(extraClass = "") {
  return `
    <svg class="flow-star-icon ${extraClass}" viewBox="0 0 24 24" aria-hidden="true">
      <path class="flow-orbit" d="M12 3.5c1.1 3.25 2.25 4.4 5.5 5.5-3.25 1.1-4.4 2.25-5.5 5.5-1.1-3.25-2.25-4.4-5.5-5.5 3.25-1.1 4.4-2.25 5.5-5.5Z"/>
      <path class="flow-spark-small" d="M18.1 14.5c.48 1.34 1.08 1.94 2.4 2.4-1.32.48-1.92 1.08-2.4 2.4-.48-1.32-1.08-1.92-2.4-2.4 1.32-.46 1.92-1.06 2.4-2.4Z"/>
      <circle class="flow-dot" cx="6.25" cy="16.8" r="1.05"/>
    </svg>
  `;
}

const serviceCatalog = {
  "Identidade Visual": [
    ["briefing", 1],
    ["pesquisa visual", 3],
    ["conceito criativo", 4],
    ["paleta de cores", 1],
    ["tipografia", 2],
    ["símbolo/logotipo", 6],
    ["aplicações", 3],
    ["apresentação", 4],
    ["ajustes", 2],
    ["entrega final", 1],
  ],
  Naming: [
    ["briefing", 1],
    ["pesquisa de mercado", 3],
    ["mapa de palavras", 2],
    ["território verbal", 3],
    ["geração de nomes", 5],
    ["curadoria", 2],
    ["análise de disponibilidade", 2],
    ["apresentação", 3],
    ["ajustes", 2],
    ["entrega final", 1],
  ],
  "Social Media": [
    ["planejamento", 2],
    ["pauta", 1],
    ["copy", 2],
    ["design", 4],
    ["revisão interna", 1],
    ["ajustes", 1],
    ["entrega/agendamento", 1],
  ],
  "Web Design": [
    ["briefing", 1],
    ["mapa do site", 2],
    ["wireframe", 3],
    ["layout da home", 5],
    ["páginas internas", 6],
    ["responsivo", 4],
    ["revisão", 2],
    ["ajustes", 3],
    ["entrega final", 1],
  ],
  "Design Avulso": [
    ["solicitação", 0.5],
    ["criação", 2],
    ["revisão", 0.5],
    ["ajustes", 1],
    ["entrega", 0.5],
  ],
  "Vídeo / Edição": [
    ["briefing", 0.5],
    ["referência", 1],
    ["edição inicial", 4],
    ["revisão", 1],
    ["ajustes", 2],
    ["exportação", 0.5],
    ["entrega", 0.5],
  ],
};

function createDefaultServices() {
  return Object.entries(serviceCatalog).map(([name, steps], index) => ({
    id: `service-${index}`,
    name,
    complexity: index < 2 ? "alta" : index === 4 ? "baixa" : "media",
    margin: index < 2 ? 30 : 20,
    active: true,
    steps: steps.map(([title, hours], order) => ({ id: `${name}-${order}`, title, hours, active: true })),
  }));
}

const state = {
  route: "dashboard",
  sidebarCollapsed: false,
  activeProjectView: "lista",
  settingsTab: "servicos",
  workConfig: {
    hoursPerDay: 6,
    focusHours: 4,
    safetyMargin: 25,
    workDays: ["seg", "ter", "qua", "qui", "sex"],
    holidays: ["2026-06-11"],
  },
  services: createDefaultServices(),
  projects: [
    {
      id: "p1",
      name: "Identidade Maria Atelier",
      type: "Identidade Visual",
      status: "em andamento",
      due: "2026-06-02",
      progress: 62,
      current: "símbolo/logotipo",
      notes: "Cliente prefere tons neutros, formato vertical e apresentação limpa.",
    },
    {
      id: "p2",
      name: "Site Studio Aurora",
      type: "Web Design",
      status: "em risco",
      due: "2026-05-28",
      progress: 44,
      current: "layout da home",
      notes: "Revisar dobra inicial e responsivo antes da reunião.",
    },
    {
      id: "p3",
      name: "Peças Clínica Lume",
      type: "Design Avulso",
      status: "em andamento",
      due: "2026-05-24",
      progress: 80,
      current: "ajustes",
      notes: "Incluir telefone, endereço, Instagram e logo no rodapé.",
    },
  ],
  tasks: [
    task("Finalizar símbolo principal", "Identidade Maria Atelier", "criação", "2026-05-21", "hoje", "urgente", "em progresso"),
    task("Revisar home desktop", "Site Studio Aurora", "web design", "2026-05-20", "atrasado", "urgente", "pendente"),
    task("Separar referências de paleta", "Identidade Maria Atelier", "pesquisa", "2026-05-22", "esta semana", "importante", "pendente"),
    task("Ajustar flyer da clínica", "Peças Clínica Lume", "design", "2026-05-21", "hoje", "importante", "pendente"),
    task("Organizar arquivos finais", "Peças Clínica Lume", "entrega", "2026-05-24", "esta semana", "pode esperar", "pendente"),
  ],
  notes: [
    { title: "Referência para Maria", body: "Usar contraste sutil, muita área em branco e serifas elegantes.", project: "Identidade Maria Atelier" },
    { title: "Texto obrigatório flyer", body: "Incluir telefone, endereço, Instagram e assinatura da clínica.", project: "Peças Clínica Lume" },
  ],
  members: [
    {
      id: "member-1",
      initials: "JS",
      name: "Juliana Silva",
      email: "juliana@reveeflow.com",
      role: "Dono/Admin",
      permission: "todos os projetos",
      photo: "",
      accessCode: "JUL-FLOW2026",
    },
    {
      id: "member-2",
      initials: "DA",
      name: "Dani Amarante",
      email: "dani@reveeflow.com",
      role: "Designer",
      permission: "projetos atribuídos",
      photo: "",
      accessCode: "DAN-FLOW2026",
    },
  ],
  files: [
    { name: "referencias-maria.zip", project: "Identidade Maria Atelier", tag: "referências", version: "v2" },
    { name: "home-wireframe.fig", project: "Site Studio Aurora", tag: "wireframe", version: "v1" },
    { name: "flyer-clinica-final.pdf", project: "Peças Clínica Lume", tag: "entrega", version: "v3" },
  ],
  calendar: {
    connected: false,
    email: "",
    events: [
      { id: "cal-1", title: "Reunião cliente", date: TODAY_ISO, hour: "14:00", type: "reuniao" },
      { id: "cal-2", title: "Apresentação cliente", date: TODAY_ISO, hour: "16:00", type: "reuniao" },
    ],
  },
  searchQuery: "",
  taskFilters: { status: "", priority: "", assignedTo: "", projectId: "", dueDate: "" },
  theme: "light",
  calendarView: "semana",
  calendarCursor: TODAY_ISO,
  notificationsCleared: false,
  brainGeneratedIds: [],
  profile: {
    name: "Juliana Silva",
    email: "juliana@reveeflow.com",
    role: "Designer",
    photo: "",
    accessCode: "JUL-FLOW2026",
  },
  timer: {
    open: false,
    minimized: false,
    running: false,
    taskId: "",
    stageLabel: "",
    startedAt: null,
    elapsed: 0,
    x: null,
    y: null,
  },
  flowAi: {
    open: false,
    messages: [],
    pendingSuggestion: null,
  },
  aiMemory: {
    user: {},
    projectPatterns: {},
    taskPatterns: {},
    estimationHistory: [],
  },
};

function task(name, project, category, due, label, priority, status) {
  return {
    id: crypto.randomUUID(),
    title: name,
    name,
    projectId: "",
    project,
    category,
    assignedTo: "",
    responsible: "Dani Amarante",
    priority,
    dueDate: due,
    due,
    duration: 1,
    status,
    source: "manual",
    notes: "",
    comments: [],
    createdAt: new Date().toISOString(),
    label,
  };
}

function taskTitle(item) {
  return repairPortugueseText(item.title || item.name || "Tarefa sem nome");
}

function taskDue(item) {
  return item.dueDate || item.due || TODAY_ISO;
}

function taskProject(item) {
  return taskProjectName(item);
}

function projectForTask(item) {
  return state.projects.find((project) => project.id === item.projectId || project.name === item.project) || null;
}

function taskProjectName(item) {
  const project = projectForTask(item);
  return repairPortugueseText(project?.name || item.project || "Sem projeto");
}

function taskClientName(item) {
  const project = projectForTask(item);
  return repairPortugueseText(project?.client || item.client || "Cliente não informado");
}

function taskContextLine(item) {
  return `${taskProjectName(item)} · Cliente: ${taskClientName(item)}`;
}

function eventTypeLabel(type = "evento") {
  const labels = {
    evento: "Evento",
    reuniao: "Reunião",
    compromisso: "Compromisso",
    bloqueio: "Bloqueio de agenda",
    ausencia: "Ausência",
  };
  return labels[type] || capitalize(repairPortugueseText(type));
}

function taskAssignee(item) {
  const member = state.members.find((memberItem) => memberItem.id === item.assignedTo);
  return member?.name || item.responsible || "Sem responsável";
}

function memberOptions(selected = "") {
  return state.members.map((member) => `<option value="${member.id}" ${selected === member.id || selected === member.name ? "selected" : ""}>${member.name}</option>`).join("");
}

function projectOptions(selected = "") {
  return `<option value="">Sem projeto</option>${state.projects.map((project) => `<option value="${project.id}" ${selected === project.id || selected === project.name ? "selected" : ""}>${project.name}</option>`).join("")}`;
}

function linkedTasks(projectId) {
  return state.tasks.filter((item) => item.projectId === projectId);
}

function profileFirstName() {
  return (state.profile?.name || "Dani").trim().split(/\s+/)[0] || "Dani";
}

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !window.supabase?.createClient) return null;
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

function isSupabaseEnabled() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase?.createClient);
}

function readAuthSession() {
  try {
    authSession = JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    authSession = null;
  }
}

function isAuthenticated() {
  return Boolean(authSession?.email && (!isSupabaseEnabled() || authSession.source === "supabase"));
}

function authUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAuthUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function applyAuthUser(user, source = "local") {
  authSession = {
    id: user.id || crypto.randomUUID(),
    email: user.email,
    name: user.name || user.user_metadata?.name || user.email?.split("@")[0] || "Dani",
    role: user.role || "Designer",
    source,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authSession));
  state.profile.name = authSession.name;
  state.profile.email = authSession.email;
  state.profile.role = authSession.role;
  state.profile.accessCode ||= generateAccessCode(authSession.name);
  normalizeState();
}

function setAuthSession(user, source = "local") {
  applyAuthUser(user, source);
  persistState();
}

function logout() {
  const client = getSupabaseClient();
  if (client) client.auth.signOut().catch(() => {});
  authSession = null;
  localStorage.removeItem(AUTH_KEY);
  closeFloatingPanels();
  closeModal();
  render();
}

async function restoreSupabaseSession() {
  const client = getSupabaseClient();
  if (!client) return;
  const { data, error } = await client.auth.getSession();
  if (error) return;
  const user = data?.session?.user;
  if (!user) {
    if (authSession && authSession.source !== "supabase") {
      authSession = null;
      localStorage.removeItem(AUTH_KEY);
      render();
    }
    return;
  }
  applyAuthUser({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email?.split("@")[0],
    role: user.user_metadata?.role || state.profile.role,
  }, "supabase");
  await loadStateFromSupabase();
  renderSidebarProfile();
  render();
}

function dynamicGreeting() {
  const hour = new Date().getHours();
  const period = hour >= 5 && hour < 12 ? "Bom dia" : hour >= 12 && hour < 18 ? "Boa tarde" : "Boa noite";
  return `${period}, ${profileFirstName()}.`;
}

function isDone(item) {
  return item.status === "concluida" || item.status === "concluído";
}

function timeMinutes(value) {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function isTimeSoon(item) {
  if (taskDue(item) !== TODAY_ISO || !item.hour) return false;
  const target = timeMinutes(item.hour);
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  return target !== null && target - current <= 180;
}

function smartTaskLabel(item) {
  if (isDone(item)) return "concluido";
  const base = classifyDueDate(taskDue(item));
  if (taskDue(item) === TODAY_ISO && item.hour) {
    const target = timeMinutes(item.hour);
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    if (target !== null && current > target) return "atrasado";
    if (target !== null && target - current <= 90) return "atenção imediata";
    if (target !== null && target - current <= 240) return "entrega em breve";
  }
  return base;
}

function upcomingOperationalTasks() {
  return sortedTasks(state.tasks.filter((item) => {
    if (isDone(item)) return false;
    const days = daysUntil(taskDue(item));
    return days <= 3 || item.priority === "urgente" || item.priority === "importante" || ["atrasado", "hoje", "atenção imediata", "entrega em breve"].includes(item.label);
  }));
}

function operationalTimelineItems() {
  const tasks = state.tasks.filter((item) => !isDone(item)).map((item) => ({
    id: item.id,
    kind: "task",
    iso: taskDue(item),
    title: taskTitle(item),
    subtitle: `${taskProjectName(item)} · Cliente: ${taskClientName(item)} · ${item.category || "tarefa"}`,
    priority: item.priority,
    label: item.label,
  }));
  const calendar = getCalendarItems().map((item) => ({
    id: item.id,
    kind: item.kind,
    iso: item.iso,
    title: item.title,
    subtitle: item.subtitle,
    priority: item.kind === "project" ? "importante" : "pode esperar",
    label: item.kind === "project" ? "entrega em breve" : "evento",
  }));
  return [...tasks, ...calendar].sort((a, b) => parseISODate(a.iso) - parseISODate(b.iso));
}

function getCalendarItems() {
  const eventItems = (state.calendar?.events || []).map((event) => ({
    id: event.id,
    kind: "event",
    iso: event.date || event.dueDate || TODAY_ISO,
    start: event.hour || "09:00",
    title: event.title || "Evento",
    subtitle: eventTypeLabel(event.type || "evento"),
    tone: eventTypeTone(event.type || "evento"),
  }));
  const deliveries = state.projects.map((project) => ({
    id: project.id,
    kind: "project",
    iso: project.dueDate || project.due || TODAY_ISO,
    start: "17:00",
    title: `Entrega ${project.name}`,
    subtitle: project.client || project.type,
    tone: project.status === "atrasado" || project.status === "prazo curto" ? "rose" : "cyan",
  }));
  return [...eventItems, ...deliveries];
}

const app = document.querySelector("#app");
const nav = document.querySelector("#nav");
const title = document.querySelector("#section-title");
const kicker = document.querySelector("#section-kicker");
const modalBackdrop = document.querySelector("#modal-backdrop");
const modalContent = document.querySelector("#modal-content");
const modalTitle = document.querySelector("#modal-title");
let brainRecognition = null;
let brainIsListening = false;

function init() {
  document.addEventListener("click", handleClick);
  document.addEventListener("click", handleCalendarControls, true);
  document.addEventListener("change", handleChange);
  document.addEventListener("input", handleInput);
  document.addEventListener("submit", handleSubmit);
  readAuthSession();
  hydrateState();
  normalizeState();
  applyTheme();
  renderSidebarProfile();
  applySidebarState();
  nav.innerHTML = routes
    .map(([id, label]) => `<button type="button" data-route="${id}" title="${label}"><span class="nav-icon">${iconSvg(id)}</span><span class="nav-label">${label}</span></button>`)
    .join("");

  const quickNoteButton = document.querySelector("#quick-note-button");
  if (quickNoteButton) {
    quickNoteButton.addEventListener("click", () => {
      state.route = "notes";
      state.notes.unshift({ title: "Nota rápida", body: "Nova anotação sem projeto. Edite livremente.", project: "Geral" });
      persistState();
      notify("Nota criada.");
      render();
    });
  }
  render();
  restoreSupabaseSession().catch(() => {});
}

function handleCalendarControls(event) {
  const viewButton = event.target.closest("[data-calendar-view]");
  if (viewButton) {
    event.preventDefault();
    event.stopPropagation();
    setCalendarView(viewButton.dataset.calendarView);
    return;
  }
  const monthButton = event.target.closest("[data-calendar-month]");
  if (monthButton) {
    event.preventDefault();
    event.stopPropagation();
    moveCalendarMonth(Number(monthButton.dataset.calendarMonth));
    return;
  }
  if (event.target.closest("[data-calendar-today]")) {
    event.preventDefault();
    event.stopPropagation();
    goCalendarToday();
  }
}

function setCalendarView(view) {
  if (!["dia", "semana", "mes"].includes(view)) return;
  state.calendarView = view;
  persistState();
  render();
}

function moveCalendarMonth(delta) {
  state.calendarCursor = shiftCalendarMonth(Number(delta || 0));
  persistState();
  render();
}

function goCalendarToday() {
  state.calendarCursor = TODAY_ISO;
  persistState();
  render();
}

function bindInteractiveElements() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.route = button.dataset.route;
      closeFloatingPanels();
      render();
    };
  });

  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      authMode = button.dataset.authTab || "login";
      localStorage.setItem("reveeflow-auth-mode", authMode);
      renderAuthScreen();
    };
  });

  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      const input = button.closest(".password-field")?.querySelector("input");
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      button.classList.toggle("is-visible", input.type === "text");
    };
  });

  document.querySelectorAll("[data-calendar-view]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      setCalendarView(button.dataset.calendarView);
    };
  });

  document.querySelectorAll("[data-calendar-month]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      moveCalendarMonth(Number(button.dataset.calendarMonth));
    };
  });

  document.querySelectorAll("[data-calendar-today]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      goCalendarToday();
    };
  });

  document.querySelectorAll("[data-project-view]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.activeProjectView = button.dataset.projectView;
      persistState();
      render();
    };
  });

  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.settingsTab = button.dataset.settingsTab;
      persistState();
      render();
    };
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.onclick = (event) => {
      if (runAction(button, event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
  });

  document.querySelectorAll("#process-brain").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      processBrainDump();
    };
  });

  document.querySelectorAll("#add-custom-service").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      addCustomService();
    };
  });

  document.querySelectorAll("#connect-google-calendar").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      connectGoogleCalendar();
    };
  });

  document.querySelectorAll("[data-task-done]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      updateTaskStatus(button.dataset.taskDone, "concluida");
    };
  });

  document.querySelectorAll("[data-task-delete]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      deleteTask(button.dataset.taskDelete);
    };
  });

  document.querySelectorAll("[data-project-delete]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      deleteProject(button.dataset.projectDelete);
    };
  });

  document.querySelectorAll("[data-note-delete]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      deleteNote(Number(button.dataset.noteDelete));
    };
  });

  document.querySelectorAll("[data-file-delete]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      deleteFile(Number(button.dataset.fileDelete));
    };
  });

  document.querySelectorAll("[data-member-remove]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      removeMember(button.dataset.memberRemove);
    };
  });

  document.querySelectorAll("[data-service-remove]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      removeService(button.dataset.serviceRemove);
    };
  });

  document.querySelectorAll("[data-service-step-add]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      addServiceStep(button.dataset.serviceStepAdd);
    };
  });

  document.querySelectorAll("[data-service-step-remove]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      removeServiceStep(button.dataset.serviceStepRemove);
    };
  });

  document.querySelectorAll("[data-service-save]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      persistState();
      notify("Serviço salvo.");
      closeModal();
      render();
    };
  });

  document.querySelectorAll("[data-project-step]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleProjectStep(button.dataset.projectStep, Number(button.dataset.stepIndex));
    };
  });

  document.querySelectorAll("[data-task-open]").forEach((item) => {
    item.onclick = (event) => {
      if (event.target.closest("button, select, input, textarea")) return;
      event.preventDefault();
      event.stopPropagation();
      openTaskDetail(item.dataset.taskOpen || findTaskByName(item.dataset.taskName)?.id);
    };
  });

  document.querySelectorAll("[data-project-open]").forEach((item) => {
    item.onclick = (event) => {
      if (event.target.closest("button, select, input, textarea")) return;
      event.preventDefault();
      event.stopPropagation();
      openProjectDetail(item.dataset.projectOpen);
    };
  });

  document.querySelectorAll("[data-event-open]").forEach((item) => {
    item.onclick = (event) => {
      if (event.target.closest("select, input, textarea")) return;
      event.preventDefault();
      event.stopPropagation();
      openEventDetail(item.dataset.eventOpen);
    };
  });

  document.querySelectorAll("[data-member-open]").forEach((item) => {
    item.onclick = (event) => {
      if (event.target.closest("button, select, input, textarea")) return;
      event.preventDefault();
      event.stopPropagation();
      openMemberModal(item.dataset.memberOpen);
    };
  });

  document.querySelectorAll("[data-service-open]").forEach((item) => {
    item.onclick = (event) => {
      if (event.target.closest("button, select, input, textarea")) return;
      event.preventDefault();
      event.stopPropagation();
      openServiceModal(item.dataset.serviceOpen);
    };
  });

  document.querySelectorAll("[data-auth-form], [data-create-form], [data-edit-task], [data-edit-project], [data-edit-event], [data-member-form], [data-profile-form]").forEach((form) => {
    form.onsubmit = (event) => {
      event.stopPropagation();
      handleSubmit(event);
    };
  });

  document.querySelectorAll("[data-photo-upload]").forEach((input) => {
    input.onchange = (event) => {
      event.stopPropagation();
      readPhotoUpload(input);
    };
  });

  document.querySelectorAll("[data-has-time]").forEach((input) => {
    input.onchange = (event) => {
      event.stopPropagation();
      const timeField = input.closest("form")?.querySelector("[data-time-field]");
      if (timeField) timeField.hidden = !input.checked;
    };
  });

  document.querySelectorAll("[data-task-status]").forEach((input) => {
    input.onchange = (event) => {
      event.stopPropagation();
      updateTaskStatus(input.dataset.taskStatus, input.value);
    };
  });

  document.querySelectorAll("[data-task-filter]").forEach((input) => {
    input.onchange = (event) => {
      event.stopPropagation();
      state.taskFilters[input.dataset.taskFilter] = input.value;
      persistState();
      render();
    };
  });
}

function runAction(action, event) {
  const name = action?.dataset.action;
  if (!name) return false;
  const actions = {
    "open-create": () => openCreateModal(),
    "open-create-menu": () => openCreateMenu(),
    "open-task": () => openCreateModal("task", action.dataset.hour || ""),
    "open-event": () => openCreateModal("event", action.dataset.hour || "", action.dataset.date || ""),
    "open-commitment": () => openCreateModal("event", action.dataset.hour || "", action.dataset.date || ""),
    "open-project": () => openCreateModal("project"),
    "open-note": () => openCreateModal("note"),
    "open-file": () => openCreateModal("file"),
    "open-member": () => openMemberModal(),
    "open-profile": () => openProfileModal(),
    "open-profile-menu": () => openProfileMenu(),
    "open-notifications": () => openNotifications(),
    "open-timer": () => openTimerWidget(action.dataset.taskId || ""),
    "open-flow-ai": () => openFlowIA(),
    "close-flow-ai": () => closeFlowIA(),
    "flow-quick": () => sendFlowMessage(action.dataset.prompt || action.textContent.trim()),
    "flow-send": () => submitFlowMessage(),
    "flow-apply": () => applyFlowSuggestion(action.dataset.flowApply),
    "flow-new-conversation": () => resetFlowConversation(),
    "flow-clear-conversation": () => clearFlowConversation(),
    "flow-new-question": () => focusFlowInput(),
    "ask-flow-project": () => askFlowAboutProject(action.dataset.projectId || ""),
    "start-dictation": () => startBrainDictation(),
    "start-focus": () => startFocusTask(),
    "postpone-focus": () => postponeFocusTask(),
    "toggle-theme": () => toggleTheme(),
    "toggle-sidebar": () => toggleSidebar(),
    logout: () => logout(),
    "clear-notifications": () => clearNotifications(),
    "timer-start": () => toggleTimerRunning(),
    "timer-finish": () => finishTimer(),
    "timer-minimize": () => minimizeTimer(),
    "timer-close": () => closeTimerWidget(),
    "close-modal": () => closeModal(),
  };
  if (!actions[name]) return false;
  actions[name]();
  return true;
}

function render() {
  if (!isAuthenticated()) {
    document.querySelector("#flow-ai-root")?.remove();
    renderAuthScreen();
    return;
  }
  document.body.classList.remove("auth-mode");
  document.querySelector("#auth-screen")?.remove();
  document.querySelector(".shell")?.removeAttribute("hidden");
  const current = routes.find(([id]) => id === state.route) || routes[0];
  const screens = {
    dashboard: dashboardScreen,
    brain: brainScreen,
    projects: projectsScreen,
    tasks: tasksScreen,
    events: eventsScreen,
    timeline: timelineScreen,
    notes: notesScreen,
    team: teamScreen,
    settings: settingsScreen,
  };
  const route = screens[state.route] ? state.route : "dashboard";
  state.route = route;
  const active = routes.find(([id]) => id === route) || [route, routeLabels[route] || current[1]];
  title.textContent = route === "dashboard" ? dynamicGreeting() : active[1];
  kicker.textContent = route === "dashboard" ? "Aqui está o que precisa da sua atenção hoje." : active[1];
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.classList.toggle("active", button.dataset.route === route);
  });
  const mainCreateButton = document.querySelector(".add-button");
  if (mainCreateButton) {
    mainCreateButton.dataset.action = "open-create-menu";
    mainCreateButton.setAttribute("aria-label", "Criar novo item");
    const label = mainCreateButton.querySelector("strong");
    if (label) label.textContent = "Novo";
  }
  document.querySelector(".notification-button")?.classList.toggle("is-clear", state.notificationsCleared);
  applySidebarState();
  try {
    app.innerHTML = screens[route]();
  } catch (error) {
    console.error(error);
    app.innerHTML = `<section class="panel panel-pad"><h2>Algo não carregou</h2><p class="muted">Recarregue a página. O sistema protegeu a tela para não ficar em branco.</p></section>`;
  }
  renderTimerWidget();
  renderFlowIA();
  bindInteractiveElements();
}

function renderAuthScreen() {
  authMode = localStorage.getItem("reveeflow-auth-mode") || authMode || "login";
  document.body.classList.add("auth-mode");
  document.querySelector(".shell")?.setAttribute("hidden", "");
  document.querySelector("#auth-screen")?.remove();
  const screen = document.createElement("main");
  screen.id = "auth-screen";
  screen.className = "auth-screen";
  const isRegister = authMode === "register";
  const isRecover = authMode === "recover";
  screen.innerHTML = `
    <section class="auth-card" aria-label="Acesso ReveeFlow">
      <div class="auth-brand">
        <img src="assets/reveeflow-favicon.png?v=46" alt="" />
        <div>
          <h1>ReveeFlow</h1>
          <p>Clareza para o seu fluxo criativo</p>
        </div>
      </div>
      <div class="auth-tabs" role="tablist" aria-label="Entrar ou cadastrar">
        <button class="${!isRegister && !isRecover ? "active" : ""}" data-auth-tab="login" type="button">Entrar</button>
        <button class="${isRegister ? "active" : ""}" data-auth-tab="register" type="button">Cadastro</button>
        <button class="${isRecover ? "active" : ""}" data-auth-tab="recover" type="button">Recuperar</button>
      </div>
      <form class="auth-form" data-auth-form="${isRecover ? "recover" : isRegister ? "register" : "login"}">
        ${isRegister ? `<label>Nome<input name="name" autocomplete="name" required placeholder="Seu nome" /></label>` : ""}
        <label>E-mail<input name="email" type="email" autocomplete="email" required placeholder="seu@email.com" /></label>
        ${isRecover ? `<p class="auth-helper">Enviaremos um link para redefinir sua senha.</p>` : `<label>Senha
          <span class="password-field">
            <input name="password" type="password" autocomplete="${isRegister ? "new-password" : "current-password"}" required minlength="6" placeholder="Mínimo 6 caracteres" />
            <button data-password-toggle type="button" aria-label="Mostrar senha">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </span>
        </label>${!isRegister ? `<button class="auth-link" data-auth-tab="recover" type="button">Esqueci minha senha</button>` : ""}`}
        <p class="auth-message" id="auth-message" aria-live="polite"></p>
        <button class="auth-submit" type="submit">${isRecover ? "Enviar recuperação" : isRegister ? "Cadastrar" : "Entrar"}</button>
      </form>
    </section>
  `;
  document.body.appendChild(screen);
  bindInteractiveElements();
}

async function handleAuthSubmit(form) {
  const message = form.querySelector("#auth-message");
  const submit = form.querySelector(".auth-submit");
  const data = Object.fromEntries(new FormData(form));
  const email = String(data.email || "").trim().toLowerCase();
  const password = String(data.password || "");
  const name = String(data.name || "").trim();
  if (message) message.textContent = "";
  if (!email || (form.dataset.authForm !== "recover" && password.length < 6)) {
    if (message) message.textContent = "Preencha e-mail e senha com pelo menos 6 caracteres.";
    return;
  }
  submit.disabled = true;
  try {
    const client = getSupabaseClient();
    if (form.dataset.authForm === "recover") {
      if (client) {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
        if (error) throw error;
      }
      if (message) message.textContent = "Se o e-mail estiver cadastrado, enviaremos o link de recuperação.";
      submit.disabled = false;
      return;
    }
  if (client) {
      if (form.dataset.authForm === "register") {
        const { data: result, error } = await client.auth.signUp({ email, password, options: { data: { name } } });
        if (error) throw error;
        if (!result.session) {
          if (message) message.textContent = "Enviamos o e-mail de confirmação. Confirme para entrar.";
          localStorage.setItem("reveeflow-auth-mode", "login");
          authMode = "login";
          submit.disabled = false;
          return;
        }
        applyAuthUser({ id: result.user?.id, email, name: name || result.user?.user_metadata?.name }, "supabase");
      } else {
        const { data: result, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        applyAuthUser({ id: result.user?.id, email, name: result.user?.user_metadata?.name || state.profile.name }, "supabase");
      }
      await loadStateFromSupabase();
      renderSidebarProfile();
      render();
      return;
    }

    const users = authUsers();
    if (form.dataset.authForm === "register") {
      if (!name) {
        if (message) message.textContent = "Digite seu nome para cadastrar.";
        return;
      }
      if (users.some((user) => user.email === email)) {
        if (message) message.textContent = "Este e-mail já está cadastrado. Entre com sua senha.";
        return;
      }
      const user = { id: crypto.randomUUID(), name, email, password, role: "Designer" };
      saveAuthUsers([...users, user]);
      if (message) message.textContent = "Cadastro criado. No Supabase, o e-mail de confirmação será enviado automaticamente.";
      setAuthSession(user, "local");
    } else {
      const user = users.find((item) => item.email === email && item.password === password);
      if (!user) {
        if (message) message.textContent = "Conta não encontrada. Faça o cadastro primeiro.";
        return;
      }
      setAuthSession(user, "local");
    }
    renderSidebarProfile();
    render();
  } catch (error) {
    if (message) message.textContent = error.message || "Não foi possível acessar agora.";
  } finally {
    submit.disabled = false;
  }
}

function handleClick(event) {
  const clickedAction = event.target.closest("[data-action]");
  if (!event.target.closest(".floating-popover, [data-action='open-profile-menu'], [data-action='open-notifications'], [data-action='open-create-menu']")) closeFloatingPanels();

  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    state.route = routeButton.dataset.route;
    closeFloatingPanels();
    render();
    return;
  }

  const viewButton = event.target.closest("[data-project-view]");
  if (viewButton) {
    state.activeProjectView = viewButton.dataset.projectView;
    render();
    return;
  }

  const settingsButton = event.target.closest("[data-settings-tab]");
  if (settingsButton) {
    state.settingsTab = settingsButton.dataset.settingsTab;
    render();
    return;
  }

  const calendarViewButton = event.target.closest("[data-calendar-view]");
  if (calendarViewButton) {
    state.calendarView = calendarViewButton.dataset.calendarView;
    persistState();
    render();
    return;
  }

  const calendarMonthButton = event.target.closest("[data-calendar-month]");
  if (calendarMonthButton) {
    state.calendarCursor = shiftCalendarMonth(Number(calendarMonthButton.dataset.calendarMonth));
    persistState();
    render();
    return;
  }

  if (event.target.closest("[data-calendar-today]")) {
    state.calendarCursor = TODAY_ISO;
    persistState();
    render();
    return;
  }

  if (event.target.closest("#process-brain")) {
    processBrainDump();
    return;
  }
  if (event.target.closest("#create-project")) {
    createProject();
    return;
  }
  if (event.target.closest("#calculate-deadline")) {
    calculateDeadline();
    return;
  }
  if (event.target.closest("#add-custom-service")) {
    addCustomService();
    return;
  }
  if (event.target.closest("#connect-google-calendar")) {
    connectGoogleCalendar();
    return;
  }
  if (event.target.closest("#add-calendar-event")) {
    addCalendarEvent();
    return;
  }

  const action = clickedAction;
  if (action?.dataset.action === "start-focus") {
    startFocusTask();
    return;
  }
  if (action?.dataset.action === "postpone-focus") {
    postponeFocusTask();
    return;
  }
  if (action?.dataset.action === "open-create") {
    openCreateModal();
    return;
  }
  if (action?.dataset.action === "open-create-menu") {
    openCreateMenu();
    return;
  }
  if (action?.dataset.action === "open-task") {
    openCreateModal("task", action.dataset.hour || "");
    return;
  }
  if (action?.dataset.action === "open-event") {
    openCreateModal("event", action.dataset.hour || "", action.dataset.date || "");
    return;
  }
  if (action?.dataset.action === "open-commitment") {
    openCreateModal("event", action.dataset.hour || "", action.dataset.date || "");
    return;
  }
  if (action?.dataset.action === "start-dictation") {
    startBrainDictation();
    return;
  }
  if (action?.dataset.action === "open-timer") {
    openTimerWidget(action.dataset.taskId || "");
    return;
  }
  if (action?.dataset.action === "timer-start") {
    toggleTimerRunning();
    return;
  }
  if (action?.dataset.action === "timer-finish") {
    finishTimer();
    return;
  }
  if (action?.dataset.action === "timer-minimize") {
    minimizeTimer();
    return;
  }
  if (action?.dataset.action === "timer-close") {
    closeTimerWidget();
    return;
  }
  if (action?.dataset.action === "open-notifications") {
    openNotifications();
    return;
  }
  if (action?.dataset.action === "clear-notifications") {
    clearNotifications();
    return;
  }
  if (action?.dataset.action === "open-member") {
    openMemberModal();
    return;
  }
  if (action?.dataset.action === "open-profile") {
    openProfileModal();
    return;
  }
  if (action?.dataset.action === "toggle-theme") {
    toggleTheme();
    return;
  }
  if (action?.dataset.action === "open-profile-menu") {
    openProfileMenu();
    return;
  }
  if (action?.dataset.action === "logout") {
    logout();
    return;
  }
  if (action?.dataset.action === "open-project") {
    openCreateModal("project");
    return;
  }
  if (action?.dataset.action === "open-note") {
    openCreateModal("note");
    return;
  }
  if (action?.dataset.action === "open-file") {
    openCreateModal("file");
    return;
  }
  if (action?.dataset.action === "close-modal") {
    closeModal();
    return;
  }
  if (event.target.closest("#timer-play")) {
    startSimpleTimer();
    return;
  }

  const summary = event.target.closest("[data-summary]");
  if (summary) {
    if (state.route !== "timeline") state.route = "tasks";
    state.taskFilter = summary.dataset.summary;
    render();
  }

  const doneButton = event.target.closest("[data-task-done]");
  if (doneButton) {
    updateTaskStatus(doneButton.dataset.taskDone, "concluida");
    return;
  }

  const projectStepButton = event.target.closest("[data-project-step]");
  if (projectStepButton) {
    toggleProjectStep(projectStepButton.dataset.projectStep, Number(projectStepButton.dataset.stepIndex));
    return;
  }

  const taskOpenButton = event.target.closest("[data-task-open]");
  const taskInteractive = event.target.closest("button, select, input, textarea");
  if (taskOpenButton && (!taskInteractive || taskInteractive === taskOpenButton)) {
    openTaskDetail(taskOpenButton.dataset.taskOpen || findTaskByName(taskOpenButton.dataset.taskName)?.id);
    return;
  }

  const projectOpenButton = event.target.closest("[data-project-open]");
  const projectInteractive = event.target.closest("button, select, input, textarea");
  if (projectOpenButton && (!projectInteractive || projectInteractive === projectOpenButton)) {
    openProjectDetail(projectOpenButton.dataset.projectOpen);
    return;
  }

  const eventOpenButton = event.target.closest("[data-event-open]");
  if (eventOpenButton) {
    openEventDetail(eventOpenButton.dataset.eventOpen);
    return;
  }

  const serviceOpenButton = event.target.closest("[data-service-open]");
  if (serviceOpenButton && !event.target.closest("button, select, input, textarea")) {
    openServiceModal(serviceOpenButton.dataset.serviceOpen);
    return;
  }

  const memberOpenButton = event.target.closest("[data-member-open]");
  if (memberOpenButton && !event.target.closest("button, select, input, textarea")) {
    openMemberModal(memberOpenButton.dataset.memberOpen);
    return;
  }

  const deleteTaskButton = event.target.closest("[data-task-delete]");
  if (deleteTaskButton) {
    deleteTask(deleteTaskButton.dataset.taskDelete);
    return;
  }

  const deleteProjectButton = event.target.closest("[data-project-delete]");
  if (deleteProjectButton) {
    deleteProject(deleteProjectButton.dataset.projectDelete);
    return;
  }

  const deleteEventButton = event.target.closest("[data-event-delete]");
  if (deleteEventButton) {
    deleteEvent(deleteEventButton.dataset.eventDelete);
    return;
  }

  const deleteNoteButton = event.target.closest("[data-note-delete]");
  if (deleteNoteButton) {
    deleteNote(Number(deleteNoteButton.dataset.noteDelete));
    return;
  }

  const deleteFileButton = event.target.closest("[data-file-delete]");
  if (deleteFileButton) {
    deleteFile(Number(deleteFileButton.dataset.fileDelete));
    return;
  }

  const serviceStepAdd = event.target.closest("[data-service-step-add]");
  if (serviceStepAdd) {
    addServiceStep(serviceStepAdd.dataset.serviceStepAdd);
    return;
  }

  const serviceStepRemove = event.target.closest("[data-service-step-remove]");
  if (serviceStepRemove) {
    removeServiceStep(serviceStepRemove.dataset.serviceStepRemove);
    return;
  }

  const serviceRemove = event.target.closest("[data-service-remove]");
  if (serviceRemove) {
    removeService(serviceRemove.dataset.serviceRemove);
    return;
  }

  const serviceSave = event.target.closest("[data-service-save]");
  if (serviceSave) {
    persistState();
    notify("Serviço salvo.");
    closeModal();
    render();
    return;
  }

  const memberRemove = event.target.closest("[data-member-remove]");
  if (memberRemove) {
    removeMember(memberRemove.dataset.memberRemove);
    return;
  }
}

function handleSubmit(event) {
  const form = event.target;
  if (form.matches("[data-auth-form]")) {
    event.preventDefault();
    handleAuthSubmit(form);
    return;
  }
  if (form.matches("[data-flow-form]")) {
    event.preventDefault();
    submitFlowMessage();
    return;
  }
  if (form.matches("[data-google-config]")) {
    event.preventDefault();
    saveGoogleCalendarConfig(Object.fromEntries(new FormData(form)));
    return;
  }
  if (!form.matches("[data-create-form], [data-edit-task], [data-edit-project], [data-edit-event], [data-member-form], [data-profile-form]")) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (form.matches("[data-profile-form]")) {
    saveProfileFromForm(data);
    closeModal();
    return;
  }
  if (form.matches("[data-member-form]")) {
    saveMemberFromForm(form.dataset.memberForm, data);
    closeModal();
    return;
  }
  if (form.matches("[data-edit-task]")) updateTaskFromForm(form.dataset.editTask, data);
  if (form.matches("[data-edit-project]")) updateProjectFromForm(form.dataset.editProject, data);
  if (form.matches("[data-edit-event]")) updateEventFromForm(form.dataset.editEvent, data);
  if (form.dataset.createForm === "task") createTaskFromForm(data);
  if (form.dataset.createForm === "project") createProjectFromForm(data);
  if (form.dataset.createForm === "event") createEventFromForm(data);
  if (form.dataset.createForm === "note") createNoteFromForm(data);
  if (form.dataset.createForm === "file") createFileFromForm(data);
  closeModal();
}

function handleInput(event) {
  const input = event.target;
  if (!input.matches("#global-search")) return;
  state.searchQuery = input.value;
  render();
}

function saveGoogleCalendarConfig(data) {
  state.calendar.config = {
    calendarId: String(data.calendarId || "").trim(),
    clientId: String(data.clientId || "").trim(),
    redirectUrl: String(data.redirectUrl || "").trim(),
    syncMode: data.syncMode === "automatic" ? "automatic" : "manual",
    updatedAt: new Date().toISOString(),
  };
  if (state.calendar.config.calendarId) state.calendar.email = state.calendar.config.calendarId;
  persistState();
  notify("Configuração do Google Calendar salva.");
  render();
}

function handleChange(event) {
  const input = event.target;
  if (input.matches("[data-service-hours]")) {
    const [serviceId, stepId] = input.dataset.serviceHours.split("|");
    const service = state.services.find((item) => item.id === serviceId);
    const step = service.steps.find((item) => item.id === stepId);
    step.hours = Number(input.value);
    persistState();
  }
  if (input.matches("[data-service-title]")) {
    const [serviceId, stepId] = input.dataset.serviceTitle.split("|");
    const service = state.services.find((item) => item.id === serviceId);
    const step = service.steps.find((item) => item.id === stepId);
    step.title = input.value;
    persistState();
  }
  if (input.matches("[data-step-active]")) {
    const [serviceId, stepId] = input.dataset.stepActive.split("|");
    const service = state.services.find((item) => item.id === serviceId);
    const step = service.steps.find((item) => item.id === stepId);
    step.active = input.checked;
    persistState();
    render();
  }
  if (input.matches("[data-work-day]")) {
    const day = input.dataset.workDay;
    state.workConfig.workDays = input.checked ? [...new Set([...state.workConfig.workDays, day])] : state.workConfig.workDays.filter((item) => item !== day);
    persistState();
  }
  if (input.matches("[data-work-config]")) {
    const key = input.dataset.workConfig;
    state.workConfig[key] = Number(input.value);
    persistState();
    render();
  }
  if (input.matches("[data-task-status]")) updateTaskStatus(input.dataset.taskStatus, input.value);
  if (input.matches("[data-task-filter]")) {
    state.taskFilters[input.dataset.taskFilter] = input.value;
    persistState();
    render();
  }
  if (input.matches("[data-photo-upload]")) readPhotoUpload(input);
  if (input.matches("[data-has-time]")) {
    const timeField = input.closest("form")?.querySelector("[data-time-field]");
    if (timeField) timeField.hidden = !input.checked;
  }
}

function dashboardScreen() {
  const next = getRecommendedTask();
  const upcomingTasks = upcomingOperationalTasks().filter((item) => !next || item.id !== next.id).slice(0, 3);
  return `
    <section class="focus-dashboard clean-dashboard">
      <div class="focus-grid hero-dashboard-grid">
        <section class="focus-now-card">
          <div class="quiet-title">
            <div>
              <h2>Foco de agora</h2>
              <p>Sua próxima tarefa principal.</p>
            </div>
          </div>
          ${next ? `<article class="focus-task-card simple-focus" data-task-open="${next.id}">
            <div>
              <h3>${taskTitle(next)}</h3>
              <p>Projeto: ${taskProjectName(next)}</p>
              <p>Cliente: ${taskClientName(next)}</p>
              <p>Prazo: ${formatDate(taskDue(next))}${next.hour ? ` · ${next.hour}` : ""}</p>
              <div class="focus-status">${tag(next.priority)}${tag(next.label)}</div>
            </div>
            <button class="quiet-button" data-task-done="${next.id}" type="button">Concluir</button>
          </article>` : `<div class="focus-task-card simple-focus empty-focus"><div><h3>Tudo sob controle por enquanto.</h3><p>Quando algo ficar urgente, aparece aqui.</p></div></div>`}
        </section>

        <section class="next-three-card">
          <div class="quiet-title">
            <h2>Tarefas próximas</h2>
            <button class="quiet-link" data-route="tasks" type="button">Ver todas →</button>
          </div>
          <div class="next-task-list">
            ${upcomingTasks.map(nextTaskLine).join("") || `<div class="next-empty-line">Nada urgente depois do foco principal.</div>`}
          </div>
        </section>
      </div>

      <section class="today-agenda-card big-calendar-card">
        <div class="quiet-title">
          <div>
            <h2>Calendário</h2>
            <p>Sua visão completa de prazos e compromissos.</p>
          </div>
        </div>
        ${dashboardCalendar()}
      </section>
    </section>
  `;
}

function brainScreen() {
  const generated = (state.brainGeneratedIds || [])
    .map((id) => state.tasks.find((taskItem) => taskItem.id === id))
    .filter(Boolean);
  return `
    <div class="brain-page">
      <section class="panel panel-pad">
        <div class="section-head">
          <div>
            <p class="eyebrow">Organizar depois</p>
            <h2>Brain Dump</h2>
            <p>Escreva ou dite tudo solto. O sistema transforma em tarefas priorizadas.</p>
          </div>
          <button class="top-icon voice-button" data-action="start-dictation" type="button" aria-label="Ditado por voz">${iconSvg("mic")}<span>Ouvindo</span></button>
        </div>
        <textarea id="brain-input" placeholder="Ex: preciso revisar a apresentação amanhã, responder a cliente e separar referências do projeto novo."></textarea>
        <div style="margin-top:14px"><button class="primary-button" id="process-brain" type="button">Transformar em tarefas</button></div>
      </section>
      <section class="panel panel-pad brain-results-panel">
        <div class="section-head"><div><p class="eyebrow">Cards gerados</p><h2>Ordem sugerida</h2></div></div>
        <div class="task-list brain-compact-list" id="brain-results">${generated.map(taskRow).join("")}</div>
      </section>
    </div>
  `;
}

function projectsScreen() {
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <div>
          <p class="eyebrow">Projetos</p>
          <h2>Projetos em andamento</h2>
        </div>
        <div class="topbar-actions">
          <button class="flow-mini-button" data-action="ask-flow-project" type="button">${flowAiIcon("mini")} Perguntar à Flow IA</button>
          <div class="tabs">${["lista", "kanban", "calendario", "timeline", "semanal"].map((view) => tabButton(view)).join("")}</div>
        </div>
      </div>
      ${projectView()}
    </section>
  `;
}

function tasksScreen() {
  const filtered = searchItems(applyTaskFilters(state.taskFilter ? filterTasks(state.taskFilter) : sortedTasks(state.tasks)), ["title", "name", "project", "category", "label", "priority", "status", "responsible"]);
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <div><p class="eyebrow">Prioridade inteligente</p><h2>${state.taskFilter ? `Filtro: ${displayLabel(state.taskFilter)}` : "Tarefas organizadas por urgência real"}</h2></div>
        <div class="topbar-actions">
          ${state.taskFilter ? `<button class="glass-button" data-summary="" type="button">Limpar filtro</button>` : ""}
        </div>
      </div>
      <div class="task-filter-bar">
        ${["", "pendente", "em progresso", "concluida", "urgente", "atrasado", "hoje", "esta semana"].map((filter) => `<button class="${state.taskFilter === filter ? "active" : ""}" data-summary="${filter}" type="button">${filter ? displayLabel(filter) : "todas"}</button>`).join("")}
      </div>
      <div class="task-filter-fields">
        <select data-task-filter="status"><option value="">Status</option>${["pendente", "em progresso", "aguardando", "revisão", "concluida"].map((status) => `<option value="${status}" ${state.taskFilters.status === status ? "selected" : ""}>${displayLabel(status)}</option>`).join("")}</select>
        <select data-task-filter="priority"><option value="">Prioridade</option>${["urgente", "importante", "pode esperar"].map((priority) => `<option value="${priority}" ${state.taskFilters.priority === priority ? "selected" : ""}>${priority}</option>`).join("")}</select>
        <select data-task-filter="assignedTo"><option value="">Responsável</option>${memberOptions(state.taskFilters.assignedTo)}</select>
        <select data-task-filter="projectId">${projectOptions(state.taskFilters.projectId).replace("Sem projeto", "Projeto")}</select>
        <input data-task-filter="dueDate" type="date" value="${state.taskFilters.dueDate || ""}" />
      </div>
      <div class="task-list">${filtered.map(taskEditableRow).join("") || empty("Nenhuma tarefa encontrada.")}</div>
    </section>
  `;
}

function agendaScreen() {
  return `
    <section class="agenda-pro">
      <div class="agenda-metrics">
        ${agendaMetric("Atrasados", 3, "Requerem atenção", "red")}
        ${agendaMetric("Vencem hoje", 5, "Foco total", "orange")}
        ${agendaMetric("Esta semana", 12, "Próximos 7 dias", "blue")}
        ${agendaMetric("Próximos 30 dias", 28, "No radar", "green")}
        ${agendaMetric("Sem prazo", 2, "Definir data", "purple")}
      </div>

      <article class="deadline-table-card">
        <div class="card-title">
          <h2>Todos os prazos</h2>
          <button class="glass-button" type="button">Ordenar: Data ↑</button>
        </div>
        <div class="deadline-tabs"><span class="active">Lista</span><span>Por projeto</span><span>Por prioridade</span></div>
        <div class="deadline-table">
          <div class="deadline-head"><span>Prazo</span><span>Tarefa</span><span>Projeto</span><span>Prioridade</span><span>Status</span></div>
          ${deadlineRow("15/05", "-2 dias", "Revisar apresentação", "Identidade Visual", "Urgente", "A fazer", "red")}
          ${deadlineRow("16/05", "-1 dia", "Enviar ajustes do logo", "Identidade Visual", "Importante", "A fazer", "orange")}
          ${deadlineRow("20/05", "Hoje", "Criar conceito visual", "Identidade Visual", "Urgente", "Em andamento", "red")}
          ${deadlineRow("20/05", "Hoje", "Responder cliente do site", "Site Institucional", "Importante", "A fazer", "orange")}
          ${deadlineRow("Qui, 23/05", "Esta semana", "Entrega da home", "Site Institucional", "Urgente", "A fazer", "red")}
        </div>
      </article>

      <aside class="agenda-side">
        <article class="panel-card">
          <div class="card-title"><h2>Calendário de prazos</h2></div>
          ${miniCalendar()}
        </article>
        <article class="panel-card">
          <div class="card-title"><h2>Entregas principais</h2><a href="#">Ver todas</a></div>
          ${projectMini("Identidade Visual", "Entrega final", 68, "cyan")}
          ${projectMini("Site Institucional", "Layout completo", 45, "blue")}
          ${projectMini("Social Media", "10 artes", 72, "deep")}
        </article>
      </aside>
    </section>
  `;
}

function calendarScreen() {
  return `
    <section class="panel panel-pad">
      <div class="section-head"><div><p class="eyebrow">Calendário</p><h2>Maio e Junho de entregas</h2></div></div>
      <div class="calendar">${calendarCells()}</div>
    </section>
  `;
}

function eventsScreen() {
  const cursor = parseISODate(state.calendarCursor || TODAY_ISO);
  const month = cursor.getMonth();
  const year = cursor.getFullYear();
  const events = [...(state.calendar?.events || [])]
    .filter((event) => {
      const date = parseISODate(event.date || TODAY_ISO);
      return date.getMonth() === month && date.getFullYear() === year;
    })
    .sort((a, b) => `${a.date || ""} ${a.hour || ""}`.localeCompare(`${b.date || ""} ${b.hour || ""}`));
  const counts = {
    reuniao: events.filter((event) => event.type === "reuniao").length,
    compromisso: events.filter((event) => event.type === "compromisso").length,
    evento: events.filter((event) => event.type === "evento").length,
    bloqueio: events.filter((event) => event.type === "bloqueio").length,
    ausencia: events.filter((event) => event.type === "ausencia").length,
  };
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <div><p class="eyebrow">Eventos</p><h2>${monthName(cursor)}</h2><p>Reuniões, compromissos, eventos e bloqueios do calendário.</p></div>
        <button class="primary-button" data-action="open-event" type="button">+ Evento</button>
      </div>
      <div class="event-summary-grid">
        ${agendaMetric("Reuniões", counts.reuniao, "calls e alinhamentos", "blue", "reuniao")}
        ${agendaMetric("Compromissos", counts.compromisso, "agenda externa", "cyan", "compromisso")}
        ${agendaMetric("Eventos", counts.evento, "marcos importantes", "green", "evento")}
        ${agendaMetric("Bloqueios", counts.bloqueio + counts.ausencia, "dias/horários indisponíveis", "rose", "bloqueio")}
      </div>
      <div class="event-list">
        ${events.map((event) => `
          <button class="event-row" data-event-open="${event.id}" type="button">
            <time><strong>${formatDate(event.date)}</strong><span>${event.hour || "--:--"}</span></time>
            <div><h3>${event.title}</h3><p>${event.notes || event.type}</p></div>
            ${tag(event.type)}
          </button>
        `).join("") || empty("Nenhum evento cadastrado neste mês.")}
      </div>
    </section>
  `;
}

function timelineScreen() {
  const items = operationalTimelineItems();
  const filtered = state.taskFilter ? items.filter((item) => item.label === state.taskFilter || item.priority === state.taskFilter) : items;
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <div><p class="eyebrow">Timeline</p><h2>Sequência operacional</h2></div>
        <div class="tabs">${["", "atrasado", "urgente", "hoje", "esta semana"].map((filter) => `<button class="${state.taskFilter === filter ? "active" : ""}" data-summary="${filter}" type="button">${filter || "todas"}</button>`).join("")}</div>
      </div>
      <div class="timeline-list">
        ${filtered.map((item) => `<button class="timeline-item" ${item.kind === "task" ? `data-task-open="${item.id}"` : item.kind === "project" ? `data-project-open="${item.id}"` : ""} type="button"><strong>${formatDate(item.iso)}</strong><div><h3>${item.title}</h3><p>${item.subtitle}</p></div>${tag(item.priority)}${tag(item.label)}</button>`).join("") || empty("Nenhuma tarefa nesse filtro.")}
      </div>
    </section>
  `;
}

function filesScreen() {
  const files = searchItems(state.files, ["name", "project", "tag"]);
  return `
    <div class="grid two">
      <section class="panel panel-pad">
        <div class="section-head"><div><p class="eyebrow">Central de arquivos</p><h2>Projetos, versões e favoritos</h2></div><button class="primary-button" data-action="open-file" type="button">Novo arquivo</button></div>
        <div class="dropzone"><div><strong>Arraste arquivos aqui</strong><p class="muted">Preview grande, versões e integrações futuras com Google Drive e Dropbox.</p></div></div>
      </section>
      <section class="panel panel-pad">
        <div class="section-head"><div><p class="eyebrow">Recentes</p><h2>Arquivos importantes</h2></div></div>
        <div class="task-list">${files.map((file, index) => `<div class="file-row"><div><strong>${file.name}</strong><p class="muted">${file.project} · ${file.tag}</p></div><div class="task-actions">${tag(file.version)}<button class="quiet-button danger" data-file-delete="${state.files.indexOf(file)}" type="button">Excluir</button></div></div>`).join("") || empty("Nenhum arquivo encontrado.")}</div>
      </section>
    </div>
  `;
}

function notesScreen() {
  const notes = searchItems(state.notes, ["title", "body"]);
  return `
    <section class="panel panel-pad">
      <div class="section-head"><div><p class="eyebrow">Notas</p><h2>Anotações rápidas</h2></div></div>
      <div class="note-list">${notes.map((note) => `<div class="note-row"><div><h3>${note.title}</h3><p>${note.body}</p></div><div class="task-actions"><button class="quiet-button" data-note-delete="${state.notes.indexOf(note)}" type="button">Excluir</button></div></div>`).join("") || empty("Nenhuma nota encontrada.")}</div>
      <div style="margin-top:16px"><button class="primary-button" data-action="open-note" type="button">Nova nota</button></div>
    </section>
  `;
}

function teamScreen() {
  return `
    <section class="panel panel-pad">
      <div class="section-head">
        <div><p class="eyebrow">Equipe</p><h2>Acessos e permissões</h2><p>Convites simples, com acesso limitado por função.</p></div>
        <button class="primary-button" data-action="open-member" type="button">Adicionar membro</button>
      </div>
      <div class="team-grid">
        ${state.members.map(memberCard).join("")}
        <button class="team-add-card" data-action="open-member" type="button">＋<span>Adicionar membro</span></button>
      </div>
    </section>
  `;
}

function settingsScreen() {
  const tabs = [
    ["servicos", "Serviços & Tempos"],
    ["agenda", "Agenda de trabalho"],
    ["integracoes", "Conexões"],
  ];
  return `
    <div class="settings-layout">
      <aside class="settings-menu">${tabs.map(([id, label]) => `<button class="${state.settingsTab === id ? "active" : ""}" data-settings-tab="${id}" type="button">${label}</button>`).join("")}</aside>
      <section class="panel panel-pad">${settingsContent()}</section>
    </div>
  `;
}

function settingsContent() {
  if (state.settingsTab === "agenda") {
    return `
      <div class="section-head"><div><p class="eyebrow">Capacidade real</p><h2>Dias e horas de trabalho</h2></div></div>
      <div class="form-grid">
        <label>Horas por dia<input data-work-config="hoursPerDay" type="number" value="${state.workConfig.hoursPerDay}" /></label>
        <label>Margem padrão (%)<input data-work-config="safetyMargin" type="number" value="${state.workConfig.safetyMargin}" /></label>
        <label>Trabalha em feriados<select><option>Não</option><option>Sim</option></select></label>
      </div>
      <div class="week-config">
        ${["seg", "ter", "qua", "qui", "sex", "sab", "dom"].map((day) => `<label><input data-work-day="${day}" type="checkbox" ${state.workConfig.workDays.includes(day) ? "checked" : ""} />${day}</label>`).join("")}
      </div>
    `;
  }
  if (state.settingsTab === "integracoes") {
    const config = state.calendar.config || {};
    const redirectUrl = config.redirectUrl || window.location.origin + window.location.pathname;
    return `
      <div class="section-head"><div><p class="eyebrow">Conexões</p><h2>Google Calendar</h2><p>Vincule seu calendário para trazer reuniões, compromissos, eventos, bloqueios e ausências para a agenda operacional.</p></div></div>
      <div class="integration-card">
        <div>
          <strong>${state.calendar.connected ? "Google Calendar preparado" : "Vincular Google Calendar"}</strong>
          <p>${state.calendar.connected ? `${state.calendar.email} · aguardando configuração OAuth para sincronização real` : "Conecte um calendário para centralizar reuniões, eventos, compromissos e ausências."}</p>
        </div>
        <button class="glass-button" id="connect-google-calendar" type="button">${state.calendar.connected ? "Reconectar" : "Vincular calendário"}</button>
      </div>
      <form class="google-config-card" data-google-config>
        <div class="section-head compact">
          <div>
            <p class="eyebrow">Configuração</p>
            <h3>Dados para sincronização</h3>
            <p>Use estes campos para preparar a conexão real com o Google Calendar via Supabase/OAuth.</p>
          </div>
        </div>
        <div class="form-grid">
          <label>Calendário / e-mail<input name="calendarId" value="${escapeHtml(config.calendarId || state.calendar.email || "")}" placeholder="seu@email.com ou primary" /></label>
          <label>Google Client ID<input name="clientId" value="${escapeHtml(config.clientId || "")}" placeholder="Client ID do Google Cloud" /></label>
          <label>URL de retorno<input name="redirectUrl" value="${escapeHtml(redirectUrl)}" /></label>
          <label>Sincronização<select name="syncMode">
            <option value="manual" ${config.syncMode !== "automatic" ? "selected" : ""}>Manual</option>
            <option value="automatic" ${config.syncMode === "automatic" ? "selected" : ""}>Automática</option>
          </select></label>
        </div>
        <div class="integration-actions">
          <button class="liquid-button subtle" type="submit">Salvar configuração</button>
          <button class="glass-button" id="connect-google-calendar" type="button">${state.calendar.connected ? "Testar vínculo" : "Vincular calendário"}</button>
        </div>
      </form>
    `;
  }
  return `
    <div class="section-head">
      <div><p class="eyebrow">Serviços & Tempos</p><h2>Tempos médios editáveis</h2><p>Estes dados alimentam o cronograma, a entrega segura e a previsão de sobrecarga.</p></div>
      <div class="topbar-actions"><button class="glass-button service-add-button" id="add-custom-service" type="button">+ Adicionar serviço</button></div>
    </div>
    <div class="service-card-grid">${state.services.map(serviceCard).join("")}</div>
  `;
}

function serviceCard(service) {
  const total = service.steps.reduce((sum, step) => sum + Number(step.hours || 0), 0);
  return `
    <article class="service-card" data-service-open="${service.id}">
      <div>
        <h3>${service.name}</h3>
        <p>${service.steps.length} etapas · ${total}h médias</p>
      </div>
      ${tag(service.complexity)}
    </article>
  `;
}

function serviceEditor(service) {
  const total = service.steps.filter((step) => step.active).reduce((sum, step) => sum + step.hours, 0);
  const minimumDays = Math.ceil((total * (1 + service.margin / 100)) / state.workConfig.hoursPerDay);
  return `
    <article class="service-row">
      <div class="section-head">
        <div><h3>${service.name}</h3><p>Complexidade ${service.complexity} · margem ${service.margin}% · mínimo sugerido ${minimumDays} dias úteis</p></div>
        <button class="quiet-button danger" data-service-remove="${service.id}" type="button">Remover serviço</button>
      </div>
      ${service.steps.map((step) => `
        <div class="service-step">
          <label>Etapa<input data-service-title="${service.id}|${step.id}" value="${step.title}" /></label>
          <label>Tempo<input data-service-hours="${service.id}|${step.id}" type="number" step="0.5" value="${step.hours}" /></label>
          <button class="icon-button danger" data-service-step-remove="${service.id}|${step.id}" type="button" aria-label="Remover etapa">×</button>
        </div>
      `).join("")}
      <div class="modal-actions service-editor-actions">
        <button class="glass-button" data-service-step-add="${service.id}" type="button">+ Adicionar etapa</button>
        <button class="primary-button" data-service-save="${service.id}" type="button">Salvar serviço</button>
      </div>
    </article>
  `;
}

function projectView() {
  if (state.activeProjectView === "kanban") {
    const cols = [
      ["pendente", "A fazer"],
      ["em progresso", "Em andamento"],
      ["revisão", "Revisão"],
      ["aguardando", "Aguardando"],
      ["concluida", "Concluído"],
    ];
    return `<div class="kanban">${cols.map(([status, label]) => `<div class="kanban-col"><h3>${label}</h3>${state.tasks.filter((item) => item.status === status).map((item) => `<button class="kanban-card" data-task-open="${item.id}" type="button"><strong>${taskTitle(item)}</strong><p>${taskProject(item)}</p>${tag(item.priority)}</button>`).join("") || `<p class="muted">Sem tarefas.</p>`}</div>`).join("")}</div>`;
  }
  if (state.activeProjectView === "calendario") return `<div class="calendar">${calendarCells()}</div>`;
  if (state.activeProjectView === "timeline") return `<div class="timeline-list">${state.projects.map((project) => `<button class="timeline-item" data-project-open="${project.id}" type="button"><strong>${formatDate(project.dueDate)}</strong><div><h3>${project.name}</h3><p>${project.currentStage}</p></div><div class="progress" style="width:110px"><span style="width:${project.progress}%"></span></div></button>`).join("")}</div>`;
  if (state.activeProjectView === "semanal") return `<div class="mini-grid">${weekChips()}</div>`;
  return `<div class="project-list">${state.projects.map(projectRow).join("")}</div>`;
}

function processBrainDump() {
  const text = document.querySelector("#brain-input").value.trim();
  if (!text) {
    state.brainGeneratedIds = [];
    persistState();
    const results = document.querySelector("#brain-results");
    if (results) results.innerHTML = "";
    notify("Escreva ou dite algo para organizar.");
    return;
  }
  const pieces = text
    .replace(/\./g, "")
    .split(/,| e |;|\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  const generated = pieces.map((part, index) => {
    const name = cleanupTaskName(part);
    const project = inferProject(part);
    const due = addDays(new Date(`${TODAY_ISO}T12:00:00`), index + (part.includes("sexta") ? 3 : 1)).toISOString().slice(0, 10);
    const priority = part.match(/finalizar|revisar|responder|sexta|cliente/i) ? "urgente" : index < 2 ? "importante" : "pode esperar";
    const label = classifyDueDate(due);
    const item = task(name, project, inferCategory(part), due, label, priority, "pendente");
    const linkedProject = state.projects.find((projectItem) => projectItem.name === project);
    item.projectId = linkedProject?.id || "";
    item.assignedTo = state.members[0]?.id || "";
    item.responsible = taskAssignee(item);
    item.notes = part;
    item.source = "brain-dump";
    return item;
  });
  state.tasks = [...generated, ...state.tasks];
  state.brainGeneratedIds = generated.map((item) => item.id);
  normalizeState();
  persistState();
  notify(`${generated.length} tarefas criadas.`);
  document.querySelector("#brain-results").innerHTML = generated
    .map((item) => taskRow(item))
    .join("");
}

function createProject() {
  const name = document.querySelector("#new-project-name").value;
  const type = document.querySelector("#new-project-type").value;
  const due = document.querySelector("#new-project-due").value;
  const service = state.services.find((item) => item.name === type);
  state.projects.unshift({
    id: crypto.randomUUID(),
    name,
    type,
    dueDate: due,
    due,
    status: "planejado",
    progress: 8,
    currentStage: service.steps.find((step) => step.active).title,
    current: service.steps.find((step) => step.active).title,
    notes: "Fluxo automático criado a partir de Serviços & Tempos.",
    steps: service.steps.filter((step) => step.active).map((step) => ({ title: step.title, done: false, hours: step.hours })),
    tasks: [],
  });
  const project = state.projects[0];
  const start = new Date("2026-05-21");
  const generated = service.steps
    .filter((step) => step.active)
    .map((step, index) => {
      const item = task(capitalize(step.title), name, type.toLowerCase(), addBusinessDays(start, index + 1).toISOString().slice(0, 10), index < 2 ? "esta semana" : "pode esperar", index < 2 ? "importante" : "pode esperar", "pendente");
      item.projectId = project.id;
      item.duration = step.hours || 1;
      item.assignedTo = state.members[0]?.id || "";
      item.source = "project";
      return item;
    });
  state.tasks = [...generated, ...state.tasks];
  project.tasks = generated.map((item) => item.id);
  normalizeState();
  persistState();
  notify("Projeto criado com fluxo automático.");
  render();
}

function calculateDeadline() {
  const serviceName = document.querySelector("#deadline-service").value;
  const start = new Date(document.querySelector("#deadline-start").value);
  const client = new Date(document.querySelector("#deadline-client").value);
  const margin = Number(document.querySelector("#deadline-margin").value) / 100;
  const service = state.services.find((item) => item.name === serviceName);
  const totalHours = service.steps.filter((step) => step.active).reduce((sum, step) => sum + step.hours, 0);
  const delayedLoad = state.tasks.filter((item) => item.label === "atrasado").length * 2;
  const daysNeeded = Math.ceil(((totalHours + delayedLoad) * (1 + margin)) / state.workConfig.hoursPerDay);
  const safe = addBusinessDays(start, daysNeeded);
  const tight = addBusinessDays(start, Math.max(1, Math.ceil(totalHours / state.workConfig.hoursPerDay)));
  const risk = safe > client ? "alto" : "moderado";
  const reason = risk === "alto" ? "já existem projetos em criação e revisão nessa semana" : "há margem suficiente para ajustes sem comprimir foco profundo";
  document.querySelector("#deadline-result").innerHTML = `
    <div class="section-head">
      <div>
        <p class="eyebrow">Resultado</p>
        <h2>Entrega segura: ${formatDateISO(safe)}</h2>
        <p>Entrega apertada: ${formatDateISO(tight)} · Risco ${risk} · Motivo: ${reason}.</p>
      </div>
    </div>
    ${freeWindows()}
  `;
}

function duplicateService() {
  const first = state.services[0];
  state.services.unshift({
    ...structuredClone(first),
    id: crypto.randomUUID(),
    name: `${first.name} cópia`,
    steps: first.steps.map((step) => ({ ...step, id: crypto.randomUUID() })),
  });
  persistState();
  notify("Serviço duplicado.");
  render();
}

function addCustomService() {
  const service = {
    id: crypto.randomUUID(),
    name: "Serviço personalizado",
    complexity: "média",
    margin: 20,
    active: true,
    steps: [
      { id: crypto.randomUUID(), title: "briefing", hours: 1, active: true },
      { id: crypto.randomUUID(), title: "criação", hours: 3, active: true },
      { id: crypto.randomUUID(), title: "ajustes", hours: 1, active: true },
      { id: crypto.randomUUID(), title: "entrega", hours: 0.5, active: true },
    ],
  };
  state.services.unshift(service);
  persistState();
  notify("Serviço personalizado criado.");
  render();
  openServiceModal(service.id);
}

function addServiceStep(serviceId) {
  const service = state.services.find((item) => item.id === serviceId);
  if (!service) return;
  service.steps.push({ id: crypto.randomUUID(), title: "nova etapa", hours: 1, active: true });
  persistState();
  render();
  openServiceModal(serviceId);
}

function removeServiceStep(value) {
  const [serviceId, stepId] = value.split("|");
  const service = state.services.find((item) => item.id === serviceId);
  if (!service) return;
  service.steps = service.steps.filter((step) => step.id !== stepId);
  persistState();
  render();
  openServiceModal(serviceId);
}

function removeService(serviceId) {
  state.services = state.services.filter((service) => service.id !== serviceId);
  persistState();
  notify("Serviço removido.");
  closeModal();
  render();
}

function getRecommendedTask() {
  const candidates = upcomingOperationalTasks().filter((item) => ["atrasado", "hoje", "urgente", "atenção imediata", "entrega em breve"].includes(item.label) || item.priority === "urgente" || isTimeSoon(item));
  return candidates[0] || null;
}

function sortedTasks(items) {
  const score = (item) => {
    const days = daysUntil(taskDue(item));
    return (isDone(item) ? -300 : 0) + (item.label === "atrasado" ? 130 : 0) + (item.label === "atenção imediata" ? 110 : 0) + (item.label === "entrega em breve" ? 80 : 0) + (item.priority === "urgente" ? 60 : item.priority === "importante" ? 30 : 5) - days;
  };
  return [...items].sort((a, b) => score(b) - score(a));
}

function findTaskByName(name) {
  if (!name) return null;
  return state.tasks.find((item) => taskTitle(item) === name) || null;
}

function startBrainDictation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    notify("Ditado não disponível neste navegador.");
    return;
  }
  const button = document.querySelector(".voice-button");
  if (brainIsListening && brainRecognition) {
    brainRecognition.stop();
    return;
  }
  const recognition = new SpeechRecognition();
  brainRecognition = recognition;
  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.onstart = () => {
    brainIsListening = true;
    button?.classList.add("listening");
    notify("Ouvindo...");
  };
  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    const input = document.querySelector("#brain-input");
    input.value = `${input.value.trim()} ${text}`.trim();
    notify("Texto adicionado.");
  };
  recognition.onend = () => {
    brainIsListening = false;
    brainRecognition = null;
    button?.classList.remove("listening");
  };
  recognition.onerror = () => {
    brainIsListening = false;
    brainRecognition = null;
    button?.classList.remove("listening");
  };
  recognition.start();
}

function startSimpleTimer() {
  const display = document.querySelector("#timer-display");
  let remaining = 25 * 60;
  window.clearInterval(startSimpleTimer.timer);
  startSimpleTimer.timer = window.setInterval(() => {
    remaining -= 1;
    const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
    const seconds = String(remaining % 60).padStart(2, "0");
    if (display) display.textContent = `${minutes}:${seconds}`;
    if (remaining <= 0) window.clearInterval(startSimpleTimer.timer);
  }, 1000);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function startFocusTask() {
  const next = getRecommendedTask();
  if (!next) return;
  updateTaskStatus(next.id, "em progresso", false);
  state.route = "tasks";
  state.taskFilter = "";
  persistState();
  notify(`Tarefa iniciada: ${next.name}`);
  render();
}

function postponeFocusTask() {
  const next = getRecommendedTask();
  if (!next) return;
  state.tasks = state.tasks.filter((item) => item.id !== next.id).concat(next);
  persistState();
  notify("Tarefa movida para depois.");
  render();
}

function updateTaskStatus(id, status, shouldRender = true) {
  const item = state.tasks.find((taskItem) => taskItem.id === id);
  if (!item) return;
  item.status = status;
  if (status === "concluida") {
    item.label = "feito";
    item.priority = "pode esperar";
    celebrateDone(taskTitle(item));
  }
  normalizeState();
  persistState();
  notify(status === "concluida" ? "Uma tarefa a menos. Feito." : `Status atualizado: ${displayLabel(status)}`);
  if (shouldRender) render();
}

function updateTaskFromForm(id, data) {
  const item = state.tasks.find((taskItem) => taskItem.id === id);
  if (!item) return;
  const project = state.projects.find((projectItem) => projectItem.id === data.projectId);
  item.title = data.name;
  item.name = data.name;
  item.projectId = data.projectId || "";
  item.project = project?.name || "Sem projeto";
  item.assignedTo = data.assignedTo || "";
  item.responsible = taskAssignee(item);
  item.dueDate = data.due;
  item.due = data.due;
  item.hour = data.hasTime ? data.hour : "";
  item.duration = Number(data.duration || item.duration || 1);
  item.priority = data.priority;
  item.status = data.status;
  item.notes = data.notes || "";
  item.label = item.status === "concluida" ? "feito" : classifyDueDate(item.dueDate);
  normalizeState();
  persistState();
  notify("Tarefa atualizada.");
  render();
}

function filterTasks(filter) {
  if (!filter) return state.tasks;
  return state.tasks.filter((item) => item.label === filter || item.priority === filter || item.status === filter);
}

function applyTaskFilters(items) {
  const filters = state.taskFilters || {};
  return items.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    if (filters.assignedTo && item.assignedTo !== filters.assignedTo) return false;
    if (filters.projectId && item.projectId !== filters.projectId) return false;
    if (filters.dueDate && taskDue(item) !== filters.dueDate) return false;
    return true;
  });
}

function searchItems(items, keys) {
  const query = state.searchQuery.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => keys.some((key) => String(item[key] || "").toLowerCase().includes(query)));
}

function persistState() {
  const payload = statePayload();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  scheduleSupabaseSave(payload);
}

function statePayload() {
  return {
    version: 3,
    projects: state.projects,
    tasks: state.tasks,
    notes: state.notes,
    services: state.services,
    files: state.files,
    members: state.members,
    workConfig: state.workConfig,
    calendar: state.calendar,
    flowAi: state.flowAi,
    aiMemory: state.aiMemory,
    theme: state.theme,
    taskFilters: state.taskFilters,
    calendarView: state.calendarView,
    calendarCursor: state.calendarCursor,
    notificationsCleared: state.notificationsCleared,
    brainGeneratedIds: state.brainGeneratedIds,
    sidebarCollapsed: state.sidebarCollapsed,
    profile: state.profile,
    timer: state.timer,
  };
}

function scheduleSupabaseSave(payload) {
  const client = getSupabaseClient();
  if (!client || !authSession?.id || authSession.source !== "supabase") return;
  clearTimeout(supabaseSaveTimer);
  supabaseSaveTimer = setTimeout(() => {
    Promise.resolve(
      client.from("reveeflow_workspaces").upsert({
        user_id: authSession.id,
        email: authSession.email,
        data: payload,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
    ).catch((error) => {
      console.warn("ReveeFlow Supabase save failed", error);
    });
  }, 600);
}

async function loadStateFromSupabase() {
  const client = getSupabaseClient();
  if (!client || !authSession?.id || authSession.source !== "supabase") return;
  const { data, error } = await client.from("reveeflow_workspaces").select("data").eq("user_id", authSession.id).maybeSingle();
  if (!error && data?.data) {
    Object.assign(state, data.data);
    normalizeState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statePayload()));
  } else if (!error && !data) {
    scheduleSupabaseSave(statePayload());
  }
}

function hydrateState() {
  LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    if (parsed.version !== 3) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    Object.assign(state, parsed);
    if (!state.calendar) state.calendar = { connected: false, email: "", events: [] };
    if (!state.profile) state.profile = { name: "Juliana Silva", email: "juliana@reveeflow.com", role: "Designer", photo: "", accessCode: "JUL-FLOW2026" };
    if (!state.timer) state.timer = { open: false, minimized: false, running: false, taskId: "", stageLabel: "", startedAt: null, elapsed: 0, x: null, y: null };
    if (!state.flowAi) state.flowAi = { open: false, messages: [], pendingSuggestion: null };
    if (!Array.isArray(state.flowAi.messages)) state.flowAi.messages = [];
    if (!state.aiMemory) state.aiMemory = { user: {}, projectPatterns: {}, taskPatterns: {}, estimationHistory: [] };
    if (!state.theme) state.theme = "light";
    if (!state.taskFilters) state.taskFilters = { status: "", priority: "", assignedTo: "", projectId: "", dueDate: "" };
    if (!state.calendarView) state.calendarView = "semana";
    if (!state.calendarCursor) state.calendarCursor = state.calendarMonth === "Junho 2026" ? "2026-06-27" : TODAY_ISO;
    if (typeof state.notificationsCleared !== "boolean") state.notificationsCleared = false;
    if (!Array.isArray(state.brainGeneratedIds)) state.brainGeneratedIds = [];
    state.sidebarCollapsed = Boolean(state.sidebarCollapsed);
    if (!state.members) state.members = [
      { id: "member-1", initials: "JS", name: "Juliana Silva", email: "juliana@reveeflow.com", role: "Dono/Admin", permission: "todos os projetos", photo: "", accessCode: "JUL-FLOW2026" },
      { id: "member-2", initials: "DA", name: "Dani Amarante", email: "dani@reveeflow.com", role: "Designer", permission: "projetos atribuidos", photo: "", accessCode: "DAN-FLOW2026" },
    ];
    normalizeState();
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function normalizeState() {
  state.calendar ||= { connected: false, email: "", events: [] };
  state.calendar.events = Array.isArray(state.calendar.events) ? state.calendar.events : [];
  state.timer ||= { open: false, minimized: false, running: false, taskId: "", stageLabel: "", startedAt: null, elapsed: 0, x: null, y: null };
  state.flowAi ||= { open: false, messages: [], pendingSuggestion: null };
  state.flowAi.messages = Array.isArray(state.flowAi.messages) ? state.flowAi.messages : [];
  state.aiMemory ||= { user: {}, projectPatterns: {}, taskPatterns: {}, estimationHistory: [] };
  state.members = Array.isArray(state.members) ? state.members : [];
  state.projects = Array.isArray(state.projects) ? state.projects : [];
  state.tasks = Array.isArray(state.tasks) ? state.tasks : [];
  state.notes = Array.isArray(state.notes) ? state.notes : [];
  state.files = Array.isArray(state.files) ? state.files : [];
  state.services = Array.isArray(state.services) && state.services.length ? state.services : createDefaultServices();
  state.workConfig ||= { hoursPerDay: 6, margin: 25, workDays: ["Seg", "Ter", "Qua", "Qui", "Sex"], holidays: "nao" };
  repairStoredPortugueseText();
  if (state.profile?.name) {
    const owner = state.members.find((member) => member.id === "profile-owner") || state.members.find((member) => member.email === state.profile.email);
    if (owner) {
      owner.id ||= "profile-owner";
      owner.name = state.profile.name;
      owner.email = state.profile.email;
      owner.role = state.profile.role;
      owner.photo = state.profile.photo || owner.photo || "";
      owner.avatar = owner.photo;
      owner.permission = "todos os projetos";
    } else {
      state.members.unshift({ id: "profile-owner", name: state.profile.name, email: state.profile.email, role: state.profile.role, photo: state.profile.photo || "", avatar: state.profile.photo || "", permission: "todos os projetos", accessCode: state.profile.accessCode });
    }
  }
  state.projects.forEach((project) => {
    project.id ||= crypto.randomUUID();
    project.name ||= "Projeto sem nome";
    project.client ||= "";
    project.type ||= "Design Avulso";
    project.dueDate ||= project.due || TODAY_ISO;
    project.due = project.dueDate;
    if (!Array.isArray(project.steps) || !project.steps.length) {
      const service = state.services.find((item) => item.name === project.type);
      project.steps = (service?.steps || []).filter((step) => step.active).map((step) => ({ title: step.title, done: false, hours: step.hours }));
    }
    project.currentStage ||= project.current || "briefing";
    project.current = project.currentStage;
    project.status ||= projectTiming(project.start || TODAY_ISO, project.dueDate).tag;
    project.tasks = Array.isArray(project.tasks) ? project.tasks : [];
    project.notes ||= "";
  });
  state.members.forEach((member) => {
    member.id ||= crypto.randomUUID();
    member.name ||= "Membro";
    member.role ||= "Designer";
    member.avatar ||= member.photo || "";
    member.photo = member.avatar || member.photo || "";
    member.initials ||= initialsFromName(member.name);
  });
  state.tasks.forEach((item) => {
    item.id ||= crypto.randomUUID();
    item.title ||= item.name || "Tarefa sem nome";
    item.name = item.title;
    item.dueDate ||= item.due || TODAY_ISO;
    item.due = item.dueDate;
    item.status = item.status === "concluída" ? "concluida" : item.status || "pendente";
    item.label = item.label === "concluído" ? "concluido" : item.label;
    item.source ||= "manual";
    item.createdAt ||= new Date().toISOString();
    item.duration = Number(item.duration || item.estimatedDuration || 1);
    item.notes ||= "";
    if (!item.projectId && item.project) {
      const project = state.projects.find((projectItem) => projectItem.name === item.project);
      if (project) item.projectId = project.id;
    }
    item.project = taskProject(item);
    if (!item.assignedTo && item.responsible) {
      const member = state.members.find((memberItem) => memberItem.name === item.responsible);
      if (member) item.assignedTo = member.id;
    }
    if (!item.assignedTo && state.members[0]) item.assignedTo = state.members[0].id;
    item.responsible = taskAssignee(item);
    if (!isDone(item)) {
      item.label = smartTaskLabel(item);
      item.priority = item.priority && item.priority !== "automatica" ? item.priority : priorityFromLabel(item.label);
    } else {
      item.label = "concluido";
    }
  });
  state.projects.forEach((project) => {
    const projectTasks = linkedTasks(project.id);
    project.tasks = projectTasks.map((item) => item.id);
    const stages = Array.isArray(project.steps) ? project.steps : [];
    const done = projectTasks.length ? projectTasks.filter((item) => item.status === "concluida").length : stages.filter((step) => step.done).length;
    const total = projectTasks.length || stages.length;
    project.progress = total ? Math.round((done / total) * 100) : Number(project.progress || 0);
    const nextTask = sortedTasks(projectTasks).find((item) => item.status !== "concluida");
    const nextStage = stages.find((step) => !step.done);
    project.currentStage = nextTask?.title || nextStage?.title || project.currentStage || project.current || "entrega final";
    project.current = project.currentStage;
    project.status = projectTiming(project.start || TODAY_ISO, project.dueDate).tag;
  });
}

function repairStoredPortugueseText() {
  const targets = [state.projects, state.tasks, state.notes, state.files, state.members, state.services, state.calendar?.events].filter(Array.isArray);
  targets.forEach((collection) => collection.forEach(repairObjectText));
}

function repairObjectText(value) {
  if (!value || typeof value !== "object") return;
  const stableValueKeys = ["status", "label", "priority", "type", "source"];
  Object.entries(value).forEach(([key, item]) => {
    if (typeof item === "string" && !stableValueKeys.includes(key)) value[key] = repairPortugueseText(item);
    if (Array.isArray(item)) item.forEach(repairObjectText);
    if (item && typeof item === "object" && !Array.isArray(item)) repairObjectText(item);
  });
}

function repairPortugueseText(value) {
  return value
    .replace(/Organizacao/g, "Organização")
    .replace(/organizacao/g, "organização")
    .replace(/Confirmacao/g, "Confirmação")
    .replace(/confirmacao/g, "confirmação")
    .replace(/Informacoes/g, "Informações")
    .replace(/Informacao/g, "Informação")
    .replace(/informacoes/g, "informações")
    .replace(/informacao/g, "informação")
    .replace(/Rapidas/g, "Rápidas")
    .replace(/rapidas/g, "rápidas")
    .replace(/Rapido/g, "Rápido")
    .replace(/rapido/g, "rápido")
    .replace(/Codigo/g, "Código")
    .replace(/codigo/g, "código")
    .replace(/Alteracao/g, "Alteração")
    .replace(/alteracao/g, "alteração")
    .replace(/Ausencia/g, "Ausência")
    .replace(/ausencia/g, "ausência")
    .replace(/Calendario/g, "Calendário")
    .replace(/calendario/g, "calendário")
    .replace(/Configuracoes/g, "Configurações")
    .replace(/configuracoes/g, "configurações")
    .replace(/Observacoes/g, "Observações")
    .replace(/Observacao/g, "Observação")
    .replace(/observacoes/g, "observações")
    .replace(/observacao/g, "observação")
    .replace(/Anotacoes/g, "Anotações")
    .replace(/Anotacao/g, "Anotação")
    .replace(/anotacoes/g, "anotações")
    .replace(/anotacao/g, "anotação")
    .replace(/Criacao/g, "Criação")
    .replace(/criacao/g, "criação")
    .replace(/Revisao/g, "Revisão")
    .replace(/revisao/g, "revisão")
    .replace(/Responsavel/g, "Responsável")
    .replace(/responsavel/g, "responsável")
    .replace(/Atencao/g, "Atenção")
    .replace(/atencao/g, "atenção")
    .replace(/Proximo/g, "Próximo")
    .replace(/proximo/g, "próximo")
    .replace(/Servicos/g, "Serviços")
    .replace(/Servico/g, "Serviço")
    .replace(/servicos/g, "serviços")
    .replace(/servico/g, "serviço")
    .replace(/Duracao/g, "Duração")
    .replace(/duracao/g, "duração")
    .replace(/Execucao/g, "Execução")
    .replace(/execucao/g, "execução")
    .replace(/Pagina/g, "Página")
    .replace(/pagina/g, "página")
    .replace(/Paginas/g, "Páginas")
    .replace(/paginas/g, "páginas")
    .replace(/Simbolo/g, "Símbolo")
    .replace(/simbolo/g, "símbolo")
    .replace(/Aplicacoes/g, "Aplicações")
    .replace(/aplicacoes/g, "aplicações")
    .replace(/Apresentacao/g, "Apresentação")
    .replace(/apresentacao/g, "apresentação")
    .replace(/simbolo\/logotipo/g, "símbolo/logotipo")
    .replace(/aplicacoes/g, "aplicações")
    .replace(/apresentacao/g, "apresentação")
    .replace(/territorio verbal/g, "território verbal")
    .replace(/geracao de nomes/g, "geração de nomes")
    .replace(/analise de disponibilidade/g, "análise de disponibilidade")
    .replace(/revisao interna/g, "revisão interna")
    .replace(/paginas internas/g, "páginas internas")
    .replace(/revisao/g, "revisão")
    .replace(/solicitacao/g, "solicitação")
    .replace(/criacao/g, "criação")
    .replace(/Video/g, "Vídeo")
    .replace(/video/g, "vídeo")
    .replace(/Edicao/g, "Edição")
    .replace(/edicao/g, "edição")
    .replace(/Video \/ Edicao/g, "Vídeo / Edição")
    .replace(/referencia/g, "referência")
    .replace(/referencias/g, "referências")
    .replace(/edicao inicial/g, "edição inicial")
    .replace(/exportacao/g, "exportação")
    .replace(/concluida/g, "concluída")
    .replace(/Pecas Clinica Lume/g, "Peças Clínica Lume")
    .replace(/clinica/g, "clínica")
    .replace(/Clinica/g, "Clínica")
    .replace(/endereco/g, "endereço")
    .replace(/rodape/g, "rodapé")
    .replace(/reuniao/g, "reunião")
    .replace(/Reuniao/g, "Reunião")
    .replace(/nao/g, "não")
    .replace(/nao /g, "não ")
    .replace(/titulo/g, "título")
    .replace(/Titulo/g, "Título");
}

function notify(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function celebrateDone(name) {
  const burst = document.createElement("div");
  burst.className = "done-burst";
  burst.innerHTML = `<strong>-1 tarefa</strong><span>${name} concluída</span>`;
  document.body.appendChild(burst);
  window.setTimeout(() => burst.classList.add("show"), 20);
  window.setTimeout(() => burst.remove(), 1900);
}

function openCreateModal(type = state.route === "projects" ? "project" : state.route === "notes" ? "note" : "task", hour = "", date = "") {
  closeFloatingPanels();
  const titles = { task: "Nova tarefa", project: "Novo projeto", event: "Novo evento", note: "Nova nota", file: "Novo arquivo" };
  modalTitle.textContent = titles[type];
  modalContent.innerHTML = type === "project" ? projectForm() : type === "event" ? eventForm(hour, date) : type === "note" ? noteForm() : type === "file" ? fileForm() : taskForm(hour);
  modalBackdrop.hidden = false;
  bindInteractiveElements();
}

function openCreateMenu() {
  togglePopover("create-popover", document.querySelector(".add-button"), `
    <div class="create-menu">
      <button data-action="open-task" type="button">${iconSvg("tasks")}<span>Nova tarefa</span></button>
      <button data-action="open-project" type="button">${iconSvg("projects")}<span>Novo projeto</span></button>
      <button data-action="open-event" type="button">${iconSvg("calendar")}<span>Novo evento</span></button>
      <button data-action="open-commitment" type="button">${iconSvg("agenda")}<span>Novo compromisso</span></button>
      <button data-action="open-note" type="button">${iconSvg("notes")}<span>Nova nota</span></button>
    </div>
  `);
}

function openTimerWidget(taskId = "") {
  const fallback = getRecommendedTask();
  state.timer.open = true;
  state.timer.minimized = false;
  state.timer.taskId = taskId || state.timer.taskId || fallback?.id || "";
  state.timer.stageLabel = state.timer.taskId ? taskTitle(state.tasks.find((item) => item.id === state.timer.taskId) || {}) : "Sem tarefa vinculada";
  persistState();
  renderTimerWidget();
}

function timerElapsed() {
  const base = Number(state.timer.elapsed || 0);
  if (!state.timer.running || !state.timer.startedAt) return base;
  return base + Math.floor((Date.now() - Number(state.timer.startedAt)) / 1000);
}

function formatTimer(seconds) {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${secs}`;
}

function renderTimerWidget() {
  let widget = document.querySelector("#timer-widget");
  if (!state.timer?.open) {
    widget?.remove();
    window.clearInterval(timerTicker);
    timerTicker = null;
    return;
  }
  if (!widget) {
    widget = document.createElement("section");
    widget.id = "timer-widget";
    widget.className = "timer-widget";
    document.body.appendChild(widget);
    makeTimerDraggable(widget);
  }
  widget.classList.toggle("minimized", Boolean(state.timer.minimized));
  widget.innerHTML = `
    <div class="timer-widget-head" data-timer-drag>
      <strong id="timer-widget-time">${formatTimer(timerElapsed())}</strong>
      <button class="timer-play" data-action="timer-start" type="button" aria-label="${state.timer.running ? "Pausar timer" : "Iniciar timer"}">${state.timer.running ? "Ⅱ" : "▶"}</button>
      <button class="timer-close" data-action="timer-close" type="button" aria-label="Fechar timer">×</button>
    </div>
    <p>Work timer</p>
  `;
  widget.style.left = state.timer.x ? `${state.timer.x}px` : "";
  widget.style.top = state.timer.y ? `${state.timer.y}px` : "";
  widget.style.right = state.timer.x ? "auto" : "28px";
  widget.style.bottom = state.timer.y ? "auto" : "28px";
  widget.querySelector(".timer-play")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleTimerRunning();
  });
  widget.querySelector(".timer-close")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeTimerWidget();
  });
  if (state.timer.running && !timerTicker) {
    timerTicker = window.setInterval(() => {
      const display = document.querySelector("#timer-widget-time");
      if (display) display.textContent = formatTimer(timerElapsed());
    }, 1000);
  }
  if (!state.timer.running && timerTicker) {
    window.clearInterval(timerTicker);
    timerTicker = null;
  }
}

function toggleTimerRunning() {
  if (state.timer.running) {
    state.timer.elapsed = timerElapsed();
    state.timer.startedAt = null;
    state.timer.running = false;
  } else {
    state.timer.startedAt = Date.now();
    state.timer.running = true;
  }
  persistState();
  renderTimerWidget();
}

function finishTimer() {
  const seconds = timerElapsed();
  if (state.timer.taskId) {
    const item = state.tasks.find((taskItem) => taskItem.id === state.timer.taskId);
    if (item) {
      item.timeLogs ||= [];
      item.timeLogs.push({ seconds, finishedAt: new Date().toISOString() });
    }
  }
  state.timer.running = false;
  state.timer.startedAt = null;
  state.timer.elapsed = 0;
  persistState();
  notify("Tempo registrado.");
  renderTimerWidget();
}

function minimizeTimer() {
  state.timer.minimized = !state.timer.minimized;
  persistState();
  renderTimerWidget();
}

function closeTimerWidget() {
  state.timer.open = false;
  state.timer.running = false;
  state.timer.startedAt = null;
  state.timer.elapsed = 0;
  persistState();
  renderTimerWidget();
}

function makeTimerDraggable(widget) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  widget.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    if (!event.target.closest("[data-timer-drag]")) return;
    dragging = true;
    offsetX = event.clientX - widget.getBoundingClientRect().left;
    offsetY = event.clientY - widget.getBoundingClientRect().top;
    widget.setPointerCapture(event.pointerId);
  });
  widget.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    state.timer.x = Math.max(12, Math.min(window.innerWidth - widget.offsetWidth - 12, event.clientX - offsetX));
    state.timer.y = Math.max(12, Math.min(window.innerHeight - widget.offsetHeight - 12, event.clientY - offsetY));
    widget.style.left = `${state.timer.x}px`;
    widget.style.top = `${state.timer.y}px`;
    widget.style.right = "auto";
    widget.style.bottom = "auto";
  });
  widget.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    persistState();
  });
}

function renderFlowIA() {
  if (!isAuthenticated()) {
    document.querySelector("#flow-ai-root")?.remove();
    return;
  }
  let root = document.querySelector("#flow-ai-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "flow-ai-root";
    document.body.appendChild(root);
  }
  const messages = state.flowAi.messages || [];
  const alerts = flowAlerts();
  root.innerHTML = `
    <button class="flow-ai-launcher" data-action="open-flow-ai" type="button" aria-label="Abrir Flow IA">${flowAiIcon()}</button>
    <aside class="flow-ai-panel ${state.flowAi.open ? "open" : ""}" aria-label="Flow IA">
      <header class="flow-ai-head">
        <div class="flow-ai-brand"><span class="flow-ai-symbol">${flowAiIcon()}</span><div class="flow-ai-title"><strong>Flow IA</strong><small>Seu assistente operacional</small></div></div>
        <nav class="flow-ai-tools" aria-label="Ações da Flow IA">
          <button data-action="flow-new-conversation" type="button">Nova</button>
          <button data-action="flow-clear-conversation" type="button">Limpar</button>
          <button data-action="close-flow-ai" type="button" aria-label="Fechar Flow IA">×</button>
        </nav>
      </header>
      <div class="flow-ai-body">
        ${alerts.length ? `<div class="flow-ai-alerts">${alerts.map((alert) => {
          const openAttr = alert.taskId ? `data-task-open="${alert.taskId}"` : alert.projectId ? `data-project-open="${alert.projectId}"` : "";
          return `<button class="flow-ai-alert" ${openAttr} type="button"><strong>${escapeHtml(alert.title)}</strong><span>${escapeHtml(alert.message)}</span></button>`;
        }).join("")}</div>` : ""}
        ${messages.length ? messages.map(flowMessageMarkup).join("") : flowWelcomeMarkup()}
      </div>
      <form class="flow-ai-composer" data-flow-form>
        <input name="message" id="flow-ai-input" autocomplete="off" placeholder="Pergunte sobre prazos, prioridades ou organização..." />
        <button data-action="flow-send" type="submit" aria-label="Enviar">→</button>
      </form>
    </aside>
  `;
  bindInteractiveElements();
}

function flowWelcomeMarkup() {
  const quick = [
    "O que faço agora?",
    "Organizar meu dia",
    "Organizar minha semana",
    "Calcular prazo",
    "Posso aceitar projeto?",
    "Estou atrasada",
    "Reorganizar timeline",
  ];
  return `
    <div class="flow-message assistant">
      <p>Oi. Eu olho seus prazos, tarefas e agenda para te ajudar a decidir o próximo passo com calma.</p>
    </div>
    <div class="flow-quick-list">
      ${quick.map((item) => `<button data-action="flow-quick" data-prompt="${escapeHtml(item)}" type="button">${item}</button>`).join("")}
    </div>
  `;
}

function flowMessageMarkup(message) {
  const actions = (message.actions || []).map((action) => `<button data-action="flow-apply" data-flow-apply="${action.id}" type="button">${escapeHtml(action.label)}</button>`).join("");
  const followUp = message.role === "assistant" ? flowFollowUpMarkup() : "";
  return `
    <div class="flow-message ${message.role}">
      <p>${formatFlowText(message.content)}</p>
      ${actions ? `<div class="flow-message-actions">${actions}</div>` : ""}
      ${followUp}
    </div>
  `;
}

function formatFlowText(content) {
  return escapeHtml(repairPortugueseText(content || "")).replace(/\n/g, "<br>");
}

function flowFollowUpMarkup() {
  const items = ["Organizar meu dia", "Organizar minha semana", "Calcular prazo", "Reorganizar timeline"];
  return `
    <div class="flow-followup">
      <span>Posso fazer mais alguma dessas ações?</span>
      <div>
        ${items.map((item) => `<button data-action="flow-quick" data-prompt="${escapeHtml(item)}" type="button">${item}</button>`).join("")}
        <button data-action="flow-new-question" type="button">Nova pergunta</button>
      </div>
    </div>
  `;
}

function openFlowIA(prompt = "") {
  state.flowAi.open = true;
  persistState();
  renderFlowIA();
  if (prompt) {
    const input = document.querySelector("#flow-ai-input");
    if (input) input.value = prompt;
  }
}

function closeFlowIA() {
  state.flowAi.open = false;
  persistState();
  renderFlowIA();
}

function clearFlowConversation() {
  state.flowAi.messages = [];
  state.flowAi.pendingSuggestion = null;
  state.flowAi.open = true;
  persistState();
  renderFlowIA();
  notify("Conversa limpa. A memória operacional foi mantida.");
}

function resetFlowConversation() {
  state.flowAi.messages = [];
  state.flowAi.pendingSuggestion = null;
  state.flowAi.open = true;
  persistState();
  renderFlowIA();
  focusFlowInput();
  notify("Nova conversa iniciada.");
}

function focusFlowInput() {
  state.flowAi.open = true;
  persistState();
  renderFlowIA();
  window.setTimeout(() => document.querySelector("#flow-ai-input")?.focus(), 20);
}

function submitFlowMessage() {
  const input = document.querySelector("#flow-ai-input");
  const message = input?.value.trim();
  if (!message) return;
  sendFlowMessage(message);
  if (input) input.value = "";
}

function sendFlowMessage(message) {
  state.flowAi.open = true;
  state.flowAi.messages.push({ id: crypto.randomUUID(), role: "user", content: message, createdAt: new Date().toISOString() });
  const reply = generateFlowReply(message);
  state.flowAi.messages.push(reply);
  state.flowAi.messages = state.flowAi.messages.slice(-30);
  persistState();
  renderFlowIA();
}

function buildFlowReply(content, actions = []) {
  return { id: crypto.randomUUID(), role: "assistant", content, actions, createdAt: new Date().toISOString() };
}

function flowAlerts() {
  const overdue = sortedTasks(state.tasks).filter((item) => !isDone(item) && item.label === "atrasado").slice(0, 2);
  const riskyProject = state.projects.find((project) => daysUntil(project.dueDate) <= 3 && project.progress < 80);
  const alerts = overdue.map((item) => ({
    taskId: item.id,
    title: "Tarefa atrasada",
    message: `${taskTitle(item)} · ${taskProjectName(item)} · Cliente: ${taskClientName(item)} precisa de atenção.`,
  }));
  if (riskyProject) {
    alerts.push({
      projectId: riskyProject.id,
      title: "Prazo em risco",
      message: `${riskyProject.name} está em ${riskyProject.progress || 0}% e entrega em ${formatDate(riskyProject.dueDate)}.`,
    });
  }
  return alerts.slice(0, 3);
}

function generateFlowReply(message) {
  const text = message.toLowerCase();
  const blocked = ["post", "legenda", "copy", "arte", "briefing criativo", "marketing", "financeiro", "aprovação"];
  if (blocked.some((word) => text.includes(word))) {
    return buildFlowReply("Eu posso te ajudar com organização, prazos, prioridades e cronograma. Para criação de conteúdo, financeiro ou aprovação, melhor manter fora da Flow IA.");
  }
  if (text.includes("agora") || text.includes("começo") || text.includes("prioridade") || text.includes("foco")) return flowNowReply();
  if (text.includes("dia")) return flowDayReply();
  if (text.includes("semana")) return flowWeekReply();
  if (text.includes("prazo") || text.includes("entrega") || text.includes("calcular")) return flowDeadlineReply(text);
  if (text.includes("aceitar") || text.includes("cabe") || text.includes("agenda suporta") || text.includes("mais um projeto")) return flowCapacityReply();
  if (text.includes("atras")) return flowLateReply();
  if (text.includes("reorganizar") || text.includes("timeline")) return flowTimelineSuggestion();
  if (text.includes("criar tarefa") || text.includes("transformar") || text.length > 90) return flowDumpSuggestion(message);
  return buildFlowReply("Posso te responder melhor olhando para uma decisão operacional. Me pergunte, por exemplo: “o que faço agora?”, “organiza meu dia”, “posso aceitar um projeto?” ou “calcula um prazo para identidade visual”.");
}

function flowNowReply() {
  const next = getRecommendedTask();
  const after = upcomingOperationalTasks().filter((item) => !next || item.id !== next.id).slice(0, 3);
  if (!next) return buildFlowReply("Tudo sob controle por enquanto.\n\nNão encontrei nenhuma tarefa atrasada, urgente ou com horário próximo. O melhor agora é manter a agenda limpa ou adiantar algo leve.");
  return buildFlowReply(`Faça agora:\n${taskTitle(next)}\n\nCliente:\n${taskClientName(next)}\n\nProjeto:\n${taskProjectName(next)}\n\nPrazo:\n${formatDate(taskDue(next))}\n\nTempo estimado:\n${formatHours(next.duration || 1)}\n\nMotivo:\n${flowTaskReason(next)}\n\nDepois disso:\n${after.map((item, index) => `${index + 1}. ${taskTitle(item)} · ${taskProjectName(item)} · Cliente: ${taskClientName(item)} · ${formatDate(taskDue(item))}`).join("\n") || "Nenhuma próxima tarefa crítica."}`);
}

function flowDayReply() {
  const tasks = upcomingOperationalTasks().slice(0, 4);
  if (!tasks.length) return buildFlowReply("Seu dia está leve.\n\nSugestão: reserve um bloco curto para revisar pendências e deixe espaço para criação sem pressão.");
  const startHour = Math.max(new Date().getHours(), 9);
  let cursor = startHour * 60;
  const blocks = tasks.map((item) => {
    const duration = Math.max(30, Number(item.duration || 1) * 60);
    const begin = minutesToHour(cursor);
    cursor += duration;
    return `${begin} — ${taskTitle(item)} · ${taskProjectName(item)} · Cliente: ${taskClientName(item)} (${formatHours(item.duration || 1)})`;
  });
  return buildFlowReply(`Organizei seu dia em uma ordem prática:\n\n${blocks.join("\n")}\n\nPode ficar para depois: tarefas sem prazo ou marcadas como “pode esperar”.`);
}

function flowWeekReply() {
  const items = upcomingOperationalTasks().slice(0, 10);
  if (!items.length) return buildFlowReply("A semana não tem gargalos claros agora. Eu manteria espaço livre para demandas novas e revisão de entregas.");
  const groups = {};
  items.forEach((item) => {
    const key = formatDate(taskDue(item));
    groups[key] ||= [];
    groups[key].push(item);
  });
  const lines = Object.entries(groups).map(([date, list]) => `${date}: ${list.map((item) => `${taskTitle(item)} · ${taskProjectName(item)} · Cliente: ${taskClientName(item)}`).join(", ")}`);
  return buildFlowReply(`Resumo da semana:\n\n${lines.join("\n")}\n\nDia crítico: ${Object.entries(groups).sort((a, b) => b[1].length - a[1].length)[0]?.[0] || "sem concentração forte"}.\nSugestão: resolva primeiro tarefas atrasadas e deixe criação profunda longe de reuniões.`);
}

function flowDeadlineReply(text) {
  const service = state.services.find((item) => text.includes(item.name.toLowerCase())) || state.services[0];
  if (!service) return buildFlowReply("Não encontrei serviços configurados para calcular o prazo. Configure Serviços & Tempos primeiro.");
  const hours = service.steps.filter((step) => step.active).reduce((sum, step) => sum + Number(step.hours || 0), 0);
  const safeHours = hours * (1 + Number(service.margin || state.workConfig.safetyMargin || 20) / 100);
  const minimumDate = addBusinessDays(new Date(`${TODAY_ISO}T12:00:00`), Math.ceil(hours / state.workConfig.hoursPerDay)).toISOString().slice(0, 10);
  const comfortableDate = addBusinessDays(new Date(`${TODAY_ISO}T12:00:00`), Math.ceil(safeHours / state.workConfig.hoursPerDay) + 2).toISOString().slice(0, 10);
  const risk = flowWorkloadNextDays(7) > state.workConfig.hoursPerDay * 4 ? "médio" : "baixo";
  return buildFlowReply(`Estimativa para ${service.name}:\n\nMelhor início: ${formatDate(TODAY_ISO)}.\nEntrega mínima: ${formatDate(minimumDate)}.\nEntrega confortável: ${formatDate(comfortableDate)}.\nRisco: ${risk}.\n\nBase: ${hours}h configuradas + margem de segurança de ${service.margin || state.workConfig.safetyMargin}%.`);
}

function flowCapacityReply() {
  const load = flowWorkloadNextDays(7);
  const capacity = Number(state.workConfig.hoursPerDay || 6) * Number((state.workConfig.workDays || []).length || 5);
  const ratio = capacity ? load / capacity : 1;
  if (ratio > .85) return buildFlowReply(`Eu não recomendo aceitar para começar esta semana.\n\nSua agenda já está usando cerca de ${Math.round(ratio * 100)}% da capacidade útil. Melhor janela: próxima semana, depois das entregas mais próximas.`);
  if (ratio > .6) return buildFlowReply(`Cabe, mas com ressalvas.\n\nSugiro prometer um prazo confortável e iniciar depois das tarefas urgentes. Sua capacidade da semana está em aproximadamente ${Math.round(ratio * 100)}%.`);
  return buildFlowReply("Pode aceitar com tranquilidade operacional.\n\nA agenda tem espaço, mas eu ainda reservaria margem para ajustes e reuniões de cliente.");
}

function flowLateReply() {
  const late = sortedTasks(state.tasks).filter((item) => !isDone(item) && item.label === "atrasado").slice(0, 5);
  if (!late.length) return buildFlowReply("Você não está atrasada nas tarefas abertas. O melhor é proteger os próximos prazos e não puxar mais demanda para hoje.");
  return buildFlowReply(`Vamos recuperar o controle.\n\nFaça hoje:\n${late.slice(0, 3).map((item, index) => `${index + 1}. ${taskTitle(item)} · ${taskProjectName(item)} · Cliente: ${taskClientName(item)}`).join("\n")}\n\nPode ficar para depois: tarefas sem prazo e demandas marcadas como “pode esperar”.`);
}

function flowTimelineSuggestion() {
  const tasks = upcomingOperationalTasks().slice(0, 6);
  state.flowAi.pendingSuggestion = { id: "timeline-now", type: "timeline", taskIds: tasks.map((item) => item.id) };
  return buildFlowReply(`Sugestão de nova ordem:\n\n${tasks.map((item, index) => `${index + 1}. ${taskTitle(item)} · ${taskProjectName(item)} · Cliente: ${taskClientName(item)} · ${formatDate(taskDue(item))}`).join("\n") || "Nenhuma tarefa crítica encontrada."}\n\nQuer que eu aplique essa ordem na timeline?`, [
    { id: "timeline-now", label: "Aplicar ordem" },
    { id: "cancel", label: "Cancelar" },
  ]);
}

function flowDumpSuggestion(message) {
  const pieces = message.replace(/\./g, "").split(/,| e |;|\n/).map((part) => part.trim()).filter(Boolean).slice(0, 6);
  const proposed = pieces.map((part, index) => ({
    title: cleanupTaskName(part),
    dueDate: addDays(new Date(`${TODAY_ISO}T12:00:00`), index + 1).toISOString().slice(0, 10),
    priority: index < 2 ? "urgente" : "importante",
  }));
  state.flowAi.pendingSuggestion = { id: "create-from-flow", type: "create_tasks", tasks: proposed };
  return buildFlowReply(`Eu transformaria isso em ${proposed.length} tarefas:\n\n${proposed.map((item, index) => `${index + 1}. ${item.title} · ${formatDate(item.dueDate)}`).join("\n")}\n\nQuer que eu crie esses cards?`, [
    { id: "create-from-flow", label: "Criar tarefas" },
    { id: "cancel", label: "Ajustar depois" },
  ]);
}

function applyFlowSuggestion(id) {
  const suggestion = state.flowAi.pendingSuggestion;
  if (!suggestion || id === "cancel") {
    state.flowAi.pendingSuggestion = null;
    state.flowAi.messages.push(buildFlowReply("Tudo bem. Não alterei nada."));
    persistState();
    renderFlowIA();
    return;
  }
  if (suggestion.type === "timeline") {
    const ordered = suggestion.taskIds.map((taskId) => state.tasks.find((item) => item.id === taskId)).filter(Boolean);
    state.tasks = [...ordered, ...state.tasks.filter((item) => !suggestion.taskIds.includes(item.id))];
    state.flowAi.messages.push(buildFlowReply("Pronto. Reorganizei a ordem operacional da timeline."));
  }
  if (suggestion.type === "create_tasks") {
    const created = suggestion.tasks.map((item) => {
      const label = classifyDueDate(item.dueDate);
      const taskItem = task(item.title, "Sem projeto", "tarefa", item.dueDate, label, item.priority, "pendente");
      taskItem.source = "flow-ai";
      taskItem.assignedTo = state.members[0]?.id || "";
      taskItem.responsible = taskAssignee(taskItem);
      return taskItem;
    });
    state.tasks = [...created, ...state.tasks];
    state.brainGeneratedIds = created.map((item) => item.id);
    state.flowAi.messages.push(buildFlowReply("Criei as tarefas e coloquei na lista global do ReveeFlow."));
  }
  state.flowAi.pendingSuggestion = null;
  normalizeState();
  persistState();
  render();
}

function askFlowAboutProject(projectId = "") {
  const project = state.projects.find((item) => item.id === projectId) || state.projects[0];
  openFlowIA(project ? `Analise o projeto ${project.name} e me diga o próximo passo.` : "Analise meus projetos e me diga o próximo passo.");
}

function flowTaskReason(item) {
  if (item.label === "atrasado") return "está atrasada e pode travar o restante do fluxo.";
  if (isTimeSoon(item)) return "tem horário próximo e precisa sair do radar mental.";
  if (item.priority === "urgente") return "está marcada como urgente e tem prazo próximo.";
  if (taskDue(item) === TODAY_ISO) return "vence hoje e precisa ser resolvida antes de novas demandas.";
  return "tem a maior prioridade operacional neste momento.";
}

function flowWorkloadNextDays(days) {
  return state.tasks
    .filter((item) => !isDone(item) && daysUntil(taskDue(item)) >= 0 && daysUntil(taskDue(item)) <= days)
    .reduce((sum, item) => sum + Number(item.duration || 1), 0);
}

function formatHours(value) {
  const hours = Number(value || 1);
  if (hours < 1) return `${Math.round(hours * 60)}min`;
  if (Number.isInteger(hours)) return `${hours}h`;
  const full = Math.floor(hours);
  const minutes = Math.round((hours - full) * 60);
  return `${full}h${String(minutes).padStart(2, "0")}`;
}

function minutesToHour(minutes) {
  const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minute = String(minutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
}

function openNotifications() {
  const items = buildContextNotifications();
  togglePopover("notifications-popover", document.querySelector(".notification-button"), `
    <div class="mini-popover-title"><span>Notificações</span><button data-action="clear-notifications" type="button">Limpar</button></div>
    ${items.length ? `<div class="notification-list">${items.map((item) => `<button class="notification-item" ${item.attr} type="button"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.message)}</span></button>`).join("")}</div>` : `<div class="notification-empty compact"><span>${iconSvg("bell")}</span><h3>Tudo em ordem</h3><p>Reuniões, prazos e avisos importantes aparecerão aqui.</p></div>`}
  `);
}

function buildContextNotifications() {
  if (state.notificationsCleared) return [];
  const tasks = sortedTasks(state.tasks)
    .filter((item) => !isDone(item))
    .slice(0, 5)
    .map((item) => ({
      title: item.label === "atrasado" ? "Prazo vencido" : "Prazo próximo",
      message: `${taskAssignee(item)} precisa de ${taskTitle(item)} em ${taskProjectName(item)} · Cliente: ${taskClientName(item)}.`,
      attr: `data-task-open="${item.id}"`,
    }));
  const events = (state.calendar.events || [])
    .filter((item) => daysUntil(item.date) >= 0 && daysUntil(item.date) <= 7)
    .slice(0, 3)
    .map((item) => ({
      title: "Agenda atualizada",
      message: `${eventTypeLabel(item.type || "evento")} ${item.title} em ${formatDate(item.date)}${item.hour ? ` às ${item.hour}` : ""}.`,
      attr: `data-event-open="${item.id}"`,
    }));
  return [...tasks, ...events].slice(0, 6);
}

function clearNotifications() {
  state.notificationsCleared = true;
  persistState();
  closeFloatingPanels();
  notify("Notificações limpas.");
}

function openProfileMenu() {
  togglePopover("profile-popover", document.querySelector(".sidebar-card"), `
    <div class="profile-menu">
      <button data-action="open-profile" type="button">${iconSvg("user")}<span>Meu perfil</span></button>
      <button data-route="team" type="button">${iconSvg("team")}<span>Equipe</span></button>
      <button data-action="toggle-theme" type="button">${iconSvg("settings")}<span>Tema escuro</span><em>${state.theme === "dark" ? "On" : "Off"}</em></button>
      <button data-route="settings" type="button">${iconSvg("settings")}<span>Configurações</span></button>
      <button class="danger" data-action="logout" type="button">↪<span>Sair</span></button>
    </div>
  `);
}

function togglePopover(id, anchor, html) {
  const existing = document.querySelector(`#${id}`);
  if (existing) {
    existing.remove();
    return;
  }
  closeFloatingPanels();
  const popover = document.createElement("div");
  popover.id = id;
  popover.className = `floating-popover ${id}`;
  popover.innerHTML = html;
  document.body.appendChild(popover);
  const rect = anchor.getBoundingClientRect();
  if (id === "profile-popover") {
    popover.style.left = `${rect.left}px`;
    popover.style.bottom = `${window.innerHeight - rect.top + 10}px`;
  } else {
    popover.style.right = `${window.innerWidth - rect.right}px`;
    popover.style.top = `${rect.bottom + 10}px`;
  }
  bindInteractiveElements();
}

function closeFloatingPanels(exceptId = "") {
  document.querySelectorAll(".floating-popover").forEach((panel) => {
    if (panel.id !== exceptId) panel.remove();
  });
}

function openProfileModal() {
  closeFloatingPanels();
  modalTitle.textContent = "Meu perfil";
  modalContent.innerHTML = profileForm();
  modalBackdrop.hidden = false;
  bindInteractiveElements();
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  persistState();
  applyTheme();
  closeFloatingPanels();
  notify(state.theme === "dark" ? "Tema escuro ativado." : "Tema claro ativado.");
}

function toggleSidebar() {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  applySidebarState();
  persistState();
}

function applySidebarState() {
  document.body.classList.toggle("sidebar-collapsed", Boolean(state.sidebarCollapsed));
  const button = document.querySelector(".sidebar-collapse-button");
  if (button) button.setAttribute("aria-label", state.sidebarCollapsed ? "Expandir menu" : "Encolher menu");
}

function applyTheme() {
  document.body.classList.toggle("dark-theme", state.theme === "dark");
}

function closeModal() {
  modalBackdrop.hidden = true;
  modalContent.innerHTML = "";
}

function taskForm(hour = "") {
  return `
    <form class="modal-form" data-create-form="task">
      <label>O que precisa ser feito?<input name="name" required placeholder="Ex: Entrar em contato com a cliente" /></label>
      <label>Projeto relacionado<select name="projectId">${projectOptions("")}</select></label>
      <label>Responsável<select name="assignedTo">${memberOptions(state.members[0]?.id || "")}</select></label>
      <label>Data de entrega<input name="due" type="date" required value="${TODAY_ISO}" /></label>
      <label class="check-line"><input data-has-time name="hasTime" type="checkbox" ${hour ? "checked" : ""} />Adicionar horário</label>
      <label data-time-field ${hour ? "" : "hidden"}>Horário<input name="hour" type="time" value="${hour || "09:00"}" /></label>
      <label>Observação<textarea name="notes" placeholder="Detalhes importantes, links, combinados ou contexto"></textarea></label>
      <label>Prioridade<select name="priority"><option value="automatica">automática</option><option>urgente</option><option>importante</option><option>pode esperar</option></select></label>
      <label>Status<select name="status"><option>pendente</option><option>em progresso</option><option>aguardando</option><option>revisão</option><option value="concluida">concluída</option></select></label>
      <button class="primary-button" type="submit">Cadastrar tarefa</button>
    </form>
  `;
}

function eventForm(hour = "", date = "") {
  return `
    <form class="modal-form" data-create-form="event">
      <label>Título<input name="title" required placeholder="Ex: Reunião com cliente" /></label>
      <label>Tipo<select name="type">${eventTypeOptions("evento")}</select></label>
      <label>Data<input name="date" type="date" required value="${date || TODAY_ISO}" /></label>
      <label>Horário<input name="hour" type="time" value="${hour || "09:00"}" /></label>
      <label>Observação<textarea name="notes" placeholder="Contexto rápido"></textarea></label>
      <button class="primary-button" type="submit">Cadastrar evento</button>
    </form>
  `;
}

function editEventForm(event) {
  return `
    <form class="modal-form" data-edit-event="${event.id}">
      <label>Título<input name="title" required value="${escapeHtml(event.title || "")}" /></label>
      <label>Tipo<select name="type">${eventTypeOptions(event.type || "evento")}</select></label>
      <label>Data<input name="date" type="date" required value="${event.date || TODAY_ISO}" /></label>
      <label>Horário<input name="hour" type="time" value="${event.hour || "09:00"}" /></label>
      <label>Observação<textarea name="notes" placeholder="Contexto rápido">${escapeHtml(event.notes || "")}</textarea></label>
      <div class="modal-actions">
        <button class="primary-button" type="submit">Salvar evento</button>
        <button class="quiet-button danger" data-event-delete="${event.id}" type="button">Excluir evento</button>
      </div>
    </form>
  `;
}

function projectForm() {
  return `
    <form class="modal-form" data-create-form="project">
      <label>Nome do projeto<input name="name" required placeholder="Ex: Identidade visual Maria" /></label>
      <label>Cliente<input name="client" required placeholder="Ex: Maria Atelier" /></label>
      <label>Tipo de projeto<select name="type">${state.services.map((service) => `<option>${service.name}</option>`).join("")}</select></label>
      <label>Data de início<input name="start" type="date" required value="${TODAY_ISO}" /></label>
      <label>Data de entrega<input name="due" type="date" required value="2026-06-20" /></label>
      <label>Observações<textarea name="notes" placeholder="Escopo, combinados e pontos que não podem ser esquecidos"></textarea></label>
      <button class="primary-button" type="submit">Cadastrar projeto</button>
    </form>
  `;
}

function profileForm() {
  return `
    <form class="modal-form member-form" data-profile-form>
      <div class="member-photo-edit">
        <label class="photo-picker">${state.profile.photo ? `<img src="${escapeHtml(state.profile.photo)}" alt="">` : `<div class="avatar big">${initialsFromName(state.profile.name)}</div>`}<input data-photo-upload type="file" accept="image/*" /></label>
        <div>
          <strong>Foto do perfil</strong>
          <p>Clique para escolher uma imagem do seu computador.</p>
        </div>
      </div>
      <input type="hidden" name="photo" value="${escapeHtml(state.profile.photo || "")}" />
      <label>Nome<input name="name" required value="${escapeHtml(state.profile.name)}" /></label>
      <label>E-mail<input name="email" type="email" required value="${escapeHtml(state.profile.email)}" /></label>
      <label>Cargo<select name="role">${roles.map((role) => `<option ${state.profile.role === role ? "selected" : ""}>${role}</option>`).join("")}</select></label>
      <label>Código de acesso<input name="accessCode" readonly value="${escapeHtml(state.profile.accessCode)}" /></label>
      <button class="primary-button" type="submit">Salvar perfil</button>
    </form>
  `;
}

function noteForm() {
  return `
    <form class="modal-form" data-create-form="note">
      <label>Título<input name="title" required placeholder="Ex: Ajustes da cliente" /></label>
      <label>Anotação<textarea name="body" required placeholder="Escreva o que não pode esquecer"></textarea></label>
      <button class="primary-button" type="submit">Cadastrar nota</button>
    </form>
  `;
}

function fileForm() {
  return `
    <form class="modal-form" data-create-form="file">
      <label>Nome do arquivo<input name="name" required placeholder="Ex: apresentacao-final.pdf" /></label>
      <label>Projeto<input name="project" required placeholder="Ex: Identidade Visual" /></label>
      <label>Tag<input name="tag" value="referencias" /></label>
      <label>Versao<input name="version" value="v1" /></label>
      <button class="primary-button" type="submit">Cadastrar arquivo</button>
    </form>
  `;
}

function createTaskFromForm(data) {
  const label = classifyDueDate(data.due);
  const priority = data.priority === "automatica" ? priorityFromLabel(label) : data.priority;
  const project = state.projects.find((item) => item.id === data.projectId);
  const item = task(data.name, project?.name || "Sem projeto", project?.type?.toLowerCase() || "tarefa", data.due, label, priority, data.status || "pendente");
  item.projectId = data.projectId || "";
  item.assignedTo = data.assignedTo || state.members[0]?.id || "";
  item.responsible = taskAssignee(item);
  item.duration = Number(data.duration || 1);
  item.hour = data.hasTime ? data.hour : "";
  item.notes = data.notes || "";
  item.source = "manual";
  state.tasks.unshift(item);
  normalizeState();
  persistState();
  notify("Tarefa cadastrada.");
  render();
}

function createEventFromForm(data) {
  state.calendar.events.unshift({
    id: crypto.randomUUID(),
    title: data.title,
    date: data.date,
    hour: data.hour || "09:00",
    type: data.type || "evento",
    notes: data.notes || "",
    createdAt: new Date().toISOString(),
  });
  persistState();
  notify("Evento cadastrado.");
  render();
}

function updateEventFromForm(id, data) {
  const event = state.calendar.events.find((item) => item.id === id);
  if (!event) return;
  event.title = data.title || event.title;
  event.date = data.date || event.date;
  event.hour = data.hour || "09:00";
  event.type = data.type || event.type || "evento";
  event.notes = data.notes || "";
  persistState();
  notify("Evento atualizado.");
  render();
}

function deleteEvent(id) {
  state.calendar.events = state.calendar.events.filter((item) => item.id !== id);
  persistState();
  notify("Evento excluído.");
  closeModal();
  render();
}

function createProjectFromForm(data) {
  const service = state.services.find((item) => item.name === data.type);
  const steps = (service?.steps || [])
    .filter((step) => step.active)
    .map((step) => ({ title: step.title, done: false, hours: step.hours }));
  const timing = projectTiming(data.start, data.due);
  state.projects.unshift({
    id: crypto.randomUUID(),
    name: data.name,
    client: data.client,
    type: data.type,
    start: data.start,
    dueDate: data.due,
    due: data.due,
    status: timing.tag,
    progress: 0,
    currentStage: steps[0]?.title || "briefing",
    current: steps[0]?.title || "briefing",
    notes: data.notes || "Projeto cadastrado manualmente.",
    steps,
    tasks: [],
  });
  const project = state.projects[0];
  const generated = steps.map((step, index) => {
    const due = addBusinessDays(new Date(`${data.start}T12:00:00`), index + 1).toISOString().slice(0, 10);
    const label = classifyDueDate(due);
    const item = task(capitalize(step.title), data.name, data.type.toLowerCase(), due, label, priorityFromLabel(label), "pendente");
    item.projectId = project.id;
    item.client = data.client;
    item.assignedTo = state.members[0]?.id || "";
    item.responsible = taskAssignee(item);
    item.duration = step.hours || 1;
    item.notes = data.notes || "";
    item.source = "project";
    return item;
  });
  state.tasks = [...generated, ...state.tasks];
  project.tasks = generated.map((item) => item.id);
  normalizeState();
  persistState();
  notify("Projeto cadastrado com etapas criadas.");
  render();
}

function updateProjectFromForm(id, data) {
  const project = state.projects.find((item) => item.id === id);
  if (!project) return;
  project.name = data.name;
  project.client = data.client || "";
  project.type = data.type;
  project.start = data.start || project.start;
  project.dueDate = data.due;
  project.due = data.due;
  project.currentStage = data.current || project.currentStage || project.current;
  project.current = project.currentStage;
  project.notes = data.notes || "";
  project.status = projectTiming(project.start, project.dueDate).tag;
  normalizeState();
  persistState();
  notify("Projeto atualizado.");
  render();
}

function createNoteFromForm(data) {
  state.notes.unshift({ title: data.title, body: data.body, project: "Geral" });
  persistState();
  notify("Nota cadastrada.");
  render();
}

function createFileFromForm(data) {
  state.files.unshift({ name: data.name, project: data.project, tag: data.tag || "geral", version: data.version || "v1" });
  persistState();
  notify("Arquivo cadastrado.");
  render();
}

function deleteTask(id) {
  const item = state.tasks.find((taskItem) => taskItem.id === id);
  state.tasks = state.tasks.filter((taskItem) => taskItem.id !== id);
  normalizeState();
  persistState();
  notify(item ? `Tarefa excluída: ${taskTitle(item)}` : "Tarefa excluída.");
  render();
}

function deleteProject(id) {
  const item = state.projects.find((project) => project.id === id);
  state.projects = state.projects.filter((project) => project.id !== id);
  state.tasks.forEach((taskItem) => {
    if (taskItem.projectId === id) taskItem.projectId = "";
  });
  normalizeState();
  persistState();
  notify(item ? `Projeto excluído: ${item.name}` : "Projeto excluído.");
  closeModal();
  render();
}

function deleteNote(index) {
  state.notes.splice(index, 1);
  persistState();
  notify("Nota excluída.");
  render();
}

function deleteFile(index) {
  state.files.splice(index, 1);
  persistState();
  notify("Arquivo excluído.");
  render();
}

function taskRow(item) {
  return `
    <article class="brain-task-card" data-task-open="${item.id}">
      <div class="brain-card-head">
        <span class="brain-card-icon">${iconSvg("projects")}</span>
        <button class="icon-button danger" data-task-delete="${item.id}" type="button" aria-label="Excluir tarefa">×</button>
      </div>
      <div class="brain-card-main">
        <h3>${taskTitle(item)}</h3>
        <div class="brain-card-tags">${tag(item.label)}${tag(item.priority)}</div>
      </div>
      <div class="brain-card-date">
        <small>Prazo</small>
        <strong>${new Intl.DateTimeFormat("pt-BR").format(parseISODate(taskDue(item)))}</strong>
      </div>
    </article>
  `;
}

function taskEditableRow(item) {
  return `
    <article class="task-row" data-task-open="${item.id}">
      <button class="task-check ${item.status === "concluida" ? "checked" : ""}" data-task-done="${item.id}" type="button" aria-label="Concluir ${taskTitle(item)}"></button>
      <div>
        <h3>${taskTitle(item)}</h3>
        <p>${taskProject(item)} · ${taskAssignee(item)} · prazo ${formatDate(taskDue(item))}</p>
      </div>
      <div class="task-actions">
        ${tag(item.priority)} ${tag(item.label)}
        <select data-task-status="${item.id}" aria-label="Status da tarefa ${taskTitle(item)}">
          ${["pendente", "em progresso", "aguardando", "concluida"].map((status) => `<option value="${status}" ${item.status === status ? "selected" : ""}>${status === "concluida" ? "concluída" : status}</option>`).join("")}
        </select>
        <button class="quiet-button danger" data-task-delete="${item.id}" type="button">Excluir</button>
      </div>
    </article>
  `;
}

function editTaskForm(item) {
  return `
    <form class="modal-form" data-edit-task="${item.id}">
      <label>O que precisa ser feito?<input name="name" required value="${escapeHtml(taskTitle(item))}" /></label>
      <label>Projeto relacionado<select name="projectId">${projectOptions(item.projectId || item.project)}</select></label>
      <label>Responsável<select name="assignedTo">${memberOptions(item.assignedTo || item.responsible)}</select></label>
      <label>Data de entrega<input name="due" type="date" required value="${taskDue(item)}" /></label>
      <label class="check-line"><input data-has-time name="hasTime" type="checkbox" ${item.hour ? "checked" : ""} />Adicionar horário</label>
      <label data-time-field ${item.hour ? "" : "hidden"}>Horário<input name="hour" type="time" value="${item.hour || "09:00"}" /></label>
      <label>Prioridade<select name="priority">${["urgente", "importante", "pode esperar"].map((priority) => `<option ${item.priority === priority ? "selected" : ""}>${priority}</option>`).join("")}</select></label>
      <label>Status<select name="status">${["pendente", "em progresso", "aguardando", "revisão", "concluida"].map((status) => `<option value="${status}" ${item.status === status ? "selected" : ""}>${status === "concluida" ? "concluída" : status}</option>`).join("")}</select></label>
      <label>Observação<textarea name="notes">${escapeHtml(item.notes || "")}</textarea></label>
      <div class="modal-actions">
        <button class="primary-button" type="submit">Salvar tarefa</button>
        <button class="quiet-button danger" data-task-delete="${item.id}" type="button">Excluir tarefa</button>
      </div>
    </form>
  `;
}

function taskTable(items) {
  return `
    <div class="work-table">
      <div class="work-table-head"><span>Tarefa</span><span>Projeto</span><span>Prazo</span><span>Status</span></div>
      ${items
        .map(
          (item) => `
            <div class="work-table-row">
              <strong>${taskTitle(item)}</strong>
              <span>${taskProject(item)}</span>
              <span>${formatDate(taskDue(item))}</span>
              <span>${tag(item.label)}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function metricCard(label, value, helper) {
  return `
    <article class="metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <p>${helper}</p>
    </article>
  `;
}

function summaryRow(label, value, tone, filter) {
  return `<button class="summary-row" data-summary="${filter}" type="button"><span class="status-dot ${tone}"></span><strong>${label}</strong><b>${value}</b><span>›</span></button>`;
}

function calmSummaryCard(label, value, helper, tone, filter) {
  const iconMap = {
    tasks: "tasks",
    late: "agenda",
    deadline: "calendar",
    calendar: "calendar",
  };
  return `
    <button class="calm-summary-card ${tone}" data-summary="${filter}" type="button">
      <span class="summary-symbol">${iconSvg(iconMap[tone] || "tasks")}</span>
      <span>
        <small>${label}</small>
        <strong>${value}</strong>
        <em>${helper}</em>
      </span>
    </button>
  `;
}

function nextTaskLine(item) {
  return `
    <article class="next-task-line" data-task-open="${item.id}">
      <button class="task-check" data-task-done="${item.id}" type="button" aria-label="Concluir ${taskTitle(item)}"></button>
      <div>
        <strong>${taskTitle(item)}</strong>
        <span>${taskProject(item)}</span>
      </div>
      <time>${item.label === "hoje" ? "Hoje" : formatDate(taskDue(item))}</time>
      ${tag(item.priority)}
    </article>
  `;
}

function emptyNextTaskCard(item) {
  return `
    <article class="next-empty-card" data-task-open="${item.id}">
      <span class="next-empty-icon">${iconSvg("projects")}</span>
      <button class="icon-button" type="button" aria-label="Mais opções">⋮</button>
      <h3>${taskTitle(item)}</h3>
      <div class="focus-status">${tag(item.label)}${tag(item.priority)}</div>
      <div class="next-empty-date"><span>${iconSvg("calendar")}</span><div><small>Prazo</small><strong>${new Intl.DateTimeFormat("pt-BR").format(parseISODate(taskDue(item)))}</strong></div></div>
    </article>
  `;
}

function todayAgenda() {
  const blocks = (state.calendar.events || [])
    .filter((event) => event.date === TODAY_ISO)
    .map((event) => [event.hour, event.title, `${event.hour} · ${event.type}`, event.type === "tarefa" ? "creative" : event.type === "evento" ? "client" : "meeting"]);
  if (!blocks.length) blocks.push(["14:00", "Reunião cliente", "14:00 · reunião", "meeting"]);
  const hours = ["08:00", "09:00", "10:00", "10:30", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
  const byHour = Object.fromEntries(blocks.map((block) => [block[0], block]));
  return `
    <div class="agenda-switch">
      <button class="active" type="button">Dia</button>
      <button type="button">Mês</button>
    </div>
    <div class="month-strip">
      ${Array.from({ length: 30 }, (_, index) => `<span class="${index + 1 === 26 ? "today" : ""}">${index + 1}</span>`).join("")}
    </div>
    <div class="day-agenda">
      ${hours.map((hour) => {
        const block = byHour[hour];
        return `<button class="agenda-hour-row ${block ? "has-block" : ""}" data-action="open-task" data-hour="${hour}" type="button"><time>${hour}</time>${block ? `<div class="agenda-block ${block[3]}"><strong>${block[1]}</strong><span>${block[2]}</span></div>` : `<span class="empty-slot">Criar tarefa</span>`}</button>`;
      }).join("")}
    </div>
  `;
}

function dashboardCalendar() {
  const cursor = parseISODate(state.calendarCursor || TODAY_ISO);
  const monthLabel = monthName(cursor);
  const days = calendarDaysForView(cursor, state.calendarView);
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
  const blocks = getCalendarItems();
  const blockAt = (iso, hour) => blocks.find((block) => block.iso === iso && block.start === hour && state.calendarView !== "mes");
  if (state.calendarView === "mes") return monthCalendar(cursor, monthLabel);
  return `
    <div class="week-calendar-board">
      <div class="calendar-toolbar">
        <div class="calendar-month-title"><strong>${monthLabel}</strong><button class="top-icon" data-calendar-month="-1" onclick="moveCalendarMonth(-1)" type="button">‹</button><button class="top-icon" data-calendar-month="1" onclick="moveCalendarMonth(1)" type="button">›</button></div>
        <button class="glass-button today-button" data-calendar-today onclick="goCalendarToday()" type="button">Hoje</button>
        <button class="glass-button event-button" data-action="open-event" type="button">+ Evento</button>
        <div class="calendar-mode"><button class="${state.calendarView === "dia" ? "active" : ""}" data-calendar-view="dia" onclick="setCalendarView('dia')" type="button">Dia</button><button class="${state.calendarView === "semana" ? "active" : ""}" data-calendar-view="semana" onclick="setCalendarView('semana')" type="button">Semana</button><button class="${state.calendarView === "mes" ? "active" : ""}" data-calendar-view="mes" onclick="setCalendarView('mes')" type="button">Mês</button></div>
      </div>
      <div class="week-calendar ${state.calendarView}">
        <div class="week-head"><span></span>${days.map((item) => `<div class="${item.iso === TODAY_ISO ? "today" : ""}"><strong>${item.weekday}</strong><small>${item.day}</small></div>`).join("")}</div>
        <div class="week-body">
          ${hours.map((hour) => `
            <div class="week-hour">${hour}</div>
            ${days.map((dayItem, dayIndex) => {
              const block = blockAt(dayItem.iso, hour);
              const attrs = block ? (block.kind === "project" ? `data-project-open="${block.id}"` : `data-event-open="${block.id}"`) : `data-action="open-event" data-hour="${hour}" data-date="${dayItem.iso}"`;
              return `<button class="week-cell" ${attrs} type="button">${block ? `<span class="week-block ${block.tone}" style="--span:1"><strong>${block.title}</strong><em>${block.subtitle}</em></span>` : ""}</button>`;
            }).join("")}
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function monthCalendar(cursor, monthLabel) {
  const days = monthGridDays(cursor);
  const items = getCalendarItems();
  return `
    <div class="week-calendar-board">
      <div class="calendar-toolbar">
        <div class="calendar-month-title"><strong>${monthLabel}</strong><button class="top-icon" data-calendar-month="-1" onclick="moveCalendarMonth(-1)" type="button">‹</button><button class="top-icon" data-calendar-month="1" onclick="moveCalendarMonth(1)" type="button">›</button></div>
        <button class="glass-button today-button" data-calendar-today onclick="goCalendarToday()" type="button">Hoje</button>
        <button class="glass-button event-button" data-action="open-event" type="button">+ Evento</button>
        <div class="calendar-mode"><button class="" data-calendar-view="dia" onclick="setCalendarView('dia')" type="button">Dia</button><button class="" data-calendar-view="semana" onclick="setCalendarView('semana')" type="button">Semana</button><button class="active" data-calendar-view="mes" onclick="setCalendarView('mes')" type="button">Mês</button></div>
      </div>
      <div class="month-view-grid">
        ${["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => `<strong>${day}</strong>`).join("")}
        ${days.map((day) => {
          const dayItems = items.filter((item) => item.iso === day.iso);
          const previewItems = dayItems.slice(0, 3);
          const attrs = dayItems[0] ? (dayItems[0].kind === "project" ? `data-project-open="${dayItems[0].id}"` : `data-event-open="${dayItems[0].id}"`) : `data-action="open-event" data-date="${day.iso}"`;
          return `<button class="${day.inMonth ? "" : "outside"} ${day.iso === TODAY_ISO ? "today" : ""}" ${attrs} type="button">
            <span>${day.day}</span>
            <div class="month-events">
              ${previewItems.map((item) => `<em class="month-event-pill ${item.tone}">${item.start ? `${item.start} ` : ""}${escapeHtml(item.title)}</em>`).join("")}
              ${dayItems.length > 3 ? `<small>+${dayItems.length - 3}</small>` : ""}
            </div>
          </button>`;
        }).join("")}
      </div>
    </div>
  `;
}

function connectGoogleCalendar() {
  state.calendar.connected = true;
  state.calendar.email = state.profile?.email || "Google Calendar";
  state.calendar.provider = "google";
  state.calendar.syncStatus = "pending-oauth";
  state.calendar.lastSync = "";
  persistState();
  notify("Google Calendar preparado. Configure OAuth no Supabase para sincronização real.");
  render();
}

function addCalendarEvent() {
  const titleInput = document.querySelector("#calendar-title");
  const date = document.querySelector("#calendar-date").value;
  const hour = document.querySelector("#calendar-hour").value;
  const type = document.querySelector("#calendar-type").value;
  const title = titleInput.value.trim();
  if (!title) {
    notify("Informe o título do evento.");
    return;
  }
  state.calendar.events.push({ id: crypto.randomUUID(), title, date, hour, type });
  normalizeState();
  persistState();
  notify("Adicionado ao sistema.");
  render();
}

function activeProjectTile(project) {
  return `
    <article class="active-project-tile" data-project-open="${project.id}">
      <span class="project-icon">${iconSvg("projects")}</span>
      <div>
        <strong>${project.name}</strong>
        <span>${capitalize(project.current)}</span>
      </div>
      <div class="project-percent"><i style="width:${project.progress}%"></i></div>
      <b>${project.progress}%</b>
    </article>
  `;
}

function memberCard(member) {
  return `
    <article class="member-card" data-member-open="${member.id}">
      ${member.photo ? `<img src="${escapeHtml(member.photo)}" alt="${escapeHtml(member.name)}" />` : `<div class="avatar">${member.initials || initialsFromName(member.name)}</div>`}
      <div>
        <h3>${member.name}</h3>
        <p>${member.email}</p>
        <strong>${member.role}</strong>
      </div>
      ${tag(member.permission)}
    </article>
  `;
}

function projectMini(name, client, progress, tone) {
  return `
    <div class="project-mini">
      <span class="mini-square ${tone}">R</span>
      <div><strong>${name}</strong><p>${client}</p></div>
      <div class="mini-progress"><i style="width:${progress}%"></i></div>
      <small>${progress}%</small>
    </div>
  `;
}

function deliveryMini(day, time, title, subtitle) {
  return `
    <div class="delivery-mini">
      <time><strong>${day}</strong><span>${time}</span></time>
      <span class="timeline-dot"></span>
      <div><strong>${title}</strong><p>${subtitle}</p></div>
      <button class="icon-button" type="button">›</button>
    </div>
  `;
}

function weekSchedule() {
  const items = [
    ["09:00", "Identidade Visual", "Conceito criativo", "blue"],
    ["11:00", "Social Media", "Pauta de conteúdo", "orange"],
    ["14:00", "Site Institucional", "Layout da home", "cyan"],
    ["16:00", "Reunião de alinhamento", "Clínica Harmonia", "green"],
  ];
  return `<div class="week-list">${items.map(([hour, title, desc, tone]) => `<div class="${tone}"><time>${hour}</time><strong>${title}</strong><span>${desc}</span></div>`).join("")}</div>`;
}

function agendaMetric(label, value, helper, tone, icon = "evento") {
  return `<div class="agenda-metric"><span class="agenda-metric-icon ${tone}">${agendaMetricIcon(icon)}</span><div><strong>${value}</strong><p>${label}</p><small>${helper}</small></div></div>`;
}

function agendaMetricIcon(type) {
  const icons = {
    reuniao: `<rect x="4" y="5" width="16" height="13" rx="2"></rect><path d="M8 3v4M16 3v4M8 11h5"></path><path d="M15 14h4l-2 2"></path>`,
    compromisso: `<circle cx="12" cy="12" r="8"></circle><path d="m8.5 12 2.2 2.2 4.8-5"></path>`,
    evento: `<path d="M12 3.8 13.8 9l5.4 1.2-4.5 3.2.5 5.4L12 14.8 8.8 18.8l.5-5.4-4.5-3.2L10.2 9 12 3.8Z"></path>`,
    bloqueio: `<rect x="6" y="10" width="12" height="9" rx="2"></rect><path d="M8 10V8a4 4 0 0 1 8 0v2"></path>`,
    ausencia: `<path d="M4 16c4-4 8-4 16 0"></path><path d="M8 8l8 8M16 8l-8 8"></path>`,
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[type] || icons.evento}</svg>`;
}

function deadlineRow(date, delta, taskName, project, priority, status, tone) {
  return `
    <div class="deadline-row">
      <div><strong>${date}</strong><small>${delta}</small></div>
      <span>${taskName}</span>
      <span>${project}</span>
      ${tag(priority)}
      <span class="status-text ${tone}">${status}</span>
    </div>
  `;
}

function miniCalendar() {
  const days = Array.from({ length: 35 }, (_, index) => index + 1);
  return `<div class="mini-calendar">${days.map((day) => `<span class="${day === 20 ? "today" : [8, 15, 23].includes(day) ? "marked" : ""}">${day}</span>`).join("")}</div>`;
}

function projectRow(project) {
  const timing = projectTiming(project.start, project.dueDate);
  const progress = typeof project.progress === "number" ? project.progress : 0;
  return `
    <article class="project-row project-card-minimal" data-project-open="${project.id}">
      <div>
        <h3>${project.name}</h3>
        <p>${project.client || "Sem cliente"} · entrega ${formatDate(project.dueDate)}</p>
        <div class="project-progress-line"><span><i style="width:${progress}%"></i></span><b>${progress}%</b></div>
      </div>
      <div class="task-actions">${tag(timing.tag)}</div>
    </article>
  `;
}

function tag(text) {
  const klass = String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase();
  return `<span class="tag ${klass}">${text}</span>`;
}

function classifyDueDate(value) {
  const days = daysUntil(value);
  if (days < 0) return "atrasado";
  if (days === 0) return "hoje";
  if (days <= 2) return "urgente";
  if (days <= 7) return "esta semana";
  return "pode esperar";
}

function priorityFromLabel(label) {
  if (["atrasado", "hoje", "urgente", "atenção imediata", "entrega em breve"].includes(label)) return "urgente";
  if (label === "esta semana" || label === "importante") return "importante";
  return "pode esperar";
}

function daysUntil(value) {
  const today = new Date(`${TODAY_ISO}T12:00:00`);
  const due = new Date(`${value}T12:00:00`);
  return Math.ceil((due - today) / 86400000);
}

function projectTiming(start, due) {
  const days = daysUntil(due);
  const total = start ? Math.max(1, Math.ceil((new Date(`${due}T12:00:00`) - new Date(`${start}T12:00:00`)) / 86400000)) : days;
  const tagText = days < 0 ? "atrasado" : days <= 2 ? "prazo curto" : days <= 7 ? "entregar em breve" : total <= 7 ? "atenção" : "no prazo";
  const daysText = days < 0 ? `${Math.abs(days)} dias atrasado` : days === 0 ? "entrega hoje" : `faltam ${days} dias`;
  return { tag: tagText, daysText };
}

function projectSteps(project) {
  if (Array.isArray(project.steps) && project.steps.length) return project.steps;
  const service = state.services.find((item) => item.name === project.type);
  return (service?.steps || []).filter((step) => step.active).map((step) => ({ title: step.title, done: false, hours: step.hours }));
}

function toggleProjectStep(projectId, stepIndex) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;
  const taskId = project.tasks?.[stepIndex];
  const item = state.tasks.find((taskItem) => taskItem.id === taskId);
  if (item) {
    item.status = item.status === "concluida" ? "pendente" : "concluida";
    item.label = item.status === "concluida" ? "feito" : classifyDueDate(taskDue(item));
  } else {
    const steps = projectSteps(project);
    const step = steps[stepIndex];
    if (!step) return;
    step.done = !step.done;
    project.steps = steps;
  }
  normalizeState();
  persistState();
  notify(item?.status === "concluida" || project.steps?.[stepIndex]?.done ? "Etapa concluída." : "Etapa reaberta.");
  render();
  if (!modalBackdrop.hidden) openProjectDetail(projectId);
}

function openTaskDetail(id) {
  const item = state.tasks.find((taskItem) => taskItem.id === id);
  if (!item) return;
  modalTitle.textContent = taskTitle(item);
  modalContent.innerHTML = editTaskForm(item);
  modalBackdrop.hidden = false;
  bindInteractiveElements();
}

function openProjectDetail(id) {
  const project = state.projects.find((item) => item.id === id);
  if (!project) return;
  const projectTasks = linkedTasks(project.id);
  const stageItems = projectTasks.length
    ? projectTasks.map((item, index) => ({
        index,
        done: item.status === "concluida",
        title: taskTitle(item),
        meta: formatDate(taskDue(item)),
      }))
    : projectSteps(project).map((step, index) => ({
        index,
        done: Boolean(step.done),
        title: capitalize(step.title || "etapa"),
        meta: "Etapa do projeto",
      }));
  modalTitle.textContent = project.name;
  modalContent.innerHTML = `
    <form class="modal-form project-detail-form" data-edit-project="${project.id}">
      <div class="detail-tags">${tag(project.type)} ${tag(projectTiming(project.start, project.dueDate).tag)}</div>
      <label>Nome do projeto<input name="name" required value="${escapeHtml(project.name)}" /></label>
      <label>Cliente<input name="client" value="${escapeHtml(project.client || "")}" /></label>
      <label>Tipo de projeto<select name="type">${state.services.map((service) => `<option ${project.type === service.name ? "selected" : ""}>${service.name}</option>`).join("")}</select></label>
      <div class="form-grid">
        <label>Data de início<input name="start" type="date" value="${project.start || TODAY_ISO}" /></label>
        <label>Data de entrega<input name="due" type="date" value="${project.dueDate}" /></label>
      </div>
      <label class="current-stage-field">Etapa atual<input name="current" value="${escapeHtml(project.currentStage || project.current || "")}" /></label>
      <div class="auto-progress"><strong>${project.progress || 0}% concluído</strong><span><i style="width:${project.progress || 0}%"></i></span><small>A porcentagem muda automaticamente ao marcar as etapas.</small></div>
      <label>Observação<textarea name="notes">${escapeHtml(project.notes || "")}</textarea></label>
      <div class="project-steps">
        ${stageItems.map((step) => `<button class="${step.done ? "done" : ""}" data-project-step="${project.id}" data-step-index="${step.index}" type="button"><span></span><strong>${escapeHtml(step.title)}</strong><small>${step.meta}</small></button>`).join("") || `<div class="empty-state">Nenhuma etapa vinculada a este projeto.</div>`}
      </div>
      <div class="modal-actions">
        <button class="primary-button" type="submit">Salvar projeto</button>
        <button class="quiet-button danger" data-project-delete="${project.id}" type="button">Excluir projeto</button>
      </div>
    </form>
  `;
  modalBackdrop.hidden = false;
  bindInteractiveElements();
}

function openEventDetail(id) {
  const event = state.calendar.events.find((item) => item.id === id);
  if (!event) return;
  modalTitle.textContent = event.title || "Editar evento";
  modalContent.innerHTML = editEventForm(event);
  modalBackdrop.hidden = false;
  bindInteractiveElements();
}

function openServiceModal(id) {
  const service = state.services.find((item) => item.id === id);
  if (!service) return;
  modalTitle.textContent = "Editar serviço";
  modalContent.innerHTML = serviceEditor(service);
  modalBackdrop.hidden = false;
  bindInteractiveElements();
}

function openMemberModal(id = "") {
  closeFloatingPanels();
  const member = state.members.find((item) => item.id === id) || {
    id: "",
    name: "",
    email: "",
    role: "Designer",
    permission: "projetos atribuidos",
    photo: "",
    accessCode: generateAccessCode("FLOW"),
  };
  modalTitle.textContent = id ? "Editar membro" : "Adicionar membro";
  modalContent.innerHTML = `
    <form class="modal-form member-form" data-member-form="${member.id}">
      <div class="member-photo-edit">
        <label class="photo-picker">${member.photo ? `<img src="${escapeHtml(member.photo)}" alt="">` : `<div class="avatar big">${member.initials || initialsFromName(member.name || "Novo membro")}</div>`}<input data-photo-upload type="file" accept="image/*" /></label>
        <div>
          <strong>Foto do membro</strong>
          <p>Clique para escolher uma imagem do computador.</p>
        </div>
      </div>
      <input type="hidden" name="photo" value="${escapeHtml(member.photo || "")}" />
      <label>Nome<input name="name" required placeholder="Nome do membro" value="${escapeHtml(member.name)}" /></label>
      <label>E-mail<input name="email" type="email" required placeholder="email@dominio.com" value="${escapeHtml(member.email)}" /></label>
      <label>Função / cargo<select name="role">${roles.map((role) => `<option ${member.role === role ? "selected" : ""}>${role}</option>`).join("")}</select></label>
      <label>Acesso<select name="permission">${["todos os projetos", "projetos atribuidos", "editar tarefas", "apenas comentar"].map((permission) => `<option ${member.permission === permission ? "selected" : ""}>${permission}</option>`).join("")}</select></label>
      <label>Código de acesso<input name="accessCode" readonly value="${escapeHtml(member.accessCode)}" /></label>
      <div class="modal-actions">
        <button class="primary-button" type="submit">Salvar membro</button>
        ${member.id ? `<button class="quiet-button danger" data-member-remove="${member.id}" type="button">Excluir membro</button>` : ""}
      </div>
    </form>
  `;
  modalBackdrop.hidden = false;
  bindInteractiveElements();
}

function saveProfileFromForm(data) {
  state.profile = {
    name: data.name,
    email: data.email,
    role: data.role,
    photo: data.photo || state.profile.photo || "",
    accessCode: data.accessCode || state.profile.accessCode || generateAccessCode(data.name),
  };
  persistState();
  renderSidebarProfile();
  notify("Perfil atualizado.");
}

function saveMemberFromForm(id, data) {
  const member = state.members.find((item) => item.id === id);
  const next = {
    id: member?.id || crypto.randomUUID(),
    initials: initialsFromName(data.name),
    name: data.name,
    email: data.email,
    role: data.role,
    permission: data.permission,
    avatar: data.photo || "",
    photo: data.photo || "",
    accessCode: data.accessCode || generateAccessCode(data.name),
  };
  if (member) Object.assign(member, next);
  else state.members.unshift(next);
  persistState();
  notify("Membro salvo.");
  render();
}

function removeMember(id) {
  state.members = state.members.filter((member) => member.id !== id);
  persistState();
  notify("Membro removido.");
  closeModal();
  render();
}

function initialsFromName(name) {
  return String(name || "RF")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function generateAccessCode(seed) {
  const clean = initialsFromName(seed || "FLOW");
  return `${clean}-FLOW${Math.floor(1000 + Math.random() * 9000)}`;
}

function readPhotoUpload(input) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const form = input.closest("form");
    const hidden = form?.querySelector('input[name="photo"]');
    if (hidden) hidden.value = reader.result;
    const preview = form?.querySelector(".member-photo-edit img, .member-photo-edit .avatar");
    if (preview) {
      const img = document.createElement("img");
      img.src = reader.result;
      img.alt = "";
      preview.replaceWith(img);
    }
  };
  reader.readAsDataURL(file);
}

function renderSidebarProfile() {
  const card = document.querySelector(".sidebar-card");
  if (!card) return;
  const avatar = card.querySelector(".mini-avatar");
  const name = card.querySelector("strong");
  const role = card.querySelector("p");
  if (avatar) {
    if (state.profile.photo) avatar.innerHTML = `<img src="${escapeHtml(state.profile.photo)}" alt="">`;
    else avatar.textContent = initialsFromName(state.profile.name).slice(0, 1);
  }
  if (name) name.textContent = state.profile.name;
  if (role) role.textContent = state.profile.role;
}

function tabButton(view) {
  return `<button class="${state.activeProjectView === view ? "active" : ""}" data-project-view="${view}" type="button">${capitalize(displayLabel(view))}</button>`;
}

function displayLabel(value) {
  const labels = {
    calendario: "calendário",
    concluida: "concluída",
    concluido: "concluído",
    servicos: "serviços",
    configuracoes: "configurações",
    anotacoes: "anotações",
    criacao: "criação",
    revisao: "revisão",
    reuniao: "reunião",
    compromisso: "compromisso",
    ausencia: "ausência",
    edicao: "edição",
    video: "vídeo",
  };
  return repairPortugueseText(labels[value] || value);
}

function weekChips() {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
  return days
    .map((day, index) => {
      const taskItem = state.tasks[index] || state.tasks[0];
      return `<div class="day-chip"><strong>${day}</strong><span>${index < 5 ? taskTitle(taskItem) : "janela livre"}</span></div>`;
    })
    .join("");
}

function calendarCells() {
  const cells = Array.from({ length: 35 }, (_, index) => index + 1);
  return cells
    .map((day) => {
      const taskItem = state.tasks.find((item) => Number(taskDue(item).slice(-2)) === day);
      return `<button class="calendar-cell ${day < 21 ? "dim" : ""}" ${taskItem ? `data-task-open="${taskItem.id}"` : `data-action="open-task"`} type="button"><strong>${day}</strong>${taskItem ? `<p class="muted">${taskTitle(taskItem)}</p>${tag(taskItem.label)}` : ""}</button>`;
    })
    .join("");
}

function freeWindows() {
  return `
    <div class="section-head"><div><p class="eyebrow">Próximas janelas livres</p><h3>Espaço real para iniciar projetos</h3></div></div>
    <div class="task-list">
      <div class="task-row"><div><h3>03/06 a 05/06</h3><p>Boa janela para Design Avulso ou ajustes pequenos.</p></div>${tag("segura")}</div>
      <div class="task-row"><div><h3>10/06 a 12/06</h3><p>Possível iniciar Social Media, com margem reduzida.</p></div>${tag("apertada")}</div>
      <div class="task-row"><div><h3>17/06 a 24/06</h3><p>Melhor janela para Identidade Visual ou Web Design.</p></div>${tag("ideal")}</div>
    </div>
  `;
}

function empty(text) {
  return `<div class="empty-state">${text}</div>`;
}

function inferProject(text) {
  if (/maria|identidade/i.test(text)) return "Identidade Maria Atelier";
  if (/site|home/i.test(text)) return "Site Studio Aurora";
  if (/clinica|flyer/i.test(text)) return "Peças Clínica Lume";
  return "Inbox criativo";
}

function inferCategory(text) {
  if (/referencia|pesquisa/i.test(text)) return "pesquisa";
  if (/responder|cliente/i.test(text)) return "comunicação";
  if (/site|home/i.test(text)) return "web design";
  if (/flyer|design/i.test(text)) return "design";
  return "criação";
}

function cleanupTaskName(text) {
  return capitalize(text.replace(/^preciso\s+/i, "").replace(/^criar\s+/i, "Criar ").replace(/^finalizar\s+/i, "Finalizar "));
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addBusinessDays(date, days) {
  const next = new Date(date);
  let added = 0;
  while (added < days) {
    next.setDate(next.getDate() + 1);
    if (![0, 6].includes(next.getDay())) added += 1;
  }
  return next;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(`${value}T12:00:00`));
}

function formatDateISO(date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}

function parseISODate(value) {
  return new Date(`${value}T12:00:00`);
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function monthName(date) {
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function shiftCalendarMonth(delta) {
  const date = parseISODate(state.calendarCursor || TODAY_ISO);
  date.setMonth(date.getMonth() + delta);
  return toISODate(date);
}

function calendarDaysForView(cursor, view) {
  if (view === "dia") return [calendarDayInfo(cursor)];
  const monday = new Date(cursor);
  const day = monday.getDay() || 7;
  monday.setDate(monday.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, index) => calendarDayInfo(addDays(monday, index)));
}

function monthGridDays(cursor) {
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  const firstDay = start.getDay() || 7;
  const gridStart = addDays(start, -firstDay + 1);
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return { ...calendarDayInfo(date), inMonth: date.getMonth() === cursor.getMonth() };
  });
}

function calendarDayInfo(date) {
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", "");
  return {
    iso: toISODate(date),
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    day: String(date.getDate()).padStart(2, "0"),
  };
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

init();
