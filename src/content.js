function waitForElement(selector) {
    return new Promise(function(resolve, reject) {
        let element = document.querySelector(selector);

        if(element) {
            resolve(element);
            return;
        }

        let observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                let nodes = Array.from(mutation.addedNodes);
                for(let node of nodes) {
                    if(node.matches && node.matches(selector)) {
                        observer.disconnect();
                        resolve(node);
                        return;
                    }
                };
            });
        });

        observer.observe(document.documentElement, { childList: true, subtree: true });
    });
}

(async () => {
    await window.addEventListener('load', async () => {

        if (window.name === "gsft_main" || window.name === "") {

            let scriptGForm = document.createElement('script');
            scriptGForm.id = "u_g_form";
            scriptGForm.src = chrome.runtime.getURL('context/g_form.js');

            let scriptGLink = document.createElement('script');
            scriptGLink.id = "u_g_link";
            scriptGLink.src = chrome.runtime.getURL('context/g_link.js');

            let scriptHeader = document.createElement('script');
            scriptHeader.id = "global_beautiful_snow"

            chrome.storage.sync.get(['global_replacements', 'quick_adds', 'quick_add_buttons', 'actions', 'auto_runs', 'advanced_settings'], function (result) {
                scriptHeader.textContent += 'var bSNOW_global_settings = ' + JSON.stringify(result) + ';\n';
            });

            document.head.appendChild(scriptHeader);
            document.head.appendChild(scriptGLink);
            document.body.appendChild(scriptGForm);

            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                console.log(document.querySelectorAll('#gsft_main')[0] ? document.querySelectorAll('#gsft_main')[0].contentWindow.document.g_form : 'null')
                if (request.method === "getVars")
                    sendResponse({bSnow: bSNOW_global_settings})
            });
        }

    })

})();