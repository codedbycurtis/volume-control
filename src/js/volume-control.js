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

browser.tabs.query({ audible: true }).then(tabs => {
    if (tabs.length == 0) {
        document.getElementById('no-audio').style.display = 'block';
        return;
    }
    
    audibleTabs = tabs;
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
            await browser.scripting.executeScript(scriptInjection);
        });
    
        container.append(slider, label);
        tabsElement.appendChild(container);
    });
}).catch(reason => {
    console.log(`[Volume Control] An error occurred: ${reason}`);
});

/**
 * Sets the volume of all audio and video elements in the document relative to their initial values.
 * This means that for sites like YouTube, the user's preferences are preserved between changes.
 * @param {Number} volume A value between 1 and 100 representing the new relative volume level.
 */
function setVolume(volume) {
    let audioLimits = JSON.parse(sessionStorage.getItem('volume-control-extension__audioLimits')) ?? {};
    let videoLimits = JSON.parse(sessionStorage.getItem('volume-control-extension__videoLimits')) ?? {};
    let audioCache = JSON.parse(sessionStorage.getItem('volume-control-extension__audioCache')) ?? {};
    let videoCache = JSON.parse(sessionStorage.getItem('volume-control-extension__videoCache')) ?? {};
    
    const audioElements = document.getElementsByTagName('audio');
    const videoElements = document.getElementsByTagName('video');

    for (let i = 0; i < audioElements.length; i++) {
        // If the element is new, or the cached (previous) volume differs from the current volume,
        // i.e. it has been changed outside of the extension...
        if (!(i in audioLimits) || audioCache[i] != audioElements[i].volume) {
            // ...set the new limit
            audioLimits[i] = audioElements[i].volume;
        }
        let current = audioLimits[i] * volume / 100;
        audioElements[i].volume = current;
        audioCache[i] = current;
    }

    for (let i = 0; i < videoElements.length; i++) {
        if (!(i in videoLimits) || videoCache[i] != videoElements[i].volume) {
            videoLimits[i] = videoElements[i].volume;
        }
        let current = videoLimits[i] * volume / 100;
        videoElements[i].volume = current;
        videoCache[i] = current;
    }

    sessionStorage.setItem('volume-control-extension__audioLimits', JSON.stringify(audioLimits));
    sessionStorage.setItem('volume-control-extension__videoLimits', JSON.stringify(videoLimits));
    sessionStorage.setItem('volume-control-extension__audioCache', JSON.stringify(audioCache));
    sessionStorage.setItem('volume-control-extension__videoCache', JSON.stringify(videoCache));
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