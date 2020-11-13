

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let g_background = chrome.extension.getBackgroundPage();
        g_background.getBrowserVariables(tabs[0].id);
    });
});

function setBrowserVariables(values) {
    console.log(values)
}