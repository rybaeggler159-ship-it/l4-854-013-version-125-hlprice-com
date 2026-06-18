(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".nav-menu");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                var open = menu.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var scopes = document.querySelectorAll("[data-filter-scope]");
        scopes.forEach(function (scope) {
            var section = scope.closest("section") || document;
            var input = section.querySelector("[data-filter-input]");
            var year = section.querySelector("[data-filter-year]");
            var type = section.querySelector("[data-filter-type]");
            var status = section.querySelector("[data-filter-status]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

            function applyFilter() {
                var query = normalize(input ? input.value : "");
                var selectedYear = normalize(year ? year.value : "");
                var selectedType = normalize(type ? type.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
                    var matchType = !selectedType || normalize(card.getAttribute("data-type")) === selectedType;
                    var matched = matchQuery && matchYear && matchType;
                    card.classList.toggle("is-hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (status) {
                    status.textContent = query || selectedYear || selectedType ? "正在显示匹配的影片内容" : "";
                    if (visible === 0) {
                        status.textContent = "未找到匹配内容";
                    }
                }
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
        });
    });
})();
