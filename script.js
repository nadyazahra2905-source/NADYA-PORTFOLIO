const STORAGE_KEY = "editablePortfolioDataNadyaElegantV1";
const defaultData = normalizePortfolioData(window.PORTFOLIO_DATA || {});
let portfolioData = loadSavedData();
let activeCategory = "All";
let editorDraft = null;

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizePortfolioData(data) {
  const source = data && typeof data === "object" ? data : {};
  const fallback = window.PORTFOLIO_DATA && source !== window.PORTFOLIO_DATA ? window.PORTFOLIO_DATA : {};
  const profile = { ...(fallback.profile || {}), ...(source.profile || {}) };
  const settings = { ...(fallback.settings || {}), ...(source.settings || {}) };
  const ui = { ...(fallback.ui || {}), ...(source.ui || {}) };
  const navigation = { ...(fallback.ui?.navigation || {}), ...(source.ui?.navigation || {}) };
  const headings = { ...(fallback.ui?.headings || {}), ...(source.ui?.headings || {}) };
  const actions = { ...(fallback.ui?.actions || {}), ...(source.ui?.actions || {}) };
  const filters = { ...(fallback.ui?.filters || {}), ...(source.ui?.filters || {}) };

  return {
    settings: {
      language: settings.language || "en",
      layout: settings.layout || "clean",
      accentColor: settings.accentColor || "#8d260c"
    },
    ui: {
      brandFallback: ui.brandFallback || "Portfolio",
      navigation: {
        about: navigation.about || "About",
        experience: navigation.experience || "Experience",
        projects: navigation.projects || "Projects",
        contact: navigation.contact || "Contact"
      },
      headings: {
        about: headings.about || "About & Skills",
        experience: headings.experience || "Experience & Education",
        projects: headings.projects || "Selected Projects",
        experienceColumn: headings.experienceColumn || "Experience",
        educationColumn: headings.educationColumn || "Education"
      },
      actions: {
        contact: actions.contact || "Contact Me",
        cv: actions.cv || "View CV",
        project: actions.project || "View project"
      },
      filters: {
        all: filters.all || "All"
      }
    },
    profile: {
      name: profile.name || "",
      role: profile.role || "",
      eyebrow: profile.eyebrow || "",
      summary: profile.summary || "",
      about: profile.about || "",
      profileImage: profile.profileImage || "images/profile.jpg",
      email: profile.email || "",
      phone: profile.phone || "",
      cv: profile.cv || "",
      contactTitle: profile.contactTitle || "Open to collaboration",
      contactCopy: profile.contactCopy || "",
      details: asArray(profile.details).map(item => ({
        label: item?.label || "",
        value: item?.value || ""
      })),
      socials: asArray(profile.socials).map(item => ({
        label: item?.label || "",
        url: item?.url || ""
      }))
    },
    skills: asArray(source.skills ?? fallback.skills).filter(Boolean),
    experience: asArray(source.experience ?? fallback.experience).map(item => ({
      company: item?.company || "",
      position: item?.position || "",
      year: item?.year || "",
      description: item?.description || ""
    })),
    education: asArray(source.education ?? fallback.education).map(item => ({
      institution: item?.institution || "",
      degree: item?.degree || "",
      year: item?.year || "",
      description: item?.description || ""
    })),
    projects: asArray(source.projects ?? fallback.projects).map(item => ({
      title: item?.title || "",
      year: item?.year || "",
      category: item?.category || "",
      role: item?.role || "",
      description: item?.description || "",
      image: item?.image || "",
      link: item?.link || ""
    }))
  };
}

function loadSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizePortfolioData(JSON.parse(saved)) : cloneData(defaultData);
  } catch (_) {
    return cloneData(defaultData);
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || "";
}

function setOptionalText(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  const text = String(value || "").trim();
  element.textContent = text;
  element.hidden = !text;
}

