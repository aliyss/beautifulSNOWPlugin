window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

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
            case "endFromTo":
                if (pluginData.activityWatch_data[request.content.id]) {
                    break;
                }
                let fromTo = request.content.id.split('|')
                let fromToDate = fromTo[0]
                let fromToStart = fromTo[1]
                let fromToEnd = fromTo[2]

                let reggie = /(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/;

                let dateStringStart = `${fromToDate.replaceAll('.', '-').replaceAll('/', '-')} ${fromToStart}`;
                let dateArrayStart = reggie.exec(dateStringStart);
                let dateObjectStart = new Date(
                    (+dateArrayStart[3]),
                    (+dateArrayStart[2])-1, // Careful, month starts at 0!
                    (+dateArrayStart[1]),
                    (+dateArrayStart[4]),
                    (+dateArrayStart[5]),
                    (+dateArrayStart[6])
                );

                let dateStringEnd = `${fromToDate.replaceAll('.', '-').replaceAll('/', '-')} ${fromToEnd}`;
                let dateArrayEnd = reggie.exec(dateStringEnd);
                let dateObjectEnd = new Date(
                    (+dateArrayEnd[3]),
                    (+dateArrayEnd[2])-1, // Careful, month starts at 0!
                    (+dateArrayEnd[1]),
                    (+dateArrayEnd[4]),
                    (+dateArrayEnd[5]),
                    (+dateArrayEnd[6])
                );

                let parsedFromToStart = dateObjectStart.toJSON().split(".")[0];
                let parsedFromToEnd = dateObjectEnd.toJSON().split(".")[0];

                pluginData.activityWatch_data[request.content.id] = {
                    base_link: request.base_link,
                    start: parsedFromToStart,
                    end: parsedFromToEnd,
                    values: []
                }

                let pathFromTo = `${pluginData.activityWatch_data[request.content.id].base_link}events?start=${pluginData.activityWatch_data[request.content.id].start}&end=${pluginData.activityWatch_data[request.content.id].end}`
                pluginData.activityWatch_data[request.content.id].values = await (await g_xmlGetter(pathFromTo)).json()
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

browser.runtime.onMessage.addListener(requestHandler)

browser.runtime.onMessageExternal.addListener(requestHandler);

