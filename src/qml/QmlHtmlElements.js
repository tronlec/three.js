// HTML document and Element wrappers/stubs

function document() {
}

document.createElement = function(type) {
    if (type === "img") {
        return new Image();
    } else if (type === 'div') {
        return new HtmlDiv();
    }

    return new HtmlElement();
}

document.createTextNode = function(value) {
    return new HtmlElement();
}

function Event() {
}

Event.prototype = {
    constructor: Event
}

function HtmlStyle() {
    this.position = undefined;
    this.right = undefined;
    this.top = undefined;
    this.fontSize = undefined;
    this.textAlign = undefined;
    this.background = undefined;
    this.color = undefined;
    this.width = undefined;
    this.width = undefined;
    this.padding = undefined;
    this.zIndex = undefined;
}

function HtmlElement() {
    this.style = new HtmlStyle();
}

HtmlElement.prototype = {
    constructor: HtmlElement,

    appendChild: function(child) {
    }
}

function HtmlDiv() {
    this.innerHTML = "";
    this.style = new HtmlStyle();
}


