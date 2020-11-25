let default_g_ck;

function g_xmlGetter(path, g_ck) {
    if (g_ck) {
        default_g_ck = g_ck;
    } else  {
        g_ck = default_g_ck;
    }
    return new Promise((resolve, reject) => {
        fetch(path, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-UserToken': g_ck
            }
        }).then(r => resolve(r))
    })
}

async function retrieveContent(element) {
    let temp_id = element.srcElement.getAttribute("val_id")
    let website = element.srcElement.getAttribute("val")
    element.srcElement.parentNode.removeChild(element.srcElement)
    await insertJSON(website, null, temp_id)
}

async function insertJSON(website, g_ck, id="editor_holder") {
    let x = await g_xmlGetter(website, g_ck)
    if (x) {
        let result = await x.json();
        let schema = {}
        for (const xKey in result.result) {
            schema[xKey] = {
                type: typeof result.result[xKey],
                title: id.replace("editor_holder", "").replaceAll("root¦¦¦", "").replaceAll("¦¦¦link", ".") + xKey
            }
            if (typeof result.result[xKey] === "object") {
                schema[xKey].options = {
                    disable_collapse: true
                }
            }
        }
        let editor = new JSONEditor(document.getElementById(id), {
            schema: {
                type: "object",
                title: " ",
                options: {
                    disable_collapse: false,
                    inputAttributes: {
                        class: "hidden"
                    }
                },
                properties: {
                    ...schema
                }
            },
            prompt_before_delete: false,
            disable_edit_json: true,
            disable_properties: true,
            disable_array_reorder: true,
            disable_array_delete_last_row: true,
            disable_array_delete_all_rows: true,
            object_layout: 'table',
            compact: true,
            startval: {...result.result}
        });
        editor.disable();
        let qry = `#${id} > div > div.je-indented-panel > div > div > * > div > div.je-indented-panel`
        document.querySelectorAll(qry).forEach(element => {
            let sc_qry = element.querySelectorAll("[class=form-control] > input")[0].name.replace(/]/g, "").replace(/\[/g, ".")
            let btn = document.createElement("button")
            element.innerHTML = ""
            element.id = id + sc_qry.replace(/\./g, "¦¦¦")
            btn.textContent = "Load Data..."
            btn.setAttribute("val_id", element.id)
            btn.setAttribute("val", editor.getEditor(sc_qry).getValue())
            btn.onclick = retrieveContent;
            element.appendChild(btn)
        })
    }
}

function listenSearch() {
    let search_bar = document.getElementById("search_bar")
    let aTags = document.getElementsByClassName("row");
    if (search_bar.value !== "" && search_bar.value !== null) {
        let searchText = search_bar.value.toLowerCase();
        for (let i = 0; i < aTags.length; i++) {
            let xTags = aTags[i].getElementsByTagName("label");
            let lTags = aTags[i].getElementsByTagName("input");
            let changed = false;
            for (let j = 0; j < xTags.length; j++) {
                if (xTags[j].textContent.toLowerCase().includes(searchText) || lTags[j].value.toLowerCase().includes(searchText)) {
                    if (xTags[j].parentElement.parentElement.parentElement.className === "row") {
                        xTags[j].parentElement.parentElement.parentElement.style.display = ""
                        changed = true
                    }
                } else {
                    if (xTags[j].parentElement.parentElement.parentElement.className === "row") {
                        xTags[j].parentElement.parentElement.parentElement.style.display = "none"
                    }
                }
            }
            if (changed) {
                aTags[i].style.display = "";
            }
        }
    } else {
        for (let i = 0; i < aTags.length; i++) {
            aTags[i].style.display = "";
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.runtime.sendMessage({
            type: "g_form_data",
            handle: "get",
            data: {
                id: tabs[0].id
            }
        }, async info => {
            await insertJSON(info.page + "/api/now/v1/table/" + info.tableName + "/" + info.sys_id, info.g_ck)
            let search_bar = document.getElementById("search_bar")
            search_bar.addEventListener("input", listenSearch)
        });
    });
});