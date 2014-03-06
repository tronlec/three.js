// HTML document and Element wrappers/stubs

function Event() {
}

Event.prototype = {
    constructor: Event
}

function HtmlElement() {
}

HtmlElement.prototype = {
    constructor: HtmlElement,

    appendChild: function(child) {
    }
}

function document() {
}

document.createElement = function(type) {
    if (type === "img") {
        return new Image();
    }

    return new HtmlElement();
}

document.createTextNode = function(value) {
    return new HtmlElement();
}
