window.browser = (function () {
	return window.msBrowser ||
		window.browser ||
		window.chrome;
})();

function bSNOW_retrieve_settings(retrievals) {
	return new Promise((resolve, reject) => {
		browser.storage.local.get(retrievals, function (result) {
			resolve(result)
		});
	})
}


(async () => {
	window.addEventListener('load', async () => {

		if (!window.location.origin.endsWith("service-now.com")) {
			return;
		}

		if (document.querySelector("[class='nav navbar-right']")) {
			let scriptGParentCSS = document.createElement('link');
			scriptGParentCSS.id = "u_g_parent_css";
			scriptGParentCSS.type = "text/css";
			scriptGParentCSS.rel = "stylesheet";
			scriptGParentCSS.href = browser.runtime.getURL('extension_contents/css/g_parent.css');

			document.head.appendChild(scriptGParentCSS);

			let scriptGParent = document.createElement('script');
			scriptGParent.id = "u_g_parent";
			scriptGParent.src = browser.runtime.getURL('extension_contents/js/g_parent.js');

			document.body.appendChild(scriptGParent);
		}

		let retrievals = [];

		if (window.location.pathname.toLowerCase() === "/bsnow_admin.do") {

			let scriptGAdmin = document.createElement('script');
			scriptGAdmin.id = "u_g_admin";
			scriptGAdmin.src = browser.runtime.getURL('extension_contents/js/g_admin.js');

			document.body.appendChild(scriptGAdmin);

		} else if (window.name === "gsft_main" || window.name === "") {

			let scriptGForm = document.createElement('script');
			scriptGForm.id = "u_g_form";
			scriptGForm.src = browser.runtime.getURL('extension_contents/js/g_form.js');

			let scriptGLink = document.createElement('script');
			scriptGLink.id = "u_g_link";
			scriptGLink.src = browser.runtime.getURL('extension_contents/js/g_link.js');

			document.head.appendChild(scriptGLink);
			document.body.appendChild(scriptGForm);

			retrievals = ['global_replacements', 'quick_adds', 'quick_add_buttons', 'actions', 'auto_runs', 'advanced_settings', 'activity_watcher'];
		}

		let scriptHeader = document.createElement('script');
		scriptHeader.id = "global_beautiful_snow";

		let bSNOW_settings = {
			runtime: {
				id: browser.runtime.id
			}
		};

		if (retrievals.length > 0) {
			bSNOW_settings = { ...bSNOW_settings, ...await bSNOW_retrieve_settings(retrievals) };
		}

		scriptHeader.textContent += 'var bSNOW_global_settings = ' + JSON.stringify(bSNOW_settings) + ';\n';
		document.head.appendChild(scriptHeader);

	})

})();