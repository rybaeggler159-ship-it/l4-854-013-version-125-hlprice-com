(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bindNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function bindHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;
    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalized(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function bindSearch() {
    selectAll('[data-search-input]').forEach(function (input) {
      var targetSelector = input.getAttribute('data-search-target');
      var target = targetSelector ? document.querySelector(targetSelector) : document;
      if (!target) {
        return;
      }
      var cards = selectAll('[data-card]', target);
      var form = input.closest('form');
      function run() {
        var q = normalized(input.value);
        cards.forEach(function (card) {
          var text = normalized(card.getAttribute('data-search') || card.textContent);
          card.classList.toggle('is-hidden-card', q && text.indexOf(q) === -1);
        });
      }
      input.addEventListener('input', run);
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          run();
          if (target.scrollIntoView) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    });
  }

  function bindFilters() {
    selectAll('[data-filter-group]').forEach(function (group) {
      var target = document.querySelector(group.getAttribute('data-filter-group'));
      var key = group.getAttribute('data-filter-key');
      if (!target || !key) {
        return;
      }
      var cards = selectAll('[data-card]', target);
      selectAll('[data-filter-value]', group).forEach(function (button) {
        button.addEventListener('click', function () {
          var value = button.getAttribute('data-filter-value');
          selectAll('[data-filter-value]', group).forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          cards.forEach(function (card) {
            var current = card.getAttribute('data-' + key) || '';
            card.classList.toggle('is-filtered', value && current !== value);
          });
        });
      });
    });
  }

  window.setupMoviePlayer = function (videoId, overlayId, src) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !src) {
      return;
    }
    var ready = false;
    var hls = null;
    function attach() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      ready = true;
    }
    function play() {
      attach();
      overlay.classList.add('is-hidden');
      video.controls = true;
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }
    overlay.addEventListener('click', play);
    selectAll('[data-player-start]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindNav();
    bindHero();
    bindSearch();
    bindFilters();
  });
})();
