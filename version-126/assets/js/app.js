(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilter();
    initPlayer();
  });

  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", play);
    play();
  }

  function initFilter() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    var items = Array.prototype.slice.call(list.children);

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input.value);
      var year = select ? normalize(select.value) : "";
      items.forEach(function (item) {
        var text = normalize(item.textContent + " " + item.getAttribute("data-title") + " " + item.getAttribute("data-region") + " " + item.getAttribute("data-genre") + " " + item.getAttribute("data-year"));
        var yearText = normalize(item.getAttribute("data-year"));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || yearText === year;
        item.classList.toggle("is-filtered-out", !(matchKeyword && matchYear));
      });
    }

    input.addEventListener("input", apply);
    if (select) {
      select.addEventListener("change", apply);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      input.value = q;
      apply();
      input.focus();
    }
  }

  function initPlayer() {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playButton");
    if (!video || !button) {
      return;
    }
    var hlsUrl = video.getAttribute("data-hls");
    var hlsInstance = null;
    var loaded = false;

    function loadScript(callback) {
      if (window.Hls) {
        callback();
        return;
      }
      var existing = document.querySelector("script[data-hls-loader]");
      if (existing) {
        existing.addEventListener("load", callback, { once: true });
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
      script.async = true;
      script.setAttribute("data-hls-loader", "true");
      script.addEventListener("load", callback, { once: true });
      document.head.appendChild(script);
    }

    function playVideo() {
      button.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    function start() {
      if (!hlsUrl) {
        return;
      }
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        return;
      }
      loadScript(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(hlsUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              try {
                hlsInstance.destroy();
              } catch (error) {}
              loaded = false;
              button.classList.remove("is-hidden");
            }
          });
        } else {
          video.src = hlsUrl;
          video.load();
          playVideo();
        }
      });
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });
  }
})();
