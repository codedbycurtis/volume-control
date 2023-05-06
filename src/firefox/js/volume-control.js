const tabsElement = document.getElementById('tabs');
const themeToggle = document.getElementById('theme-toggle');

let isDarkMode = bool(localStorage.getItem('dark-mode-enabled')) ?? false;

loadTheme();

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('dark-mode-enabled', isDarkMode);
    loadTheme();
});

let browserTabs = [];

browser.runtime
    .getBackgroundPage()
    .then(page => {
        browserTabs = page.getTabs();

        if (browserTabs.length == 0) {
            document.getElementById('no-audio').style.display = 'block';
        }
        
        browserTabs.forEach(tabData => {
            let container = document.createElement('div');
            container.classList.add('tabContainer');

            let icon = document.createElement('img');
            icon.classList.add('tabIcon');
            icon.src = tabData.tab.favIconUrl;

            let label = document.createElement('label');
            label.for = tabData.tab.id;
            label.textContent = tabData.tab.title;

            let labelContainer = document.createElement('div');
            labelContainer.classList.add('labelContainer');
            labelContainer.append(icon, label);
            
            let slider = document.createElement('input');
            slider.id = tabData.tab.id;
            slider.type = 'range';
            slider.min = 0;
            slider.max = 100;
            slider.value = tabData.volume;
            
            slider.addEventListener('input', async () => {
                tabData.volume = slider.value;

                if (tabData.isControllerInjected) {
                    await browser.tabs.sendMessage(tabData.tab.id, {
                        type: 'setVolume',
                        value: slider.value
                    });
                    return;
                }

                let injectionTarget = {
                    tabId: tabData.tab.id
                };
                let scriptInjection = {
                    files: ['js/browser-polyfill.min.js', 'js/volume-controller.js'],
                    injectImmediately: true,
                    target: injectionTarget,
                };
                try {
                    await browser.scripting.executeScript(scriptInjection);
                    tabData.isControllerInjected = true;
                    console.log('[Volume Control Extension] Script injection successful');
                } catch (err) {
                    console.error(`[Volume Control Extension] An error occurred while injecting 'volume-controller.js'.\n${err}`);
                }
            });
            
            container.append(slider, labelContainer);
            tabsElement.appendChild(container);
        });
    });

function loadTheme() {
    const root = document.documentElement.style;
    if (isDarkMode) {
        themeToggle.src = '../images/dark-mode.svg';
        themeToggle.alt = 'Toggle Light Mode';
        themeToggle.title = 'Toggle Light Mode';
        root.setProperty('--bg-color-primary', '#212121');
        root.setProperty('--bg-color-secondary', '#121212');
        root.setProperty('--bg-color-tertiary', '#2c2c2c');
        root.setProperty('--text-color', '#ededed');
        return;
    }
    themeToggle.src = '../images/light-mode.svg';
    themeToggle.alt = 'Toggle Dark Mode';
    themeToggle.title = 'Toggle Dark Mode';
    root.setProperty('--bg-color-primary', null);
    root.setProperty('--bg-color-secondary', null);
    root.setProperty('--bg-color-tertiary', null);
    root.setProperty('--text-color', null);
}

function bool(str) {
    return str?.toLowerCase() === 'true';
}