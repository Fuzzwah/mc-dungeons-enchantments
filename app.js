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
    { id: "speed", label: "Attack Speed", color: "#ffca67", test: /attack speed|attacks faster|fire faster|rapid fire|frenzied|rampaging|fast attacks|consecutive shots/i },
    { id: "combo", label: "Combo Finishers", color: "#ff8f66", test: /last hit of a combo|combo|fifth powers up|echo/i },
    { id: "lifesteal", label: "Life Steal & Sustain", color: "#f27c9b", test: /life steal|restore health|healing circle|healing|health on hit|leeching|radiance/i },
    { id: "crit", label: "Critical Burst", color: "#f5e36b", test: /triple damage|critical|damage multiplier|high damage|burst/i },
  ];
  const loadoutDefinitions = [
    {
      id: "roll",
      label: "Roll & Evade",
      code: "F-01 / KINETIC ESCAPE",
      summary: "Turn movement into damage and treat every roll as part of the attack cycle.",
      armor: [{ name: "Ember Robe", tier: "S", note: "Short-range burst and a natural fit for roll-through damage." }, { name: "Fox Armor", tier: "A", note: "A safer mobility option with room for defensive enchantments." }],
      weapons: [{ name: "Fighters Bindings", tier: "S", note: "Fast attacks keep the roll-and-strike loop active." }, { name: "Whirlwind", tier: "A", note: "Wide melee coverage while moving through packs." }],
      ranged: [{ name: "Harp Crossbow", tier: "A", note: "Spreads the movement loop across clustered targets." }, { name: "Auto Crossbow", tier: "B", note: "A safer ranged fallback when the front line is crowded." }],
      artifacts: [{ name: "Boots of Swiftness", tier: "S", note: "The defining movement tool for the family." }, { name: "Death Cap Mushroom", tier: "S", note: "Converts speed into a decisive damage window." }, { name: "Wind Horn", tier: "A", note: "Creates space before the next roll sequence." }],
    },
    {
      id: "souls",
      label: "Soul Build",
      code: "F-02 / SOUL CONVERSION",
      summary: "Generate souls consistently, then spend them on healing, control, and burst windows.",
      armor: [{ name: "Wither Armor", tier: "S", note: "Defensive soul synergy for a build that stays in danger." }, { name: "Soul Dancer Robe", tier: "A", note: "A more mobile soul-focused alternative." }],
      weapons: [{ name: "Soul Fists", tier: "S", note: "Directly reinforces soul collection and close-range damage." }, { name: "Feral Soul Crossbow", tier: "A", note: "Keeps soul generation online from safer range." }],
      ranged: [{ name: "Feral Soul Crossbow", tier: "S", note: "Keeps soul generation online from safer range." }, { name: "Bow of Lost Souls", tier: "A", note: "Extends the soul engine without abandoning ranged play." }],
      artifacts: [{ name: "Harvester", tier: "S", note: "Reliable soul spend for burst damage and crowd clear." }, { name: "Corrupted Beacon", tier: "A", note: "High-output channelled spend when positioning is safe." }, { name: "Soul Lantern", tier: "A", note: "Adds another soul-powered body to the field." }],
    },
    {
      id: "artifacts",
      label: "Artifact Loop",
      code: "F-03 / COOLDOWN ECONOMY",
      summary: "Build around frequent artifact casts and let cooldown reduction become the engine.",
      armor: [{ name: "Cave Crawler", tier: "S", note: "Artifact damage amplification defines the loadout." }, { name: "Archer's Armor", tier: "A", note: "A ranged variant with strong artifact flexibility." }],
      weapons: [{ name: "Truthseeker", tier: "A", note: "Reliable melee platform for an artifact-first build." }, { name: "Elite Power Bow", tier: "A", note: "Keeps the loop useful while playing at range." }],
      ranged: [{ name: "Elite Power Bow", tier: "A", note: "A reliable platform for artifact-enhanced burst." }, { name: "Harp Crossbow", tier: "A", note: "Spreads artifact effects across grouped targets." }],
      artifacts: [{ name: "Satchel of Elements", tier: "S", note: "Flexible elemental output across encounters." }, { name: "Gong of Weakening", tier: "S", note: "Turns a timed artifact window into a boss solution." }, { name: "Lightning Rod", tier: "A", note: "A direct high-impact artifact spend." }],
    },
    {
      id: "elemental",
      label: "Elemental Damage",
      code: "F-04 / DAMAGE SPECTRUM",
      summary: "Layer fire, poison, lightning, and cold effects to make the battlefield do the work.",
      armor: [{ name: "Ember Robe", tier: "S", note: "Fire-focused close-range output with artifact overlap." }, { name: "Frost Bite", tier: "A", note: "Adds a control layer to elemental damage." }],
      weapons: [{ name: "Firebrand", tier: "S", note: "A direct fire identity for melee elemental builds." }, { name: "Harp Crossbow", tier: "A", note: "Spreads effect payloads across clustered targets." }],
      ranged: [{ name: "Firebolt Thrower", tier: "S", note: "Carries elemental payloads across a wide lane." }, { name: "Imploding Crossbow", tier: "A", note: "Groups targets for chained elemental effects." }],
      artifacts: [{ name: "Satchel of Elements", tier: "S", note: "The broadest elemental artifact platform." }, { name: "Corrupted Beacon", tier: "A", note: "Sustained beam damage for controlled positions." }, { name: "Shock Powder", tier: "A", note: "Adds a lightning control pulse to the rotation." }],
    },
    {
      id: "control",
      label: "Crowd Control",
      code: "F-05 / FIELD MANAGEMENT",
      summary: "Slow, pull, stun, and separate threats so the encounter stays ordered.",
      armor: [{ name: "Spider Armor", tier: "S", note: "Life steal and melee control support sustained front-line presence." }, { name: "Stalwart Armor", tier: "A", note: "Trades some control for safer anchoring." }],
      weapons: [{ name: "Gravity Hammer", tier: "S", note: "Pull and impact effects compress the battlefield." }, { name: "Anchor", tier: "A", note: "Heavy hits reward deliberate enemy grouping." }],
      ranged: [{ name: "Feral Soul Crossbow", tier: "A", note: "Slows the encounter from a safer distance." }, { name: "Harp Crossbow", tier: "A", note: "Multi-projectile pressure helps maintain control." }],
      artifacts: [{ name: "Wind Horn", tier: "S", note: "Repositions entire groups on demand." }, { name: "Shock Powder", tier: "S", note: "A reliable stun pulse for interrupt windows." }, { name: "Corrupted Beacon", tier: "A", note: "Punishes enemies once the field is controlled." }],
    },
    {
      id: "survival",
      label: "Survival & Healing",
      code: "F-06 / DAMAGE ABSORPTION",
      summary: "Stay in the middle of the fight, reduce incoming damage, and create time for the team.",
      armor: [{ name: "Stalwart Armor", tier: "S", note: "The clearest defensive baseline for a committed frontliner." }, { name: "Wither Armor", tier: "A", note: "Damage reduction with soul-build overlap." }],
      weapons: [{ name: "Cursed Axe", tier: "S", note: "Sustained melee clearing keeps pressure off the back line." }, { name: "Heartstealer", tier: "A", note: "Healing on hit supports a close-range durable role." }],
      ranged: [{ name: "Slayer Crossbow", tier: "A", note: "Reliable ranged pressure while the tank holds the line." }, { name: "Bow of Lost Souls", tier: "B", note: "Adds safe soul generation to a defensive setup." }],
      artifacts: [{ name: "Iron Hide Amulet", tier: "S", note: "The defining defensive cooldown for a true tank." }, { name: "Totem of Regeneration", tier: "A", note: "Anchors a safe zone for the party." }, { name: "Gong of Weakening", tier: "A", note: "Makes dangerous elite windows manageable." }],
    },
    {
      id: "speed",
      label: "Attack Speed",
      code: "F-07 / MOMENTUM ENGINE",
      summary: "Stack attack-speed windows so every second in melee or at range produces more damage and more on-hit effects.",
      armor: [{ name: "Wither Armor", tier: "S", note: "Keeps an aggressive speed build alive in the middle of a pack." }, { name: "Ember Robe", tier: "A", note: "Adds close-range burst while the faster attack loop is active." }],
      weapons: [{ name: "Fighters Bindings", tier: "S", note: "The fastest melee platform turns every speed bonus into more hits." }, { name: "Firebrand", tier: "A", note: "Fast swings spread fire and keep pressure constant." }],
      ranged: [{ name: "Auto Crossbow", tier: "S", note: "Sustained fire makes Accelerate and Rapid Fire easy to maintain." }, { name: "Harp Crossbow", tier: "A", note: "More projectiles create more chances to trigger on-hit effects." }],
      artifacts: [{ name: "Death Cap Mushroom", tier: "S", note: "The defining attack-speed window for an aggressive rotation." }, { name: "Gong of Weakening", tier: "S", note: "Makes the speed window count against elites and bosses." }, { name: "Boots of Swiftness", tier: "A", note: "Gets the build into range and keeps the momentum going." }],
    },
    {
      id: "combo",
      label: "Combo Finishers",
      code: "F-08 / FINAL HIT PAYLOAD",
      summary: "Build around the last hit of each combo, then use positioning and crowd control to land finishers safely.",
      armor: [{ name: "Ember Robe", tier: "S", note: "Close-range burst helps the finisher connect before the pack recovers." }, { name: "Spider Armor", tier: "A", note: "Life steal gives repeated combo attempts room to breathe." }],
      weapons: [{ name: "Whirlwind", tier: "S", note: "Wide swings reliably reach the final-hit payoff." }, { name: "Anchor", tier: "A", note: "Heavy finishing hits reward deliberate timing and grouped targets." }],
      ranged: [{ name: "Imploding Crossbow", tier: "A", note: "Groups enemies so one combo finisher can hit the whole pack." }, { name: "Harp Crossbow", tier: "B", note: "Keeps pressure on targets while waiting for the next melee opening." }],
      artifacts: [{ name: "Wind Horn", tier: "S", note: "Creates a clean lane for the final hit." }, { name: "Shock Powder", tier: "S", note: "Stuns enemies during the combo timing window." }, { name: "Gong of Weakening", tier: "A", note: "Multiplies the impact of a successful finisher." }],
    },
    {
      id: "lifesteal",
      label: "Life Steal & Sustain",
      code: "F-09 / BLOOD ECONOMY",
      summary: "Trade space for reliable healing: stay engaged, keep hitting, and let life steal turn damage into durability.",
      armor: [{ name: "Spider Armor", tier: "S", note: "The clearest life-steal foundation for a committed melee build." }, { name: "Wither Armor", tier: "A", note: "Damage reduction covers the gaps between healing hits." }],
      weapons: [{ name: "Heartstealer", tier: "S", note: "Built-in healing reinforces Leeching and other sustain effects." }, { name: "Cursed Axe", tier: "A", note: "Wide clearing produces frequent healing opportunities." }],
      ranged: [{ name: "Harp Crossbow", tier: "A", note: "Multiple projectiles provide safer healing and pressure support." }, { name: "Feral Soul Crossbow", tier: "B", note: "A ranged fallback that preserves soul and sustain options." }],
      artifacts: [{ name: "Iron Hide Amulet", tier: "S", note: "Reduces incoming damage while healing catches up." }, { name: "Totem of Regeneration", tier: "A", note: "Adds a dependable recovery zone for difficult encounters." }, { name: "Gong of Weakening", tier: "A", note: "Lets life steal outpace incoming damage during elite fights." }],
    },
    {
      id: "crit",
      label: "Critical Burst",
      code: "F-10 / DAMAGE SPIKE",
      summary: "Create short, decisive damage windows by combining critical hits, multipliers, and enemy vulnerability.",
      armor: [{ name: "Cave Crawler", tier: "S", note: "Artifact amplification gives critical windows a stronger opening." }, { name: "Archer's Armor", tier: "A", note: "Supports a safer ranged version of the burst plan." }],
      weapons: [{ name: "Truthseeker", tier: "S", note: "Reliable damage lets critical multipliers finish priority targets." }, { name: "Fighters Bindings", tier: "A", note: "Many hits create more opportunities for a critical spike." }],
      ranged: [{ name: "Elite Power Bow", tier: "S", note: "Charged shots and critical effects combine into boss-sized bursts." }, { name: "Firebolt Thrower", tier: "A", note: "Adds area pressure after the primary target takes the spike." }],
      artifacts: [{ name: "Gong of Weakening", tier: "S", note: "The best setup tool for a single-target burst window." }, { name: "Satchel of Elements", tier: "A", note: "Adds flexible damage when the critical plan needs area coverage." }, { name: "Lightning Rod", tier: "A", note: "Converts a setup window into immediate burst damage." }],
    },
  ];
  const loadoutRecommendationNames = {
    speed: {
      Armor: ["Cool Down", "Frenzied", "Swiftfooted"],
      Melee: ["Rampaging", "Echo", "Radiance"],
      Ranged: ["Accelerate", "Rapid Fire", "Multishot"],
      Artifacts: ["Cool Down", "Speed Synergy", "Health Synergy"],
    },
    combo: {
      Armor: ["Acrobat", "Protection", "Potion Barrier"],
      Melee: ["Swirling", "Shockwave", "Echo"],
      Ranged: ["Gravity", "Multishot", "Chain Reaction"],
      Artifacts: ["Cool Down", "Health Synergy", "Speed Synergy"],
    },
    lifesteal: {
      Armor: ["Potion Barrier", "Protection", "Health Synergy"],
      Melee: ["Leeching", "Radiance", "Guarding Strike"],
      Ranged: ["Radiance Shot", "Anima Conduit", "Soul Siphon"],
      Artifacts: ["Health Synergy", "Cool Down", "Potion Barrier"],
    },
    crit: {
      Armor: ["Cowardice", "Reckless", "Fire Focus"],
      Melee: ["Critical Hit", "Committed", "Void Strike"],
      Ranged: ["Critical Hit", "Overcharge", "Supercharge"],
      Artifacts: ["Cool Down", "Cowardice", "Fire Focus"],
    },
  };

  function loadoutRecommendations(loadoutId, category) {
    const names = loadoutRecommendationNames[loadoutId]?.[category] || [];
    const sourceCategory = category === "Artifacts" ? "Armor" : category;
    return names
      .map((name) => records.find((record) => record.category === sourceCategory && record.name === name))
      .filter(Boolean);
  }

  const loadoutImageFiles = {
    "Fighters Bindings": "Fighter's Bindings (MCD).png",
    "Archer's Armor": "Archer's Armor (MCD).png",
    "Soul Dancer Robe": "Souldancer Robe (MCD).png",
    "Gravity Hammer": "Hammer of Gravity (MCD).png",
  };

  function loadoutImageMarkup(name) {
    const filename = loadoutImageFiles[name] || `${name} (MCD).png`;
    return `<img class="loadout-item-image" data-file-name="${escapeHtml(filename)}" alt="" width="48" height="48" loading="lazy">`;
  }

  async function resolveLoadoutImages() {
    const images = [...document.querySelectorAll(".loadout-item-image")];
    const filenames = [...new Set(images.map((image) => image.dataset.fileName))];
    if (!filenames.length) return;
    const params = new URLSearchParams({
      action: "query",
      titles: filenames.map((filename) => `File:${filename}`).join("|"),
      prop: "imageinfo",
      iiprop: "url",
      format: "json",
      origin: "*",
    });
    try {
      const response = await fetch(`https://minecraft.fandom.com/api.php?${params}`);
      const data = await response.json();
      const urls = new Map(
        Object.values(data.query?.pages || {}).map((page) => [
          page.title.replace(/^File:/, "").replaceAll("_", " "),
          page.imageinfo?.[0]?.url,
        ])
      );
      images.forEach((image) => {
        const source = urls.get(image.dataset.fileName);
        if (source) image.src = source;
        else image.hidden = true;
      });
    } catch {
      images.forEach((image) => { image.hidden = true; });
    }
  }

  const loadoutPageNames = {
    "Soul Dancer Robe": "Souldancer Robe",
    "Gravity Hammer": "Hammer of Gravity",
  };
  const loadoutItemMeta = new Map();

  function loadoutPageName(name) {
    return loadoutPageNames[name] || name;
  }

  function cleanWikiText(value) {
    return String(value || "")
      .replace(/\{\{[^{}]*\}\}/g, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g, "$1")
      .replace(/'{2,}/g, "")
      .replace(/\s+\n/g, "\n")
      .trim();
  }

  function extractWikiField(source, field) {
    const match = source.match(new RegExp(`\\|\\s*${field}\\s*=([\\s\\S]*?)(?=\\n\\|\\s|\\n}})`));
    return cleanWikiText(match?.[1]);
  }

  async function resolveLoadoutMetadata() {
    const names = [...new Set(loadoutDefinitions.flatMap((loadout) =>
      [...loadout.armor, ...loadout.weapons, ...loadout.ranged, ...loadout.artifacts].map((item) => item.name)
    ))];
    const params = new URLSearchParams({
      action: "query",
      titles: names.map((name) => `Minecraft_Dungeons:${loadoutPageName(name)}`).join("|"),
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
      format: "json",
      origin: "*",
    });
    try {
      const response = await fetch(`https://minecraft.fandom.com/api.php?${params}`);
      const data = await response.json();
      Object.values(data.query?.pages || {}).forEach((page) => {
        const source = page.revisions?.[0]?.slots?.main?.["*"];
        if (!source) return;
        const title = page.title.replace(/^Minecraft[ _]Dungeons:/, "");
        const itemName = names.find((name) => loadoutPageName(name).replaceAll("_", " ") === title.replaceAll("_", " "));
        if (!itemName) return;
        const properties = extractWikiField(source, "property")
          .split("\n")
          .map((property) => property.trim())
          .filter(Boolean);
        loadoutItemMeta.set(itemName, {
          rarity: extractWikiField(source, "rarity") || "Source page",
          properties,
          sourceUrl: `https://minecraft.fandom.com/wiki/Minecraft_Dungeons:${encodeURIComponent(loadoutPageName(itemName).replaceAll(" ", "_"))}`,
        });
      });
      updateLoadoutMetadata();
    } catch {
      // The loadout remains usable when the external metadata service is unavailable.
    }
  }

  function updateLoadoutMetadata() {
    document.querySelectorAll(".loadout-item").forEach((item) => {
      const meta = loadoutItemMeta.get(item.dataset.itemName);
      const target = item.querySelector(".loadout-item-source-properties");
      if (!meta || !target) return;
      target.innerHTML = `<span class="loadout-rarity">${escapeHtml(meta.rarity)}</span>${meta.properties.map((property) => `<span>${escapeHtml(property)}</span>`).join("")}`;
    });
  }
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
    slots: Array(9).fill(""),
    pickerIndex: 0,
    pickerQuery: "",
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
    loadoutView: document.querySelector("#loadout-view"),
    loadoutGrid: document.querySelector("#loadout-grid"),
    search: document.querySelector("#search"),
    sort: document.querySelector("#sort"),
    sortControl: document.querySelector(".sort-control"),
    catalogueGrid: document.querySelector("#catalogue-grid"),
    tierBoard: document.querySelector("#tier-board"),
    resultCount: document.querySelector("#result-count"),
    emptyState: document.querySelector("#empty-state"),
    clearSearch: document.querySelector("#clear-search"),
    dialog: document.querySelector("#details-dialog"),
    dialogContent: document.querySelector("#dialog-content"),
    dialogClose: document.querySelector(".dialog-close"),
    pickerDialog: document.querySelector("#picker-dialog"),
    pickerDialogTitle: document.querySelector("#picker-dialog-title"),
    pickerSearch: document.querySelector("#picker-search"),
    pickerOptions: document.querySelector("#picker-options"),
    evaluatorForm: document.querySelector("#evaluator-form"),
    itemName: document.querySelector("#item-name"),
    itemCategory: document.querySelector("#item-category"),
    slotFields: document.querySelector(".slot-fields"),
    slotSelects: [...document.querySelectorAll(".slot-select")],
    evaluationResult: document.querySelector("#evaluation-result"),
    themeToggle: document.querySelector("#theme-toggle"),
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
    const visibleCategories = state.view === "tier" ? gearCategories : categories;
    const activeCategory = state.view === "tier" ? state.tierCategory : state.category;
    elements.categoryFilters.innerHTML = visibleCategories.map((category) => `
      <button
        type="button"
        class="filter-chip ${activeCategory === category ? "is-active" : ""}"
        data-category="${category}"
        aria-pressed="${activeCategory === category}"
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
  function enchantmentSmallMarkup(item, extraClass = "") {
    return `<span class="enchantment-small ${extraClass}">
      ${iconMarkup(item, "enchantment-small-icon")}
      <span class="enchantment-small-copy"><strong>${escapeHtml(item.name)}</strong><em>${item.rank} · ${escapeHtml(rankLabels[item.rank])}</em></span>
    </span>`;
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
        <button class="slot-picker-toggle" type="button" aria-haspopup="dialog" aria-expanded="false">
          ${selectedItem ? `<img src="${escapeHtml(selectedItem.icon)}" alt="" width="84" height="84"><span>${escapeHtml(selectedItem.name)}<em>${selectedItem.rank} tier</em></span>` : "<span>Choose an enchantment</span>"}
          <span class="picker-chevron" aria-hidden="true">⌄</span>
        </button>`;
    });
  }

  function renderPickerModalOptions() {
    const selected = state.slots[state.pickerIndex];
    const query = state.pickerQuery.trim().toLowerCase();
    const options = evaluatorOptions().filter((item) => {
      if (!query) return true;
      return `${item.name} ${item.rank} ${rankLabels[item.rank]} ${item.rarity}`.toLowerCase().includes(query);
    });
    elements.pickerOptions.innerHTML = `
      <button class="picker-modal-option is-empty" type="button" role="option" data-slot-value="">Clear slot</button>
      ${options.map((item) => `
        <button class="picker-modal-option ${item.id === selected ? "is-selected" : ""}" type="button" role="option" data-slot-value="${escapeHtml(item.id)}">
          <img src="${escapeHtml(item.icon)}" alt="" width="84" height="84">
          <span>${escapeHtml(item.name)}<em>${item.rank} tier · ${rankLabels[item.rank]}</em></span>
        </button>
      `).join("") || `<p class="picker-no-results">No enchantments match that filter.</p>`}`;
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
          <strong>Select at least one enchantment option</strong>
          <span>The evaluator will average the selected enchantment option ratings.</span>
        </div>`;
      return;
    }

    const score = selected.reduce((total, item) => total + rankScore[item.rank], 0) / selected.length;
    const rank = evaluationRank(score);
    const itemName = state.itemName || "Unnamed item";
    const slotItems = [0, 1, 2].map((slot) => state.slots
      .slice(slot * 3, slot * 3 + 3)
      .map((id) => records.find((record) => record.id === id))
      .filter(Boolean));
    const strongestBySlot = slotItems.map((items) => {
      const bestScore = Math.max(...items.map((item) => rankScore[item.rank]), -1);
      return items.filter((item) => rankScore[item.rank] === bestScore);
    });
    const familyCounts = new Map();
    selected.forEach((item) => getFamilies(item).forEach((family) => {
      familyCounts.set(family, (familyCounts.get(family) || 0) + 1);
    }));
    const playstyleCombos = [...familyCounts.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ family: familyDefinitions.find((entry) => entry.id === id), count }))
      .filter((entry) => entry.family);

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
          <p>Average enchantment rating: <strong>${score.toFixed(1)} / 5</strong> across ${selected.length} selected option${selected.length === 1 ? "" : "s"}.</p>
        </div>
      </div>
      <div class="evaluation-insights">
        <section class="evaluation-insight strongest-options">
          <h4>Strongest options</h4>
          <div>
            ${strongestBySlot.map((items, slot) => `
              <div class="evaluation-recommendation"><span>Slot ${slot + 1}</span><div>${items.length ? items.map((item) => enchantmentSmallMarkup(item, "is-recommended")).join("") : "<strong>No selection</strong>"}</div></div>
            `).join("")}
          </div>
        </section>
        <section class="evaluation-insight playstyle-combos">
          <h4>Playstyle synergy</h4>
          ${playstyleCombos.length
            ? `<p>These choices reinforce a shared build direction:</p><div>${playstyleCombos.map(({ family, count }) => `<span style="--family-color:${family.color}">${escapeHtml(family.label)} · ${count} matches</span>`).join("")}</div>`
            : "<p>No strong playstyle combo yet. Try options with matching effect themes.</p>"}
        </section>
      </div>
      <div class="evaluation-slots">
        ${[0, 1, 2].map((slot) => {
          const strongestIds = new Set(strongestBySlot[slot].map((item) => item.id));
          return `
            <div class="evaluation-slot">
              <span>Slot ${slot + 1}</span>
              ${state.slots.slice(slot * 3, slot * 3 + 3).map((id, option) => {
                const item = records.find((record) => record.id === id);
                return `<div class="evaluation-option ${item && strongestIds.has(item.id) ? "is-strongest" : ""}">
                  <span>Option ${option + 1}${item && strongestIds.has(item.id) ? " · strongest" : ""}</span>
                  ${item ? enchantmentSmallMarkup(item) : "<strong class=\"unfilled-slot\">Not selected</strong>"}
                </div>`;
              }).join("")}
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
      ${values.map((value, index) => `<div><span class="tier-preview-diamond"><span>${["I", "II", "III"][index]}</span></span><strong title="${escapeHtml(value)}">${escapeHtml(value)}</strong></div>`).join("")}
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
  function renderLoadouts() {
    const visibleLoadouts = state.family === "All"
      ? loadoutDefinitions
      : loadoutDefinitions.filter((loadout) => loadout.id === state.family);
    elements.loadoutGrid.innerHTML = visibleLoadouts.map((loadout) => `
      <article class="loadout-panel">
        <div class="loadout-panel-head">
          <div>
            <p class="section-kicker">${escapeHtml(loadout.code)}</p>
            <h3>${escapeHtml(loadout.label)}</h3>
          </div>
          <a class="loadout-stamp" href="https://minecraft.fandom.com/wiki/Category:Minecraft_Dungeons_gear_icons" target="_blank" rel="noreferrer">Fandom image index ↗</a>
        </div>
        <p class="loadout-summary">${escapeHtml(loadout.summary)}</p>
        <div class="loadout-columns">
          ${[
            ["Armor", loadout.armor],
            ["Melee", loadout.weapons],
            ["Ranged", loadout.ranged],
            ["Artifacts", loadout.artifacts],
          ].map(([category, items]) => {
            const recommendations = loadoutRecommendations(loadout.id, category);
            return `
            <section class="loadout-slot">
              <h4>${category}</h4>
              ${items.map((item) => `
                <button class="loadout-item" type="button" data-item-name="${escapeHtml(item.name)}">
                  ${loadoutImageMarkup(item.name)}
                  <div>
                    <strong>${escapeHtml(item.name)}</strong>
                    <div class="loadout-item-properties"><span>${escapeHtml(item.note)}</span></div>
                    <div class="loadout-item-enchantments">
                      <span class="loadout-item-enchantments-label">Best enchantments</span>
                      <div>${recommendations.map((enchantment) => `<span title="${escapeHtml(enchantment.description)}">${escapeHtml(enchantment.name)}</span>`).join("")}</div>
                    </div>
                    <div class="loadout-item-properties loadout-item-source-properties"></div>
                  </div>
                </button>
              `).join("")}
            </section>
          `;
          }).join("")}
        </div>
        </div>
      </article>
    `).join("");
    resolveLoadoutImages();
    resolveLoadoutMetadata();
  }

  function showLoadoutDetails(name) {
    const item = loadoutDefinitions
      .flatMap((loadout) => [...loadout.armor, ...loadout.weapons, ...loadout.ranged, ...loadout.artifacts])
      .find((entry) => entry.name === name);
    const meta = loadoutItemMeta.get(name);
    const image = [...document.querySelectorAll(".loadout-item-image")]
      .find((entry) => entry.closest("[data-item-name]")?.dataset.itemName === name);
    const sourceUrl = meta?.sourceUrl || `https://minecraft.fandom.com/wiki/Minecraft_Dungeons:${encodeURIComponent(loadoutPageName(name).replaceAll(" ", "_"))}`;
    const properties = meta?.properties?.length ? meta.properties : [item?.note || "Metadata is loading from the source page."];
    elements.dialogContent.innerHTML = `
      <div class="dialog-body loadout-dialog-body">
        <div class="dialog-hero">
          <div class="dialog-hero-copy">
            <div class="dialog-rarity">${escapeHtml(meta?.rarity || "Loadout item")}</div>
            <h2 id="dialog-title">${escapeHtml(name)}</h2>
            <p>Loadout guidance is editorial. Check the source page for the complete item record and acquisition details.</p>
          </div>
          <div class="dialog-icon-well">${image?.src ? `<img src="${escapeHtml(image.src)}" alt="" width="88" height="88">` : ""}</div>
        </div>
        <section class="dialog-section">
          <h3>Properties</h3>
          <ul class="loadout-dialog-properties">${properties.map((property) => `<li>${escapeHtml(property)}</li>`).join("")}</ul>
        </section>
        <a class="loadout-source-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">Open item page on Minecraft Fandom ↗</a>
      </div>`;
    elements.dialog.showModal();
  }

  function setView(view) {
    state.view = view;
    elements.viewTabs.forEach((tab) => {
      const active = tab.dataset.view === view;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    elements.filtersRow.hidden = view === "evaluator" || view === "loadout";
    elements.familyFilterRow.hidden = view === "evaluator";
    elements.sortControl.hidden = view !== "catalogue";
    elements.tierCategorySwitcher.hidden = true;
    elements.catalogueView.hidden = view !== "catalogue";
    elements.tierView.hidden = view !== "tier";
    elements.loadoutView.hidden = view !== "loadout";
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
    } else if (state.view === "loadout") {
      renderLoadouts();
    } else {
      renderEvaluatorOptions();
      renderEvaluationResult();
    }
  }

  function setTheme(dark) {
    document.body.classList.toggle("dark-mode", dark);
    elements.themeToggle.setAttribute("aria-pressed", String(dark));
    elements.themeToggle.querySelector(".theme-toggle-label").textContent = dark ? "Light mode" : "Dark mode";
    elements.themeToggle.querySelector("[aria-hidden]").textContent = dark ? "○" : "◐";
    localStorage.setItem("enchantment-theme", dark ? "dark" : "light");
  }

  function initTheme() {
    const params = new URLSearchParams(window.location.search);
    const saved = localStorage.getItem("enchantment-theme");
    const nightOwlPreview = params.get("night-owl") === "1";
    setTheme(nightOwlPreview || saved !== "light");
  }

  function bindEvents() {
    elements.themeToggle.addEventListener("click", () => {
      setTheme(!document.body.classList.contains("dark-mode"));
    });
    elements.viewTabs.forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));
    elements.categoryFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      if (state.view === "tier") {
        state.tierCategory = button.dataset.category;
      } else {
        state.category = button.dataset.category;
      }
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
      state.slots = Array(9).fill("");
      renderEvaluatorOptions();
      renderEvaluationResult();
    });

    elements.itemName.addEventListener("input", () => {
      state.itemName = elements.itemName.value.trim();
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
      if (!toggle) return;
      const picker = toggle.closest(".custom-slot-picker");
      state.pickerIndex = Number(picker.dataset.slotPicker);
      state.pickerQuery = "";
      elements.pickerSearch.value = "";
      elements.pickerDialogTitle.textContent = `Choose an option for slot ${Math.floor(state.pickerIndex / 3) + 1}`;
      renderPickerModalOptions();
      elements.pickerDialog.showModal();
      elements.pickerSearch.focus();
    });

    elements.pickerSearch.addEventListener("input", () => {
      state.pickerQuery = elements.pickerSearch.value;
      renderPickerModalOptions();
    });

    elements.pickerOptions.addEventListener("click", (event) => {
      const option = event.target.closest(".picker-modal-option");
      if (!option) return;
      state.slots[state.pickerIndex] = option.dataset.slotValue;
      elements.slotSelects[state.pickerIndex].value = state.slots[state.pickerIndex];
      elements.pickerDialog.close();
      renderEvaluatorOptions();
      renderEvaluationResult();
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
    elements.loadoutGrid.addEventListener("click", (event) => {
      const item = event.target.closest("[data-item-name]");
      if (item) showLoadoutDetails(item.dataset.itemName);
    });
    elements.loadoutGrid.addEventListener("keydown", (event) => {
      const item = event.target.closest("[data-item-name]");
      if (item && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        showLoadoutDetails(item.dataset.itemName);
      }
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
    initTheme();
    bindEvents();
    render();
  }

  init();
})();