function render() {
  const { settings = {}, ui = {}, profile = {}, skills = [], experience = [], education = [] } = portfolioData;
  const brandFallback = ui.brandFallback || "Portfolio";
  const accentColor = settings.accentColor || "#8d260c";
  document.documentElement.style.setProperty("--accent", accentColor);
  document.documentElement.lang = settings.language || "id";
  document.body.className = `layout-${settings.layout || "clean"}`;
  document.body.style.setProperty("--accent", accentColor);
  document.title = `${profile.name || brandFallback} | ${brandFallback}`;

  setText("brand-name", profile.name || brandFallback);
  setText("nav-about", ui.navigation?.about);
  setText("nav-experience", ui.navigation?.experience);
  setText("nav-projects", ui.navigation?.projects);
  setText("nav-contact", ui.navigation?.contact);
  setText("about-heading", ui.headings?.about);
  setText("experience-heading", ui.headings?.experience);
  setText("projects-heading", ui.headings?.projects);
  setText("experience-column-heading", ui.headings?.experienceColumn);
  setText("education-column-heading", ui.headings?.educationColumn);
  setText("hero-eyebrow", profile.eyebrow);
  setText("profile-name", profile.name);
  setText("profile-role", profile.role);
  setOptionalText("profile-summary", profile.summary);
  setText("about-text", profile.about);
  setText("contact-title", profile.contactTitle || "Open to collaboration");
  setText("contact-copy", profile.contactCopy);
  setText("email-link", profile.email);
  setText("phone-link", profile.phone);
  setText("contact-button", ui.actions?.contact);
  setText("cv-link", ui.actions?.cv);
  setText("footer-name", profile.name);
  setText("current-year", new Date().getFullYear());

  const photo = document.getElementById("profile-image");
  photo.src = profile.profileImage || "images/profile.jpg";
  photo.alt = `${profile.name || "Profile"} photo`;
  document.getElementById("cv-link").href = profile.cv || "#";
  document.getElementById("email-link").href = `mailto:${profile.email || ""}`;
  document.getElementById("phone-link").href = `tel:${String(profile.phone || "").replace(/[^+\d]/g, "")}`;
  document.getElementById("contact-button").href = `mailto:${profile.email || ""}`;

  document.getElementById("social-links").replaceChildren(...asArray(profile.socials).map(social => {
    const link = document.createElement("a");
    link.href = social.url || "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = social.label;
    return link;
  }));

  renderProfileDetails(profile.details);

  document.getElementById("skills").replaceChildren(...asArray(skills).map(name => {
    const item = document.createElement("span");
    item.className = "skill";
    item.textContent = name;
    return item;
  }));

  renderTimeline("experience-list", experience, "company", "position");
  renderTimeline("education-list", education, "institution", "degree");
  renderFilters();
  renderProjects();
}

function renderProfileDetails(items = []) {
  const target = document.getElementById("profile-details");
  const details = asArray(items).filter(item => item.label || item.value);
  const nodes = details.map(item => {
    const wrapper = document.createElement("dl");
    wrapper.className = "profile-detail";
    wrapper.innerHTML = "<dt></dt><dd></dd>";
    wrapper.querySelector("dt").textContent = item.label || "Detail";
    wrapper.querySelector("dd").textContent = item.value || "";
    return wrapper;
  });
  target.hidden = details.length === 0;
  target.replaceChildren(...nodes);
}

function renderTimeline(targetId, items, titleKey, roleKey) {
  const nodes = asArray(items).map(item => {
    const article = document.createElement("article");
    article.className = "timeline-item";
    article.innerHTML = `<h3></h3><p class="timeline-role"></p><p class="timeline-year"></p><p class="timeline-description"></p>`;
    article.querySelector("h3").textContent = item[titleKey] || "";
    article.querySelector(".timeline-role").textContent = item[roleKey] || "";
    article.querySelector(".timeline-year").textContent = item.year || "";
    article.querySelector(".timeline-description").textContent = item.description || "";
    return article;
  });
  document.getElementById(targetId).replaceChildren(...nodes);
}

