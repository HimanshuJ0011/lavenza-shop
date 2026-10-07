/* =========================================================
   LAVENZA — script.js (v2 - CLEAN)
   ========================================================= */

/* ===== CONFIG ===== */
const CONFIG = {
  brandName: "LAVENZA",
  tagline: "Beauty, Treats & Everyday Favourites",
  whatsappNumber: "919999999999",
  whatsappDisplay: "+91 99999 99999",
  phone: "+91 99999 99999",
  phoneLink: "+919999999999",
  email: "hello@example.com",
  location: "Gurugram, Haryana, India",
  dataSource: "LOCAL",
  googleSheetId: "",
  googleSheetName: "Products",
  enquiryScriptUrl: ""
};

/* ===== DOM SHORTCUTS ===== */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ===== STATE ===== */
let allProducts = [];
let enquiryList = [];
let activeFilters = {
  categories: [],
  subCategories: [],
  brands: [],
  priceMin: null,
  priceMax: null,
  stock: [],
  rating: null,
  attributes: {},
  festiveOnly: false
};
let currentSort = "recommended";
let searchQuery = "";

/* ===== HELPERS ===== */
function showToast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2200);
}

function formatPrice(v) { return "₹" + Number(v).toLocaleString("en-IN"); }

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function productEmoji(p) {
  if (!p) return "🛍️";
  const n = (p.name + " " + (p.subCategory || "")).toLowerCase();
  if (n.includes("serum")) return "✨";
  if (n.includes("lipstick")) return "💄";
  if (n.includes("foundation")) return "🧴";
  if (n.includes("kajal") || n.includes("eyeliner") || n.includes("mascara")) return "👁️";
  if (n.includes("blush")) return "🌸";
  if (n.includes("shampoo") || n.includes("conditioner")) return "🧴";
  if (n.includes("hair oil") || n.includes("hair serum")) return "💧";
  if (n.includes("mask")) return "🧖";
  if (n.includes("perfume") || n.includes("attar") || n.includes("mist") || n.includes("deodorant")) return "🌺";
  if (n.includes("kaju")) return "🥜";
  if (n.includes("laddu")) return "🍡";
  if (n.includes("jamun")) return "🍮";
  if (n.includes("rasgulla")) return "🍥";
  if (n.includes("soan")) return "🍪";
  if (n.includes("dark chocolate")) return "🍫";
  if (n.includes("chocolate")) return "🍫";
  if (n.includes("cookie")) return "🍪";
  if (n.includes("namkeen")) return "🥨";
  if (n.includes("chips")) return "🍟";
  if (n.includes("dry fruit")) return "🥜";
  if (n.includes("hamper") || n.includes("gift")) return "🎁";
  if (n.includes("candle")) return "🕯️";
  if (n.includes("freshener") || n.includes("diffuser")) return "🌿";
  if (n.includes("hand wash")) return "🧼";
  if (n.includes("sunscreen")) return "☀️";
  if (n.includes("toner")) return "💧";
  if (n.includes("moisturizer") || n.includes("night cream")) return "🧴";
  if (n.includes("face wash")) return "🧼";
  if (n.includes("aloe")) return "🌱";
  const map = {
    "Cosmetics":"💄","Skincare":"🧴","Haircare":"💇","Fragrance":"🌸",
    "Sweets":"🍬","Chocolates":"🍫","Snacks":"🍪","Gifts":"🎁","Household":"🏠"
  };
  return map[p.category] || "🛍️";
}

/* ===== WHATSAPP ===== */
function waLink(message) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function openWhatsAppEnquiry(product) {
  const msg =
`Hi ${CONFIG.brandName}, I am interested in this product:

🛍️ *${product.name}*
🏷️ Brand: ${product.brand}
🔖 Code: ${product.id}
📦 Pack: ${product.unit}
💰 Price: ${formatPrice(product.price)}

Please share availability and more details.`;
  window.open(waLink(msg), "_blank");
}

function openGeneralEnquiry() {
  const msg = `Hi ${CONFIG.brandName}, I would like to enquire about your products. Please share more information.`;
  window.open(waLink(msg), "_blank");
}

/* ===== DATA LOADING ===== */
async function loadProducts() {
  if (CONFIG.dataSource === "GOOGLE_SHEETS") {
    console.warn("Google Sheets not configured — using local data.");
  }
  if (window.dummyProducts && Array.isArray(window.dummyProducts)) {
    return window.dummyProducts;
  }
  console.error("❌ window.dummyProducts is not defined. Check data/products.js");
  return [];
}

