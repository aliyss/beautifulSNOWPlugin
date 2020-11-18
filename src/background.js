
let l_arr = {}

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

chrome.runtime.onMessageExternal.addListener(
    async function(request, sender, sendResponse) {
        if (request.type === "bSNOW_activity_watch") {
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
                l_arr[request.content.id].values = await (await g_xmlGetter(l_arr[request.content.id].base_link + `events?start=${l_arr[request.content.id].start}&end=${l_arr[request.content.id].end}`)).json()
                console.log(l_arr)
            } else if (request.handle === "get") {
                console.log(l_arr[request.content.id].values)
            }
        }
    });
