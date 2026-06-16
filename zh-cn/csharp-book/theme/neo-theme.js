(function neoTheme() {
    const themeName = 'neo';
    const themeId = 'mdbook-theme-' + themeName;
    const html = document.documentElement;
    const themePopup = document.getElementById('mdbook-theme-list');
    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    const knownThemes = ['light', 'rust', 'coal', 'navy', 'ayu'];

    if (!themePopup) {
        return;
    }

    function addNeoButton() {
        if (document.getElementById(themeId)) {
            return;
        }

        const item = document.createElement('li');
        item.setAttribute('role', 'none');

        const button = document.createElement('button');
        button.setAttribute('role', 'menuitem');
        button.className = 'theme';
        button.id = themeId;
        button.textContent = 'Neo';

        item.appendChild(button);
        themePopup.appendChild(item);
    }

    function selectNeoButton() {
        themePopup.querySelectorAll('.theme-selected').forEach(function(element) {
            element.classList.remove('theme-selected');
        });

        const button = document.getElementById(themeId);
        if (button) {
            button.classList.add('theme-selected');
        }
    }

    function applyNeoTheme(store) {
        knownThemes.forEach(function(name) {
            html.classList.remove(name);
        });

        html.classList.add(themeName);
        selectNeoButton();

        if (store) {
            try {
                localStorage.setItem('mdbook-theme', themeName);
            } catch {
                // Ignore storage failures.
            }
        }

        if (themeColorMetaTag) {
            setTimeout(function() {
                themeColorMetaTag.content = getComputedStyle(html).backgroundColor;
            }, 1);
        }

        if (window.ace && window.editors) {
            window.editors.forEach(function(editor) {
                editor.setTheme('ace/theme/dawn');
            });
        }
    }

    function savedThemeIsNeo() {
        try {
            return localStorage.getItem('mdbook-theme') === themeName;
        } catch {
            return false;
        }
    }

    addNeoButton();

    if (savedThemeIsNeo()) {
        applyNeoTheme(false);
    }

    themePopup.addEventListener('click', function(event) {
        const button = event.target.closest('button.theme');
        if (!button) {
            return;
        }

        if (button.id !== themeId) {
            html.classList.remove(themeName);
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        applyNeoTheme(true);
    }, true);
})();