/* ===== RENDER: CATEGORIES ===== */
function renderCategories(products) {
  const categoryGrid = $("#categoryGrid");
  const catStrip = $("#catStrip");
  const mobileMenuBody = $("#mobileMenuBody");

  if (!products || !products.length) {
    categoryGrid.innerHTML = "";
    catStrip.innerHTML = "";
    mobileMenuBody.innerHTML = "";
    return;
  }

  const counts = {};
  products.forEach(p => {
    if (p && p.category) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
  });

  const emojiMap = {
    "Cosmetics":"💄","Skincare":"🧴","Haircare":"💇","Fragrance":"🌸",
    "Sweets":"🍬","Chocolates":"🍫","Snacks":"🍪","Gifts":"🎁","Household":"🏠"
  };

  const cats = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  categoryGrid.innerHTML = cats.map(([name, count]) => `
    <div class="category-card" data-category="${name}">
      <span class="category-icon">${emojiMap[name] || "🛍️"}</span>
      <div class="category-name">${name}</div>
      <div class="category-count">${count} products</div>
    </div>
  `).join("");

  catStrip.innerHTML = `<button class="cat-strip-btn active" data-category="">All</button>` +
    cats.map(([name]) => `<button class="cat-strip-btn" data-category="${name}">${name}</button>`).join("");

  mobileMenuBody.innerHTML = `<button class="drawer-cat-item active" data-category="">All Products</button>` +
    cats.map(([name, count]) => `
      <button class="drawer-cat-item" data-category="${name}">
        ${name}
        <span style="float:right;color:var(--text-3);font-size:.72rem">${count}</span>
      </button>
    `).join("");

  $$(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      const cat = card.dataset.category;
      activeFilters.categories = [cat];
      activeFilters.subCategories = [];
      applyFiltersAndRender();
      const target = document.getElementById("catalogue");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  $$(".cat-strip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".cat-strip-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.category;
      activeFilters.categories = cat ? [cat] : [];
      activeFilters.subCategories = [];
      applyFiltersAndRender();
    });
  });

  $$(".drawer-cat-item").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".drawer-cat-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.category;
      activeFilters.categories = cat ? [cat] : [];
      activeFilters.subCategories = [];
      applyFiltersAndRender();
      closeMobileMenu();
    });
  });
}

