/* Table Buddy theme — country/province select for address forms */
(function () {
  'use strict';

  function setup(countrySelect) {
    var container = countrySelect.closest('.field').parentElement.querySelector('[data-address-province-container]');
    var provinceSelect = container ? container.querySelector('[data-address-province-select]') : null;
    if (!provinceSelect) return;

    function update() {
      var option = countrySelect.options[countrySelect.selectedIndex];
      var provinces = [];
      try { provinces = JSON.parse(option.getAttribute('data-provinces') || '[]'); } catch (e) { provinces = []; }
      provinceSelect.innerHTML = '';
      if (provinces.length) {
        provinces.forEach(function (pair) {
          var opt = document.createElement('option');
          opt.value = pair[0];
          opt.textContent = pair[1];
          if (pair[0] === provinceSelect.getAttribute('data-default')) opt.selected = true;
          provinceSelect.appendChild(opt);
        });
        container.hidden = false;
      } else {
        container.hidden = true;
      }
    }

    countrySelect.addEventListener('change', update);
    update();
  }

  document.querySelectorAll('[data-address-country-select]').forEach(function (select) {
    var defaultCountry = select.getAttribute('data-default');
    if (defaultCountry) {
      Array.prototype.forEach.call(select.options, function (opt) {
        if (opt.textContent === defaultCountry || opt.value === defaultCountry) opt.selected = true;
      });
    }
    setup(select);
  });
})();
