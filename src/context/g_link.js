function handleTextNode(textNode, currentDocument) {
    if (textNode.parentNode.nodeName === "TEXTAREA" ||
        textNode.parentNode.nodeName === 'SCRIPT'
        || textNode.parentNode.nodeName === 'STYLE'
    ) {
        return;
    }
    let origText = textNode.textContent;
    if (!bSNOW_global_settings && bSNOW_global_settings.global_replacements) {
        return;
    }
    for (let i = 0; i < bSNOW_global_settings.global_replacements.length; i++) {
        let mainReplacement = bSNOW_global_settings.global_replacements[i];
        let newHtml = origText.replace(new RegExp(mainReplacement.searchRegex, "g"), function (m) {
            return `<${mainReplacement.replaceValue.tag} 
                    ${mainReplacement.replaceValue.attribute.replace('<default>', m)}
                >${mainReplacement.replaceValue.content.replace('<default>', m)}</${mainReplacement.replaceValue.tag}>`;
        });
        if (newHtml !== origText) {
            let newSpan = currentDocument.createElement('span');
            newSpan.innerHTML = newHtml;
            textNode.parentNode.replaceChild(newSpan, textNode);
            return;
        }
    }
}

class u_g_link {

    currentDocument;
    replacementPolitics;

    constructor(currentDocument) {
        this.currentDocument = currentDocument;
        this.processDocument()
    }

    processDocument() {
        let treeWalker = this.currentDocument.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                if (node.textContent.length === 0) {
                    return NodeFilter.FILTER_SKIP;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }, false);

        let nodeList = [];
        while (treeWalker.nextNode()) {
            nodeList.push(treeWalker.currentNode);
        }

        for (let i = 0; i < nodeList.length; i++) {
            handleTextNode(nodeList[i], this.currentDocument);
        }
    }

}

new u_g_link(document)
