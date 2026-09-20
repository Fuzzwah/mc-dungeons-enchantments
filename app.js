(() => {
  "use strict";

  const payload = window.ENCHANTMENT_DATA;
  const records = payload.records;
  const categories = ["All", "Melee", "Ranged", "Armor", "Built-in"];
  const gearCategories = categories.slice(1);
  const familyDefinitions = [
    { id: "roll", label: "Roll & Evade", color: "#b990ff", test: /roll|dodge|evade|tumble|swiftfoot|acrobat/i },
    { id: "souls", label: "Soul Build", color: "#a58cff", test: /soul/i },
    { id: "artifacts", label: "Artifact Loop", color: "#f4ba55", test: /artifact/i },
    { id: "elemental", label: "Elemental Damage", color: "#ff7f8d", test: /fire|poison|lightning|thunder|shock|electr|freeze|chill|burn/i },
    { id: "control", label: "Crowd Control", color: "#65c7ff", test: /stun|bind|hold|slow|pull|gravity|levitation|chain/i },
    { id: "survival", label: "Survival & Healing", color: "#75df9b", test: /health|heal|shield|damage reduction|protect|weakening|potion/i },
  ];
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
    family: "All",
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
    familyFilters: document.querySelector("#family-filters"),
    familyFilterRow: document.querySelector(".family-filter-row"),
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
    slotFields: document.querySelector(".slot-fields"),
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

  function getFamilies(item) {
    const haystack = `${item.name} ${item.description}`.toLowerCase();
    return familyDefinitions
      .filter((family) => family.test.test(haystack))
      .map((family) => family.id);
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
        entries,
        families: [...new Set(entries.flatMap(getFamilies))],
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
  function matchesFamily(item) {
    return state.family === "All" || (item.families || getFamilies(item)).includes(state.family);
  }

  function catalogueItems() {
    let items;
    if (state.category === "All") {
      items = getUniqueGroups();
    } else {
      items = records
        .filter((record) => record.category === state.category)
        .map((record) => ({ ...record, entries: [record], categories: [record.category], families: getFamilies(record) }));
    }
    items = items.filter(matchesFamily).filter(matchesQuery);
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

    elements.familyFilters.innerHTML = [
      { id: "All", label: "All styles", color: "#9a74ff" },
      ...familyDefinitions,
    ].map((family) => `
      <button
        type="button"
        class="family-filter ${state.family === family.id ? "is-active" : ""}"
        data-family="${family.id}"
        aria-pressed="${state.family === family.id}"
        style="--family-color:${family.color}"
      >${family.label}</button>
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
      const selectedItem = options.find((item) => item.id === selected);
      select.innerHTML = `<option value="">Choose an enchantment</option>${options.map((item) => `
        <option value="${escapeHtml(item.id)}" ${item.id === selected ? "selected" : ""}>${escapeHtml(item.name)} — ${item.rank} tier</option>
      `).join("")}`;
      select.classList.add("native-slot-select");
      select.setAttribute("aria-hidden", "true");
      let picker = select.parentElement.querySelector(".custom-slot-picker");
      if (!picker) {
        select.insertAdjacentHTML("afterend", `<div class="custom-slot-picker" data-slot-picker="${index}"></div>`);
        picker = select.parentElement.querySelector(".custom-slot-picker");
      }
      picker.innerHTML = `
        <button class="slot-picker-toggle" type="button" aria-haspopup="listbox" aria-expanded="false">
          ${selectedItem ? `<img src="${escapeHtml(selectedItem.icon)}" alt="" width="42" height="42"><span>${escapeHtml(selectedItem.name)}<em>${selectedItem.rank} tier</em></span>` : "<span>Choose an enchantment</span>"}
          <span class="picker-chevron" aria-hidden="true">⌄</span>
        </button>
        <div class="slot-picker-menu" role="listbox" hidden>
          <button class="slot-picker-option is-empty" type="button" role="option" data-slot-value="">Clear slot</button>
          ${options.map((item) => `
            <button class="slot-picker-option ${item.id === selected ? "is-selected" : ""}" type="button" role="option" data-slot-value="${escapeHtml(item.id)}">
              <img src="${escapeHtml(item.icon)}" alt="" width="42" height="42">
              <span>${escapeHtml(item.name)}<em>${item.rank} tier · ${rankLabels[item.rank]}</em></span>
            </button>
          `).join("")}
        </div>`;
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
          ${(item.families || []).map((id) => {
            const family = familyDefinitions.find((entry) => entry.id === id);
            return `<span class="family-tag" style="--family-color:${family.color}">${family.label}</span>`;
          }).join("")}
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
      .filter((record) => matchesFamily(record))
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
    elements.familyFilterRow.hidden = view === "evaluator";
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
        <section class="dialog-section" style="--category-color:${categoryColors[entry.category]}">
          <div class="placement-heading">
            <h3>${entry.category} upgrade tiers</h3>
            <span class="rank-badge" style="--rank-color:${rankColors[entry.rank]}" title="${entry.rank} tier — ${rankLabels[entry.rank]}">${entry.rank}</span>
          </div>
          ${hasValues ? `
            <div class="dialog-upgrade-list">
              ${entry.tiers.map((value, index) => `
                <div class="dialog-upgrade-row ${index === 0 ? "is-current" : ""}">
                  <span class="tier-diamond"><span>${["I", "II", "III"][index]}</span></span>
                  <strong>${escapeHtml(value)}</strong>
                </div>`).join("")}
            </div>
            <p class="tier-metric">Scales by ${escapeHtml(entry.tierLabel.toLowerCase())}.</p>
          ` : `<p class="tier-metric">This effect is fixed on its unique equipment and cannot be rolled normally.</p>`}
        </section>`;
    }).join("");
    const builtInto = item.builtInto?.length ? `
      <section class="dialog-section dialog-built-into">
        <h3>Built into</h3>
        <div class="item-list">${item.builtInto.map((name) => `<span>${escapeHtml(name)}</span>`).join("")}</div>
      </section>` : "";

    elements.dialogContent.innerHTML = `
      <div class="dialog-body" style="--category-color:${color}">
        <div class="dialog-hero">
          <div class="dialog-hero-copy">
            <div class="dialog-rarity">${escapeHtml(lead.rarity)}${lead.rarity === "Powerful" ? " enchantment" : ""}</div>
            <div class="tag-row">${item.categories.map((category) => `<span class="category-tag" style="--tag-color:${categoryColors[category]}">${category}</span>`).join("")}</div>
            <h2 id="dialog-title">${escapeHtml(item.name)}</h2>
            <p>${escapeHtml(lead.description)}</p>
          </div>
          <div class="dialog-icon-well">${iconMarkup(lead)}</div>
        </div>
        ${placements}
        ${builtInto}
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

    elements.familyFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-family]");
      if (!button) return;
      state.family = button.dataset.family;
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

    elements.slotFields.addEventListener("click", (event) => {
      const toggle = event.target.closest(".slot-picker-toggle");
      if (toggle) {
        const picker = toggle.closest(".custom-slot-picker");
        const menu = picker.querySelector(".slot-picker-menu");
        const open = menu.hidden;
        document.querySelectorAll(".slot-picker-menu").forEach((otherMenu) => {
          otherMenu.hidden = true;
          otherMenu.previousElementSibling?.setAttribute("aria-expanded", "false");
        });
        menu.hidden = !open;
        toggle.setAttribute("aria-expanded", String(open));
        return;
      }

      const option = event.target.closest(".slot-picker-option");
      if (!option) return;
      const picker = option.closest(".custom-slot-picker");
      const index = Number(picker.dataset.slotPicker);
      state.slots[index] = option.dataset.slotValue;
      elements.slotSelects[index].value = state.slots[index];
      renderEvaluatorOptions();
      renderEvaluationResult();
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".custom-slot-picker")) return;
      document.querySelectorAll(".slot-picker-menu").forEach((menu) => {
        menu.hidden = true;
        menu.previousElementSibling?.setAttribute("aria-expanded", "false");
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
