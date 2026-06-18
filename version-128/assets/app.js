(function() {
    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function yearMatches(value, rule) {
        if (!rule) {
            return true;
        }
        var year = parseInt(value, 10);
        if (rule === '2010s') {
            return year >= 2010 && year <= 2019;
        }
        if (rule === 'older') {
            return year > 0 && year < 2010;
        }
        return String(value) === rule;
    }

    function typeMatches(value, rule) {
        if (!rule) {
            return true;
        }
        return normalize(value).indexOf(normalize(rule)) !== -1;
    }

    function applyFilters(root) {
        var input = root.querySelector('[data-search-input]');
        if (!input) {
            return;
        }
        var scopeSelector = input.getAttribute('data-search-scope') || '.movie-grid';
        var scope = document.querySelector(scopeSelector) || root;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var yearSelect = root.querySelector('[data-filter-year]');
        var typeSelect = root.querySelector('[data-filter-type]');
        var empty = root.querySelector('[data-empty-state]');
        var query = normalize(input.value);
        var yearRule = yearSelect ? yearSelect.value : '';
        var typeRule = typeSelect ? typeSelect.value : '';
        var visible = 0;
        cards.forEach(function(card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
            var ok = (!query || haystack.indexOf(query) !== -1) &&
                yearMatches(card.getAttribute('data-year'), yearRule) &&
                typeMatches(card.getAttribute('data-type'), typeRule);
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('visible', visible === 0);
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        var navToggle = document.querySelector('[data-nav-toggle]');
        var navLinks = document.querySelector('[data-nav-links]');
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', function() {
                navLinks.classList.toggle('open');
            });
        }

        var filterRoots = Array.prototype.slice.call(document.querySelectorAll('main, body'));
        filterRoots.forEach(function(root) {
            var controls = root.querySelectorAll('[data-search-input], [data-filter-year], [data-filter-type]');
            controls.forEach(function(control) {
                control.addEventListener('input', function() {
                    applyFilters(root);
                });
                control.addEventListener('change', function() {
                    applyFilters(root);
                });
            });
        });
    });
})();
