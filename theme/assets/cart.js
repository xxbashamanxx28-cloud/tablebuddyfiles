/* Table Buddy theme — AJAX cart drawer */
(function () {
  'use strict';

  function formatMoney(cents) {
    var format = (window.Shopify && window.Shopify.money_format) || '${{amount}}';
    var value = (cents / 100).toFixed(2);
    var parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    value = parts.join('.');
    return format.replace(/\{\{\s*(amount|amount_no_decimals)\s*\}\}/, value);
  }
  window.TB = window.TB || {};
  TB.formatMoney = formatMoney;

  var drawer = document.getElementById('cart-drawer');
  var itemsEl = drawer && drawer.querySelector('[data-cart-items]');
  var emptyEl = drawer && drawer.querySelector('[data-cart-empty]');
  var subtotalEl = drawer && drawer.querySelector('[data-cart-subtotal]');
  var footerEl = drawer && drawer.querySelector('[data-cart-footer]');
  var progressFill = drawer && drawer.querySelector('[data-shipping-progress-fill]');
  var progressLabel = drawer && drawer.querySelector('[data-shipping-progress-label]');
  var countBubbles = document.querySelectorAll('[data-cart-count]');
  var freeShippingThreshold = parseFloat(drawer && drawer.getAttribute('data-free-shipping-threshold')) || 0;

  function itemTemplate(item) {
    var img = item.image ? '<img src="' + item.image.replace(/(\.[a-zA-Z0-9]+)(\?.*)?$/, '_160x$1$2') + '" alt="' + (item.image_alt || item.product_title) + '" width="80" height="80" loading="lazy">' : '';
    return (
      '<li class="cart-line" data-cart-line="' + item.key + '">' +
        '<div class="cart-line__media">' + img + '</div>' +
        '<div class="cart-line__body">' +
          '<p class="cart-line__title">' + item.product_title + '</p>' +
          (item.variant_title ? '<p class="cart-line__variant text-muted">' + item.variant_title + '</p>' : '') +
          '<div class="cart-line__row">' +
            '<div class="quantity-selector" data-line-key="' + item.key + '">' +
              '<button type="button" data-cart-qty="decrease" aria-label="Decrease quantity">&minus;</button>' +
              '<input type="number" min="0" value="' + item.quantity + '" aria-label="Quantity" data-cart-qty-input>' +
              '<button type="button" data-cart-qty="increase" aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<p class="cart-line__price">' + formatMoney(item.final_line_price) + '</p>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="icon-btn cart-line__remove" data-cart-remove="' + item.key + '" aria-label="Remove ' + item.product_title + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</li>'
    );
  }

  function renderCart(cart) {
    countBubbles.forEach(function (el) { el.textContent = cart.item_count; el.hidden = cart.item_count === 0; });
    if (!drawer) return;
    if (cart.item_count === 0) {
      if (itemsEl) itemsEl.innerHTML = '';
      if (emptyEl) emptyEl.hidden = false;
      if (footerEl) footerEl.hidden = true;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    if (footerEl) footerEl.hidden = false;
    if (itemsEl) itemsEl.innerHTML = cart.items.map(itemTemplate).join('');
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
    if (progressFill && freeShippingThreshold > 0) {
      var pct = Math.min(100, (cart.total_price / 100 / freeShippingThreshold) * 100);
      progressFill.style.width = pct + '%';
      if (progressLabel) {
        progressLabel.textContent = pct >= 100
          ? (progressLabel.getAttribute('data-reached-text') || "You've unlocked free shipping!")
          : (progressLabel.getAttribute('data-progress-text') || '').replace('{{ amount }}', formatMoney(Math.max(0, freeShippingThreshold * 100 - cart.total_price)));
      }
    }
  }

  function fetchCart() {
    return fetch('/cart.js', { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); });
  }
  TB.refreshCart = function () { return fetchCart().then(renderCart); };

  function addToCart(form) {
    var formData = new FormData(form);
    formData.set('form_type', 'product');
    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.classList.add('btn--loading');
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData
    }).then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
      .then(function (res) {
        if (submitBtn) submitBtn.classList.remove('btn--loading');
        if (!res.ok) {
          var err = form.querySelector('[data-form-error]');
          if (err) { err.hidden = false; err.textContent = res.data.description || 'This item could not be added to your cart.'; }
          return Promise.reject(res.data);
        }
        var err2 = form.querySelector('[data-form-error]');
        if (err2) err2.hidden = true;
        return fetchCart().then(function (cart) {
          renderCart(cart);
          if (drawer) TB.openDrawer(drawer, submitBtn);
        });
      });
  }
  TB.addToCart = addToCart;

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-type="add-to-cart-form"]');
    if (!form) return;
    e.preventDefault();
    addToCart(form).catch(function () {});
  });

  document.addEventListener('click', function (e) {
    var removeBtn = e.target.closest('[data-cart-remove]');
    if (removeBtn) {
      changeLine(removeBtn.getAttribute('data-cart-remove'), 0);
    }
    var qtyBtn = e.target.closest('[data-cart-qty]');
    if (qtyBtn) {
      var wrap = qtyBtn.closest('.quantity-selector');
      var input = wrap.querySelector('[data-cart-qty-input]');
      var val = parseInt(input.value, 10) || 1;
      val = qtyBtn.getAttribute('data-cart-qty') === 'increase' ? val + 1 : Math.max(0, val - 1);
      input.value = val;
      changeLine(wrap.getAttribute('data-line-key'), val);
    }
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-cart-qty-input]')) {
      var wrap = e.target.closest('.quantity-selector');
      changeLine(wrap.getAttribute('data-line-key'), Math.max(0, parseInt(e.target.value, 10) || 0));
    }
  });

  var changeTimer;
  function changeLine(key, quantity) {
    clearTimeout(changeTimer);
    changeTimer = setTimeout(function () {
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity })
      }).then(function (r) { return r.json(); }).then(renderCart);
    }, 200);
  }

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-cart-note-form]');
    if (!form) return;
    e.preventDefault();
    var note = form.querySelector('textarea').value;
    fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ note: note })
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    if (drawer) TB.refreshCart();
  });
})();
