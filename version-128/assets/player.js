(function() {
    function bindMoviePlayer(videoId, triggerId, source) {
        var video = document.getElementById(videoId);
        var trigger = document.getElementById(triggerId);
        if (!video || !trigger || !source) {
            return;
        }
        var hlsInstance = null;
        var ready = false;

        function load() {
            if (ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            ready = true;
        }

        function start() {
            load();
            trigger.classList.add('player-cover-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function() {
                    trigger.classList.remove('player-cover-hidden');
                });
            }
        }

        trigger.addEventListener('click', start);
        video.addEventListener('click', function() {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function() {
            trigger.classList.add('player-cover-hidden');
        });
        window.addEventListener('beforeunload', function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.bindMoviePlayer = bindMoviePlayer;
})();
