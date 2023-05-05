let browserTabs = [];

browser.tabs
    .query({})
    .then(tabs => { browserTabs = tabs; })
    .catch(() => { console.log(`[Volume Control Extension] An error occurred while querying tabs.\n${reason}`); });

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('[Volume Control Extension] browser.tabs.onUpdated invoked');
    let idx = browserTabs.findIndex(tab => tab.id === tabId);
    if (idx !== -1) {
        browserTabs[idx] = tab;
        console.log('[Volume Control Extension] Tab updated');
        return;
    }
    browserTabs.push(tab);
    console.log('[Volume Control Extension] Tab added');
});

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
    console.log('[Volume Control Extension] browser.tabs.onRemoved invoked');
    browserTabs = browserTabs.filter(tab => tab.id != tabId);
});

function getTabs() {
    console.log('GET');
    return browserTabs;
}

async function resolveTabsAsync() {
    try {
        console.log('RESOLVED');
        browserTabs = await browser.tabs.query({});
        console.log('DONE');
    } catch {
        console.log(`[Volume Control Extension] An error occurred while querying tabs.\n${reason}`);
    }
}