/* Table Buddy theme — predictive search */
(function () {
  'use strict';

  class TbPredictiveSearch extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('input[type="search"]');
      this.resultsEl = this.querySelector('[data-search-results]');
      this.form = this.querySelector('form');
      if (!this.input) return;
      this.debounced = debounce(this.search.bind(this), 220);
      this.input.addEventListener('input', function () {
        var term = this.input.value.trim();
        if (term.length < 2) { this.clear(); return; }
        this.debounced(term);
      }.bind(this));
      this.input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') this.clear();
      }.bind(this));
    }

    clear() {
      if (this.resultsEl) { this.resultsEl.innerHTML = ''; this.resultsEl.hidden = true; }
    }

    search(term) {
      var url = '/search/suggest.json?q=' + encodeURIComponent(term) + '&resources[type]=product,page,article&resources[limit]=6&resources[options][unavailable_products]=last';
      fetch(url, { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(this.render.bind(this))
        .catch(function () {});
    }

    render(data) {
      if (!this.resultsEl) return;
      var resources = data.resources && data.resources.results;
      if (!resources) { this.clear(); return; }
      var products = resources.products || [];
      var pages = (resources.pages || []).concat(resources.articles || []);
      if (!products.length && !pages.length) {
        this.resultsEl.innerHTML = '<p class="predictive-search__empty">' + (this.getAttribute('data-no-results-text') || 'No results found.') + '</p>';
        this.resultsEl.hidden = false;
        return;
      }
      var html = '';
      if (products.length) {
        html += '<p class="predictive-search__label">' + (this.getAttribute('data-products-label') || 'Products') + '</p><ul class="predictive-search__list">';
        products.forEach(function (p) {
          html += '<li><a href="' + p.url + '" class="predictive-search__item">' +
            (p.image ? '<img src="' + p.image + '" width="52" height="52" alt="" loading="lazy">' : '') +
            '<span><span class="predictive-search__title">' + p.title + '</span><span class="predictive-search__price">' + p.price + '</span></span>' +
          '</a></li>';
        });
        html += '</ul>';
      }
      if (pages.length) {
        html += '<p class="predictive-search__label">' + (this.getAttribute('data-pages-label') || 'Pages') + '</p><ul class="predictive-search__list">';
        pages.forEach(function (p) {
          html += '<li><a href="' + p.url + '" class="predictive-search__item predictive-search__item--text">' + p.title + '</a></li>';
        });
        html += '</ul>';
      }
      html += '<a href="/search?q=' + encodeURIComponent(this.input.value) + '" class="predictive-search__view-all link-arrow">' + (this.getAttribute('data-view-all-text') || 'View all results') + '</a>';
      this.resultsEl.innerHTML = html;
      this.resultsEl.hidden = false;
    }
  }
  if (!customElements.get('tb-predictive-search')) customElements.define('tb-predictive-search', TbPredictiveSearch);

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('tb-predictive-search')) {
      document.querySelectorAll('[data-search-results]').forEach(function (el) { el.hidden = true; });
    }
  });
})();
