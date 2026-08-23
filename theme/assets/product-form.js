/* Table Buddy theme — variant selection, price/media/availability sync */
(function () {
  'use strict';

  function moneyFmt(cents) { return (window.TB && TB.formatMoney) ? TB.formatMoney(cents) : '$' + (cents / 100).toFixed(2); }

  class TbProductForm extends HTMLElement {
    connectedCallback() {
      var dataEl = this.querySelector('[data-product-json]');
      if (!dataEl) return;
      this.product = JSON.parse(dataEl.textContent);
      this.form = this.querySelector('form[data-type="add-to-cart-form"]');
      this.optionInputs = Array.prototype.slice.call(this.querySelectorAll('[data-option-input]'));
      this.idInput = this.querySelector('[data-variant-id-input]');
      this.priceEl = this.querySelector('[data-price]');
      this.comparePriceEl = this.querySelector('[data-compare-price]');
      this.priceWrap = this.querySelector('[data-price-wrap]');
      this.availabilityEl = this.querySelector('[data-availability]');
      this.submitBtn = this.querySelector('[data-submit-button]');
      this.skuEl = this.querySelector('[data-sku]');

      this.optionInputs.forEach(function (input) {
        input.addEventListener('change', this.onOptionChange.bind(this));
      }.bind(this));

      var initial = this.getSelectedVariant();
      if (initial) this.updateForVariant(initial, false);
    }

    getSelectedOptions() {
      var selected = [];
      var groups = {};
      this.optionInputs.forEach(function (input) {
        if (input.type === 'radio' && !input.checked) return;
        var idx = parseInt(input.getAttribute('data-option-index'), 10);
        groups[idx] = input.value;
      });
      var max = this.product.options.length;
      for (var i = 0; i < max; i++) selected.push(groups[i]);
      return selected;
    }

    getSelectedVariant() {
      var selected = this.getSelectedOptions();
      return this.product.variants.find(function (v) {
        return v.options.every(function (opt, i) { return opt === selected[i]; });
      });
    }

    onOptionChange() {
      var variant = this.getSelectedVariant();
      this.optionInputs.forEach(function (input) {
        var label = input.closest('[data-option-value]');
        if (label) label.classList.toggle('is-selected', input.checked);
      });
      this.updateForVariant(variant, true);
    }

    updateForVariant(variant, pushState) {
      if (!variant) {
        if (this.submitBtn) { this.submitBtn.disabled = true; this.submitBtn.textContent = this.submitBtn.getAttribute('data-unavailable-text') || 'Unavailable'; }
        if (this.availabilityEl) this.availabilityEl.textContent = '';
        return;
      }
      if (this.idInput) this.idInput.value = variant.id;
      if (this.priceEl) this.priceEl.textContent = moneyFmt(variant.price);
      if (this.comparePriceEl) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          this.comparePriceEl.textContent = moneyFmt(variant.compare_at_price);
          this.comparePriceEl.hidden = false;
          if (this.priceWrap) this.priceWrap.classList.add('price--on-sale');
        } else {
          this.comparePriceEl.hidden = true;
          if (this.priceWrap) this.priceWrap.classList.remove('price--on-sale');
        }
      }
      if (this.skuEl) this.skuEl.textContent = variant.sku || '';
      if (this.submitBtn) {
        if (!variant.available) {
          this.submitBtn.disabled = true;
          this.submitBtn.textContent = this.submitBtn.getAttribute('data-soldout-text') || 'Sold out';
        } else {
          this.submitBtn.disabled = false;
          this.submitBtn.textContent = this.submitBtn.getAttribute('data-add-text') || 'Add to cart';
        }
      }
      if (this.availabilityEl) {
        this.availabilityEl.textContent = variant.available ? (this.availabilityEl.getAttribute('data-in-stock-text') || 'In stock') : (this.availabilityEl.getAttribute('data-oos-text') || 'Sold out');
        this.availabilityEl.classList.toggle('is-oos', !variant.available);
      }
      if (variant.featured_media) {
        document.dispatchEvent(new CustomEvent('variant:media-change', { detail: { mediaId: variant.featured_media.id } }));
      }
      if (pushState && window.history && this.product.url) {
        var url = this.product.url + '?variant=' + variant.id;
        window.history.replaceState({}, '', url);
      }
      this.dispatchEvent(new CustomEvent('variant:change', { bubbles: true, detail: { variant: variant } }));
    }
  }
  if (!customElements.get('tb-product-form')) customElements.define('tb-product-form', TbProductForm);

  /* Product gallery: thumbnail click / variant-driven select */
  class TbProductGallery extends HTMLElement {
    connectedCallback() {
      this.main = this.querySelector('[data-gallery-main]');
      this.thumbs = Array.prototype.slice.call(this.querySelectorAll('[data-gallery-thumb]'));
      this.thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () { this.select(thumb.getAttribute('data-media-id')); }.bind(this));
      }.bind(this));
      document.addEventListener('variant:media-change', function (e) { this.select(e.detail.mediaId); }.bind(this));
    }
    select(mediaId) {
      var target = this.main.querySelector('[data-media-id="' + mediaId + '"]');
      if (!target) return;
      this.thumbs.forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-media-id') === mediaId); });
      if (this.main.scrollTo) this.main.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    }
  }
  if (!customElements.get('tb-product-gallery')) customElements.define('tb-product-gallery', TbProductGallery);

  /* Bundle add-to-cart: multiple variant ids at once */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-bundle-form]');
    if (!form) return;
    e.preventDefault();
    var items = Array.prototype.slice.call(form.querySelectorAll('[data-bundle-item]:checked, [data-bundle-item][data-required="true"]'))
      .map(function (el) { return { id: parseInt(el.value, 10), quantity: 1 }; });
    if (!items.length) return;
    var btn = form.querySelector('[type="submit"]');
    if (btn) btn.classList.add('btn--loading');
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: items })
    }).then(function (r) { return r.json(); }).then(function () {
      if (btn) btn.classList.remove('btn--loading');
      if (window.TB && TB.refreshCart) {
        TB.refreshCart().then(function () {
          var drawer = document.getElementById('cart-drawer');
          if (drawer) TB.openDrawer(drawer, btn);
        });
      }
    }).catch(function () { if (btn) btn.classList.remove('btn--loading'); });
  });
})();