function renderFilters() {
  const projects = asArray(portfolioData.projects);
  const allLabel = portfolioData.ui?.filters?.all || "All";
  const categories = [allLabel, ...new Set(projects.map(project => project.category).filter(Boolean))];
  if (!categories.includes(activeCategory)) activeCategory = allLabel;
  const buttons = categories.map(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-button${category === activeCategory ? " active" : ""}`;
    button.textContent = category;
    button.addEventListener("click", () => { activeCategory = category; renderFilters(); renderProjects(); });
    return button;
  });
  document.getElementById("project-filters").replaceChildren(...buttons);
}

function renderProjects() {
  const allLabel = portfolioData.ui?.filters?.all || "All";
  const projectLinkLabel = portfolioData.ui?.actions?.project || "View project";
  const projects = asArray(portfolioData.projects).filter(project => activeCategory === allLabel || project.category === activeCategory);
  const cards = projects.map(project => {
    const article = document.createElement("article");
    article.className = "project-card";
    const linkMarkup = project.link ? `<a class="project-link" target="_blank" rel="noopener noreferrer"></a>` : "";
    article.innerHTML = `<div class="project-image"><img loading="lazy"></div><div class="project-content"><div class="project-meta"><span></span><span></span><span></span></div><h3></h3><p></p>${linkMarkup}</div>`;
    const image = article.querySelector("img");
    image.src = project.image || "images/project1.png";
    image.alt = project.title || "Project image";
    const meta = article.querySelectorAll(".project-meta span");
    meta[0].textContent = project.year || "";
    meta[1].textContent = project.category || "";
    meta[2].textContent = project.role || "";
    article.querySelector("h3").textContent = project.title || "";
    article.querySelector(".project-content > p").textContent = project.description || "";
    if (project.link) {
      const projectLink = article.querySelector(".project-link");
      projectLink.href = project.link;
      projectLink.textContent = projectLinkLabel;
    }
    return article;
  });
  document.getElementById("projects-grid").replaceChildren(...cards);
}

const repeaterFields = {
  profileDetails: [
    ["label", "Label"], ["value", "Value"]
  ],
  experience: [
    ["company", "Company / institution"], ["position", "Position"],
    ["year", "Year"], ["description", "Description", "textarea"]
  ],
  education: [
    ["institution", "Institution"], ["degree", "Program / degree"],
    ["year", "Year"], ["description", "Description", "textarea"]
  ],
  projects: [
    ["title", "Project name"], ["year", "Year"], ["category", "Category"],
    ["role", "Role"], ["image", "Image path"], ["link", "Project link"],
    ["description", "Description", "textarea"]
  ]
};

function fieldValue(id, value) {
  const input = document.getElementById(id);
  if (!input) return "";
  if (arguments.length === 1) return input.value.trim();
  input.value = value || "";
  return "";
}

function setEditorStatus(message, type = "info") {
  const status = document.getElementById("editor-status");
  if (!status) return;
  status.style.color = type === "success" ? "#176b5b" : "#b42318";
  status.textContent = message || "";
}

function getRepeaterItems(type) {
  if (type === "profileDetails") return editorDraft.profile?.details || [];
  return editorDraft[type] || [];
}

function setRepeaterItems(type, items) {
  if (type === "profileDetails") {
    editorDraft.profile = editorDraft.profile || {};
    editorDraft.profile.details = items;
    return;
  }
  editorDraft[type] = items;
}

function renderRepeater(type) {
  const target = document.getElementById(`${type}-editor`);
  const items = getRepeaterItems(type);
  const nodes = items.map((item, index) => {
    const wrapper = document.createElement("article");
    wrapper.className = "repeat-item";
    wrapper.dataset.index = index;
    const grid = document.createElement("div");
    grid.className = "form-grid";

    repeaterFields[type].forEach(([key, labelText, inputType]) => {
      const label = document.createElement("label");
      if (inputType === "textarea") label.className = "full-field";
      label.append(document.createTextNode(labelText));
      const input = inputType === "textarea" ? document.createElement("textarea") : document.createElement("input");
      input.dataset.field = key;
      input.value = item[key] || "";
      if (inputType === "textarea") input.rows = 3;
      label.appendChild(input);
      grid.appendChild(label);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-item";
    remove.title = "Remove item";
    remove.setAttribute("aria-label", "Remove item");
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      syncEditorDraft();
      const nextItems = getRepeaterItems(type);
      nextItems.splice(index, 1);
      setRepeaterItems(type, nextItems);
      renderRepeater(type);
    });
    wrapper.append(grid, remove);
    return wrapper;
  });
  target.replaceChildren(...nodes);
}

function collectRepeater(type) {
  return [...document.querySelectorAll(`#${type}-editor .repeat-item`)].map(item => {
    const result = {};
    item.querySelectorAll("[data-field]").forEach(input => { result[input.dataset.field] = input.value.trim(); });
    return result;
  });
}

function syncEditorDraft() {
  const socials = fieldValue("edit-socials").split("\n").map(line => line.trim()).filter(Boolean).map(line => {
    const separator = line.indexOf("|");
    return separator < 0
      ? { label: line, url: "" }
      : { label: line.slice(0, separator).trim(), url: line.slice(separator + 1).trim() };
  });

  editorDraft.settings = {
    ...(editorDraft.settings || {}),
    layout: document.getElementById("layout-select").value,
    accentColor: document.getElementById("accent-input").value
  };
  editorDraft.profile = {
    ...(editorDraft.profile || {}),
    name: fieldValue("edit-name"), role: fieldValue("edit-role"), eyebrow: fieldValue("edit-eyebrow"),
    summary: fieldValue("edit-summary"), about: fieldValue("edit-about"), email: fieldValue("edit-email"),
    phone: fieldValue("edit-phone"), profileImage: fieldValue("edit-photo"), cv: fieldValue("edit-cv"),
    contactTitle: fieldValue("edit-contact-title"), contactCopy: fieldValue("edit-contact-copy"), socials,
    details: collectRepeater("profileDetails")
  };
  editorDraft.skills = fieldValue("edit-skills").split("\n").map(item => item.trim()).filter(Boolean);
  editorDraft.experience = collectRepeater("experience");
  editorDraft.education = collectRepeater("education");
  editorDraft.projects = collectRepeater("projects");
}

