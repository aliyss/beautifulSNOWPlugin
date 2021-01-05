var editor;

window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

browser.storage.local.get(['global_replacements', 'quick_adds', 'actions', 'auto_runs', 'quick_add_buttons', 'advanced_settings', 'activity_watcher'], function (result) {
    let contentConfig = result;

    if (!contentConfig.global_replacements) {
        contentConfig.global_replacements = []
    }
    if (!contentConfig.quick_adds) {
        contentConfig.quick_adds = []
    }
    if (!contentConfig.quick_add_buttons) {
        contentConfig.quick_add_buttons = []
    }
    if (!contentConfig.quick_add_buttons) {
        contentConfig.quick_add_buttons = []
    }
    if (!contentConfig.auto_runs) {
        contentConfig.auto_runs = []
    }

    if (!contentConfig.advanced_settings) {
        contentConfig.advanced_settings = {
            custom_history_line_query: ""
        }
    }

    if (!contentConfig.activity_watcher) {
        contentConfig.activity_watcher = {
        }
    }

    if (!contentConfig.activity_watcher.activity_watcher_api) {
        contentConfig.activity_watcher = {
            activity_watcher_api: "",
            minimum_duration: 60,
            replacements_app: [],
            replacements_title: [],
            ignore_app: [],
            ignore_title: [],
        }
    }

    if (!contentConfig.activity_watcher.disable_duplicates) {
        contentConfig.activity_watcher.disable_duplicates = true
    }

    if (!contentConfig._executions) {
        contentConfig._executions = ["==", "+=", "=+", "=-", "-="]
    }

    if (!contentConfig._conditionals) {
        contentConfig._conditionals = ["==", ">=", "<="]
    }

    JSONEditor.defaults.callbacks.template = {
        "editor_executionsFilter": (jseditor, e) => {
            if (e.watched._type === 'val' && (e.item === "-=" || e.item === "=-")) return "";
            if (e.watched._type === 'ref' && e.item !== "==") return "";
            if (e.watched._type === 'opt' && e.item !== "==") return "";
            return e.item;
        },
        "editor_executionsValue": (jseditor, e) => e.item
    };

    editor = new JSONEditor(document.getElementById('editor_holder'), {
        schema: {
            type: "object",
            title: "⚙ Settings",
            options: {
                input_width: '100vh',
                disable_collapse: true
            },
            properties: {
                _conditionals: {
                    type: "array",
                    format: "table",
                    options: {
                        hidden: true
                    },
                    items: {
                        type: "string"
                    }
                },
                _executions: {
                    type: "array",
                    format: "table",
                    options: {
                        hidden: true
                    },
                    items: {
                        type: "string"
                    }
                },
                global_replacements: {
                    options: {
                        disable_collapse: true
                    },
                    type: "array",
                    format: "table",
                    title: "Replacements",
                    uniqueItems: true,
                    items: {
                        type: "object",
                        name: "Row",
                        properties: {
                            siteFilter: {
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '100px'
                                }
                            },
                            searchRegex: {
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '400px'
                                }
                            },
                            replaceValue: {
                                type: "object",
                                name: "Replace Value",
                                options: {
                                    collapsed: true,
                                    input_width: '100vh'
                                },
                                properties: {
                                    tag: {
                                        type: "string",
                                        name: "Tag"
                                    },
                                    attribute: {
                                        type: "string",
                                        name: "Attribute"
                                    },
                                    content: {
                                        type: "string",
                                        name: "Content"
                                    },
                                }
                            }
                        }
                    }
                },
                actions: {
                    type: "array",
                    format: "table",
                    title: "Actions",
                    uniqueItems: true,
                    options: {
                        expanded: true,
                        disable_collapse: true
                    },
                    items: {
                        type: "object",
                        format: "categories",
                        options: {
                            expanded: true
                        },
                        properties: {
                            action_name: {
                                title: "Action",
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '200px',
                                    expanded: true
                                }
                            },
                            action_id: {
                                title: "Action Id",
                                type: "string",
                                options: {
                                    hidden: true
                                }
                            },
                            action_application: {
                                title: "Application",
                                format: "categories",
                                options: {
                                    collapsed: true,
                                    expanded: true
                                },
                                properties: {
                                    keys: {
                                        type: "array",
                                        format: "table",
                                        title: "Runners",
                                        uniqueItems: true,
                                        options: {
                                            expanded: true,
                                            disable_collapse: true
                                        },
                                        items: {
                                            id: "arr_action_item_runner",
                                            type: "object",
                                            name: "Row",
                                            properties: {
                                                key: {
                                                    title: "Field ID",
                                                    type: "string",
                                                    options: {
                                                        input_height: '40px',
                                                        input_width: '300px'
                                                    }
                                                },
                                                type: {
                                                    title: "Type",
                                                    type: "string",
                                                    options: {
                                                        input_height: '40px',
                                                        input_width: '100px'
                                                    },
                                                    enumSource: [{source: ["val", "ref", "date", "opt"]}],
                                                },
                                                exe: {
                                                    title: "Execution",
                                                    type: "string",
                                                    options: {
                                                        input_width: '100px'
                                                    },
                                                    watch: {
                                                        "__executions": "_executions",
                                                        "_type": "arr_action_item_runner.type"
                                                    },
                                                    enumSource: [{
                                                        source: "__executions",
                                                        filter: "editor_executionsFilter",
                                                        value: "editor_executionsValue"
                                                    }],
                                                },
                                                value: {
                                                    title: "Field Value",
                                                    type: "string",
                                                    format: "xhtml",
                                                    options: {
                                                        input_width: "100vh",
                                                        expanded: true
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    conditional_for_type: {
                                        title: "Conditional For",
                                        type: "object",
                                        options: {
                                            expanded: true,
                                            disable_collapse: true
                                        },
                                        properties: {
                                            for_executions: {
                                                title: "Execute Actions X times",
                                                type: "number",
                                                options: {
                                                    input_height: '40px',
                                                    input_width: '200px',
                                                },
                                                default: 1
                                            }
                                        }
                                    },
                                    conditional_if_type: {
                                        type: "array",
                                        format: "table",
                                        title: "Conditional Ifs",
                                        uniqueItems: true,
                                        options: {
                                            expanded: true,
                                            disable_collapse: true
                                        },
                                        items: {
                                            properties: {
                                                if_field_id: {
                                                    title: "Field ID",
                                                    type: "string",
                                                    options: {
                                                        input_height: '40px',
                                                        input_width: '200px',
                                                    }
                                                },
                                                if_field_type: {
                                                    title: "Field Type",
                                                    type: "string",
                                                    options: {
                                                        input_height: '40px',
                                                        input_width: '200px',
                                                    },
                                                    enumSource: [{source: ["val", "ref", "date", "opt"]}],
                                                },
                                                if_field_execution: {
                                                    title: "Execution",
                                                    type: "string",
                                                    options: {
                                                        input_height: '40px',
                                                        input_width: '200px',
                                                    },
                                                    watch: {
                                                        "__conditionals": "_conditionals"
                                                    },
                                                    enumSource: [{
                                                        source: "__conditionals"
                                                    }],
                                                },
                                                if_field_value: {
                                                    title: "Value",
                                                    type: "string",
                                                    options: {
                                                        input_height: '40px',
                                                        input_width: '200px',
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                quick_adds: {
                    type: "array",
                    format: "table",
                    title: "Quick Adds",
                    uniqueItems: true,
                    options: {
                        disable_collapse: true
                    },
                    items: {
                        type: "object",
                        name: "Row",
                        properties: {
                            code: {
                                title: "Code",
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '100px'
                                }
                            },
                            fieldNames: {
                                type: "array",
                                format: "table",
                                title: "Field Names",
                                uniqueItems: true,
                                items: {
                                    title: "Field ID",
                                    type: "string",
                                    name: "",
                                },
                                options: {
                                    input_height: '40px',
                                    input_width: '400px'
                                }
                            },
                            keys: {
                                type: "array",
                                format: "table",
                                title: "Action List",
                                uniqueItems: true,
                                items: {
                                    type: "object",
                                    name: "Row",
                                    properties: {
                                        key: {
                                            title: "Key",
                                            type: "string",
                                            options: {
                                                input_height: '40px',
                                                input_width: '100px'
                                            }
                                        },
                                        value: {
                                            title: "Action",
                                            name: "Action Name",
                                            type: "string",
                                            options: {
                                                input_height: '40px',
                                                input_width: '100vh'
                                            },
                                            watch: {
                                                action_yo: "actions"
                                            },
                                            enumSource: [
                                                ["none"],
                                                {
                                                    source: "action_yo",
                                                    title: "{{item.action_name}}",
                                                    value: "{{item.action_id}}"
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                        }
                    }
                },
                quick_add_buttons: {
                    type: "array",
                    format: "table",
                    title: "Quick Add Buttons",
                    uniqueItems: true,
                    options: {
                        disable_collapse: true
                    },
                    items: {
                        type: "object",
                        name: "Row",
                        properties: {
                            code: {
                                title: "Code",
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '100px'
                                }
                            },
                            tableNames: {
                                type: "array",
                                format: "table",
                                title: "Table Names",
                                uniqueItems: true,
                                items: {
                                    title: "Table ID",
                                    type: "string",
                                    name: "",
                                },
                                options: {
                                    input_height: '40px',
                                    input_width: '500px'
                                }
                            },
                            keys: {
                                type: "array",
                                format: "table",
                                title: "Action List",
                                uniqueItems: true,
                                options: {
                                    input_width: '100vh'
                                },
                                items: {
                                    type: "object",
                                    name: "Row",
                                    properties: {
                                        key: {
                                            name: "Key",
                                            type: "string",
                                            options: {
                                                hidden: true,
                                                input_height: '40px',
                                                input_width: '100px'
                                            },
                                            default: "*"
                                        },
                                        value: {
                                            title: "Action",
                                            name: "Action Name",
                                            type: "string",
                                            options: {
                                                input_height: '40px',
                                                input_width: '100vh'
                                            },
                                            watch: {
                                                action_yo: "actions"
                                            },
                                            enumSource: [
                                                ["none"],
                                                {
                                                    source: "action_yo",
                                                    title: "{{item.action_name}}",
                                                    value: "{{item.action_id}}"
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                        }
                    }
                },
                auto_runs: {
                    options: {
                        disable_collapse: true
                    },
                    type: "array",
                    format: "table",
                    title: "AutoRuns",
                    uniqueItems: true,
                    items: {
                        type: "object",
                        name: "Row",
                        properties: {
                            code: {
                                title: "Code",
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '100px'
                                }
                            },
                            tableNames: {
                                type: "array",
                                format: "table",
                                title: "Table Names",
                                uniqueItems: true,
                                items: {
                                    title: "Table ID",
                                    type: "string",
                                    name: "",
                                },
                                options: {
                                    input_height: '40px',
                                    input_width: '500px'
                                }
                            },
                            keys: {
                                type: "array",
                                format: "table",
                                title: "Action List",
                                uniqueItems: true,
                                options: {
                                    input_width: '100vh'
                                },
                                items: {
                                    type: "object",
                                    name: "Row",
                                    properties: {
                                        key: {
                                            name: "Key",
                                            type: "string",
                                            options: {
                                                hidden: true,
                                                input_height: '40px',
                                                input_width: '100px'
                                            },
                                            default: "*"
                                        },
                                        value: {
                                            title: "Action",
                                            name: "Action Name",
                                            type: "string",
                                            options: {
                                                input_height: '40px',
                                                input_width: '100vh'
                                            },
                                            watch: {
                                                action_yo: "actions"
                                            },
                                            enumSource: [
                                                ["none"],
                                                {
                                                    source: "action_yo",
                                                    title: "{{item.action_name}}",
                                                    value: "{{item.action_id}}"
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                        }
                    }
                },
                advanced_settings: {
                    options: {
                        disable_collapse: true
                    },
                    format: "categories",
                    type: "object",
                    title: "Advanced Settings",
                    properties: {
                        custom_history_line_query: {
                            title: "Custom History Line Query",
                            type: "string",
                            options: {
                                input_height: '40px'
                            }
                        }
                    }
                },
                activity_watcher: {
                    type: "object",
                    title: "Activity Watcher",
                    format: "categories",
                    options: {
                        disable_collapse: true
                    },
                    properties: {
                        activity_watcher_api: {
                            title: "Activity Watcher Bucket Api",
                            type: "string",
                            options: {
                                input_height: '40px'
                            },
                            default: "http://localhost:5600/api/0/buckets/[your_bucket_id]/"
                        },
                        minimum_duration: {
                            title: "Minimum Duration (in sec)",
                            type: "number",
                            options: {
                                input_height: '40px'
                            },
                            default: "60"
                        },
                        disable_duplicates: {
                            title: "Disable Duplicates",
                            type: "boolean",
                            options: {
                                input_height: '40px'
                            },
                            default: true
                        },
                        replacements_app: {
                            type: "array",
                            format: "table",
                            title: "Replacements App",
                            uniqueItems: true,
                            options: {
                                disable_collapse: true
                            },
                            items: {
                                type: "object",
                                name: "Row",
                                properties: {
                                    searchRegex: {
                                        type: "string",
                                        options: {
                                            input_height: '40px',
                                            input_width: '600px'
                                        }
                                    },
                                    replaceValue: {
                                        type: "string",
                                        options: {
                                            input_height: '40px'
                                        }
                                    }
                                }
                            }
                        },
                        replacements_title: {
                            type: "array",
                            format: "table",
                            title: "Replacements Title",
                            uniqueItems: true,
                            options: {
                                disable_collapse: true
                            },
                            items: {
                                type: "object",
                                name: "Row",
                                properties: {
                                    searchRegex: {
                                        type: "string",
                                        options: {
                                            input_height: '40px',
                                            input_width: '600px'
                                        }
                                    },
                                    replaceValue: {
                                        type: "string",
                                        options: {
                                            input_height: '40px'
                                        }
                                    }
                                }
                            }
                        },
                        ignore_app: {
                            type: "array",
                            format: "table",
                            title: "Ignorable Apps",
                            uniqueItems: true,
                            options: {
                                disable_collapse: true
                            },
                            items: {
                                type: "object",
                                name: "Row",
                                properties: {
                                    searchRegex: {
                                        type: "string",
                                        options: {
                                            input_height: '40px',
                                            input_width: '600px'
                                        }
                                    }
                                }
                            }
                        },
                        ignore_title: {
                            type: "array",
                            format: "table",
                            title: "Ignorable Titles",
                            uniqueItems: true,
                            options: {
                                disable_collapse: true
                            },
                            items: {
                                type: "object",
                                name: "Row",
                                properties: {
                                    searchRegex: {
                                        type: "string",
                                        options: {
                                            input_height: '40px',
                                            input_width: '600px'
                                        }
                                    }
                                }
                            }
                        },
                    }
                }
            }
        },
        theme: 'bootstrap4',
        iconlib: 'fontawesome5',
        prompt_before_delete: false,
        disable_edit_json: true,
        disable_properties: true,
        disable_array_delete_last_row: true,
        disable_array_delete_all_rows: true,
        object_layout: 'table',
        startval: {...contentConfig}
    });

    const watcherCallbackAndArrayId = function (path) {
        let pathValue = this.getEditor(path).getValue();
        for (let i = 0; i < pathValue.length; i++) {
            if (!pathValue[i].action_id) {
                pathValue[i].action_id = Math.random().toString().split(".").join("") + Math.random().toString().split(".").join("")
                this.getEditor(path + "." + i).setValue(pathValue)
            }
        }
    }

    editor.watch('root.actions', watcherCallbackAndArrayId.bind(editor, 'root.actions'));


    document.getElementById('submit').addEventListener('click', function () {

        try {
            let parser = editor.getValue();
            browser.storage.local.set(parser)
            document.getElementById('submit').innerText = 'Saving...';
        } catch (e) {
            document.getElementById('submit').innerText = 'Error: Saving.';
        }


        setTimeout(() => {
            document.getElementById('submit').innerText = 'Save Settings';
            location.reload();
        }, 1000);
    });

    document.getElementById('export').addEventListener('click', async function () {
        try {
            let vLink = document.createElement('a'),
                vBlob = new Blob([JSON.stringify(editor.getValue(), null, 4)], {type: "octet/stream"}),
                vName = 'beautifulSNOW_Configuration.json',
                vUrl = window.URL.createObjectURL(vBlob);
            vLink.setAttribute('href', vUrl);
            vLink.setAttribute('download', vName);
            vLink.click();
        } catch (e) {
            console.error(e)
        }
    });
});

document.getElementById('import').addEventListener('click', async function () {

    document.getElementById('import').innerText = 'Importing...';
    // Get the value from the editor
    var [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();

    try {
        browser.storage.local.set(JSON.parse(contents), function () {
            console.log("Files have been saved to SYNC")
        });
        location.reload();
    } catch (e) {
        console.error(e)
        location.reload();
    }

    setTimeout(() => {
        document.getElementById('import').innerText = 'Import Settings';
    }, 1000);

});

document.getElementById("goBack").addEventListener('click', function () {
    for (let i = 0; i < window.history.length; i++) {
        console.log(window.history)
    }
    window.history.go(-2);
    return false;
})