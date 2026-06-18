(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var tabs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-tab]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      tabs.forEach(function (tab, tabIndex) {
        tab.classList.toggle('active', tabIndex === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(tab.getAttribute('data-hero-tab')) || 0);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var toolbar = document.querySelector('[data-filter-toolbar]');

  if (toolbar) {
    var input = toolbar.querySelector('[data-card-filter]');
    var region = toolbar.querySelector('[data-filter-region]');
    var year = toolbar.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (input && q) {
      input.value = q;
    }

    function normalize(text) {
      return String(text || '').toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : '');
      var regionValue = normalize(region ? region.value : '');
      var yearValue = normalize(year ? year.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var data = normalize(card.getAttribute('data-keywords') || '') + ' ' + normalize(card.getAttribute('data-title') || '');
        var cardRegion = normalize(card.getAttribute('data-region') || '');
        var cardYear = normalize(card.getAttribute('data-year') || '');
        var matchKeyword = !keyword || data.indexOf(keyword) !== -1;
        var matchRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1 || data.indexOf(regionValue) !== -1;
        var matchYear = !yearValue || cardYear.indexOf(yearValue) !== -1;
        var matched = matchKeyword && matchRegion && matchYear;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();

function initVideoPlayer(streamUrl, videoId, coverId) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var started = false;
  var hlsPlayer = null;

  if (!video || !cover || !streamUrl) {
    return;
  }

  function start() {
    if (started) {
      video.play();
      return;
    }

    started = true;
    cover.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', function () {
        video.play();
      }, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsPlayer = new window.Hls({
        maxBufferLength: 60,
        enableWorker: true
      });
      hlsPlayer.loadSource(streamUrl);
      hlsPlayer.attachMedia(video);
      hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
      return;
    }

    video.src = streamUrl;
    video.play();
  }

  cover.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!started) {
      start();
    }
  });
  video.addEventListener('error', function () {
    if (hlsPlayer) {
      hlsPlayer.destroy();
      hlsPlayer = null;
    }
  });
}
