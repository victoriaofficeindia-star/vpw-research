const ADMIN_USER = "Kundan@Victoria@Great@VPW";
const ADMIN_PASS = "Kundan@1234@Karmakar";

const seedReports = [
  {
    id: "report-ai-regime-2026",
    type: "reports",
    title: "India's AI Capital Cycle",
    subtitle: "A regime note on productivity, private capex, and the next compounding corridor.",
    author: "VPW Intelligence Desk",
    date: "2026-05-04",
    body: "India's AI capital cycle is no longer a software story alone. It is becoming a productivity story across lending, manufacturing, compliance, research, and portfolio operations.\n\nThe first implication for investors is that operating leverage may appear before headline earnings fully explain it. The second is that companies able to convert data into decision velocity will deserve a different quality premium from companies merely announcing technology spend.\n\nVPW's view is selective participation. We prefer balance sheets with pricing power, cash conversion, and governance quality over broad thematic exposure. In a crowded theme, discipline is not pessimism. It is the cost of staying invested long enough for the real winners to separate."
  },
  {
    id: "report-macro-rates-2026",
    type: "reports",
    title: "The Rupee, Rates, and Resilience",
    subtitle: "Why macro stability remains the silent engine of Indian wealth creation.",
    author: "VPW Intelligence Desk",
    date: "2026-04-20",
    body: "Macro stability is often invisible when it works. It enters portfolios through lower volatility, better earnings visibility, and the confidence with which long-duration capital can be allocated.\n\nThe rupee's path, domestic rate expectations, and India's external account must be read together. A portfolio that treats currency, inflation, and liquidity as separate headlines misses the transmission mechanism that matters.\n\nOur allocation posture remains quality-led. In periods where the market rewards speed, we still prefer companies and funds that can survive slower money, tighter liquidity, and a less forgiving cost of capital."
  },
  {
    id: "report-family-wealth-2026",
    type: "reports",
    title: "Family Wealth Architecture",
    subtitle: "A framework for education, retirement, legacy, and liquidity.",
    author: "VPW Intelligence Desk",
    date: "2026-03-28",
    body: "A portfolio is not a pile of products. It is an architecture of obligations. Education needs a different risk budget from retirement. Legacy needs a different time horizon from liquidity.\n\nThe most common error in family wealth is not taking too much risk. It is taking the same kind of risk everywhere. VPW's architecture separates goal buckets, assigns time horizons, and then chooses instruments only after the life objective is clear.\n\nThe product follows the purpose. This is the discipline that turns income into wealth and wealth into continuity."
  }
];

const seedArticles = [
  {
    id: "article-noise-signal-2026",
    type: "articles",
    title: "Noise Is Loud. Signal Is Useful.",
    subtitle: "A note on how serious investors should read market headlines.",
    author: "VPW Editorial",
    date: "2026-05-01",
    body: "The market's loudest information is rarely its most useful. A headline tells you what happened. A framework tells you whether it matters.\n\nAt VPW, we separate information by time horizon. Some facts require no portfolio action. Some require a watchlist adjustment. A few require structural response. The discipline is knowing which is which.\n\nInvestors do not need more noise. They need a calmer way to decide."
  },
  {
    id: "article-investor-patience-2026",
    type: "articles",
    title: "Patience Is Not Passive",
    subtitle: "Why long-term investing is an active discipline.",
    author: "VPW Editorial",
    date: "2026-04-12",
    body: "Patience is often mistaken for inaction. In serious wealth management, patience is a sequence of active choices: what to ignore, what to rebalance, what to buy more of, and what to let compound without interruption.\n\nThe investor who stays invested without understanding is merely hoping. The investor who stays invested with a framework is practicing discipline.\n\nThis is why research matters. It gives patience a spine."
  }
];

const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const state = {
  reports: storage.get("vpw_reports", seedReports),
  articles: storage.get("vpw_articles", seedArticles),
  users: storage.get("vpw_users", []),
  subscribers: storage.get("vpw_subscribers", []),
  admin: storage.get("vpw_admin", false)
};

let pendingProtectedRoute = "";

state.users = state.users.map((user, index) => ({
  userId: user.userId || `VPW-${String(index + 1).padStart(6, "0")}`,
  email: user.email,
  provider: user.provider || "email",
  createdAt: user.createdAt || new Date().toISOString()
}));
storage.set("vpw_users", state.users);

