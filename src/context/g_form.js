function simpleFlattener(obj, parent, res = {}) {
    // Stolen from StackOverflow
    for(let key in obj){
        let propName = parent ? parent + '.' + key : key;
        if(typeof obj[key] == 'object'){
            simpleFlattener(obj[key], propName, res);
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
}

function handleCommand(whereTask, valueTask) {
    let specifications = bSNOW_global_settings.quick_adds;

    let parameters = valueTask.match(new RegExp(/\(.*\)/g, "g"))
    let replacementParameter = ""
    if (parameters) {
        replacementParameter = parameters[0].substring(1, parameters[0].length - 1)
        valueTask = valueTask.replace(/\(.*\)/g, "")
    }

    let turbulenceElement;
    for (let i = 0; i < specifications.length; i++) {
        if (specifications[i].fieldNames.includes(whereTask) || whereTask === specifications[i].code) {
            turbulenceElement = specifications[i]
            break;
        }
    }

    let turbulenceValue;
    for (let i = 0; i < turbulenceElement.keys.length; i++) {
        if (valueTask === turbulenceElement.keys[i].key) {
            turbulenceValue = turbulenceElement.keys[i].value.replace(
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
                let flattened_g_formDataCache = simpleFlattener(g_formDataCache)
                for (let j = 0; j < turboMatches.length; j++) {
                    let savedTurboMatch = turboMatches[j];
                    turboMatches[j] = turboMatches[j].substring(1, turboMatches[j].length - 1);
                    let mainValue = turboMatches[j]
                    if (turboMatches[j].includes(".")) {
                        mainValue = turboMatches[j].split(".")[0]
                    }
                    if (!g_formDataCache[mainValue] && !flattened_g_formDataCache[turboMatches[j]]) {
                        let g_formElement = window.g_form.elements.find(element => element.fieldName === mainValue)
                        if (!g_formElement) {
                            continue;
                        }
                        switch (g_formElement.type) {
                            case "reference":
                                g_formDataCache[g_formElement.fieldName] = {}
                                let xper = window.g_form.getReference(g_formElement.fieldName).rows[0];
                                for (let k = 0; k < xper.length; k++) {
                                    g_formDataCache[g_formElement.fieldName][xper[k].name] = xper[k].value;
                                }
                                break;
                            case "integer":
                                g_formDataCache[g_formElement.fieldName] = window.g_form.getOption(
                                    g_formElement.fieldName,
                                    document.gsft_main.g_form.getValue(g_formElement.fieldName)
                                ).textContent
                                break;
                            default:
                                g_formDataCache[g_formElement.fieldName] = window.g_form.getValue(g_formElement.fieldName)
                                break;
                        }
                    }

                    flattened_g_formDataCache = simpleFlattener(g_formDataCache)

                    if (flattened_g_formDataCache[turboMatches[j]]) {
                        turbulenceValue = turbulenceValue.replace(savedTurboMatch, flattened_g_formDataCache[turboMatches[j]])
                    }
                }
            }
            break;
        }
    }
    return {
        returnFieldName: turbulenceElement.setValue || turbulenceElement.fieldNames[0],
        returnValue: turbulenceValue
    };
}


function handleInput(value, config, element_id) {
    let newValue = value.replace(config.regex, function (match) {
        match = match.substring(config.beforeLimiter.length, match.length - config.afterLimiter.length)
        if (match.match(/:(?![^(]*[)])/)) {
            let currentTasks = match.split(/:(?![^(]*[)])/);
            for (let i = 0; i < currentTasks.length; i++) {
                let replaceTask;
                if (currentTasks[i].match(/=(?![^(]*[)])/)) {
                    let contentSpecifics = currentTasks[i].split(/=(?![^(]*[)])/);
                    let whereTask = contentSpecifics[0]
                    let valueTask = contentSpecifics[1]

                    let commanded = handleCommand(whereTask, valueTask);
                    if (element_id.endsWith(commanded.returnFieldName) && commanded.returnValue) {
                        replaceTask = commanded.returnValue
                    } else if (commanded.returnFieldName && commanded.returnValue) {
                        window.g_form.setValue(commanded.returnFieldName, commanded.returnValue)
                    }
                } else {
                    let commanded = handleCommand(element_id, currentTasks[i]);
                    if (element_id.endsWith(commanded.returnFieldName) && commanded.returnValue) {
                        replaceTask = commanded.returnValue
                    }
                }
                if (replaceTask) {
                    match = match.replace(currentTasks[i], replaceTask)
                } else {
                    match = match.replace(":" + currentTasks[i], "")
                    match = match.replace(currentTasks[i] + ":", "")
                    match = match.replace(currentTasks[i], "")
                }
            }
        } else {
            let replaceTask;
            if (match.match(/=(?![^(]*[)])/)) {
                let contentSpecifics = match.split(/=(?![^(]*[)])/);
                let whereTask = contentSpecifics[0]
                let valueTask = contentSpecifics[1]

                let commanded = handleCommand(whereTask, valueTask);
                if (element_id.endsWith(commanded.returnFieldName) && commanded.returnValue) {
                    replaceTask = commanded.returnValue
                } else if (commanded.returnFieldName && commanded.returnValue) {
                    window.g_form.setValue(commanded.returnFieldName, commanded.returnValue)
                }
            } else {
                let commanded = handleCommand(element_id, match);
                if (element_id.endsWith(commanded.returnFieldName) && commanded.returnValue) {
                    replaceTask = commanded.returnValue
                }
            }
            if (replaceTask) {
                match = replaceTask
            } else {
                match = ""
            }
        }
        return match;
    })
    return newValue
}

class CommandHandler {

    constructor() {
        this.quickAdds = [];
    }

    parseText(data, config) {
        if (!bSNOW_global_settings && bSNOW_global_settings.quick_adds) {
            return;
        }
        let input = handleInput(data.newValue, config, data.element_id)
        if (input !== data.newValue) {
            window.g_form.setValue(data.element_id, input)
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

        window.g_form.onUserChangeValue((e, p, n) => {
            this.commandHandler.parseText({
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

if (this.g_form) {
    new u_g_form()
}
