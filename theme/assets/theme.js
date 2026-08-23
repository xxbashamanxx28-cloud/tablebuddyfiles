/* Table Buddy theme — global behavior: drawers, accordions, mega menu, carousels */
(function () {
  'use strict';

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trapFocus(container, first) {
    var nodes = container.querySelectorAll(FOCUSABLE);
    if (!nodes.length) return;
    (first || nodes[0]).focus();
    function handler(e) {
      if (e.key !== 'Tab') return;
      var list = Array.prototype.slice.call(container.querySelectorAll(FOCUSABLE));
      var idx = list.indexOf(document.activeElement);
      if (e.shiftKey && (idx <= 0)) { e.preventDefault(); list[list.length - 1].focus(); }
      else if (!e.shiftKey && idx === list.length - 1) { e.preventDefault(); list[0].focus(); }
    }
    container.addEventListener('keydown', handler);
    container.__trapHandler = handler;
  }
  function releaseFocus(container) {
    if (container.__trapHandler) container.removeEventListener('keydown', container.__trapHandler);
  }

  /* ---------- Generic drawer (cart, mobile nav, search) ---------- */
  window.TB = window.TB || {};
  TB.openDrawer = function (drawerEl, opener) {
    if (!drawerEl) return;
    var overlay = document.querySelector('[data-drawer-overlay="' + drawerEl.id + '"]') || document.getElementById('drawer-overlay');
    drawerEl.classList.add('is-open');
    drawerEl.removeAttribute('inert');
    drawerEl.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    drawerEl.__opener = opener || document.activeElement;
    trapFocus(drawerEl);
    drawerEl.dispatchEvent(new CustomEvent('drawer:open'));
  };
  TB.closeDrawer = function (drawerEl) {
    if (!drawerEl || !drawerEl.classList.contains('is-open')) return;
    var overlay = document.querySelector('[data-drawer-overlay="' + drawerEl.id + '"]') || document.getElementById('drawer-overlay');
    drawerEl.classList.remove('is-open');
    drawerEl.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    releaseFocus(drawerEl);
    if (drawerEl.__opener && drawerEl.__opener.focus) drawerEl.__opener.focus();
    drawerEl.dispatchEvent(new CustomEvent('drawer:close'));
  };

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open-drawer]');
    if (opener) {
      var target = document.getElementById(opener.getAttribute('data-open-drawer'));
      TB.openDrawer(target, opener);
    }
    var closer = e.target.closest('[data-close-drawer]');
    if (closer) {
      var drawer = closer.closest('.drawer');
      if (drawer) TB.closeDrawer(drawer);
    }
    if (e.target.matches('.drawer-overlay')) {
      document.querySelectorAll('.drawer.is-open').forEach(function (d) { TB.closeDrawer(d); });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.drawer.is-open').forEach(function (d) { TB.closeDrawer(d); });
      document.querySelectorAll('.mega-menu.is-open').forEach(function (m) { m.classList.remove('is-open'); });
    }
  });

  /* ---------- Accordion ---------- */
  class TbAccordionItem extends HTMLElement {
    connectedCallback() {
      var trigger = this.querySelector('.accordion__trigger');
      var panel = this.querySelector('.accordion__panel');
      if (!trigger || !panel) return;
      trigger.addEventListener('click', function () {
        var expanded = trigger.getAttribute('aria-expanded') === 'true';
        var group = trigger.closest('.accordion');
        if (group && group.hasAttribute('data-single-open') && !expanded) {
          group.querySelectorAll('.accordion__trigger[aria-expanded="true"]').forEach(function (t) {
            if (t !== trigger) {
              t.setAttribute('aria-expanded', 'false');
              t.nextElementSibling.style.maxHeight = null;
            }
          });
        }
        trigger.setAttribute('aria-expanded', String(!expanded));
        panel.style.maxHeight = !expanded ? panel.scrollHeight + 'px' : null;
      });
    }
  }
  if (!customElements.get('tb-accordion-item')) customElements.define('tb-accordion-item', TbAccordionItem);

  /* ---------- Mega menu ---------- */
  document.querySelectorAll('.site-header__nav-item').forEach(function (item) {
    var menu = item.querySelector('.mega-menu');
    if (!menu) return;
    var trigger = item.querySelector('.site-header__nav-link');
    var closeTimer;
    function open() { clearTimeout(closeTimer); menu.classList.add('is-open'); trigger.setAttribute('aria-expanded', 'true'); }
    function close() { closeTimer = setTimeout(function () { menu.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); }, 120); }
    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
    trigger.addEventListener('focus', open);
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) close();
    });
    trigger.addEventListener('click', function (e) {
      if (menu) { e.preventDefault(); menu.classList.toggle('is-open'); }
    });
  });

  /* ---------- Mobile nav submenu toggles ---------- */
  document.querySelectorAll('[data-mobile-submenu-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sublist = btn.parentElement.querySelector('.mobile-nav__sublist');
      var open = sublist.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Header shrink on scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      lastY = window.scrollY;
    }, { passive: true });
  }

  /* ---------- Carousels ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('.carousel__track');
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    if (!track) return;
    function amount() { return track.clientWidth * 0.85; }
    function update() {
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -amount(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: amount(), behavior: 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    update();
  });

  /* ---------- Quantity selector ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-quantity-change]');
    if (!btn) return;
    var wrapper = btn.closest('.quantity-selector');
    var input = wrapper.querySelector('input[type="number"]');
    var step = parseInt(input.step || '1', 10);
    var min = parseInt(input.min || '1', 10);
    var value = parseInt(input.value || '1', 10);
    value = btn.getAttribute('data-quantity-change') === 'increase' ? value + step : Math.max(min, value - step);
    input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* ---------- Announcement bar rotation ---------- */
  document.querySelectorAll('[data-announcement-bar]').forEach(function (bar) {
    var track = bar.querySelector('.announcement-bar__track');
    var slides = bar.querySelectorAll('.announcement-bar__slide');
    if (slides.length <= 1) return;
    var i = 0;
    setInterval(function () {
      i = (i + 1) % slides.length;
      track.style.transform = 'translateX(-' + (i * 100) + '%)';
    }, 4500);
  });

  /* ---------- Copy link / share ---------- */
  document.addEventListener('click', function (e) {
    var shareBtn = e.target.closest('[data-copy-link]');
    if (!shareBtn) return;
    navigator.clipboard && navigator.clipboard.writeText(window.location.href);
    var label = shareBtn.querySelector('[data-copy-label]');
    if (label) {
      var original = label.textContent;
      label.textContent = 'Link copied';
      setTimeout(function () { label.textContent = original; }, 2000);
    }
  });
})();