function persistContent() {
  storage.set("vpw_reports", state.reports);
  storage.set("vpw_articles", state.articles);
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function makeUserId() {
  return `VPW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function sorted(items) {
  return [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function pageNameFromHash(hash) {
  const clean = hash.replace("#", "") || "home";
  const map = {
    home: "Victoria V1 Edition XXVII",
    intelligence: "Victoria Intelligence",
    insights: "Insights",
    about: "About Us",
    vision: "Vision & Mission",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    admin: "Admin Desk",
    reader: "Reading Room"
  };
  return map[clean.split("/")[0]] || "Victoria V1 Edition XXVII";
}

function isMemberSignedIn() {
  return Boolean(storage.get("vpw_current_user", "") || state.admin);
}

function isProtectedRoute(route) {
  return ["intelligence", "insights", "reader"].includes(route);
}

function setAuthMode(mode = "default") {
  const title = document.getElementById("auth-title");
  const message = document.getElementById("auth-message");
  if (mode === "protected") {
    title.textContent = "Sign in to access";
    message.textContent = "Limited to Members";
  } else {
    title.textContent = "Signup / Login";
    message.textContent = "Create or enter your member account to continue.";
  }
}

function completeMemberLogin(email) {
  storage.set("vpw_current_user", email);
  renderAdmin();
  setTimeout(() => {
    closeDialog("auth-dialog");
    if (pendingProtectedRoute) {
      const route = pendingProtectedRoute;
      pendingProtectedRoute = "";
      location.hash = route;
    }
  }, 450);
}

function renderRouter() {
  const hash = location.hash || "#home";
  const route = hash.replace("#", "").split("/")[0] || "home";
  if (isProtectedRoute(route) && !isMemberSignedIn()) {
    pendingProtectedRoute = hash;
    location.hash = "#home";
    setAuthMode("protected");
    openDialog("auth-dialog");
    return;
  }
  const pageId = `${route}-page`;
  document.querySelectorAll(".page").forEach(page => page.classList.toggle("active", page.id === pageId));
  if (!document.getElementById(pageId)) {
    location.hash = "#home";
    return;
  }
  document.getElementById("page-title").textContent = pageNameFromHash(hash);
  document.title = `VPW Research | ${pageNameFromHash(hash)}`;
  document.getElementById("main-menu").classList.remove("open");
  document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
  if (route === "reader") renderReader(hash.split("/")[1]);
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderFeatured() {
  const container = document.getElementById("featured-insights");
  container.innerHTML = sorted(state.articles).slice(0, 3).map((item, index) => `
    <a class="feature-card" href="#reader/${item.id}">
      <div>
        <span>Insight ${String(index + 1).padStart(2, "0")}</span>
        <h3>${item.title}</h3>
        <p>${item.subtitle}</p>
      </div>
      <span>${formatDate(item.date)}</span>
    </a>
  `).join("");
}

function renderLibrary(kind, query = "") {
  const items = kind === "reports" ? state.reports : state.articles;
  const container = document.getElementById(kind === "reports" ? "reports-list" : "articles-list");
  const filtered = sorted(items).filter(item => `${item.title} ${item.subtitle} ${item.body}`.toLowerCase().includes(query.toLowerCase()));
  container.innerHTML = filtered.map((item, index) => `
    <a class="library-row" href="#reader/${item.id}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3>${item.title}</h3>
        <p>${item.subtitle}</p>
      </div>
      <time>${formatDate(item.date)}</time>
    </a>
  `).join("") || `<p class="form-status">No matching ${kind === "reports" ? "reports" : "articles"} found.</p>`;
}

function findItem(id) {
  return [...state.reports, ...state.articles].find(item => item.id === id);
}

function renderReader(id) {
  const item = findItem(id);
  const reader = document.getElementById("reader-content");
  if (!item) {
    reader.innerHTML = `<p class="reader-meta">Reading Room</p><h1>Publication not found</h1><p>This item may have been deleted by the admin desk.</p>`;
    return;
  }
  const label = item.type === "reports" ? "Victoria Intelligence" : "Insights";
  document.getElementById("page-title").textContent = label;
  document.title = `${item.title} | VPW Research`;
  reader.innerHTML = `
    <p class="reader-meta">${label} / ${formatDate(item.date)} / ${item.author}</p>
    <h1>${item.title}</h1>
    <p class="lead">${item.subtitle}</p>
    <div class="reader-actions">
      <button type="button" id="reader-share">Share</button>
      <button type="button" id="reader-pdf">Download as PDF</button>
      <a class="secondary-button" href="#${item.type === "reports" ? "intelligence" : "insights"}">Back to ${label}</a>
    </div>
    <div class="reader-body">${item.body.split(/\n+/).map(paragraph => `<p>${paragraph}</p>`).join("")}</div>
  `;
  document.getElementById("reader-share").addEventListener("click", async () => {
    const shareUrl = location.href;
    if (navigator.share) {
      await navigator.share({ title: item.title, text: item.subtitle, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      document.getElementById("reader-share").textContent = "Link copied";
    }
  });
  document.getElementById("reader-pdf").addEventListener("click", () => window.print());
}

function renderAdmin() {
  document.getElementById("admin-gate").style.display = state.admin ? "none" : "block";
  document.getElementById("admin-console").classList.toggle("visible", state.admin);
  document.getElementById("admin-logout").style.display = state.admin ? "inline-flex" : "none";
  if (!state.admin) return;

  document.getElementById("admin-reports").innerHTML = sorted(state.reports).map(item => adminItem(item)).join("");
  document.getElementById("admin-articles").innerHTML = sorted(state.articles).map(item => adminItem(item)).join("");
  document.getElementById("admin-emails").innerHTML = state.subscribers.map(email => `<span>${email.email} - ${formatDate(email.date)}</span>`).join("") || "<span>No subscribers captured yet.</span>";
  document.getElementById("admin-users").innerHTML = state.users.map(user => `<span>${user.userId} - ${user.email} - ${user.provider} - ${formatDate(user.createdAt.slice(0, 10))}</span>`).join("") || "<span>No signup data captured yet.</span>";
}

function adminItem(item) {
  return `
    <div class="admin-item">
      <div><strong>${item.title}</strong><br><small>${formatDate(item.date)}</small></div>
      <button type="button" data-delete="${item.id}">Delete</button>
    </div>
  `;
}

function openDialog(id) {
  const dialog = document.getElementById(id);
  if (typeof dialog.showModal === "function") dialog.showModal();
}

function publishStructuredData() {
  document.querySelectorAll("[data-publication-schema]").forEach(node => node.remove());
  const publications = sorted([...state.reports, ...state.articles]).map(item => ({
    "@type": item.type === "reports" ? "Report" : "Article",
    headline: item.title,
    description: item.subtitle,
    author: { "@type": "Organization", name: item.author || "VPW Intelligence Desk" },
    publisher: { "@type": "Organization", name: "VPW Research" },
    datePublished: item.date,
    mainEntityOfPage: `${location.origin}${location.pathname}#reader/${item.id}`
  }));
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.publicationSchema = "true";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "VPW Research Publications",
    itemListElement: publications.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item
    }))
  });
  document.head.appendChild(script);
}

function closeDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
  if (dialog?.open) dialog.close();
}

function setupEvents() {
  document.getElementById("menu-toggle").addEventListener("click", () => {
    const menu = document.getElementById("main-menu");
    menu.classList.toggle("open");
    document.getElementById("menu-toggle").setAttribute("aria-expanded", menu.classList.contains("open"));
  });

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    storage.set("vpw_theme", next);
  });

  document.querySelectorAll("[data-auth-open]").forEach(button => button.addEventListener("click", () => {
    pendingProtectedRoute = "";
    setAuthMode("default");
    openDialog("auth-dialog");
  }));
  document.querySelectorAll("[data-admin-open]").forEach(button => button.addEventListener("click", () => openDialog("admin-dialog")));
  document.querySelectorAll("[data-dialog-close]").forEach(button => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });

  document.getElementById("auth-form").addEventListener("submit", event => {
    event.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    let user = state.users.find(existing => existing.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = { userId: makeUserId(), email, password, provider: "email", createdAt: new Date().toISOString() };
      state.users.push(user);
      storage.set("vpw_users", state.users);
      document.getElementById("auth-status").textContent = "Signup complete. You are logged in.";
    } else if (user.password === password) {
      document.getElementById("auth-status").textContent = "Login successful.";
    } else {
      document.getElementById("auth-status").textContent = "Password does not match this Email ID.";
      return;
    }
    completeMemberLogin(user.email);
  });

  document.getElementById("google-login").addEventListener("click", () => {
    const typedEmail = document.getElementById("auth-email").value.trim();
    const email = typedEmail || window.prompt("Enter your Google email to continue");
    if (!email) {
      document.getElementById("auth-status").textContent = "Google login cancelled.";
      return;
    }
    const existing = state.users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      state.users.push({ userId: makeUserId(), email, provider: "google", createdAt: new Date().toISOString() });
    }
    storage.set("vpw_users", state.users);
    document.getElementById("auth-status").textContent = "Google login successful.";
    completeMemberLogin(email);
  });

  document.getElementById("admin-login-form").addEventListener("submit", event => {
    event.preventDefault();
    const user = document.getElementById("admin-user").value.trim();
    const pass = document.getElementById("admin-pass").value;
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      state.admin = true;
      storage.set("vpw_admin", true);
      document.getElementById("admin-status").textContent = "Admin access granted.";
      document.getElementById("admin-dialog").close();
      location.hash = "#admin";
      renderAdmin();
    } else {
      document.getElementById("admin-status").textContent = "Admin credentials do not match.";
    }
  });

  document.getElementById("admin-logout").addEventListener("click", () => {
    state.admin = false;
    storage.set("vpw_admin", false);
    renderAdmin();
  });

  document.getElementById("publish-date").valueAsDate = new Date();
  document.getElementById("publish-form").addEventListener("submit", event => {
    event.preventDefault();
    if (!state.admin) return;
    const type = document.getElementById("publish-type").value;
    const title = document.getElementById("publish-title").value.trim();
    const item = {
      id: `${type}-${slugify(title)}-${Date.now()}`,
      type,
      title,
      subtitle: document.getElementById("publish-subtitle").value.trim(),
      author: document.getElementById("publish-author").value.trim(),
      date: document.getElementById("publish-date").value,
      body: document.getElementById("publish-body").value.trim()
    };
    state[type].push(item);
    persistContent();
    event.target.reset();
    document.getElementById("publish-date").valueAsDate = new Date();
    document.getElementById("publish-status").textContent = "Published successfully.";
    refreshAll();
  });

  document.querySelector(".admin-section").addEventListener("click", event => {
    const button = event.target.closest("[data-delete]");
    if (!button || !state.admin) return;
    const id = button.dataset.delete;
    state.reports = state.reports.filter(item => item.id !== id);
    state.articles = state.articles.filter(item => item.id !== id);
    persistContent();
    refreshAll();
  });

  document.getElementById("report-search").addEventListener("input", event => renderLibrary("reports", event.target.value));
  document.getElementById("article-search").addEventListener("input", event => renderLibrary("articles", event.target.value));

  document.getElementById("newsletter-form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.target;
    const email = document.getElementById("newsletter-email").value.trim();
    const status = document.getElementById("newsletter-status");
    state.subscribers.push({ email, date: new Date().toISOString().slice(0, 10) });
    storage.set("vpw_subscribers", state.subscribers);
    status.textContent = "Subscribing...";
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      status.textContent = response.ok ? "Subscribed. Welcome to VPW." : "Saved locally. Form endpoint needs checking.";
      form.reset();
    } catch {
      status.textContent = "Saved locally. Internet submission was not available.";
    }
    renderAdmin();
  });

  document.getElementById("export-emails").addEventListener("click", () => {
    const rows = [["Email", "Date"], ...state.subscribers.map(item => [item.email, item.date])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vpw-newsletter-emails.xls";
    anchor.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("export-users").addEventListener("click", () => {
    const rows = [
      ["Unique User ID", "Email", "Signup Method", "Signup Date"],
      ...state.users.map(user => [user.userId, user.email, user.provider, user.createdAt])
    ];
    const csv = rows.map(row => row.map(value => `"${String(value || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vpw-signup-data.xls";
    anchor.click();
    URL.revokeObjectURL(url);
  });

  document.querySelectorAll(".belief").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".belief").forEach(item => item.classList.remove("open"));
      button.classList.add("open");
    });
  });

  window.addEventListener("hashchange", renderRouter);
}

function refreshAll() {
  renderFeatured();
  renderLibrary("reports");
  renderLibrary("articles");
  renderAdmin();
  publishStructuredData();
}

function init() {
  const savedTheme = storage.get("vpw_theme", "dark");
  document.documentElement.dataset.theme = savedTheme;
  setupEvents();
  refreshAll();
  renderRouter();
  setTimeout(() => document.getElementById("loader").classList.add("hidden"), 650);
}

document.addEventListener("DOMContentLoaded", init);
