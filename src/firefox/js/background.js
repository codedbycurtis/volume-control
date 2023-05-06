class TabData {
    constructor(tab, isControllerInjected, volume) {
        this.tab = tab;
        this.isControllerInjected = isControllerInjected;
        this.volume = volume;
    }
}

let browserTabs = [];

browser.tabs
    .query({})
    .then(tabs => {
        tabs.forEach(tab => {
            browserTabs.push(new TabData(tab, false, 100));
        });
    })
    .catch(reason => { console.error(`[Volume Control Extension] An error occurred while querying tabs.\n${reason}`); });

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('[Volume Control Extension] browser.tabs.onUpdated invoked');
    let idx = browserTabs.findIndex(tabData => tabData.tab.id === tabId);
    if (idx !== -1) {
        browserTabs[idx].tab = tab;
        console.log('[Volume Control Extension] Tab updated');
        return;
    }
    if (tab.url.startsWith('about:'))
        return;
    browserTabs.push(new TabData(tab, false, 100));
    console.log('[Volume Control Extension] Tab added');
});

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
    console.log('[Volume Control Extension] browser.tabs.onRemoved invoked');
    browserTabs = browserTabs.filter(tabData => tabData.tab.id != tabId);
});

function getTabs() {
    return browserTabs;
}