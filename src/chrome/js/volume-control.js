const tabsElement = document.getElementById('tabs');
const themeToggle = document.getElementById('theme-toggle');

let audibleTabs = [];
let isDarkMode = localStorage.getItem('dark-mode-enabled') ?? 'false';

loadTheme();

themeToggle.addEventListener('click', () => {
    isDarkMode = isDarkMode === 'true' ? 'false' : 'true';
    localStorage.setItem('dark-mode-enabled', isDarkMode);
    loadTheme();
});

chrome.tabs.query({ audible: true }, tabs => {
    if (tabs.length == 0) {
        document.getElementById('no-audio').style.display = 'block';
        return;
    }

    audibleTabs = tabs;
    console.log(`${logPrefix} Tabs loaded`);
    audibleTabs.forEach(tab => {
        let container = document.createElement('div');

        let label = document.createElement('label');
        label.for = tab.id;
        label.textContent = tab.title;

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
            await chrome.scripting.executeScript(scriptInjection);
        });

        container.append(slider, label);
        tabsElement.appendChild(container);
    })
});

function setVolume(volume) {
    const audioElements = document.getElementsByTagName('audio');
    const videoElements = document.getElementsByTagName('video');

    for (const audio of audioElements) {
        audio.volume = volume / 100;
    }

    for (const video of videoElements) {
        video.volume = volume / 100;
    }
}

function loadTheme() {
    const root = document.documentElement.style;
    if (isDarkMode === 'true') {
        themeToggle.src = '../images/dark-mode.svg';
        themeToggle.alt = 'Toggle Light Mode';
        themeToggle.title = 'Toggle Light Mode';
        root.setProperty('--bg-color-primary', '#212121');
        root.setProperty('--bg-color-secondary', '#121212');
        root.setProperty('--text-color', '#ededed');
        return;
    }
    themeToggle.src = '../images/light-mode.svg';
    themeToggle.alt = 'Toggle Dark Mode';
    themeToggle.title = 'Toggle Dark Mode';
    root.setProperty('--bg-color-primary', null);
    root.setProperty('--bg-color-secondary', null);
    root.setProperty('--text-color', null);
}