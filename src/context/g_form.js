
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

async function ObjectByString(o, s) {
    // Reference Code: https://stackoverflow.com/a/6491621
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];

        if (o[k] && o[k]["link"] && typeof o[k] !== "string") {
            let x_main = await g_xmlGetter(o[k]["link"])
            let x_main_json = await x_main.json()
            if (x_main_json && x_main_json.result) {
                o[k] = {...x_main_json.result}
            }
        }

        if (k === "prompt()") {
            k = prompt("input value")
        }

        if (k in o) {
            o = o[k];
            console.log(k, o)
        } else {
            return;
        }
    }
    return o;
}

function executeActionValue(runner_action, value) {
    if (window.g_form.isDisabled(runner_action.key)) {
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
                currentDate = new Date(window.g_form.getValue(runner_action.key))
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
                window.g_form.setValue(runner_action.key, "")
                window.g_form.setValue(runner_action.key, valDate)
            }
            break;
        case "val":
            if (runner_action.exe === "==") {
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

async function handleCommand(whereTask, valueTask, element_id=null) {
    let specifications = bSNOW_global_settings.quick_adds;
    let specification_buttons = bSNOW_global_settings.quick_add_buttons;
    let special_actions = bSNOW_global_settings.actions;
    let advanced_settings = bSNOW_global_settings.advanced_settings;

    let parameters = valueTask.match(new RegExp(/\(.*\)/g, "g"))
    let replacementParameter = ""
    if (parameters) {
        replacementParameter = parameters[0].substring(1, parameters[0].length - 1)
        valueTask = valueTask.replace(/\(.*\)/g, "")
    }

    let turbulenceElement;
    if (element_id === null) {
        if (!specification_buttons) {
            return;
        }
        for (let i = 0; i < specification_buttons.length; i++) {
            if (whereTask === specification_buttons[i].code) {
                turbulenceElement = specification_buttons[i]
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
            for (let j = 0; j < special_actions.length; j++) {
                if (special_actions[j].action_id === turbulenceElement.keys[i].value) {
                    runner_actions = special_actions[j].keys;
                    break;
                }
            }
            if (!runner_actions) {
                continue;
            }
            for (let ki = 0; ki < runner_actions.length; ki++) {
                let turbulenceValue;
                turbulenceValue = runner_actions[ki].value.replace(
                    new RegExp('<default>', "g"),
                    replacementParameter
                )
                let turboMatches = turbulenceValue.match(/\$.*?\$/g)

                if (turboMatches) {
                    let g_formDataCache = window.NOW ? {
                        NOW: {
                            user: window.NOW.user
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
                        if (fsLogix) {
                            turbulenceValue = turbulenceValue.replace(savedTurboMatch, fsLogix)
                        }
                    }
                }

                if (element_id && element_id.endsWith(runner_actions[ki].key)) {
                    turbulenceValueMain = turbulenceValue;
                    turbulenceElement.id = element_id;
                } else {
                    executeActionValue(runner_actions[ki], turbulenceValue)
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
    handleCommand(task, "*")
}

if (this.g_form) {

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
    
    new u_g_form()
}
