'use strict';
const dom = {
    createNewElement({
        id = '',
        content = '',
        type = 'div',
        parent = false,
        classes = [],
        attr = {},
        listeners = {},
        styles = {},
        append = true,
    } = {}) {
        let newElement = document.createElement(type);
        if (id) newElement.id = id;
        if (content) newElement.innerHTML = content;
        if (classes.length) newElement.className = classes.join(' ');
    
        Object.entries(attr).forEach(el => newElement.setAttribute(...el));
        Object.entries(listeners).forEach(el => newElement.addEventListener(...el));
        Object.entries(styles).forEach(style => newElement.style[style[0]] = style[1]);
    
        if (parent) {
            if (!append && parent.children.length) parent.prepend(newElement);
            else parent.append(newElement);
        }
    
        return newElement;
    },

    $ (selector) {return document.querySelector ( selector )},
    $$ (selector) {return document.querySelectorAll ( selector )},
}

export default dom;
export let $ = dom.$;
export let createNewElement = dom.createNewElement;        