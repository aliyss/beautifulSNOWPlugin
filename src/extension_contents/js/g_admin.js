
if (window.location.origin.endsWith("service-now.com")) {
    if (window.location.pathname.toLowerCase() === "/bsnow_admin.do") {
        window.location.href = `chrome-extension://${bSNOW_global_settings.runtime.id}/extension_options/index.html`
    }
}