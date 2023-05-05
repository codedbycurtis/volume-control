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