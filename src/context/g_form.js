
function handleInput(value, regex, element_id, specifications) {
    let newValue = value.replace(regex, function (match) {
        match = match.substring(1, match.length - 1)
        if (match.includes(":")) {
            let currentTasks = match.split(":");
            for (let i = 0; i < currentTasks.length; i++) {
                let replaceTask;
                if (currentTasks[i].includes("=")) {
                    let contentSpecifics = currentTasks[i].split("=");
                    let whereTask = contentSpecifics[0]
                    let valueTask = contentSpecifics[1]
                    if (whereTask === element_id) {
                        replaceTask = "L"
                    }
                    for (let j = 0; j < window.g_form; j++) {

                    }
                } else {
                    if (currentTasks[i].includes("Z")) {
                        replaceTask = "L"
                    }
                }
                if (replaceTask) {
                    match = match.replace(currentTasks[i], replaceTask)
                }
            }
        } else {
            if (match.includes("x")) {
                match = "Y"
            }
        }
        return match;
    })
    return newValue
}

class CommandHandler {

    regex = new RegExp("<.*?>", "g")
    quickAdds;

    constructor() {
        this.quickAdds = [];
    }

    parseText(element_id, previousValue, newValue) {
        let input = handleInput(newValue, /<.*?>/g, element_id)
        if (input !== newValue) {
            window.g_form.setValue(element_id, input)
        }
    }
}

class u_g_form {

    commandHandler;

    constructor() {
        this.commandHandler = new CommandHandler()

        //this.addUserChangeListenerToElements('incident.description');
        //this.addUserChangeListenerToElements('task_time_worked.comments');
        this.addUserChangeListenerToElementsDynamically('string')

        window.g_form.onUserChangeValue(this.commandHandler.parseText)
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
                currentElement.getElement().setAttribute('previousValue', currentElement.getValue());
                currentElement.getElement().oninput = (element) => {
                    let previousValue = currentElement.getElement().getAttribute('previousValue');
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
        for (let i = 0; i <  window.g_form.elements.length; i++) {
            let currentElement =  window.g_form.elements[i];
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
    let main_u_g_form = new u_g_form()
}
