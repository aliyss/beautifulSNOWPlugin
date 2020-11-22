let navbar_right = document.querySelector("[class='nav navbar-right']")
let limiter = document.getElementById("nav-settings-button")
let header_content = document.createElement("div")
header_content.setAttribute("class", "navpage-header-content")
let new_button = document.createElement("button")
for (const limiterKey in limiter.getAttributeNames()) {
    let attr = limiter.getAttributeNames()[limiterKey]
    if (attr === "sn-modal-show") {

    } else if (attr === "data-original-title" || attr === "aria-label" || attr === "title") {
        new_button.setAttribute(attr, "beautifulSNOW")
    } else {
        console.log(attr, limiter.getAttribute(attr))
        new_button.setAttribute(attr, limiter.getAttribute(attr))
    }
}
new_button.setAttribute("class", "btn btn-icon icon-lightbulb")
new_button.setAttribute("id", "beautifulSNOW_Configuration_Button")
new_button.addEventListener("click", function () {
    for (let i = 0; i < window.frames.length; i++) {
        try {
            if (window.frames[i].name === "gsft_main") {
                window.frames[i].window.location.href = `${window.location.origin}/bSNOW_admin.do`
            }
        } catch (e) {

        }
    }
})
header_content.appendChild(new_button)
if (limiter) {
    navbar_right.insertBefore(header_content, limiter.parentElement.nextElementSibling)
}