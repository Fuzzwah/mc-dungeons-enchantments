(() => {
  "use strict";

  const payload = window.ENCHANTMENT_DATA;
  const records = payload.records;
  const categories = ["All", "Melee", "Ranged", "Armor", "Built-in"];
  const gearCategories = categories.slice(1);
  const tierOrder = ["S", "A", "B", "C", "D"];
  const rankScore = { S: 5, A: 4, B: 3, C: 2, D: 1 };
  const rankLabels = {
    S: "Build-defining",
    A: "Excellent",
    B: "Strong",
    C: "Situational",
    D: "Outclassed",
  };
  const categoryColors = {
    All: "#9a74ff",
    Melee: "#ff6f73",
    Ranged: "#65c7ff",
    Armor: "#75df9b",
    "Built-in": "#f4ba55",
  };
  const rankColors = {
    S: "#ff6969",
    A: "#ffad5c",
    B: "#f1dc63",
    C: "#75d98d",
    D: "#6b9fe8",
  };

  const state = {
    view: "catalogue",
    category: "All",
    tierCategory: "Melee",
    query: "",
    sort: "name",
    itemName: "",
    itemCategory: "Melee",
    slots: ["", "", ""],
  };

  const elements = {
    viewTabs: [...document.querySelectorAll(".view-tab")],
    catalogueView: document.querySelector("#catalogue-view"),
    tierView: document.querySelector("#tier-view"),
    evaluatorView: document.querySelector("#evaluator-view"),
    filtersRow: document.querySelector(".filters-row"),
    categoryFilters: document.querySelector("#category-filters"),
    tierCategorySwitcher: document.querySelector("#tier-category-switcher"),
    search: document.querySelector("#search"),
    sort: document.querySelector("#sort"),
    catalogueGrid: document.querySelector("#catalogue-grid"),
    tierBoard: document.querySelector("#tier-board"),
    resultCount: document.querySelector("#result-count"),
    emptyState: document.querySelector("#empty-state"),
    clearSearch: document.querySelector("#clear-search"),
    dialog: document.querySelector("#details-dialog"),
    dialogContent: document.querySelector("#dialog-content"),
    dialogClose: document.querySelector(".dialog-close"),
    evaluatorForm: document.querySelector("#evaluator-form"),
    itemName: document.querySelector("#item-name"),
    itemCategory: document.querySelector("#item-category"),
    slotSelects: [...document.querySelectorAll(".slot-select")],
    evaluationResult: document.querySelector("#evaluation-result"),
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getUniqueGroups(source = records) {
    const groups = new Map();
    source.forEach((record) => {
      if (!groups.has(record.name)) {
        groups.set(record.name, { name: record.name, entries: [] });
      }
      groups.get(record.name).entries.push(record);
    });
    return [...groups.values()].map((group) => {
      const entries = [...group.entries].sort((a, b) =>
        gearCategories.indexOf(a.category) - gearCategories.indexOf(b.category)
      );
      const lead = entries.reduce((best, item) =>
        rankScore[item.rank] > rankScore[best.rank] ? item : best
      );
      return {
        ...lead,
        id: `group-${lead.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        entries,
        categories: entries.map((entry) => entry.category),
        builtInto: [...new Set(entries.flatMap((entry) => entry.builtInto))],
      };
    });
  }

  function matchesQuery(item) {
    if (!state.query) return true;
    const haystack = [
      item.name,
      item.description,
      ...(item.categories || [item.category]),
      ...(item.builtInto || []),
    ].join(" ").toLowerCase();
    return haystack.includes(state.query);
  }

  function catalogueItems() {
    let items;
    if (state.category === "All") {
      items = getUniqueGroups();
    } else {
      items = records
        .filter((record) => record.category === state.category)
        .map((record) => ({ ...record, entries: [record], categories: [record.category] }));
    }
    items = items.filter(matchesQuery);
    items.sort((a, b) => {
      if (state.sort === "tier") {
        return rankScore[b.rank] - rankScore[a.rank] || a.name.localeCompare(b.name);
      }
      if (state.sort === "rarity") {
        const rarity = (item) => item.rarity === "Powerful" ? 2 : item.rarity === "Common" ? 1 : 0;
        return rarity(b) - rarity(a) || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
    return items;
  }

  function renderCategoryControls() {
    elements.categoryFilters.innerHTML = categories.map((category) => `
      <button
        type="button"
        class="filter-chip ${state.category === category ? "is-active" : ""}"
        data-category="${category}"
        aria-pressed="${state.category === category}"
        style="--chip-color:${categoryColors[category]}"
      >${category}</button>
    `).join("");

    elements.tierCategorySwitcher.innerHTML = gearCategories.map((category) => `
      <button
        type="button"
        class="tier-category-button ${state.tierCategory === category ? "is-active" : ""}"
        data-tier-category="${category}"
        aria-pressed="${state.tierCategory === category}"
        style="--chip-color:${categoryColors[category]}"
      >${category}</button>
    `).join("");
  }

  function iconMarkup(item, className = "") {
    if (!item.icon) {
      return `<span class="placeholder-icon ${className}" aria-label="No official icon"><span>?</span></span>`;
    }
    return `<img class="${className}" src="${escapeHtml(item.icon)}" alt="" width="72" height="72" loading="lazy">`;
  }

  function evaluatorOptions() {
    return records
      .filter((record) => record.category === state.itemCategory)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function renderEvaluatorOptions() {
    const options = evaluatorOptions();
    elements.slotSelects.forEach((select, index) => {
      const selected = state.slots[index];
      select.innerHTML = `<option value="">Choose an enchantment</option>${options.map((item) => `
        <option value="${escapeHtml(item.id)}" ${item.id === selected ? "selected" : ""}>${escapeHtml(item.name)} — ${item.rank} tier</option>
      `).join("")}`;
    });
  }

  function evaluationRank(score) {
    if (score >= 4.5) return "S";
    if (score >= 3.5) return "A";
    if (score >= 2.5) return "B";
    if (score >= 1.5) return "C";
    return "D";
  }

  function renderEvaluationResult() {
    const selected = state.slots
      .map((id) => records.find((record) => record.id === id))
      .filter(Boolean);

    if (!selected.length) {
      elements.evaluationResult.innerHTML = `
        <div class="evaluation-empty">
          <strong>Select at least one enchantment</strong>
          <span>The evaluator will average the selected enchantment tier ratings.</span>
        </div>`;
      return;
    }

    const score = selected.reduce((total, item) => total + rankScore[item.rank], 0) / selected.length;
    const rank = evaluationRank(score);
    const itemName = state.itemName || "Unnamed item";
    elements.evaluationResult.innerHTML = `
      <div class="evaluation-summary" style="--rank-color:${rankColors[rank]}">
        <div class="evaluation-rating">
          <span>Estimated item tier</span>
          <strong>${rank}</strong>
          <em>${rankLabels[rank]}</em>
        </div>
        <div class="evaluation-copy">
          <p class="section-kicker">${escapeHtml(state.itemCategory)} item report</p>
          <h3>${escapeHtml(itemName)}</h3>
          <p>Average enchantment rating: <strong>${score.toFixed(1)} / 5</strong> across ${selected.length} selected slot${selected.length === 1 ? "" : "s"}.</p>
        </div>
      </div>
      <div class="evaluation-slots">
        ${state.slots.map((id, index) => {
          const item = records.find((record) => record.id === id);
          return `<div class="evaluation-slot">
            <span>Slot ${index + 1}</span>
            ${item ? `<strong>${escapeHtml(item.name)}</strong><em class="mini-rank" style="--rank-color:${rankColors[item.rank]}">${item.rank} · ${rankLabels[item.rank]}</em>` : "<strong class=\"unfilled-slot\">Not selected</strong>"}
          </div>`;
        }).join("")}
      </div>`;
  }

  function tierPreview(item) {
    const values = item.tiers || [];
    if (values.every((value) => value === "—")) {
      const itemText = item.builtInto?.length ? item.builtInto.join(" · ") : "Unique equipment effect";
      return `<p class="built-in-items" title="${escapeHtml(itemText)}">Found on ${escapeHtml(itemText)}</p>`;
    }
    return `<div class="tier-preview" aria-label="Tier values">
      ${values.map((value, index) => `<div><span>${["I", "II", "III"][index]}</span><strong title="${escapeHtml(value)}">${escapeHtml(value)}</strong></div>`).join("")}
    </div>`;
  }

  function cardMarkup(item) {
    const color = categoryColors[item.categories[0]];
    const powerful = item.entries.some((entry) => entry.rarity === "Powerful");
    return `
      <article
        class="enchantment-card"
        data-name="${escapeHtml(item.name)}"
        tabindex="0"
        role="button"
        aria-label="View ${escapeHtml(item.name)} details"
        style="--category-color:${color};--rank-color:${rankColors[item.rank]}"
      >
        <div class="card-head">
          <div class="icon-well">${iconMarkup(item)}</div>
          <span class="rank-badge" title="${item.rank} tier — ${rankLabels[item.rank]}">${item.rank}</span>
        </div>
        <div class="tag-row">
          ${item.categories.map((category) => `<span class="category-tag" style="--tag-color:${categoryColors[category]}">${category}</span>`).join("")}
          <span class="rarity-tag ${powerful ? "powerful" : ""}">${powerful ? "Powerful" : item.rarity}</span>
        </div>
        <h3 class="card-name">${escapeHtml(item.name)}</h3>
        <p class="card-description">${escapeHtml(item.description)}</p>
        ${tierPreview(item)}
      </article>`;
  }

  function renderCatalogue() {
    const items = catalogueItems();
    elements.catalogueGrid.innerHTML = items.map(cardMarkup).join("");
    elements.resultCount.textContent = `${items.length} ${items.length === 1 ? "enchantment" : "enchantments"}`;
    elements.emptyState.hidden = items.length !== 0 || state.view !== "catalogue";
    elements.catalogueView.hidden = state.view !== "catalogue" || items.length === 0;
  }

  function renderTierBoard() {
    const tierRecords = records
      .filter((record) => record.category === state.tierCategory)
      .filter((record) => matchesQuery({ ...record, categories: [record.category] }));

    elements.tierBoard.innerHTML = tierOrder.map((rank) => {
      const items = tierRecords.filter((record) => record.rank === rank).sort((a, b) => a.name.localeCompare(b.name));
      return `
        <section class="tier-row" aria-labelledby="tier-${rank}" style="--rank-color:${rankColors[rank]}">
          <div class="tier-label">
            <strong id="tier-${rank}">${rank}</strong>
            <span>${rankLabels[rank]}</span>
          </div>
          <div class="tier-items">
            ${items.length ? items.map((item) => `
              <button class="tier-item" type="button" data-record-id="${escapeHtml(item.id)}" style="--category-color:${categoryColors[item.category]}">
                ${item.icon ? `<img src="${escapeHtml(item.icon)}" alt="" width="44" height="44" loading="lazy">` : `<span class="mini-placeholder">?</span>`}
                <span class="tier-item-copy"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.rarity)}</span></span>
              </button>
            `).join("") : `<span class="empty-tier">No matches in this tier.</span>`}
          </div>
        </section>`;
    }).join("");

    elements.emptyState.hidden = tierRecords.length !== 0 || state.view !== "tier";
    elements.tierView.hidden = state.view !== "tier" || tierRecords.length === 0;
  }

  function setView(view) {
    state.view = view;
    elements.viewTabs.forEach((tab) => {
      const active = tab.dataset.view === view;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    elements.filtersRow.hidden = view !== "catalogue";
    elements.catalogueView.hidden = view !== "catalogue";
    elements.tierView.hidden = view !== "tier";
    elements.evaluatorView.hidden = view !== "evaluator";
    render();
  }

  function showDetailsByName(name) {
    const group = getUniqueGroups().find((item) => item.name === name);
    if (group) showDetails(group);
  }

  function showDetailsById(id) {
    const record = records.find((item) => item.id === id);
    if (record) showDetails({ ...record, entries: [record], categories: [record.category] });
  }

  function showDetails(item) {
    const lead = item.entries[0];
    const color = categoryColors[lead.category];
    const placements = item.entries.map((entry) => {
      const hasValues = entry.tiers.some((value) => value !== "—");
      return `
        <section class="dialog-section">
          <div class="placement-heading">
            <h3>${entry.category}</h3>
            <span class="rank-badge" style="--rank-color:${rankColors[entry.rank]}" title="${entry.rank} tier — ${rankLabels[entry.rank]}">${entry.rank}</span>
          </div>
          ${hasValues ? `
            <div class="dialog-tier-grid">
              ${entry.tiers.map((value, index) => `<div><span>Tier ${["I", "II", "III"][index]}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}
            </div>
            <p class="tier-metric">Scales by ${escapeHtml(entry.tierLabel.toLowerCase())}.</p>
          ` : `<p class="tier-metric">This effect is fixed on its unique equipment and cannot be rolled normally.</p>`}
          ${entry.builtInto.length ? `
            <div class="dialog-section">
              <h3>Built into</h3>
              <div class="item-list">${entry.builtInto.map((name) => `<span>${escapeHtml(name)}</span>`).join("")}</div>
            </div>` : ""}
        </section>`;
    }).join("");

    elements.dialogContent.innerHTML = `
      <div class="dialog-body" style="--category-color:${color}">
        <div class="dialog-hero">
          <div class="dialog-icon-well">${iconMarkup(lead)}</div>
          <div>
            <div class="tag-row">${item.categories.map((category) => `<span class="category-tag" style="--tag-color:${categoryColors[category]}">${category}</span>`).join("")}</div>
            <h2 id="dialog-title">${escapeHtml(item.name)}</h2>
            <p>${escapeHtml(lead.description)}</p>
          </div>
        </div>
        ${placements}
      </div>`;
    elements.dialog.showModal();
  }

  function render() {
    renderCategoryControls();
    elements.emptyState.hidden = true;
    if (state.view === "catalogue") {
      renderCatalogue();
    } else if (state.view === "tier") {
      renderTierBoard();
    } else {
      renderEvaluatorOptions();
      renderEvaluationResult();
    }
  }

  function bindEvents() {
    elements.viewTabs.forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));

    elements.categoryFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      state.category = button.dataset.category;
      render();
    });

    elements.tierCategorySwitcher.addEventListener("click", (event) => {
      const button = event.target.closest("[data-tier-category]");
      if (!button) return;
      state.tierCategory = button.dataset.tierCategory;
      render();
    });

    elements.itemCategory.addEventListener("change", () => {
      state.itemCategory = elements.itemCategory.value;
      state.slots = ["", "", ""];
      renderEvaluatorOptions();
      renderEvaluationResult();
    });

    elements.evaluatorForm.addEventListener("submit", (event) => {
      event.preventDefault();
      state.itemName = elements.itemName.value.trim();
      renderEvaluationResult();
    });

    elements.slotSelects.forEach((select, index) => {
      select.addEventListener("change", () => {
        state.slots[index] = select.value;
        renderEvaluationResult();
      });
    });

    elements.search.addEventListener("input", () => {
      state.query = elements.search.value.trim().toLowerCase();
      render();
    });

    elements.sort.addEventListener("change", () => {
      state.sort = elements.sort.value;
      renderCatalogue();
    });

    elements.catalogueGrid.addEventListener("click", (event) => {
      const card = event.target.closest("[data-name]");
      if (card) showDetailsByName(card.dataset.name);
    });

    elements.catalogueGrid.addEventListener("keydown", (event) => {
      const card = event.target.closest("[data-name]");
      if (card && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        showDetailsByName(card.dataset.name);
      }
    });

    elements.tierBoard.addEventListener("click", (event) => {
      const button = event.target.closest("[data-record-id]");
      if (button) showDetailsById(button.dataset.recordId);
    });

    elements.clearSearch.addEventListener("click", () => {
      state.query = "";
      elements.search.value = "";
      render();
      elements.search.focus();
    });

    elements.dialogClose.addEventListener("click", () => elements.dialog.close());
    elements.dialog.addEventListener("click", (event) => {
      if (event.target === elements.dialog) elements.dialog.close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && document.activeElement !== elements.search && !elements.dialog.open) {
        event.preventDefault();
        elements.search.focus();
      }
    });
  }

  function init() {
    const uniqueCount = new Set(records.map((record) => record.name)).size;
    document.querySelector("#unique-count").textContent = uniqueCount;
    document.querySelector("#placement-count").textContent = records.length;
    bindEvents();
    render();
  }

  init();
})();
