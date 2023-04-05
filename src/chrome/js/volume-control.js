let audibleTabs = []; // All open tabs currently playing audio

const logPrefix = '[Volume Control]';
const tabListEl = document.getElementById('tab-list');

chrome.tabs.query({ audible: true }, tabs => {
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
        tabListEl.appendChild(container);
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