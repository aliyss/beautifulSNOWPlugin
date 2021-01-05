window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

function g_xmlGetter(path, g_ck=window.g_ck) {
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

function g_activity_watch_getter(replacementParameter) {
    return new Promise((resolve, reject) => {
        browser.runtime.sendMessage(bSNOW_global_settings.runtime.id, {
                content: {
                    id: replacementParameter ? replacementParameter : window.g_form.getUniqueValue(),
                },
                type: "bSNOW_activity_watch",
                handle: "get",
                base_link: bSNOW_global_settings.activity_watcher.activity_watcher_api
            },
            function (response) {
                let replacersApp = bSNOW_global_settings.activity_watcher.replacements_app
                let replacersTitle = bSNOW_global_settings.activity_watcher.replacements_title
                let ignorablesApp = bSNOW_global_settings.activity_watcher.ignore_app
                let ignorablesTitle = bSNOW_global_settings.activity_watcher.ignore_title
                let min_dur = bSNOW_global_settings.activity_watcher.minimum_duration
                response.cleanedString = ""
                response.grouped = {}
                for (let i = 0; i < response.values.length; i++) {
                    if (response.values[i].data && response.values[i].data.app && response.values[i].data.title) {
                        response.values[i].data.title = response.values[i].data.title.trim();
                        if (response.duration < min_dur) {
                            continue;
                        }
                        let matched = false
                        for (let j = 0; j < ignorablesApp.length; j++) {
                            if (response.values[i].data.app.match(ignorablesApp[j].searchRegex)) {
                                matched = true
                                break;
                            }
                        }
                        if (matched) {
                            continue;
                        }
                        for (let j = 0; j < ignorablesTitle.length; j++) {
                            if (response.values[i].data.title.match(ignorablesTitle[j].searchRegex)) {
                                matched = true
                                break;
                            }
                        }
                        if (matched) {
                            continue;
                        }
                        for (let j = 0; j < replacersApp.length; j++) {
                            response.values[i].data.app = response.values[i].data.app.replace(new RegExp(replacersApp[j].searchRegex, "g"), replacersApp[j].replaceValue)
                        }
                        for (let j = 0; j < replacersTitle.length; j++) {
                            response.values[i].data.title = response.values[i].data.title.replace(new RegExp(replacersTitle[j].searchRegex, "g"), replacersTitle[j].replaceValue)
                        }
                        if (!response.grouped[response.values[i].data.app]) {
                            response.grouped[response.values[i].data.app] = []
                        }
                        function hasDuplicates(arr) {
                            return arr.some( function(item) {
                                return arr.indexOf(item) !== arr.lastIndexOf(item);
                            });
                        }
                        response.grouped[response.values[i].data.app].push(response.values[i].data.title)
                    }
                }
                for (const groupedKey in response.grouped) {
                    response.cleanedString += "\n" + groupedKey;
                    if (bSNOW_global_settings.activity_watcher.disable_duplicates) {
                        response.grouped[groupedKey] = [...new Set(response.grouped[groupedKey])]
                    }
                    for (let i = 0; i < response.grouped[groupedKey].length; i++) {
                        response.cleanedString += "\n" + "- " + response.grouped[groupedKey][i]
                    }
                }
                resolve(response)
            });
    })
}

async function ObjectByString(o, s) {
    // Reference Code: https://stackoverflow.com/a/6491621
    s = s.replace(/\[(\w+)\]/g, '.$1');
    s = s.replace(/^\./, '');
    let a = s.split('.');
    for (let i = 0, n = a.length; i < n; ++i) {
        let k = a[i];

        if (o[k] && o[k]["link"] && typeof o[k] !== "string") {
            let x_main = await g_xmlGetter(o[k]["link"])
            let x_main_json = await x_main.json()
            if (x_main_json && x_main_json.result) {
                o[k] = {...x_main_json.result}
            }
        }

        if (o[k.replace(/\(.*\)/g, "")] && k.replace(/\(.*\)/g, "") === "bSNOW_activity_watch" && o[k.replace(/\(.*\)/g, "")]["id"] !== undefined && typeof o[k.replace(/\(.*\)/g, "")] !== "string") {
            k = k.replace(/\(.*\)/g, "")
            let x_main = await g_activity_watch_getter(o[k]["id"])
            if (x_main) {
                o[k] = x_main
            }
        }

        if (k === "prompt()") {
            k = prompt("Provide your input:")
        }

        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

async function executeActionValue(runner_action, value, replacementParameter = null) {
    if (window.g_form.isDisabled(runner_action.key) && runner_action.key !== "bSNOW_gsft_main" && runner_action.key !== "bSNOW_activity_watch") {
        return;
    }

    switch (runner_action.type) {
        case "ref":

            let displayBox_ac_columns;
            if (window.g_form.getDisplayBox(runner_action.key) && window.g_form.getDisplayBox(runner_action.key).getAttribute('ac_columns')) {
                displayBox_ac_columns = window.g_form.getDisplayBox(runner_action.key).getAttribute('ac_columns').split(";")
            }

            let ref_glide_ui_element = g_form.getGlideUIElement(runner_action.key)
            if (ref_glide_ui_element.reference) {
                var gr = new GlideRecord(ref_glide_ui_element.reference);
                gr.addQuery('sys_id', value);
                gr.addQuery('ORname', value)
                gr.addQuery('ORdisplay', value)
                if (displayBox_ac_columns) {
                    for (let i = 0; i < displayBox_ac_columns.length; i++) {
                        gr.addQuery('OR' + displayBox_ac_columns[i], value)
                    }
                }
                gr.query();

                let multiHandlerElement = window.g_form.getElement(runner_action.key)
                let multiHandlerElement_isSelect;
                if (multiHandlerElement) {
                    multiHandlerElement_isSelect = multiHandlerElement.parentElement.getElementsByTagName("select")[0];
                }
                let breaker;
                while (gr.next()) {
                    if (multiHandlerElement_isSelect) {
                        for (let i = 0; i < multiHandlerElement_isSelect.options.length; i++) {
                            if (multiHandlerElement_isSelect.options[i].value === gr.sys_id) {
                                window.g_form.setValue(runner_action.key, "")
                                window.g_form.setValue(runner_action.key, multiHandlerElement_isSelect.options[i].value)
                                breaker = true;
                            }
                            if (breaker) {
                                break;
                            }
                        }
                        if (breaker) {
                            break;
                        }
                    } else {
                        window.g_form.setValue(runner_action.key, "")
                        window.g_form.setValue(runner_action.key, gr.sys_id)
                        breaker = true;
                    }
                    if (breaker) {
                        break;
                    }
                }
                break;
            }
            break;
        case "opt":
            let elopements_control = window.g_form.getControl(runner_action.key)
            let elopements;
            if (elopements_control) {
                elopements = elopements_control.parentElement.getElementsByTagName("select")[0];
            }
            if (elopements) {
                for (let i = 0; i < elopements.options.length; i++) {
                    if (elopements.options[i].text.toLowerCase().startsWith(value.toLowerCase())) {
                        window.g_form.setValue(runner_action.key, "")
                        window.g_form.setValue(runner_action.key, elopements.options[i].value)
                        break;
                    } else if (elopements.options[i].value === value) {
                        window.g_form.setValue(runner_action.key, "")
                        window.g_form.setValue(runner_action.key, elopements.options[i].value)
                        break;
                    }
                }
            }
            break;
        case "date":

            if (runner_action.exe === "==") {
                window.g_form.setValue(runner_action.key, "")
                window.g_form.setValue(runner_action.key, value)
                break;
            }

            let currentDate;
            let dateParser = value.split(" ");
            if (runner_action.exe === "=+" || runner_action.exe === "=-") {
                currentDate = new Date()
            } else if (runner_action.exe === "+=" || runner_action.exe === "=-") {
                let strdate = window.g_form.getValue(runner_action.key)
                let luldate = strdate.split(" ")
                let plaindate = luldate[0].split(".")
                if (window.g_form.getGlideUIElement(runner_action.key).type === "glide_date_time") {
                    let xdate = luldate[1].split(":")
                    currentDate = new Date(plaindate[2], plaindate[1] - 1, plaindate[0], xdate[0], xdate[1] - 1, xdate[2])
                } else {
                    currentDate = new Date(plaindate[2], plaindate[1] - 1, plaindate[0])
                }
            }

            if (dateParser && currentDate) {
                if (runner_action.exe.includes("+")) {
                    for (let i = 0; i < dateParser.length; i++) {
                        if (dateParser[i].endsWith("d")) {
                            currentDate.setDate(currentDate.getDate() + parseInt(dateParser[i].match(/\d+/)[0]))
                        } else if (dateParser[i].endsWith("M")) {
                            currentDate.setMonth(currentDate.getMonth() + parseInt(dateParser[i].match(/\d+/)[0]))
                        } else if (dateParser[i].endsWith("Y")) {
                            currentDate.setFullYear(currentDate.getFullYear() + parseInt(dateParser[i].match(/\d+/)[0]))
                        } else if (dateParser[i].endsWith("h")) {
                            currentDate.setHours(currentDate.getHours() + parseInt(dateParser[i].match(/\d+/)[0]))
                        } else if (dateParser[i].endsWith("m")) {
                            currentDate.setMinutes(currentDate.getMinutes() + parseInt(dateParser[i].match(/\d+/)[0]))
                        } else if (dateParser[i].endsWith("s")) {
                            currentDate.setSeconds(currentDate.getSeconds() + parseInt(dateParser[i].match(/\d+/)[0]))
                        }
                    }
                } else if (runner_action.exe.includes("-")) {
                    for (let i = 0; i < dateParser.length; i++) {
                        if (dateParser[i].endsWith("d")) {
                            currentDate.setDate(currentDate.getDate() - parseInt(dateParser[i].match(/\d+/)[0]))
                        } else if (dateParser[i].endsWith("M")) {
                            currentDate.setMonth(currentDate.getMonth() - parseInt(dateParser[i].match(/\d+/)[0]))
                        } else if (dateParser[i].endsWith("Y")) {
                            currentDate.setFullYear(currentDate.getFullYear() - parseInt(dateParser[i].match(/\d+/)[0]))
                        } else if (dateParser[i].endsWith("h")) {
                            currentDate.setHours(currentDate.getHours() - parseInt(dateParser[i].match(/\d+/)[0]))
                        } else if (dateParser[i].endsWith("m")) {
                            currentDate.setMinutes(currentDate.getMinutes() - parseInt(dateParser[i].match(/\d+/)[0]))
                        } else if (dateParser[i].endsWith("s")) {
                            currentDate.setSeconds(currentDate.getSeconds() - parseInt(dateParser[i].match(/\d+/)[0]))
                        }
                    }
                }

                let valDate = `${("0" + currentDate.getDate()).slice(-2)}.${("0" + (currentDate.getMonth() + 1)).slice(-2)}.${currentDate.getFullYear()}`
                if (window.g_form.getGlideUIElement(runner_action.key).type === "glide_date_time") {
                    valDate += ` ${("0" + currentDate.getHours()).slice(-2)}:${("0" + (currentDate.getMinutes() + 1)).slice(-2)}:${currentDate.getSeconds()}`
                    window.g_form.setValue(runner_action.key, "")
                    window.g_form.setValue(runner_action.key, valDate)
                } else {
                    window.g_form.setValue(runner_action.key, "")
                    window.g_form.setValue(runner_action.key, valDate)
                }
            }
            break;
        case "val":
            if (runner_action.exe === "==") {
                if (runner_action.key === "bSNOW_gsft_main") {
                    if (runner_action.value === "insert_and_stay") {
                        window.gsftSubmit(window.gel('sysverb_insert_and_stay'))
                    }
                    break;
                } else if (runner_action.key === "bSNOW_activity_watch") {
                    let temp_runnerAction = runner_action.value;
                    if (!replacementParameter) {
                        let parameters = runner_action.value.match(new RegExp(/\(.*\)/g, "g"))
                        replacementParameter = ""
                        if (parameters) {
                            replacementParameter = parameters[0].substring(1, parameters[0].length - 1)
                            temp_runnerAction = runner_action.value.replace(/\(.*\)/g, "")
                        }
                    }
                    browser.runtime.sendMessage(bSNOW_global_settings.runtime.id, {
                            content: {
                                id: replacementParameter ? await parseThroughReg(replacementParameter) : window.g_form.getUniqueValue(),
                            },
                            type: runner_action.key,
                            handle: temp_runnerAction,
                            base_link: bSNOW_global_settings.activity_watcher.activity_watcher_api
                        },
                        function (response) {
                            console.log(response)
                        });
                }
                window.g_form.setValue(runner_action.key, "")
                window.g_form.setValue(runner_action.key, value)
                break;
            } else if (runner_action.exe === "+=") {
                let val = window.g_form.getValue(runner_action.key)
                val = value + "\n" + val
                window.g_form.setValue(runner_action.key, "")
                window.g_form.setValue(runner_action.key, val)
                break;
            } else if (runner_action.exe === "=+") {
                let val = window.g_form.getValue(runner_action.key)
                val = val + "\n" + value
                window.g_form.setValue(runner_action.key, "")
                window.g_form.setValue(runner_action.key, val)
            }
            break;
        default:
            window.g_form.setValue(runner_action.key, "")
            window.g_form.setValue(runner_action.key, value)
            break;
    }
}

async function retrievableActionValue(runner_action) {

    let turbulenceValue;

    if (runner_action.if_field_id) {
        turbulenceValue = await parseThroughReg("$" + runner_action.if_field_id + "$")
    }

    switch (runner_action.if_field_type) {
        case "date":
            let currentDate = new Date();

            let strdate = window.g_form.getValue(runner_action.if_field_id)
            let luldate = strdate.split(" ")
            let plaindate = luldate[0].split(".")
            if (window.g_form.getGlideUIElement(runner_action.if_field_id).type === "glide_date_time") {
                let xdate = luldate[1].split(":")
                currentDate = new Date(plaindate[2], plaindate[1] - 1, plaindate[0], xdate[0], xdate[1] - 1, xdate[2])
            } else {
                currentDate = new Date(plaindate[2], plaindate[1] - 1, plaindate[0])
            }

            let partialDate = null;

            let strdateX = runner_action.if_field_value
            let luldateX = strdateX.split(" ")
            let plaindateX = luldateX[0].split(".")
            if (luldateX[1]) {
                let xdate = luldateX[1].split(":")
                partialDate = new Date(plaindateX[2], plaindateX[1] - 1, plaindateX[0], xdate[0], xdate[1] - 1, xdate[2])
            } else {
                partialDate = new Date(plaindateX[2], plaindateX[1] - 1, plaindateX[0])
            }

            if (!partialDate) {
                return false;
            }

            if (runner_action.if_field_execution === ">=") {
                if (currentDate >= partialDate) {
                    return true;
                }
            } else if (runner_action.if_field_execution === "<=") {
                if (currentDate <= partialDate) {
                    return true;
                }
            } else if (runner_action.if_field_execution === "==") {
                if (currentDate === partialDate) {
                    return true;
                }
            }

            return false;
        default:
            if (turbulenceValue === runner_action.if_field_value) {
                return true;
            }
            break;
    }

    return false;
}

async function parseThroughReg(turbulenceValue) {

    let advanced_settings = bSNOW_global_settings.advanced_settings;

    let parameters = turbulenceValue.match(new RegExp(/\(.*\)/g, "g"))
    let replacementParameter = ""
    if (parameters) {
        replacementParameter = parameters[0].substring(1, parameters[0].length - 1)
        turbulenceValue = turbulenceValue.replace(/\(.*\)/g, "")
    }

    let turboMatches = turbulenceValue.match(/\$.*?\$/g)

    if (turboMatches) {

        let g_formDataCache = window.NOW ? {
            NOW: {
                user: window.NOW.user
            },
            bSNOW_activity_watch: {
                id: await parseThroughReg(replacementParameter)
            }
        } : {}

        for (let j = 0; j < turboMatches.length; j++) {
            let savedTurboMatch = turboMatches[j];
            turboMatches[j] = turboMatches[j].substring(1, turboMatches[j].length - 1);
            let mainValue = turboMatches[j]
            if (turboMatches[j].includes(".")) {
                mainValue = turboMatches[j].split(".")[0]
            }
            if (!g_formDataCache[mainValue]) {

                let c = document.querySelectorAll("#activity_field_filter_popover input")
                let add_param = advanced_settings ? advanced_settings.custom_history_line_query : "";
                if (!add_param) {
                    for (i = 0; i < c.length; i++) {
                        let yo = window.angular.element(c[i]).scope().field
                        if (yo && yo.isActive) {
                            if (add_param) {
                                add_param += ("^ORlabel=" + yo.label)
                            } else {
                                add_param = "^label=" + yo.label
                            }
                        }
                    }
                }

                try {
                    let x_main = await g_xmlGetter(`${location.origin}/api/now/v1/table/${window.g_form.tableName}/${window.g_form.getUniqueValue()}`)
                    if (x_main.status === 404) {
                        throw new Error("Not Found")
                    }
                    let x_main_json = await x_main.json()
                    if (x_main_json && x_main_json.result) {
                        x_main_json.result.sys_history_line = {
                            link: `${location.origin}/api/now/v1/table/sys_history_line?sysparm_query=set.id=${window.g_form.getUniqueValue()+ add_param}^ORDERBYDESCupdate_time`,
                            value: `${window.g_form.getUniqueValue()}`
                        }
                        g_formDataCache = { ...x_main_json.result, ...g_formDataCache }
                    }
                } catch (e) {
                    let g_formElement = window.g_form.elements.find(element => element.fieldName === mainValue)
                    if (!g_formElement) {
                        continue;
                    }
                    switch (g_formElement.type) {
                        case "reference":
                            let reffrerer = window.g_form.getGlideUIElement(g_formElement.fieldName).reference
                            let x_main_sub = await g_xmlGetter(`${location.origin}/api/now/v1/table/${reffrerer}/${window.g_form.getValue(g_formElement.fieldName)}`)
                            let x_main_json_sub = await x_main_sub.json()
                            if (x_main_json_sub && x_main_json_sub.result) {
                                x_main_json_sub.result.sys_history_line = {
                                    link: `${location.origin}/api/now/v1/table/sys_history_line?sysparm_query=set.id=${window.g_form.getUniqueValue() + add_param}^ORDERBYDESCupdate_time`,
                                    value: `${window.g_form.getUniqueValue()}`
                                }
                                g_formDataCache[g_formElement.fieldName] = { ...x_main_json_sub.result }
                            } else {
                                g_formDataCache[g_formElement.fieldName] = window.g_form.getValue(g_formElement.fieldName)
                            }
                            break;
                        default:
                            g_formDataCache[g_formElement.fieldName] = window.g_form.getValue(g_formElement.fieldName)
                            break;
                    }
                }
            }

            let fsLogix = await ObjectByString(g_formDataCache, turboMatches[j])
            if (fsLogix !== undefined && fsLogix !== null) {
                if (typeof fsLogix !== "string") {
                    fsLogix = JSON.stringify(fsLogix)
                }
                turbulenceValue = turbulenceValue.replace(savedTurboMatch.replace(/\(.*\)/g, ""), fsLogix)
            }
        }
    }
    return turbulenceValue
}

async function handleCommand(whereTask, valueTask, element_id=null) {
    let specifications = bSNOW_global_settings.quick_adds;
    let specification_buttons = bSNOW_global_settings.quick_add_buttons;
    let specification_auto_runs = bSNOW_global_settings.auto_runs;
    let special_actions = bSNOW_global_settings.actions;

    let parameters = valueTask.match(new RegExp(/\(.*\)/g, "g"))
    let replacementParameter = ""
    if (parameters) {
        replacementParameter = parameters[0].substring(1, parameters[0].length - 1)
        valueTask = valueTask.replace(/\(.*\)/g, "")
    }

    let turbulenceElement;
    if (element_id === "quick_add_buttons") {
        element_id = null;
        if (!specification_buttons) {
            return;
        }
        for (let i = 0; i < specification_buttons.length; i++) {
            if (whereTask === specification_buttons[i].code) {
                turbulenceElement = specification_buttons[i]
                break;
            }
        }
    } else if (element_id === "auto_runs") {
        element_id = null;
        if (!specification_auto_runs) {
            return;
        }
        for (let i = 0; i < specification_auto_runs.length; i++) {
            if (whereTask === specification_auto_runs[i].code) {
                turbulenceElement = specification_auto_runs[i]
                break;
            }
        }
    } else {
        for (let i = 0; i < specifications.length; i++) {
            if (specifications[i].fieldNames.includes(whereTask) || whereTask === specifications[i].code) {
                turbulenceElement = specifications[i]
                break;
            }
        }

        if (!turbulenceElement || !turbulenceElement.keys) {
            return;
        }
    }

    if (!turbulenceElement || !turbulenceElement.keys) {
        return;
    }

    let turbulenceValueMain;



    for (let i = 0; i < turbulenceElement.keys.length; i++) {
        if (valueTask === turbulenceElement.keys[i].key) {
            let runner_actions;
            let z_runner_actions;
            for (let j = 0; j < special_actions.length; j++) {
                if (special_actions[j].action_id === turbulenceElement.keys[i].value) {
                    z_runner_actions = special_actions[j].action_application
                    runner_actions = z_runner_actions.keys;
                    break;
                }
            }
            if (!z_runner_actions || !runner_actions) {
                continue;
            }

            for (let jell = 0; jell < z_runner_actions.conditional_for_type.for_executions; jell++) {
                let continueable = true;
                for (let k = 0; k < z_runner_actions.conditional_if_type.length; k++) {
                    continueable = await retrievableActionValue(z_runner_actions.conditional_if_type[k])
                }
                if (!continueable) {
                    break;
                }
                for (let ki = 0; ki < runner_actions.length; ki++) {
                    let turbulenceValue;
                    turbulenceValue = runner_actions[ki].value.replace(
                        new RegExp('<default>', "g"),
                        replacementParameter
                    )

                    turbulenceValue = await parseThroughReg(turbulenceValue)

                    if (element_id && element_id.endsWith(runner_actions[ki].key)) {
                        turbulenceValueMain = turbulenceValue;
                        turbulenceElement.id = element_id;
                    } else {
                        executeActionValue(runner_actions[ki], turbulenceValue, replacementParameter)
                    }
                }
            }

            break;
        }
    }

    return {
        returnFieldName: turbulenceElement,
        returnValue: turbulenceValueMain
    };
}

async function matchYo (match, config, element_id) {
    match = match.substring(config.beforeLimiter.length, match.length - config.afterLimiter.length)

    let replaceTask;

    let whereTask = element_id
    let valueTask = match

    if (match.match(/=(?![^(]*[)])/)) {
        let contentSpecifics = match.split(/=(?![^(]*[)])/);
        whereTask = contentSpecifics[0]
        valueTask = contentSpecifics[1]
    }

    let commanded = await handleCommand(whereTask, valueTask, element_id);

    if (commanded && element_id.endsWith(commanded.returnFieldName.id) && commanded.returnValue) {
        replaceTask = commanded.returnValue
    }

    if (replaceTask) {
        match = replaceTask
    } else {
        match = ""
    }

    return match;
}

async function handleInput(value, config, element_id) {
    let matches = value.match(config.regex)

    let force_replace = false;

    if (!matches) {
        return {force_replace, value};
    }

    for (let i = 0; i < matches.length; i++) {
        let matched = await matchYo(matches[i], config, element_id)
        value = value.replace(matches[i], matched);
        force_replace = true
    }

    return {force_replace, value};
}

class CommandHandler {

    constructor() {
        this.quickAdds = [];
    }

    async parseText(data, config) {
        if (!bSNOW_global_settings) {
            return;
        }
        if (!bSNOW_global_settings.quick_adds) {
            return;
        }
        if (!bSNOW_global_settings.actions) {
            return;
        }

        let controlObject = window.g_form.getControl(data.element_id)

        if (controlObject && controlObject.dataset && controlObject.dataset.charlimit) {
            let orig_maxCharLengthYo = document.getElementById(data.element_id + '_maxCharLengthYo')
            if (!orig_maxCharLengthYo) {
                orig_maxCharLengthYo = document.createElement('p')
                orig_maxCharLengthYo.id = data.element_id + '_maxCharLengthYo'
                controlObject.labels[0].appendChild(orig_maxCharLengthYo)
            }
            orig_maxCharLengthYo.innerText = 'Remaining: ' + (controlObject.dataset.length - (controlObject.textLength - 1))

        }

        let input = await handleInput(data.newValue, config, data.element_id)
        if (input.value !== data.newValue || input.force_replace) {
            await window.g_form.setValue(data.element_id, "")
            await window.g_form.setValue(data.element_id, input.value)
        }
    }
}

class u_g_form {

    beforeLimiter = "{";
    afterLimiter = "}";
    regex;
    commandHandler;

    constructor() {
        this.regex = new RegExp(`${this.beforeLimiter}.*${this.afterLimiter}`, "g")
        this.commandHandler = new CommandHandler()

        this.addUserChangeListenerToElementsDynamically('string')

        window.g_form.onUserChangeValue(async (e, p, n) => {
            await this.commandHandler.parseText({
                element_id: e,
                previousValue: p,
                newValue: n
            }, {
                regex: this.regex,
                beforeLimiter: this.beforeLimiter,
                afterLimiter: this.afterLimiter
            })
        })
    }

    /*
     * Allows to add an input listener to the given field.
     * If the elements content changes then the OnUserChangeValue event is triggered manually.
     * This can be used to add listeners to fields that do not already trigger the event.
     * Example: addUserChangeListenerToElements('incident.close_notes');
     */
    addUserChangeListenerToElements(element_id) {
        for (let i = 0; i < window.g_form.elements.length; i++) {
            let currentElement = window.g_form.elements[i];
            if (currentElement.getID() === element_id) {
                currentElement.getElement().setAttribute('_previousValue', currentElement.getValue());
                currentElement.getElement().oninput = (element) => {
                    let previousValue = currentElement.getElement().getAttribute('_previousValue');
                    let newValue = element.target.value;
                    window.g_form.triggerOnUserChangeValue(currentElement.getID(), previousValue, newValue)
                }
            }
        }
    }

    /*
     * Does the same as the addUserChangeListenerToElements.
     * However applies to all the elements that have the same type.
     * This allows for flexibility with the downside that the event may be triggered twice.
     * Example: addUserChangeListenerToElementsDynamically('string');
     */
    addUserChangeListenerToElementsDynamically(type) {
        for (let i = 0; i < window.g_form.elements.length; i++) {
            let currentElement = window.g_form.elements[i];
            if (currentElement.type === type) {
                currentElement.getElement().setAttribute('previousValue', currentElement.getValue());
                currentElement.getElement().oninput = (element) => {
                    let previousValue = currentElement.getElement().getAttribute('previousValue');
                    let newValue = element.target.value;
                    window.g_form.triggerOnUserChangeValue(currentElement.getID(), previousValue, newValue)
                }
            }
        }
    }
}

function yoloBtn(task) {
    handleCommand(task, "*", "quick_add_buttons")
}

function yoloAuto(task) {
    handleCommand(task, "*", "auto_runs")
}

if (window.g_form) {

    if (bSNOW_global_settings && bSNOW_global_settings.quick_add_buttons) {
        let btns = bSNOW_global_settings.quick_add_buttons;
        for (let i = 0; i < btns.length; i++) {
            if (btns[i].tableNames.includes(window.g_form.tableName)) {
                let g_form_header_bar = document.querySelector(`#${window.g_form.tableName}\\.form_header nav > div > div.navbar-right`);
                let g_form_header_bar_button = document.createElement("button")
                g_form_header_bar_button.textContent = btns[i].code;
                g_form_header_bar_button.addEventListener('click', function(event){
                    yoloBtn(event.target.textContent);
                });
                g_form_header_bar.insertBefore(g_form_header_bar_button, g_form_header_bar.firstChild)
            }
        }
    }

    if (bSNOW_global_settings && bSNOW_global_settings.auto_runs) {
        let btns = bSNOW_global_settings.auto_runs;
        for (let i = 0; i < btns.length; i++) {
            if (btns[i].tableNames.includes(window.g_form.tableName)) {
                yoloAuto(btns[i].code);
            }
        }
    }

    browser.runtime.sendMessage(bSNOW_global_settings.runtime.id, {
        type: "g_form_data",
        handle: "set",
        data: {
            page: window.location.origin,
            tableName: window.g_form.tableName,
            sys_id: window.g_form.getUniqueValue(),
            g_ck: window.g_ck
        }
    })

    new u_g_form()
}
