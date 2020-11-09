var editor;

chrome.storage.sync.get(['global_replacements', 'quick_adds'], function (result) {
    let contentConfig = result;

    if (!contentConfig.global_replacements) {
        contentConfig.global_replacements = []
    }
    if (!contentConfig.quick_adds) {
        contentConfig.quick_adds = []
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
                                name: "Code",
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '100px'
                                }
                            },
                            setValue: {
                                name: "Set Value",
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '200px'
                                }
                            },
                            fieldNames: {
                                type: "array",
                                format: "table",
                                title: "Field Names",
                                uniqueItems: true,
                                items: {
                                    type: "string",
                                    name: "",
                                }
                            },
                            keys: {
                                type: "array",
                                format: "table",
                                title: "Keys",
                                uniqueItems: true,
                                items: {
                                    type: "object",
                                    name: "Row",
                                    properties: {
                                        key: {
                                            name: "Key",
                                            type: "string",
                                            options: {
                                                input_height: '40px',
                                                input_width: '100px'
                                            }
                                        },
                                        value: {
                                            name: "Value",
                                            type: "string",
                                            format: "xhtml",
                                            options: {
                                                input_height: '40px',
                                                input_width: '100vh'
                                            }
                                        },
                                    }
                                }
                            },
                        }
                    }
                },
                /*notes: {
                    type: "array",
                    format: "table",
                    title: "Notes",
                    uniqueItems: true,
                    items: {
                        type: "object",
                        name: "Row",
                        properties: {
                            key: {
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '100px'
                                }
                            },
                            name: {
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '400px'
                                }
                            },
                            value: {
                                type: "string",
                                format: "xhtml",
                                options: {
                                    input_height: '40px',
                                    input_width: '100vh'
                                }
                            }
                        }
                    }
                },
                comments: {
                    type: "array",
                    format: "table",
                    title: "Comments",
                    uniqueItems: true,
                    items: {
                        type: "object",
                        name: "Row",
                        properties: {
                            key: {
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '100px'
                                }
                            },
                            name: {
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '400px'
                                }
                            },
                            value: {
                                type: "string",
                                format: "xhtml",
                                options: {
                                    input_height: '40px',
                                    input_width: '100vh'
                                }
                            }
                        }
                    }
                },
                reportingMain: {
                    type: "array",
                    format: "table",
                    title: "Reporting",
                    uniqueItems: true,
                    items: {
                        type: "object",
                        name: "Row",
                        properties: {
                            key: {
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '100px'
                                }
                            },
                            name: {
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '400px'
                                }
                            },
                            value: {
                                type: "string",
                                format: "xhtml",
                                options: {
                                    input_height: '40px',
                                    input_width: '100vh'
                                }
                            }
                        }
                    }
                },
                ifHandler: {
                    type: "array",
                    format: "table",
                    title: "If Handler",
                    uniqueItems: true,
                    items: {
                        type: "object",
                        name: "Row",
                        properties: {
                            key: {
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '100px'
                                }
                            },
                            iftype: {
                                title: "If Type",
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '400px'
                                }
                            },
                            ifvalue: {
                                title: "If Value",
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '100vh'
                                }
                            },
                            elsetype: {
                                title: "Then Type",
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '400px'
                                }
                            },
                            elsevalue: {
                                title: "Then Value",
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '100vh'
                                }
                            }
                        }
                    }
                },
                timers: {
                    type: "array",
                    format: "table",
                    title: "Timers",
                    uniqueItems: true,
                    items: {
                        type: "object",
                        name: "Row",
                        properties: {
                            key: {
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '100px'
                                }
                            },
                            name: {
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '400px'
                                }
                            },
                            value: {
                                type: "string",
                                format: "xhtml",
                                options: {
                                    input_height: '40px',
                                    input_width: '100vh'
                                }
                            },
                            task: {
                                type: "string",
                                options: {
                                    input_height: '40px',
                                    input_width: '300px'
                                }
                            }
                        }
                    }
                },
                additional: {
                    type: "object",
                    title: "Additional Options",
                    properties: {
                        autoRapport: {
                            type: "boolean",
                            title: "Reporting-Help",
                            format: "checkbox"
                        },
                        smartSkype: {
                            type: "boolean",
                            title: "Smart-Skype",
                            format: "checkbox"
                        },
                        executablePath: {
                            type: "string",
                            title: "Executable Path"
                        }
                    }
                }*/
            }
        },
        theme: 'bootstrap4',
        iconlib: 'fontawesome5',
        prompt_before_delete: false,
        disable_edit_json: true,
        disable_properties: true,
        object_layout: 'table',
        startval: {...contentConfig}
    });

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