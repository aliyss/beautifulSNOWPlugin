let tabData = {
    g_form_data: {}
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "g_form_data") {
        if (request.handle === "getData") {
            sendResponse(tabData.g_form_data[request.data.id])
        }
    }
})

chrome.runtime.onMessageExternal.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "g_form_data") {
            if (request.handle === "setData") {
                tabData.g_form_data[sender.tab.id] = request.data
            }
        } else if (request.type === "bSNOW_activity_watch") {
            if (request.handle === "start") {
                l_arr[request.content.id] = {
                    base_link: request.base_link,
                    start: new Date().toJSON().split(".")[0],
                    end: null,
                    values: []
                }
                console.log(l_arr)
            } else if (request.handle === "end") {
                l_arr[request.content.id].end = new Date().toJSON().split(".")[0];
                console.log(l_arr[request.content.id])
                l_arr[request.content.id].values = (g_xmlGetter(l_arr[request.content.id].base_link + `events?start=${l_arr[request.content.id].start}&end=${l_arr[request.content.id].end}`)).json()
                console.log(l_arr)
            } else if (request.handle === "get") {
                console.log(l_arr[request.content.id].values)
            }
        }
    });
