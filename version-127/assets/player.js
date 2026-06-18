(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movieVideo");
        var button = document.getElementById("playButton");
        var hlsInstance = null;
        var started = false;

        if (!video || !button || !streamUrl) {
            return;
        }

        function startPlayback() {
            if (started) {
                video.play();
                return;
            }
            started = true;
            button.classList.add("is-hidden");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.play();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = streamUrl;
                        video.play();
                    }
                });
                return;
            }

            video.src = streamUrl;
            video.play();
        }

        button.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (!started) {
                startPlayback();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
    };
})();
