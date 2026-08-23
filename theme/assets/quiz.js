/* Table Buddy theme — product finder quiz */
(function () {
  'use strict';

  class TbQuiz extends HTMLElement {
    connectedCallback() {
      this.steps = Array.prototype.slice.call(this.querySelectorAll('.quiz__step'));
      this.progressEl = this.querySelector('.quiz__progress');
      this.startBtn = this.querySelector('[data-quiz-start]');
      this.retakeBtn = this.querySelector('[data-quiz-retake]');
      this.resultEls = {
        regular: this.querySelector('[data-result="regular"]'),
        smart: this.querySelector('[data-result="smart"]'),
        executive: this.querySelector('[data-result="executive"]')
      };
      this.answers = { use_case: null, cup_holder: null, footrest: null };
      this.current = 0;

      if (this.startBtn) this.startBtn.addEventListener('click', function () { this.goTo(1); }.bind(this));
      if (this.retakeBtn) this.retakeBtn.addEventListener('click', function () { this.reset(); }.bind(this));

      this.querySelectorAll('[data-quiz-option]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var key = btn.getAttribute('data-key');
          var value = btn.getAttribute('data-value');
          this.answers[key] = value;
          var group = btn.closest('.quiz__options');
          group.querySelectorAll('.quiz__option').forEach(function (o) { o.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          setTimeout(function () {
            if (this.current < this.steps.length - 2) this.goTo(this.current + 1);
            else this.showResult();
          }.bind(this), 220);
        }.bind(this));
      }.bind(this));

      this.querySelectorAll('[data-quiz-back]').forEach(function (btn) {
        btn.addEventListener('click', function () { this.goTo(Math.max(0, this.current - 1)); }.bind(this));
      }.bind(this));
    }

    goTo(index) {
      this.current = index;
      this.steps.forEach(function (step, i) { step.classList.toggle('is-active', i === index); });
      if (this.progressEl) {
        var spans = this.progressEl.querySelectorAll('span');
        spans.forEach(function (span, i) {
          span.classList.toggle('is-complete', i < index - 1);
          span.classList.toggle('is-active', i === index - 1);
        });
      }
    }

    showResult() {
      var match = 'regular';
      if (this.answers.footrest === 'yes') match = 'executive';
      else if (this.answers.cup_holder === 'yes') match = 'smart';
      Object.keys(this.resultEls).forEach(function (key) {
        if (this.resultEls[key]) this.resultEls[key].hidden = key !== match;
      }.bind(this));
      this.goTo(this.steps.length - 1);
    }

    reset() {
      this.answers = { use_case: null, cup_holder: null, footrest: null };
      this.querySelectorAll('.quiz__option').forEach(function (o) { o.classList.remove('is-selected'); });
      this.goTo(0);
    }
  }
  if (!customElements.get('tb-quiz')) customElements.define('tb-quiz', TbQuiz);
})();
