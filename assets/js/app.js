
(function () {
  const data = Array.isArray(window.KWABULAWAYO_LISTINGS) ? window.KWABULAWAYO_LISTINGS : [];

  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  function slugify(text) {
    return String(text || '').toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function createPlaceholder(name) {
    const letter = (name || 'K').trim().charAt(0).toUpperCase();
    return `<div class="placeholder" aria-hidden="true">${letter}</div>`;
  }

  function imageMarkup(item, cls = '') {
    if (item.heroImage) {
      return `<img src="${item.heroImage}" alt="${item.name}" loading="lazy" onerror="this.remove(); this.parentElement.insertAdjacentHTML('beforeend', ${JSON.stringify(createPlaceholder(item.name))});">`;
    }
    return createPlaceholder(item.name);
  }

  function mapsSearchUrl(item) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapQuery || item.name + ', Bulawayo, Zimbabwe')}`;
  }

  function directionsUrl(item) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.mapQuery || item.name + ', Bulawayo, Zimbabwe')}`;
  }

  function cardTemplate(item) {
    return `
      <article class="listing-card">
        <div class="listing-media">${imageMarkup(item)}</div>
        <div class="listing-content">
          <div class="pill-row">
            <span class="pill">${item.category}</span>
            <span class="pill">${item.area}</span>
          </div>
          <h3>${item.name}</h3>
          <p>${item.summary}</p>
          <div class="listing-actions">
            <a class="btn secondary" href="/listings/${item.slug}.html">View listing</a>
            <a class="btn ghost" href="${mapsSearchUrl(item)}" target="_blank" rel="noopener">Google Maps</a>
          </div>
        </div>
      </article>`;
  }

  function renderFeatured() {
    const root = $('[data-featured]');
    if (!root) return;
    const featured = data.filter(item => item.featured).slice(0, 6);
    root.innerHTML = featured.map(cardTemplate).join('');
  }

  function populateSelect(select, values, label) {
    if (!select) return;
    const current = select.value;
    select.innerHTML = `<option value="">${label}</option>` + values.map(v => `<option value="${v}">${v}</option>`).join('');
    select.value = current;
  }

  function renderListings() {
    const results = $('[data-results]');
    if (!results) return;
    const searchInput = $('[data-search]');
    const categorySelect = $('[data-category]');
    const areaSelect = $('[data-area]');
    const meta = $('[data-results-meta]');
    const mapFocus = $('[data-map-focus]');
    const mapLink = $('[data-map-link]');

    populateSelect(categorySelect, [...new Set(data.map(d => d.category))].sort(), 'All categories');
    populateSelect(areaSelect, [...new Set(data.map(d => d.area))].sort(), 'All areas');

    function apply() {
      const q = (searchInput?.value || '').trim().toLowerCase();
      const cat = categorySelect?.value || '';
      const area = areaSelect?.value || '';
      const filtered = data.filter(item => {
        const blob = [item.name, item.summary, item.category, item.area, ...(item.tags || [])].join(' ').toLowerCase();
        return (!q || blob.includes(q)) && (!cat || item.category === cat) && (!area || item.area === area);
      });

      results.innerHTML = filtered.length
        ? filtered.map(cardTemplate).join('')
        : `<div class="empty-state">No listings matched that search yet. Try a broader keyword or remove a filter.</div>`;

      if (meta) {
        meta.innerHTML = `<div><strong>${filtered.length}</strong> listing${filtered.length === 1 ? '' : 's'} shown</div><div class="small">Google Maps links are included on every card and detail page.</div>`;
      }

      if (mapFocus) {
        const focus = filtered.slice(0, 6);
        mapFocus.innerHTML = focus.length ? focus.map(item => `
          <a class="map-pin" href="${mapsSearchUrl(item)}" target="_blank" rel="noopener">
            <b>${item.name}</b>
            <span>${item.category} · ${item.area}</span>
          </a>`).join('') : '<div class="empty-state">No map matches for the current filter.</div>';
      }
      if (mapLink) {
        const target = filtered[0] || data[0];
        mapLink.href = target ? mapsSearchUrl(target) : 'https://www.google.com/maps/search/?api=1&query=Bulawayo%2C%20Zimbabwe';
      }
    }

    [searchInput, categorySelect, areaSelect].forEach(el => el && el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply));
    apply();
  }

  function renderDetailPage() {
    const root = document.body?.dataset?.listingSlug;
    if (!root) return;
    const item = data.find(entry => entry.slug === root);
    if (!item) return;

    document.title = `${item.name} — kwaBulawayo`;
    $('[data-detail-title]').textContent = item.name;
    $('[data-detail-category]').textContent = item.category;
    $('[data-detail-area]').textContent = item.area;
    $('[data-detail-summary]').textContent = item.summary;
    $('[data-detail-address]').textContent = item.address;
    $('[data-detail-hours]').textContent = item.hours;
    $('[data-detail-map]').href = mapsSearchUrl(item);
    $('[data-detail-directions]').href = directionsUrl(item);
    const banner = $('[data-detail-banner]');
    if (banner) banner.innerHTML = imageMarkup(item);
    const breadcrumb = $('[data-detail-breadcrumb]');
    if (breadcrumb) breadcrumb.textContent = item.name;
    const related = $('[data-related-listings]');
    if (related) {
      const matches = data.filter(entry => entry.slug !== item.slug && (entry.category === item.category || entry.area === item.area)).slice(0, 3);
      related.innerHTML = matches.map(cardTemplate).join('');
    }
  }

  function setupMobileMenu() {
    const toggle = $('[data-menu-toggle]');
    const menu = $('[data-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function setupContactForm() {
    const form = $('[data-contact-form]');
    if (!form) return;
    const status = $('[data-form-status]');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const name = (formData.get('name') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const subject = (formData.get('subject') || 'kwaBulawayo enquiry').toString().trim();
      const message = (formData.get('message') || '').toString().trim();
      const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${encodeURIComponent(message)}`;
      window.location.href = `mailto:hello@kwabulawayo.com?subject=${encodeURIComponent(subject)}&body=${body}`;
      if (status) status.textContent = 'Your email app should open now. Replace hello@kwabulawayo.com if you want a different inbox.';
    });
  }

  function updateYear() {
    $$('.js-year').forEach(node => node.textContent = new Date().getFullYear());
  }

  renderFeatured();
  renderListings();
  renderDetailPage();
  setupMobileMenu();
  setupContactForm();
  updateYear();
})();
