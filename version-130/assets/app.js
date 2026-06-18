(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = qs('[data-menu-toggle]');
        var links = qs('[data-nav-links]');
        var search = qs('.nav-search');
        if (!button || !links) {
            return;
        }
        button.addEventListener('click', function () {
            links.classList.toggle('is-open');
            if (search) {
                search.classList.toggle('is-open');
            }
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    function initLocalFilter() {
        var input = qs('[data-local-filter]');
        var cards = qsa('[data-filter-card], .all-link');
        var typeSelect = qs('[data-filter-select="type"]');
        var yearSelect = qs('[data-filter-select="year"]');
        var count = qs('[data-result-count]');
        if (!input && !typeSelect && !yearSelect) {
            return;
        }
        function filter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.textContent + ' ' + (card.dataset.title || '') + ' ' + (card.dataset.region || '') + ' ' + (card.dataset.type || '') + ' ' + (card.dataset.genre || '') + ' ' + (card.dataset.tags || '')).toLowerCase();
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchType = !type || (card.dataset.type || '').indexOf(type) !== -1 || haystack.indexOf(type.toLowerCase()) !== -1;
                var matchYear = !year || (card.dataset.year || '').indexOf(year) !== -1 || haystack.indexOf(year.toLowerCase()) !== -1;
                var ok = matchQuery && matchType && matchYear;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + ' 部影片';
            }
        }
        [input, typeSelect, yearSelect].forEach(function (el) {
            if (el) {
                el.addEventListener('input', filter);
                el.addEventListener('change', filter);
            }
        });
        filter();
    }

    function movieCard(item) {
        var tags = (item.tags || []).slice(0, 4).map(function (tag) {
            return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="movie-cover" href="./' + item.file + '" aria-label="' + escapeHtml(item.title) + '">' +
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="cover-shade"></span>' +
            '<span class="year-badge">' + escapeHtml(item.year || '热播') + '</span>' +
            '<span class="play-badge" aria-hidden="true">▶</span>' +
            '</a>' +
            '<div class="movie-info">' +
            '<h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
            '<p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>' +
            '<p class="movie-desc">' + escapeHtml(item.oneLine || '') + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[char];
        });
    }

    function initSearchPage() {
        var results = qs('[data-search-results]');
        if (!results) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = qs('[data-search-input]');
        var typeSelect = qs('[data-search-type]');
        var yearSelect = qs('[data-search-year]');
        var regionSelect = qs('[data-search-region]');
        var count = qs('[data-search-count]');
        if (input) {
            input.value = params.get('q') || '';
        }
        fetch('./assets/search-data.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (items) {
                var years = Array.from(new Set(items.map(function (item) { return item.year; }).filter(Boolean))).sort().reverse();
                var regions = Array.from(new Set(items.map(function (item) { return item.region; }).filter(Boolean))).sort();
                years.slice(0, 30).forEach(function (year) {
                    yearSelect.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(year) + '">' + escapeHtml(year) + '</option>');
                });
                regions.slice(0, 80).forEach(function (region) {
                    regionSelect.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(region) + '">' + escapeHtml(region) + '</option>');
                });
                function render() {
                    var query = (input.value || '').trim().toLowerCase();
                    var type = typeSelect.value;
                    var year = yearSelect.value;
                    var region = regionSelect.value;
                    var filtered = items.filter(function (item) {
                        var haystack = [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(','), item.oneLine].join(' ').toLowerCase();
                        return (!query || haystack.indexOf(query) !== -1) &&
                            (!type || item.type.indexOf(type) !== -1) &&
                            (!year || item.year === year) &&
                            (!region || item.region === region);
                    }).slice(0, 120);
                    results.innerHTML = filtered.map(movieCard).join('');
                    count.textContent = filtered.length + ' 条结果';
                }
                [input, typeSelect, yearSelect, regionSelect].forEach(function (el) {
                    el.addEventListener('input', render);
                    el.addEventListener('change', render);
                });
                render();
            });
    }

    function initPlayer() {
        var player = qs('[data-player]');
        if (!player) {
            return;
        }
        var video = qs('video', player);
        var button = qs('[data-play]', player);
        var source = player.getAttribute('data-source');
        var hls = null;
        var ready = false;
        function load() {
            if (ready || !video || !source) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            load();
            player.classList.add('is-playing');
            video.controls = true;
            var attempt = video.play();
            if (attempt && attempt.catch) {
                attempt.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener('click', play);
        }
        player.addEventListener('click', function (event) {
            if (event.target === player || event.target.closest('[data-play]')) {
                play();
            }
        });
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayer();
})();