/* ===== RENDER: PRODUCT CARD ===== */
function productCardHTML(p) {
  const emoji = productEmoji(p);
  const hasDiscount = p.discount && p.discount > 0;
  const discountBadge = hasDiscount ? `<span class="discount-badge">-${p.discount}%</span>` : "";
  const newBadge = p.newArrival ? `<span class="new-badge">New</span>` : "";
  const mrpHTML = (p.mrp && p.mrp > p.price) ? `<span class="price-mrp">${formatPrice(p.mrp)}</span>` : "";
  const ratingHTML = p.rating
    ? `<div class="product-rating">
         <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
         ${p.rating} <span>(${p.reviewCount || 0})</span>
       </div>`
    : "";

  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-image-wrapper">
        ${discountBadge}
        ${newBadge}
        <span>${emoji}</span>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-meta">
          <span>${p.brand}</span>
          ${ratingHTML}
        </div>
        <div class="product-price-row">
          <span class="price-current">${formatPrice(p.price)}</span>
          ${mrpHTML}
        </div>
        <div class="product-unit">${p.unit} · ${p.stockStatus}</div>
        <div class="product-actions">
          <button class="btn btn-view" data-action="view" data-id="${p.id}">View</button>
          <button class="btn btn-enquire" data-action="enquire" data-id="${p.id}">💬 Enquire</button>
        </div>
      </div>
    </div>
  `;
}

function attachCardEvents(container) {
  container.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      const id = card.dataset.id;
      if (btn) {
        e.stopPropagation();
        if (btn.dataset.action === "view") openProductDetails(id);
        else if (btn.dataset.action === "enquire") {
          const p = allProducts.find(x => x.id === id);
          if (p) openWhatsAppEnquiry(p);
        }
      } else {
        openProductDetails(id);
      }
    });
  });
}

function renderProductsGrid(container, products) {
  if (!container) return;
  if (!products.length) { container.innerHTML = ""; return; }
  container.innerHTML = products.map(productCardHTML).join("");
  attachCardEvents(container);
}

function renderFeatured() {
  const grid = $("#featuredGrid");
  const section = $("#featuredSection");
  const list = allProducts.filter(p => p.featured).slice(0, 8);
  if (!list.length) { section.style.display = "none"; return; }
  section.style.display = "block";
  renderProductsGrid(grid, list);
}

function renderFestive() {
  const grid = $("#festiveGrid");
  const section = $("#festiveSection");
  const list = allProducts.filter(p =>
    p.discount >= 15 && ["Sweets","Chocolates","Gifts","Snacks"].includes(p.category)
  ).slice(0, 4);
  if (!list.length) { section.style.display = "none"; return; }
  section.style.display = "block";
  renderProductsGrid(grid, list);
}

function renderNewArrivals() {
  const grid = $("#newArrivalsGrid");
  const section = $("#newArrivalsSection");
  const list = allProducts.filter(p => p.newArrival).slice(0, 4);
  if (!list.length) { section.style.display = "none"; return; }
  section.style.display = "block";
  renderProductsGrid(grid, list);
}

/* ===== RENDER: FILTERS ===== */
function renderFilters(products) {
  const filterContainer = $("#filterContainer");
  const filterContainerMobile = $("#filterContainerMobile");

  if (!products || !products.length) {
    filterContainer.innerHTML = "";
    filterContainerMobile.innerHTML = "";
    return;
  }

  const cats = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  const subs = [...new Set(products.map(p => p.subCategory).filter(Boolean))].sort();
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();

  const attrKeyFreq = {};
  products.forEach(p => {
    if (p.attributes && typeof p.attributes === "object") {
      Object.keys(p.attributes).forEach(k => {
        attrKeyFreq[k] = (attrKeyFreq[k] || 0) + 1;
      });
    }
  });
  const topAttrKeys = Object.entries(attrKeyFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  const attrValues = {};
  topAttrKeys.forEach(key => {
    attrValues[key] = [...new Set(
      products.map(p => p.attributes?.[key]).filter(v => v !== undefined && v !== null && v !== "")
    )].sort();
  });

  let html = "";

  html += `
    <div class="filter-group open">
      <div class="filter-group-title">Festive <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
      <div class="filter-group-content">
        <div class="filter-option">
          <input type="checkbox" id="festiveOnly" data-filter-type="festive" ${activeFilters.festiveOnly ? "checked" : ""}>
          <label for="festiveOnly">🪔 Diwali Offers only</label>
        </div>
      </div>
    </div>`;

  html += `
    <div class="filter-group open">
      <div class="filter-group-title">Category <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
      <div class="filter-group-content">
        ${cats.map(c => `
          <div class="filter-option">
            <input type="checkbox" id="cat-${c.replace(/\s/g,"-")}" value="${c}" data-filter-type="category" ${activeFilters.categories.includes(c) ? "checked" : ""}>
            <label for="cat-${c.replace(/\s/g,"-")}">${c}</label>
          </div>
        `).join("")}
      </div>
    </div>`;

  html += `
    <div class="filter-group">
      <div class="filter-group-title">Product Type <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
      <div class="filter-group-content">
        ${subs.map(s => `
          <div class="filter-option">
            <input type="checkbox" id="sub-${s.replace(/\s/g,"-")}" value="${s}" data-filter-type="subCategory" ${activeFilters.subCategories.includes(s) ? "checked" : ""}>
            <label for="sub-${s.replace(/\s/g,"-")}">${s}</label>
          </div>
        `).join("")}
      </div>
    </div>`;

  html += `
    <div class="filter-group open">
      <div class="filter-group-title">Price <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
      <div class="filter-group-content">
        <div class="price-range">
          <input type="number" id="priceMin" placeholder="Min ₹" value="${activeFilters.priceMin ?? ""}">
          <span>–</span>
          <input type="number" id="priceMax" placeholder="Max ₹" value="${activeFilters.priceMax ?? ""}">
        </div>
      </div>
    </div>`;

  html += `
    <div class="filter-group">
      <div class="filter-group-title">Brand <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
      <div class="filter-group-content">
        ${brands.map(b => `
          <div class="filter-option">
            <input type="checkbox" id="brand-${b.replace(/\s/g,"-")}" value="${b}" data-filter-type="brand" ${activeFilters.brands.includes(b) ? "checked" : ""}>
            <label for="brand-${b.replace(/\s/g,"-")}">${b}</label>
          </div>
        `).join("")}
      </div>
    </div>`;

  html += `
    <div class="filter-group">
      <div class="filter-group-title">Rating <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
      <div class="filter-group-content">
        <div class="filter-option">
          <input type="radio" name="ratingFilter" id="rating4" value="4" data-filter-type="rating" ${activeFilters.rating === "4" ? "checked" : ""}>
          <label for="rating4">⭐ 4 & up</label>
        </div>
        <div class="filter-option">
          <input type="radio" name="ratingFilter" id="rating3" value="3" data-filter-type="rating" ${activeFilters.rating === "3" ? "checked" : ""}>
          <label for="rating3">⭐ 3 & up</label>
        </div>
      </div>
    </div>`;

  topAttrKeys.forEach(key => {
    if (!attrValues[key] || !attrValues[key].length) return;
    html += `
      <div class="filter-group">
        <div class="filter-group-title">${key} <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
        <div class="filter-group-content">
          ${attrValues[key].slice(0, 8).map(v => {
            const checked = (activeFilters.attributes[key] || []).includes(v);
            const safe = String(v).replace(/[^a-z0-9]/gi, "_");
            return `<div class="filter-option">
              <input type="checkbox" id="attr-${key.replace(/\s/g,"-")}-${safe}" value="${v}" data-filter-type="attribute" data-attr-key="${key}" ${checked ? "checked" : ""}>
              <label for="attr-${key.replace(/\s/g,"-")}-${safe}">${v}</label>
            </div>`;
          }).join("")}
        </div>
      </div>`;
  });

  filterContainer.innerHTML = html;
  filterContainerMobile.innerHTML = html;

  [filterContainer, filterContainerMobile].forEach(container => {
    if (!container) return;
    container.querySelectorAll(".filter-group-title").forEach(title => {
      title.addEventListener("click", () => {
        title.parentElement.classList.toggle("open");
      });
    });
    container.querySelectorAll("input[data-filter-type]").forEach(inp => {
      inp.addEventListener("change", handleFilterChange);
    });
    container.querySelectorAll("#priceMin, #priceMax").forEach(inp => {
      inp.addEventListener("change", handleFilterChange);
      inp.addEventListener("input", debounce(handleFilterChange, 400));
    });
  });
}

function handleFilterChange(e) {
  const input = e.target;
  const type = input.dataset.filterType;

  const getChecked = (t, attrKey = null) => {
    const vals = [];
    ["#filterContainer", "#filterContainerMobile"].forEach(sel => {
      const c = $(sel);
      if (!c) return;
      c.querySelectorAll(`input[data-filter-type="${t}"]:checked`).forEach(i => {
        if (t === "attribute") {
          if (i.dataset.attrKey === attrKey) vals.push(i.value);
        } else {
          vals.push(i.value);
        }
      });
    });
    return [...new Set(vals)];
  };

  if (type === "category") activeFilters.categories = getChecked("category");
  else if (type === "subCategory") activeFilters.subCategories = getChecked("subCategory");
  else if (type === "brand") activeFilters.brands = getChecked("brand");
  else if (type === "rating") activeFilters.rating = input.checked ? input.value : null;
  else if (type === "festive") activeFilters.festiveOnly = input.checked;
  else if (type === "attribute") {
    const key = input.dataset.attrKey;
    activeFilters.attributes[key] = getChecked("attribute", key);
    if (!activeFilters.attributes[key].length) delete activeFilters.attributes[key];
  }

  const minInp = $("#filterContainer #priceMin") || $("#filterContainerMobile #priceMin");
  const maxInp = $("#filterContainer #priceMax") || $("#filterContainerMobile #priceMax");
  activeFilters.priceMin = minInp && minInp.value ? Number(minInp.value) : null;
  activeFilters.priceMax = maxInp && maxInp.value ? Number(maxInp.value) : null;

  applyFiltersAndRender();
}

/* ===== FILTER & SORT ===== */
function filterProducts(products) {
  let result = products;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(p => {
      const hay = [
        p.name, p.brand, p.category, p.subCategory, p.id, p.description,
        ...(p.tags || []),
        ...(p.attributes ? Object.entries(p.attributes).flatMap(([k, v]) => [k, String(v)]) : [])
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  if (activeFilters.categories.length)
    result = result.filter(p => activeFilters.categories.includes(p.category));
  if (activeFilters.subCategories.length)
    result = result.filter(p => activeFilters.subCategories.includes(p.subCategory));
  if (activeFilters.brands.length)
    result = result.filter(p => activeFilters.brands.includes(p.brand));
  if (activeFilters.priceMin !== null)
    result = result.filter(p => p.price >= activeFilters.priceMin);
  if (activeFilters.priceMax !== null)
    result = result.filter(p => p.price <= activeFilters.priceMax);
  if (activeFilters.rating)
    result = result.filter(p => (p.rating || 0) >= Number(activeFilters.rating));
  if (activeFilters.festiveOnly)
    result = result.filter(p => p.discount >= 15 && ["Sweets","Chocolates","Gifts","Snacks"].includes(p.category));

  Object.entries(activeFilters.attributes).forEach(([k, vals]) => {
    if (vals.length) result = result.filter(p => p.attributes && vals.includes(p.attributes[k]));
  });

  return result;
}

function sortProducts(products) {
  const arr = [...products];
  switch (currentSort) {
    case "price-asc": arr.sort((a, b) => a.price - b.price); break;
    case "price-desc": arr.sort((a, b) => b.price - a.price); break;
    case "name-asc": arr.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "newest": arr.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0)); break;
    default: arr.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
  return arr;
}

/* ===== ACTIVE CHIPS ===== */
function renderActiveChips() {
  const container = $("#activeFilters");
  const badge = $("#filterCountBadge");
  const chips = [];

  activeFilters.categories.forEach(c => chips.push({ label: c, type: "category", value: c }));
  activeFilters.subCategories.forEach(s => chips.push({ label: s, type: "subCategory", value: s }));
  activeFilters.brands.forEach(b => chips.push({ label: b, type: "brand", value: b }));
  if (activeFilters.priceMin !== null) chips.push({ label: `≥ ₹${activeFilters.priceMin}`, type: "priceMin" });
  if (activeFilters.priceMax !== null) chips.push({ label: `≤ ₹${activeFilters.priceMax}`, type: "priceMax" });
  if (activeFilters.rating) chips.push({ label: `⭐ ${activeFilters.rating}+`, type: "rating" });
  if (activeFilters.festiveOnly) chips.push({ label: "🪔 Festive", type: "festive" });
  Object.entries(activeFilters.attributes).forEach(([k, vals]) => {
    vals.forEach(v => chips.push({ label: `${k}: ${v}`, type: "attribute", key: k, value: v }));
  });

  container.innerHTML = chips.map(c => `
    <span class="filter-chip">
      ${c.label}
      <button data-chip-type="${c.type}" data-chip-value="${c.value ?? ""}" data-chip-key="${c.key ?? ""}">✕</button>
    </span>
  `).join("");

  if (badge) badge.textContent = chips.length || "";

  container.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const { chipType: type, chipValue: value, chipKey: key } = btn.dataset;
      if (type === "category") activeFilters.categories = activeFilters.categories.filter(x => x !== value);
      else if (type === "subCategory") activeFilters.subCategories = activeFilters.subCategories.filter(x => x !== value);
      else if (type === "brand") activeFilters.brands = activeFilters.brands.filter(x => x !== value);
      else if (type === "priceMin") activeFilters.priceMin = null;
      else if (type === "priceMax") activeFilters.priceMax = null;
      else if (type === "rating") activeFilters.rating = null;
      else if (type === "festive") activeFilters.festiveOnly = false;
      else if (type === "attribute" && key) {
        activeFilters.attributes[key] = (activeFilters.attributes[key] || []).filter(x => x !== value);
        if (!activeFilters.attributes[key].length) delete activeFilters.attributes[key];
      }
      applyFiltersAndRender();
    });
  });
}

/* ===== MASTER RENDER ===== */
function applyFiltersAndRender() {
  const filtered = filterProducts(allProducts);
  const sorted = sortProducts(filtered);

  renderProductsGrid($("#productGrid"), sorted);
  const countEl = $("#productCount");
  if (countEl) countEl.textContent = `${sorted.length} product${sorted.length !== 1 ? "s" : ""}`;

  const empty = $("#emptyState");
  if (empty) empty.style.display = sorted.length === 0 ? "block" : "none";

  renderActiveChips();
  renderFilters(allProducts);
}

/* ===== PRODUCT MODAL ===== */
function openProductDetails(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;

  const emoji = productEmoji(p);
  const hasDiscount = p.discount > 0;
  const discountHTML = hasDiscount ? `<span class="modal-discount">${p.discount}% OFF</span>` : "";
  const mrpHTML = (p.mrp && p.mrp > p.price) ? `<span class="modal-price-mrp">${formatPrice(p.mrp)}</span>` : "";
  const ratingHTML = p.rating
    ? `<div class="modal-rating">⭐ ${p.rating} <span>(${p.reviewCount || 0} reviews)</span></div>`
    : "";
  const stockClass = p.stockStatus === "In Stock" ? "modal-stock-in" : "modal-stock-out";

  let specsHTML = "";
  if (p.attributes && Object.keys(p.attributes).length) {
    specsHTML = `
      <div class="modal-specs">
        <h3>Product Details</h3>
        <div class="spec-grid">
          ${Object.entries(p.attributes).map(([k, v]) => `
            <div class="spec-item">
              <span class="spec-label">${k}</span>
              <span class="spec-value">${v}</span>
            </div>
          `).join("")}
        </div>
      </div>`;
  }

  $("#modalBody").innerHTML = `
    <div class="modal-product">
      <div class="modal-gallery">
        <div class="modal-main-img"><span>${emoji}</span></div>
      </div>
      <div class="modal-details">
        <div class="modal-brand">${p.brand} · ${p.category}</div>
        <h2>${p.name}</h2>
        ${ratingHTML}
        <div class="modal-price-block">
          <span class="modal-price-current">${formatPrice(p.price)}</span>
          ${mrpHTML}
          ${discountHTML}
        </div>
        <div class="modal-meta-row">
          <span>📦 <strong>${p.unit}</strong></span>
          <span class="${stockClass}">● ${p.stockStatus}</span>
          <span>🔖 <strong>${p.id}</strong></span>
        </div>
        <p class="modal-desc">${p.description}</p>
        <div class="modal-actions">
          <button class="btn-whatsapp" id="modalWaBtn">💬 Enquire on WhatsApp</button>
          <button class="btn-outline" id="modalAddBtn">+ Add to Enquiry</button>
        </div>
        ${specsHTML}
      </div>
    </div>`;

  $("#modalWaBtn").addEventListener("click", () => openWhatsAppEnquiry(p));
  $("#modalAddBtn").addEventListener("click", () => {
    addToEnquiry(p.id);
    closeProductModal();
  });

  $("#productModal").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  $("#productModal").style.display = "none";
  document.body.style.overflow = "";
}

/* ===== ENQUIRY LIST ===== */
function addToEnquiry(id) {
  if (!enquiryList.includes(id)) {
    enquiryList.push(id);
    updateEnquiryBar();
    showToast(`Added to enquiry (${enquiryList.length})`);
  } else {
    showToast("Already in your enquiry list");
  }
}

function updateEnquiryBar() {
  const bar = $("#enquiryBar");
  const count = $("#enquiryCount");
  if (enquiryList.length > 0) {
    bar.style.display = "flex";
    count.textContent = enquiryList.length;
  } else {
    bar.style.display = "none";
  }
}

/* ===== ENQUIRY MODAL ===== */
function openEnquiryModal() {
  if (!enquiryList.length) {
    showToast("Please add products first");
    return;
  }
  $("#enquiryModal").style.display = "flex";
  document.body.style.overflow = "hidden";
  $(".enquiry-modal-options").style.display = "flex";
  $("#enquiryForm").style.display = "none";
}

function closeEnquiryModal() {
  $("#enquiryModal").style.display = "none";
  document.body.style.overflow = "";
}

function sendEnquiryViaWhatsApp() {
  const items = enquiryList.map(id => {
    const p = allProducts.find(x => x.id === id);
    return p ? `• ${p.name} — ${p.unit} — ${formatPrice(p.price)}` : "";
  }).filter(Boolean).join("\n");
  const msg = `Hi ${CONFIG.brandName}, I am interested in the following products:\n\n${items}\n\nPlease share prices and availability.`;
  window.open(waLink(msg), "_blank");
  closeEnquiryModal();
}

async function sendEnquiryViaSheet(data) {
  if (!CONFIG.enquiryScriptUrl) {
    const items = enquiryList.map(id => {
      const p = allProducts.find(x => x.id === id);
      return p ? `• ${p.name} (${p.unit})` : "";
    }).filter(Boolean).join("\n");
    const msg = `Hi ${CONFIG.brandName},\n\nName: ${data.name}\nPhone: ${data.phone}\n${data.email ? `Email: ${data.email}\n` : ""}\nInterested in:\n${items}\n\n${data.message || ""}`;
    window.open(waLink(msg), "_blank");
    return { fallback: true };
  }
  const products = enquiryList.map(id => {
    const p = allProducts.find(x => x.id === id);
    return p ? { id: p.id, name: p.name, brand: p.brand, unit: p.unit, price: p.price } : null;
  }).filter(Boolean);
  try {
    await fetch(CONFIG.enquiryScriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...data, products, date: new Date().toISOString() })
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

/* ===== DRAWERS ===== */
function openMobileMenu() {
  $("#mobileMenuDrawer").classList.add("open");
  $("#mobileMenuOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeMobileMenu() {
  $("#mobileMenuDrawer").classList.remove("open");
  $("#mobileMenuOverlay").classList.remove("open");
  document.body.style.overflow = "";
}
function openFilterDrawer() {
  $("#filterDrawer").classList.add("open");
  $("#filterDrawerOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeFilterDrawerFn() {
  $("#filterDrawer").classList.remove("open");
  $("#filterDrawerOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

/* ===== CLEAR ===== */
function clearAllFilters() {
  activeFilters = {
    categories: [], subCategories: [], brands: [],
    priceMin: null, priceMax: null, stock: [],
    rating: null, attributes: {}, festiveOnly: false
  };
  currentSort = "recommended";
  $("#sortSelect").value = "recommended";
  searchQuery = "";
  $("#searchInput").value = "";
  $("#searchClear").style.display = "none";
  applyFiltersAndRender();
}

/* ===== EVENTS ===== */
function wireEvents() {
  $("#searchInput").addEventListener("input", debounce((e) => {
    searchQuery = e.target.value;
    $("#searchClear").style.display = searchQuery ? "block" : "none";
    applyFiltersAndRender();
  }, 150));

  $("#searchClear").addEventListener("click", () => {
    $("#searchInput").value = "";
    searchQuery = "";
    $("#searchClear").style.display = "none";
    applyFiltersAndRender();
  });

  $("#sortSelect").addEventListener("change", (e) => {
    currentSort = e.target.value;
    applyFiltersAndRender();
  });

  $("#generalEnquiryBtn").addEventListener("click", openGeneralEnquiry);
  $("#mobileMenuToggle").addEventListener("click", openMobileMenu);
  $("#closeMobileMenu").addEventListener("click", closeMobileMenu);
  $("#mobileMenuOverlay").addEventListener("click", closeMobileMenu);
  $("#mobileFilterBtn").addEventListener("click", openFilterDrawer);
  $("#closeFilterDrawer").addEventListener("click", closeFilterDrawerFn);
  $("#filterDrawerOverlay").addEventListener("click", closeFilterDrawerFn);
  $("#clearFiltersMobile").addEventListener("click", clearAllFilters);
  $("#applyFiltersMobile").addEventListener("click", () => {
    applyFiltersAndRender();
    closeFilterDrawerFn();
  });

  $("#clearFiltersBtn").addEventListener("click", clearAllFilters);
  $("#emptyClearBtn").addEventListener("click", clearAllFilters);

  $("#heroShopBtn").addEventListener("click", () => {
    document.getElementById("catalogue").scrollIntoView({ behavior: "smooth" });
  });
  $("#heroFestiveBtn").addEventListener("click", () => {
    activeFilters.festiveOnly = true;
    applyFiltersAndRender();
    document.getElementById("catalogue").scrollIntoView({ behavior: "smooth" });
  });

  document.querySelectorAll("[data-scroll]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById(el.dataset.scroll)?.scrollIntoView({ behavior: "smooth" });
    });
  });

  $("#closeModalBtn").addEventListener("click", closeProductModal);
  $("#productModal").addEventListener("click", (e) => {
    if (e.target === $("#productModal")) closeProductModal();
  });

  $("#sendEnquiryBtn").addEventListener("click", openEnquiryModal);
  $("#enquiryClearBtn").addEventListener("click", () => {
    enquiryList = [];
    updateEnquiryBar();
    showToast("Enquiry list cleared");
  });

  $("#closeEnquiryModal").addEventListener("click", closeEnquiryModal);
  $("#enquiryModal").addEventListener("click", (e) => {
    if (e.target === $("#enquiryModal")) closeEnquiryModal();
  });

  $("#enquiryViaWhatsApp").addEventListener("click", sendEnquiryViaWhatsApp);
  $("#enquiryViaSheet").addEventListener("click", () => {
    $(".enquiry-modal-options").style.display = "none";
    $("#enquiryForm").style.display = "flex";
  });
  $("#backToOptions").addEventListener("click", () => {
    $(".enquiry-modal-options").style.display = "flex";
    $("#enquiryForm").style.display = "none";
  });

  $("#enquiryForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#submitEnquiryBtn");
    const data = {
      name: $("#custName").value.trim(),
      phone: $("#custPhone").value.trim(),
      email: $("#custEmail").value.trim(),
      message: $("#custMessage").value.trim()
    };
    if (!data.name || !data.phone) { showToast("Please fill name and phone"); return; }
    btn.disabled = true; btn.textContent = "Submitting…";
    const res = await sendEnquiryViaSheet(data);
    btn.disabled = false; btn.textContent = "Submit Enquiry";
    if (res.success) {
      showToast("✅ Enquiry submitted!");
      enquiryList = []; updateEnquiryBar();
      closeEnquiryModal(); $("#enquiryForm").reset();
    } else if (res.fallback) {
      showToast("Opening WhatsApp…");
      enquiryList = []; updateEnquiryBar();
      closeEnquiryModal(); $("#enquiryForm").reset();
    } else {
      showToast("Could not submit — please try WhatsApp");
    }
  });

  $("#footerWhatsapp").addEventListener("click", (e) => { e.preventDefault(); openGeneralEnquiry(); });
  $("#footerPhone").addEventListener("click", (e) => { e.preventDefault(); window.location.href = `tel:${CONFIG.phoneLink}`; });
  $("#footerEmail").addEventListener("click", (e) => { e.preventDefault(); window.location.href = `mailto:${CONFIG.email}`; });
  $("#footerEnquiry").addEventListener("click", (e) => {
    e.preventDefault();
    if (enquiryList.length) openEnquiryModal();
    else openGeneralEnquiry();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeProductModal();
      closeEnquiryModal();
      closeMobileMenu();
      closeFilterDrawerFn();
    }
  });

  const params = new URLSearchParams(location.search);
  const pid = params.get("product");
  if (pid) setTimeout(() => openProductDetails(pid), 400);
}

/* ===== CONFIG TEXT ===== */
function applyConfig() {
  $("#brandLogo").textContent = CONFIG.brandName;
  document.title = `${CONFIG.brandName} · ${CONFIG.tagline}`;
  $("#footerLocation").textContent = CONFIG.location;
  $("#footerWhatsappValue").textContent = CONFIG.whatsappDisplay;
  $("#footerPhoneValue").textContent = CONFIG.phone;
  $("#footerEmailValue").textContent = CONFIG.email;
  $("#year").textContent = new Date().getFullYear();
  $("#footerWhatsapp").href = `https://wa.me/${CONFIG.whatsappNumber}`;
  $("#footerPhone").href = `tel:${CONFIG.phoneLink}`;
  $("#footerEmail").href = `mailto:${CONFIG.email}`;
}

/* ===== INIT ===== */
async function init() {
  console.log("🚀 Init started");
  try {
    applyConfig();
    console.log("✅ Config applied");

    allProducts = await loadProducts();
    console.log("📦 Products loaded:", allProducts.length);

    if (!allProducts || allProducts.length === 0) {
      console.error("❌ No products loaded. Check data/products.js");
      const grid = $("#productGrid");
      if (grid) grid.innerHTML =
        '<p style="grid-column:1/-1;padding:40px;text-align:center;color:#c9386b;font-weight:600;">⚠️ No products loaded. Open browser console (F12) for details.</p>';
      return;
    }

    renderCategories(allProducts);
    console.log("✅ Categories rendered");

    renderFeatured();
    renderFestive();
    renderNewArrivals();
    console.log("✅ Sections rendered");

    renderFilters(allProducts);
    console.log("✅ Filters rendered");

    applyFiltersAndRender();
    console.log("✅ Products rendered");

    updateEnquiryBar();
    wireEvents();
    console.log("✅ Init complete");
  } catch (err) {
    console.error("💥 Init error:", err);
  }
}

init();