function populateEditor() {
  const profile = editorDraft.profile || {};
  document.getElementById("layout-select").value = editorDraft.settings?.layout || "clean";
  document.getElementById("accent-input").value = editorDraft.settings?.accentColor || "#8d260c";
  fieldValue("edit-name", profile.name); fieldValue("edit-role", profile.role); fieldValue("edit-eyebrow", profile.eyebrow);
  fieldValue("edit-summary", profile.summary); fieldValue("edit-about", profile.about); fieldValue("edit-email", profile.email);
  fieldValue("edit-phone", profile.phone); fieldValue("edit-photo", profile.profileImage); fieldValue("edit-cv", profile.cv);
  fieldValue("edit-contact-title", profile.contactTitle); fieldValue("edit-contact-copy", profile.contactCopy);
  fieldValue("edit-skills", (editorDraft.skills || []).join("\n"));
  fieldValue("edit-socials", (profile.socials || []).map(item => `${item.label} | ${item.url}`).join("\n"));
  renderRepeater("profileDetails"); renderRepeater("experience"); renderRepeater("education"); renderRepeater("projects");
}

function openEditor() {
  editorDraft = cloneData(portfolioData);
  populateEditor();
  setEditorStatus("");
  document.getElementById("editor-dialog").showModal();
}

function applyEditor() {
  syncEditorDraft();
  portfolioData = normalizePortfolioData(editorDraft);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioData));
  render();
  setEditorStatus("Changes saved successfully.", "success");
}

function exportJson() {
  const dialog = document.getElementById("editor-dialog");
  if (dialog.open && editorDraft) syncEditorDraft();
  const dataToExport = dialog.open && editorDraft ? editorDraft : portfolioData;
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "portofolio-data.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

document.getElementById("open-editor").addEventListener("click", openEditor);
document.getElementById("apply-data").addEventListener("click", applyEditor);
document.getElementById("export-json").addEventListener("click", exportJson);
document.getElementById("clear-summary").addEventListener("click", () => {
  fieldValue("edit-summary", "");
  setEditorStatus("Summary cleared. Press Save Changes.");
});
document.getElementById("add-profile-detail").addEventListener("click", () => {
  syncEditorDraft();
  const details = getRepeaterItems("profileDetails");
  details.push({ label: "", value: "" });
  setRepeaterItems("profileDetails", details);
  renderRepeater("profileDetails");
});
document.getElementById("reset-data").addEventListener("click", () => {
  portfolioData = cloneData(defaultData);
  editorDraft = cloneData(defaultData);
  localStorage.removeItem(STORAGE_KEY);
  populateEditor();
  render();
  setEditorStatus("Data has been restored to the default version.", "success");
});
document.getElementById("import-json").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      editorDraft = normalizePortfolioData(JSON.parse(reader.result));
      populateEditor();
      setEditorStatus("Data imported successfully. Press Save Changes.", "success");
    } catch (_) {
      setEditorStatus("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

document.querySelectorAll(".editor-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".editor-tab").forEach(item => item.classList.toggle("active", item === tab));
    document.querySelectorAll(".editor-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === tab.dataset.tab));
  });
});

document.getElementById("add-experience").addEventListener("click", () => {
  syncEditorDraft();
  editorDraft.experience = asArray(editorDraft.experience);
  editorDraft.experience.push({ company: "", position: "", year: "", description: "" });
  renderRepeater("experience");
});
document.getElementById("add-education").addEventListener("click", () => {
  syncEditorDraft();
  editorDraft.education = asArray(editorDraft.education);
  editorDraft.education.push({ institution: "", degree: "", year: "", description: "" });
  renderRepeater("education");
});
document.getElementById("add-project").addEventListener("click", () => {
  syncEditorDraft();
  editorDraft.projects = asArray(editorDraft.projects);
  editorDraft.projects.push({ title: "", year: "", category: "", role: "", description: "", image: "", link: "" });
  renderRepeater("projects");
});

const updateHeader = () => {
  document.querySelector(".topbar").classList.toggle("scrolled", window.scrollY > 80);
};
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

render();
