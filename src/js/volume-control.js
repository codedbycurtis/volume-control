const tabsElement = document.getElementById('tabs');
const themeToggle = document.getElementById('theme-toggle');

let isDarkMode = bool(localStorage.getItem('dark-mode-enabled')) ?? false;

loadTheme();

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('dark-mode-enabled', isDarkMode);
    loadTheme();
});

let audibleTabs = [];

browser.runtime
    .getBackgroundPage()
    .then(page => {
        audibleTabs = page.getTabs();

        if (audibleTabs.length == 0) {
            document.getElementById('no-audio').style.display = 'block';
        }
        
        audibleTabs.forEach(tab => {
            let container = document.createElement('div');
            container.classList.add('tabContainer');

            let icon = document.createElement('img');
            icon.classList.add('tabIcon');
            icon.src = tab.favIconUrl;

            let label = document.createElement('label');
            label.for = tab.id;
            label.textContent = tab.title;

            let labelContainer = document.createElement('div');
            labelContainer.append(icon, label);
            
            let slider = document.createElement('input');
            slider.id = tab.id;
            slider.type = 'range';
            slider.min = 0;
            slider.max = 100;
            slider.value = 100;
            
            slider.addEventListener('input', async () => {
                let injectionTarget = {
                    tabId: tab.id
                };
                let scriptInjection = {
                    args: [slider.value],
                    injectImmediately: true,
                    target: injectionTarget,
                    func: setVolume
                };
                await browser.scripting.executeScript(scriptInjection);
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