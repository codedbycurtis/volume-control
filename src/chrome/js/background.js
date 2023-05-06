class TabData {
    constructor(tab, isControllerInjected, volume) {
        this.tab = tab;
        this.isControllerInjected = isControllerInjected;
        this.volume = volume;
    }
}

let browserTabs = [];

chrome.tabs
    .query({})
    .then(tabs => {
        tabs.forEach(tab => {
            browserTabs.push(new TabData(tab, false, 100));
        });
    })
    .catch(reason => { console.error(`[Volume Control Extension] An error occurred while querying tabs.\n${reason}`); });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('[Volume Control Extension] chrome.tabs.onUpdated invoked');
    let idx = browserTabs.findIndex(tabData => tabData.tab.id === tabId);
    if (idx !== -1) {
        browserTabs[idx].tab = tab;
        console.log('[Volume Control Extension] Tab updated');
        return;
    }
    if (tab.url.startsWith('chrome://'))
        return;
    browserTabs.push(new TabData(tab, false, 100));
    console.log('[Volume Control Extension] Tab added');
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    console.log('[Volume Control Extension] chrome.tabs.onRemoved invoked');
    browserTabs = browserTabs.filter(tabData => tabData.tab.id != tabId);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getTabData') {
        sendResponse({ data: browserTabs });
    }
});