function g_xmlGetter(path) {
    return new Promise((resolve, reject) => {
        fetch(path, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then(r => resolve(r))
    })
}

const tabData = {
    gForm_data: {}
}

const tabHandlers = {
    async gForm_data_handler(request, sender) {
        switch (request.handle) {
            case "set":
                tabData.gForm_data[sender.tab.id] = request.data
                break;
            case "get":
                return tabData.gForm_data[request.data.id];
        }
    }
}

const pluginData = {
    activityWatch_data: {}
}

const pluginHandlers = {
    async activityWatch_data_handler(request, sender) {
        let now_date = new Date()
        switch (request.handle) {
            case "start":
                pluginData.activityWatch_data[request.content.id] = {
                    base_link: request.base_link,
                    start: new Date(now_date).toJSON().split(".")[0],
                    end: null,
                    values: []
                }
                break;
            case "end":
                pluginData.activityWatch_data[request.content.id].end = new Date(now_date).toJSON().split(".")[0];
                let path = `${pluginData.activityWatch_data[request.content.id].base_link}events?start=${pluginData.activityWatch_data[request.content.id].start}&end=${pluginData.activityWatch_data[request.content.id].end}`
                pluginData.activityWatch_data[request.content.id].values = await (await g_xmlGetter(path)).json()
                break;
            case "get":
                return pluginData.activityWatch_data[request.content.id];
            case "delete":
                delete pluginData.activityWatch_data[request.content.id]
                break;
        }
    }
}

async function requestHandler(request, sender, sendResponse) {
    let returnValue;

    switch (request.type) {
        case "g_form_data":
            returnValue = await tabHandlers.gForm_data_handler(request, sender)
            break;
        case "bSNOW_activity_watch":
            returnValue = await pluginHandlers.activityWatch_data_handler(request, sender)
            break;
    }

    if (returnValue) {
        sendResponse(returnValue)
    }
}

chrome.runtime.onMessage.addListener(requestHandler)

chrome.runtime.onMessageExternal.addListener(requestHandler);

