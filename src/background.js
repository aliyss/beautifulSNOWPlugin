

function getBrowserVariables(tid) {

    tabid = tid;
    popup = chrome.extension.getViews({
        type: "popup"
    })[0];

    chrome.tabs.sendMessage(tabid, {
        method: "getVars",
        myVars: "g_form"
    }, function (response) {
        if (response == null || typeof response !== 'object') return;
        console.log(response)
        popup.setBrowserVariables(response);
    });
}