
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

    boxes.forEach(function (box) {
      var video = box.querySelector('video');
      var overlay = box.querySelector('.player-overlay');
      var button = box.querySelector('.play-button');
      var source = video ? video.getAttribute('data-stream') : '';
      var hls = null;

      function attach() {
        if (!video || !source || video.getAttribute('src')) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.setAttribute('src', source);
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          return;
        }

        video.setAttribute('src', source);
      }

      function play() {
        attach();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }

      if (overlay) {
        overlay.addEventListener('click', function () {
          play();
        });
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
