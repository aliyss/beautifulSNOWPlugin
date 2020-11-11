var editor;

chrome.storage.sync.get(['global_replacements', 'quick_adds', 'actions', 'quick_add_buttons'], function (result) {
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
    if (!contentConfig.actions) {
        contentConfig.actions = []
    }

    editor = new JSONEditor(document.getElementById('editor_holder'), {
        schema: {
            type: "object",
            title: "⚙ Settings",
            options: {
                input_width: '100vh',
                disable_collapse: true
            },
            properties: {
                global_replacements: {
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
                    items: {
                        type: "object",
                        name: "Row",
                        properties: {
                            action_name: {
                                title: "Action",
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '200px'
                                }
                            },
                            action_id: {
                                title: "Action Id",
                                type: "string",
                                options: {
                                    input_width: "0vh",
                                    hidden: true
                                }
                            },
                            keys: {
                                type: "array",
                                format: "table",
                                title: "Runners",
                                uniqueItems: true,
                                options: {
                                    input_width: '120vh'
                                },
                                items: {
                                    type: "object",
                                    name: "Row",
                                    properties: {
                                        key: {
                                            title: "Field ID",
                                            type: "string",
                                            options: {
                                                input_height: '40px',
                                                input_width: '400px'
                                            }
                                        },
                                        type: {
                                            title: "Field Type",
                                            type: "string",
                                            options: {
                                                input_height: '40px',
                                                input_width: '200px'
                                            },
                                            enumSource: [["val", "ref"]],
                                            default: "val"
                                        },
                                        value: {
                                            title: "Field Value",
                                            type: "string",
                                            format: "xhtml",
                                            options: {
                                                input_height: '40px',
                                                input_width: '100vh'
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
            }
        },
        theme: 'bootstrap4',
        iconlib: 'fontawesome5',
        prompt_before_delete: false,
        disable_edit_json: true,
        disable_properties: true,
        disable_array_reorder: true,
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
            chrome.storage.sync.set(editor.getValue())
            document.getElementById('submit').className = 'btn btn-success';
            document.getElementById('submit').innerText = 'Saving...';
        } catch (e) {
            console.error(e)
            document.getElementById('submit').className = 'btn btn-error';
            document.getElementById('submit').innerText = 'Error: Saving.';
        }


        setTimeout(() => {
            document.getElementById('submit').innerText = 'Save Settings';
            document.getElementById('submit').className = 'btn btn-secondary';
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

    document.getElementById('import').className = 'btn btn-warning';
    document.getElementById('import').innerText = 'Importing...';
    // Get the value from the editor
    var [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();

    try {
        chrome.storage.sync.set(JSON.parse(contents), function () {
            console.log("Files have been saved to SYNC")
        });
        location.reload();
    } catch (e) {
        console.error(e)
        chrome.storage.local.set(JSON.parse(contents), function () {
            console.log("Files have been saved to LOCAL")
        });
        location.reload();
    }

    setTimeout(() => {
        document.getElementById('import').innerText = 'Import Settings';
        document.getElementById('import').className = 'btn btn-secondary';
    }, 1000);

});