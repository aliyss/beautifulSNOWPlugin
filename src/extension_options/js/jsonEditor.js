
var editor;
chrome.storage.sync.get(['global_replacements'], function (result) {
    let contentConfig = result;

    editor = new JSONEditor(document.getElementById('editor_holder'), {
        schema:     {
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

        document.getElementById('submit').className = 'btn btn-success';
        document.getElementById('submit').innerText = 'Saving...';

        chrome.storage.sync.set(editor.getValue())

        setTimeout(() => {
            document.getElementById('submit').innerText = 'Save Settings';
            document.getElementById('submit').className = 'btn btn-secondary';
        }, 1000);
    });
});

document.getElementById('import').addEventListener('click',  async function () {

    document.getElementById('import').className = 'btn btn-warning';
    document.getElementById('import').innerText = 'Importing...';
    // Get the value from the editor
    var [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();

    try {
        chrome.storage.sync.set(JSON.parse(contents), function() {
            console.log("Files have been saved to SYNC")
        });
    } catch (e) {
        console.error(e)
        chrome.storage.local.set(JSON.parse(contents), function() {
            console.log("Files have been saved to LOCAL")
        });
    }

    setTimeout(() => {
        document.getElementById('import').innerText = 'Import Settings';
        document.getElementById('import').className = 'btn btn-secondary';
    }, 1000);

});

document.getElementById('export').addEventListener('click',  async function () {
    try {
        chrome.storage.sync.get(['config'], function() {
            console.log("Files have been loaded from SYNC")
        });
    } catch (e) {
        console.error(e)
        chrome.storage.local.get(['config'], function() {
            console.log("Files have been loaded from LOCAL")
        });
    }
});