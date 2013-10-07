// ==UserScript==
// @name          JoeSimmons' Library
// @namespace     http://userscripts.org/users/23652
// @description   A JavaScript library used by JoeSimmons
// @include       *
// @copyright     JoeSimmons
// @version       1.1.6
// @license       http://creativecommons.org/licenses/by-nc-nd/3.0/us/
// @grant         none
// ==/UserScript==



// !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !!

// NOTE: I RECOMMEND YOU VIEW THIS SOURCE CODE IN A MONOSPACED FONT (Courier, Consolas, etc)

// !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !! - !!




/* @ @ @ @ @ @ @ @ @ @ @ @ @   W I K I   @ @ @ @ @ @ @ @ @ @ @ @ @ @ @

                  https://github.com/joesimmons/jsl/wiki/

@ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ */




/* CHANGELOG

1.1.6 (10/7/2013)
    - changed .height() and .width() to .height and .width getters
        e.g., JSL('#foo').height
    - changed .exists to .exists
        e.g., JSL('#foo').exists
    - fixed .attribute()
        it now returns a blank string if you pass it one argument and it
        doesn't find that attribute on any of the elements within
        or the attributes are null

1.1.5 (10/4/2013)
    - added JSL.removeEvent() and .removeEvent()

1.1.4 (10/2/2013)
    - made JSL compatible for browsers without ECMAScript-5 (requires ECMAScript-3 at least)
    - added JSL.each()
    - changed .first() to .prepend()
    - added .first(), .height(), .last(), .prev(), .next(), .width()
        check the wiki for explanations
    - modified .get()
        will take an integer (positive or negative) and return a new JSL object with that single element
    - simplified several methods to shorten code and improve readability
    - changed the init so that if you pass an array of elements as the context,
        it will do a deep search of their children, but not the elements themselves
        e.g., JSL( '#foo', [bar, baz] ) is the same as JSL( [bar, baz] ).find('#foo')
        it will not match bar or baz, but it can match any of their children

1.1.3 (10/1/2013)
    - drastic change. made JSL more similar to jQuery
        the main methods (JSL.runAt, JSL.addScript, etc) are the same but the
        DOM methods are different. the elements are in a wrapper now, like JSL('#foo').show()
        because of the wrapper, JSL.id, JSL.query, & JSL.queryAll are gone
        read the wiki.
    - added add()
    - added an alias to JSL
        JSL can now also be used (by default) by using _J()
        (underscore and upper-case J)
        e.g., _J('#foo').show()
    - added JSL.addEvent
        e.g., JSL.addEvent(elem, 'click', fn);
    - added JSL.loop() ==> will take a function and call it a specified number of times
        e.g., JSL.loop(50, fn);
    - added ability to pass JSL.create a string of HTML and have it return a tree of nodes
    - JSL.xpath now returns an array instead of an XPath snapshot
        except in the case that you want a type like singleNodeValue, stringValue, etc

1.1.2 (9/17/2013)
    - updated JSL.create a little
    - updated JSL.runAt to be shorter and faster
        plus it can now take a custom 'this' value and extra arguments
        to be passed to the callback function

1.1.1 (9/3/2013)
    - added JSL.runAt for running functions at specified dom ready states

1.1.0 (8/30/2013)
    - updated JSL.toArray to work with xpath snapshots as well

1.0.9
    - added JSL.toArray (using Array's slice method works but it's not compatible with all browers)
        it will take whatever you throw at it and convert it to an array
        if it has a '.length' property
            e.g., HTML Collections, Node Lists, the 'arguments' parameter used in functions, etc
    - updated JSL.typeOf to include HTML Collections, Node Lists, and the 'arguments' parameter

1.0.8
    - added JSL.typeOf
        it will return 'array' on arrays, 'null' on null, 'element' on an element
        and the other regular types
    - modified JSL.[after/before/hide/show/remove/replace] to use JSL.elem()
        it will take a string argument and find out if the user wanted
        an xpath expression, a query selector, or an id.
        if the argument isn't a string, it returns itself.
        in the case that the user supplied an element, it will work as usual
            e.g., you can now do JSL.show('root') and it will show the ID 'root'
            you won't need to do JSL.show( JSL.id('root') )    (same for hide, show, remove, etc)
                backwards compatibility supports that older method, though
    - added the ability to rename this library's reference ('JSL')
        it's now dynamic and doesn't rely on the variable name you declare it with.
        you can either includ the source in your code and rename the variable that way,
        or you can simply just do
            var JSLib = JSL;
            'JSLib' in this case can be named whatever you wish

1.0.7
    - fixed JSL.id, JSL.query, and JSL.queryAll.
        there was an unthrown bug before where if the second argument
        was null (falsy), it would run the query from 'document' instead
        of returning null like it should, since the context node was null

1.0.6
    - removed HTMLElement method .before() and .after() because they weren't getting set early enough.
        to fix this, the user would've had to set '@run-at' to 'document-start' on every script.
        I, instead, replaced them with JSL.before() and JSL.after()
        syntax examples are below (as usual), where I define the methods

1.0.5
    - fixed JSL.setInterval
        it now has drift accommodation and works uniformly on all browsers (unlike DOM's setInterval)

1.0.4
    - fixed some problems with adding style attributes in Chrome with create()

1.0.3
    - added short syntax examples for each method
    - added optional context nodes for query(), queryAll(), and id()

1.0.2
    - changed create() back so you have to pass 'text' as the first argument, then your text as the second argument.
            It -will- stay this way
    - added addStyle()
    - added a third argument to addScript(code_string, id, head_node)
            head_node is optional

1.0.1
    - changed create() so if you pass it one argument, a string, it will create that as text

1.0.0
    - created

*/



(function (window, undefined) {

    'use strict'; // use strict mode in ECMAScript-5

    // initialize an array for the [set/clear]Interval methods
    var intervals = [];

    // regular expressions
    var rSelector = /^\*|^\.[a-z][\w\d-]*|^#[^ ]+|^[a-z]+|^\[a-z]+/i;   // matches a CSS selector
    var rXpath = /^\.?\/{1,2}[a-zA-Z\*]+/;                              // matches an XPath selector
    var rHTML = /<[^>]+>/;                                              // matches HTML strings
    var rHyphenated = /-[a-z]/g;                                        // matches hyphenated strings

    // compatibility methods for browsers that
    // don't support ECMAScript-5
    var compat = {
        'arr_indexOf' : function (searchElement, fromIndex) {
            var index = parseInt(fromIndex || 0, 10), len = this.length;
                index = index < 0 ? len + index : index; // handle negative fromIndex
                index = !(index > 0) ? 0 : index; // handle out of range and/or NaN fromIndex

            while (index < len && index >= 0) {
                if (this[index] === searchElement) {
                    return index;
                }
                index += 1;
            }

            return -1;
        },
        /* not used at the moment
        'filter' : function (fn, oThis) {
            var index, value, len = this.length, ret = [];

            for (index = 0; index < len; index += 1) {
                value = this[index];
                if ( fn.call(oThis, value, index, this) ) {
                    ret.push(value);
                }
            }

            return ret;
        },
        */
        'forEach' : function (fn, oThis) {
            var index, len;

            for (index = 0, len = this.length; index < len && index in this; index += 1) {
                fn.call(oThis, this[index], index, this);
            }
        },

        'map' : function (fn, oThis) {
            var index, newArr = [], len;

            for (index = 0, len = this.length; index < len && index in this; index += 1) {
                newArr[index] = fn.call(oThis, this[index], index, this);
            }

            return newArr;
        },

        'reduce' : function (fn, initialValue) {
            var index, len, value, isValueSet = false;

            if (arguments.length > 1) {
                value = initialValue;
                isValueSet = true;
            }

            for (index = 0, len = this.length; index < len; index += 1) {
                if (isValueSet) {
                    value = fn(value, this[index], index, this);
                } else {
                    value = this[index];
                    isValueSet = true;
                }
            }

            return value;
        }
    };

    // gets a method from an object's prototype. returns undefined if it fails
    var getMethod = function (obj, method) {
        var uObj = obj;

        if (typeof XPCNativeWrapper === 'function' && typeof XPCNativeWrapper.unwrap === 'function') {
            uObj = XPCNativeWrapper.unwrap(obj);
        } else if (obj.wrappedJSObject) {
            uObj = obj.wrappedJSObject;
        }

        if (uObj.prototype && typeof uObj.prototype[method] === 'function') {
            return uObj.prototype[method];
        }
    };

    // original methods for some common uses
    var core = {
        // array
        'concat' : getMethod(Array, 'concat'),
        'filter' : getMethod(Array, 'filter') || compat.filter,
        'forEach' : getMethod(Array, 'forEach') || compat.forEach,
        'arr_indexOf' : getMethod(Array, 'indexOf') || compat.arr_indexOf,
        'map' : getMethod(Array, 'map') || compat.map,
        'reduce' : getMethod(Array, 'reduce') || compat.reduce,
        'slice' : getMethod(Array, 'slice'),

        // object
        'hasOwnProperty' : getMethod(Object, 'hasOwnProperty'),
        'toString' : getMethod(Object, 'toString'),
    };

    var JSL = function JSL(selector, context) {
        return new JSL.fn.init(selector, context);
    };

    // a simple class for dealing with event listener handlers
    var handlers = {
        stack : [],

        add : function (thisElement, type, fn) {
            this.stack.push({
                element : thisElement,
                type : type,
                fn : fn
            });
        },

        get : function (thisElement, type) {
            var events = [];
                type = typeof type === 'string' ? type : '*';

            JSL.each(this.stack, function (thisEventObj) {
                if (thisElement === thisEventObj.element) {
                    if (type === '*' || thisEventObj.type === type) {
                        events.push(thisEventObj);
                    }
                }
            });

            return events;
        },

        remove : function (thisElement, type) {
            var handlerIndices = [], that = this;

            // find all the indices of what we need to remove
            JSL.each(handlers.get(thisElement, type), function (thisEventObj, index, array) {
                handlerIndices.push(
                    core.arr_indexOf.call(that.stack, thisEventObj)
                );
            });

            // remove all the indices here, using a separate array of indices
            // we can't do this as we loop over the (stack) array itself, because
            // we would be removing values as they are being iterated through
            JSL.each(handlerIndices, function (thisIndex) {
                that.stack.splice(thisIndex, 1);
            });
        }
    };

    // walkTheDom by Douglas Crockford
    function walkTheDom(node, func) {
        func(node);
        node = node.firstChild;

        while (node) {
            walkTheDom(node, func);
            node = node.nextSibling;
        }
    }

    // can pluck a key out of an object
    function pluck(obj) {
        var subs = this.split('.'),
            ret = obj, i;

        for (i = 0; i < subs.length; i += 1) {
            ret = ret[ subs[i] ];
            if (ret == null) {
                return '';
            }
        }

        return ret;
    }

    function sumInt(a, b) {
        return parseInt(a, 10) + parseInt(b, 10);
    }

    // internal function for throwing errors, so the user gets
    // some sort of hint as to why their operation failed
    function error(content) {
        var errorString = '!! - ' + content + ' - !!', method;

        if ( content && (typeof content === 'string' || typeof content === 'number') ) {
            if ('Error' in window) {
                throw new Error(errorString);
            } else if ( 'console' in window && (typeof console.error === 'function' || typeof console.error === 'function') ) {
                method = console.log || console.error;
                method.call(console, errorString);
            }
        }
    }

    // will copy an element and return a new copy with
    // the same event listeners
    function cloneElement(thisElement) {
        var newElement = thisElement.cloneNode(true);

        // clone event listeners of element
        JSL.each(handlers.get(thisElement), function (thisEventObj) {
            JSL.addEvent(newElement, thisEventObj.type, thisEventObj.fn);
        });

        return newElement;
    }

    // handles passed HTML strings. either creates node trees or text nodes
    function handleHTMLcreation(passedElement) {
        if (typeof passedElement === 'string') {
            if ( rHTML.test(passedElement) ) {
                return JSL.create(passedElement);
            } else {
                return JSL.create('text', passedElement);
            }
        }

        // return what was passed, if it wasn't a string
        return passedElement;
    }

    // this will add all the childNodes of the
    // passed document fragment to 'arrayToAddTo'
    // if not a document fragment, it will just add that element to 'arrayToAddTo'
    function addNewReturnElements(newElement, arrayToAddTo) {
        if (newElement.nodeType === 11) {
            JSL.each(newElement.childNodes, function (thisNewElement) {
                arrayToAddTo.push(thisNewElement);
            });
        } else {
            arrayToAddTo.push(newElement);
        }
    }

    function getEachElements(array, selector, key, type) {
        var newElementsArray = [],
            isValidSelector = typeof selector === 'string' && selector.trim() !== '';

        JSL.each(array, function (currentElement) {
            while ( currentElement = currentElement[key] ) { // note: intentional assignment
                if (type > 0 ? currentElement.nodeType === type : true) {
                    if ( isValidSelector === false || JSL(currentElement).filter(selector).exists ) {
                        newElementsArray.push(currentElement);
                        return;
                    }
                }
            }
        });

        return newElementsArray;
    }

    // define JSL's prototype, aka JSL.fn
    JSL.fn = JSL.prototype = {
        isJSL : true,
        constructor : JSL,
        length : 0,
        version : '1.1.5',

        // similar to jQuery. JSL is just the init constructor
        init : function (selector, context) {
            var that = this, elems = [];

            if (typeof selector === 'string') {
                if ( rXpath.test(selector) ) {
                    elems = JSL.xpath({expression : selector, type : 7, context : context});
                } else if ( rHTML.test(selector) ) {
                    // reserved for html code creation
                    // not sure if I want to implement it
                } else if ( rSelector.test(selector) ) {
                    if (JSL.typeOf(context) === 'array') {
                        // handle an array being passed as the context
                        return that.find.call(context, selector);
                    } else {
                        // handle a regular element being passed as the context
                        context = context != null && context.querySelectorAll ? context : document;
                        elems = context.querySelectorAll(selector);
                    }
                }
            } else if (typeof selector === 'object' && selector != null) {
                if (selector.isJSL === true) {
                    return selector;
                } else if ( core.hasOwnProperty.call(selector, 'length') ) {
                    elems = selector;
                } else {
                    elems = [selector];
                }
            }

            // define the length property of our object wrapper
            that.length = elems.length;

            // bind the elements to array-like key:value pairs in our wrapper
            // e.g., this[0] ==> element
            JSL.each(elems, function (value, index) {
                that[index] = value;
            });

            return that;
        },

        add : function (selector) {
            var newElements = JSL(selector).raw(),
                allElements = this.raw().concat(newElements);
            return JSL(allElements);
        },

        addEvent : function (type, fn) {
            return this.each(function (thisElement) {
                JSL.addEvent(thisElement, type, fn);
            });
        },

        after : function (passedElement) {
            var newElementsArray = [];
                passedElement = handleHTMLcreation(passedElement);

            // filter null/undefined values
            if (passedElement != null) {
                this.each(function (element) {
                    var newElement = cloneElement(passedElement),
                        parent = element.parentNode,
                        next = element.nextSibling;

                    if (parent) {
                        // add the new elements to the new elements array
                        // this is so that what's returned is a JSL object
                        // containing the new elements, not the old ones
                        addNewReturnElements(newElement, newElementsArray);

                        if (next) {
                            // add the newElement after the current element
                            parent.insertBefore(newElement, next);
                        } else {
                            // nextSibling didn't exist. just append to its parent
                            parent.appendChild(newElement);
                        }
                    }
                });
            }

            return JSL(newElementsArray);
        },

        append : function (passedElement) {
            var newElementsArray = [];
                passedElement = handleHTMLcreation(passedElement);

            // filter null/undefined values
            if (passedElement != null) {
                this.each(function (thisElement) {
                    var newElement = cloneElement(passedElement);

                    // add the new elements to the new elements array
                    // this is so that what's returned is a JSL object
                    // containing the new elements, not the old ones
                    addNewReturnElements(newElement, newElementsArray);

                    thisElement.appendChild(newElement);
                });
            }

            return JSL(newElementsArray);
        },

        attribute : function (name, value) {
            var ret = '', valueIsString = typeof value === 'string';

            if ( typeof name === 'string' && this.exists ) {
                    this.each(function (elem) {
                        if (valueIsString) {
                            elem.setAttribute(name, value);
                        } else {
                            ret += elem.getAttribute(name) || '';
                        }
                    });
            }

            return valueIsString ? this : ret;
        },

        before : function (passedElement) {
            var newElementsArray = [];
                passedElement = handleHTMLcreation(passedElement);

            // filter null/undefined values
            if (passedElement != null) {
                this.each(function (element) {
                    var newElement = cloneElement(passedElement),
                        parent = element.parentNode;

                    if (parent) {
                        // add the new elements to the new elements array
                        // this is so that what's returned is a JSL object
                        // containing the new elements, not the old ones
                        addNewReturnElements(newElement, newElementsArray);

                        // add the newElement before the current element
                        parent.insertBefore(newElement, element);
                    }
                });
            }

            return JSL(newElementsArray);
        },

        clone : function () {
            // TO DO
        },

        css : function (name, value) {
            if (typeof name === 'string') {
                name = name.toLowerCase().replace(rHyphenated, function (thisMatch) {
                    return thisMatch.substring(1).toUpperCase();
                });

                if (typeof value === 'string') {
                    return this.each(function (thisElement) {
                        if (name in thisElement.style) {
                            thisElement.style[name] = value;
                        }
                    });
                } else {
                    return core.map.call(this, pluck, 'style.' + name).join('');
                }
            }

            // return JSL object if name isn't a string
            return this;
        },

        each : function (fn, oThis) {
            if (this.length > 0) {
                JSL.each(this, fn, oThis);
            }
            return this;
        },

        get exists() {
            return this.length > 0 && this[0] != null;
        },

        filter : function (selector) {
            var newElementsArray = [];

            if ( typeof selector === 'string' && rSelector.test(selector) ) {
                JSL.each(this, function (thisElement) {
                    var docFrag = document.createDocumentFragment(),
                        thisElementClone = thisElement.cloneNode(false); // non-deep search
                        docFrag.appendChild(thisElementClone);

                    if ( docFrag.querySelector(selector) ) {
                        newElementsArray.push(thisElement);
                    }
                });

                return JSL(newElementsArray);
            }

            return null;
        },

        find : function (selector) {
            var arrayOfMatchesArrays = core.map.call(this, function (thisElement) {
                var matches = thisElement.querySelectorAll(selector);
                return JSL.toArray(matches);
            });
            var singleArrayOfMatches = arrayOfMatchesArrays.length > 0 ? core.reduce.call(arrayOfMatchesArrays, function (a, b) {
                return a.concat(b);
            }) : [];

            return JSL(singleArrayOfMatches);
        },

        first : function () {
            return this.get(0);
        },

        get : function (index) {
            index = index === 'first' ? 0 : index === 'last' ? -1 : parseInt(index, 10);

            if ( !isNaN(index) ) {
                return JSL( index < 0 ? this[this.length + index] : this[index] );
            }

            return JSL.toArray(this);
        },

        get height() {
            var arrayOfElemHeights = core.map.call(this, pluck, 'offsetHeight');
            return core.reduce.call(arrayOfElemHeights, sumInt);
        },

        hide : function () {
            return this.css('display', 'none');
        },

        is : function (selector) {
            return this.filter(selector).exists;
        },

        last : function (selector) {
            return this.get(-1);
        },

        next : function (selector) {
            return JSL( getEachElements(this, selector, 'nextSibling', 1) );
        },

        parent : function (selector) {
            return JSL( getEachElements(this, selector, 'parentNode', 1) );
        },

        prepend : function (passedElement) {
            var newElementsArray = [];
                passedElement = handleHTMLcreation(passedElement);

            // filter null/undefined values
            if (passedElement != null) {
                this.each(function (thisElement) {
                    var newElement = cloneElement(passedElement),
                        firstChild = thisElement.firstChild;

                    if (firstChild) {
                        // add the new elements to the new elements array
                        // this is so that what's returned is a JSL object
                        // containing the new elements, not the old ones
                        addNewReturnElements(newElement, newElementsArray);

                        // add the newElement before the current element's first child
                        thisElement.insertBefore(newElement, firstChild);
                    }
                });
            }

            return JSL(newElementsArray);
        },

        prev : function (selector) {
            return JSL( getEachElements(this, selector, 'previousSibling', 1) );
        },

        raw : function () {
            return [].slice.call(this, 0);
        },

        remove : function () {
            return this.each(function (element) {
                var parent = element.parentNode;
                if (element && parent) {
                    parent.removeChild(element);
                }
            });
        },

        removeEvent : function (type) {
            return this.each(function (thisElement) {
                JSL.removeEvent(thisElement, type);
            });
        },

        replace : function (passedElement) {
            var newElementsArray = [];
                passedElement = handleHTMLcreation(passedElement);

            this.each(function (element, index) {
                var newElement = cloneElement(passedElement),
                    parent = element.parentNode;

                if (element && parent) {
                    // add the new elements to the new elements array
                    // this is so that what's returned is a JSL object
                    // containing the new elements, not the old ones
                    addNewReturnElements(newElement, newElementsArray);

                    parent.replaceChild(newElement, element);
                }
            }, this);

            return JSL(newElementsArray);
        },

        show : function (value) {
            value = typeof value === 'string' && value !== '' ? value : 'inline';
            return this.css('display', value);
        },
        
        text : function (passedText, append) {
            // handle setting text
            if (typeof passedText === 'string') {
                if (append !== true) {
                    this.each(function (thisElement) {
                        walkTheDom(thisElement, function (thisChildElement) {
                            if (thisChildElement.nodeType === 3) {
                                thisChildElement.nodeValue = '';
                            }
                        });
                    });
                }

                this.append( JSL.create('text', passedText) );

                return this;
            }

            // handle getting text
            return core.map.call(this, pluck, 'textContent').join('').trim();
        },

        toggle : function () {
            return this.each(function (thisElement) {
                thisElement.style.display === 'none' ? JSL(this).show() : JSL(this).hide();
            });
        },

        get visible() {
            // TO DO
        },

        get width() {
            return core.reduce.call( core.map.call(this, pluck, 'offsetWidth'), sumInt);
        },
    };

    // give the init function the JSL prototype for later instantiation
    JSL.fn.init.prototype = JSL.fn;

    // extend method. can extend any object it's run upon
    JSL.fn.extend = JSL.extend = function (obj) {
        var name, copy;

        for (name in obj) {
            copy = obj[name];

            if ( !core.hasOwnProperty.call(this, name) && typeof copy !== 'undefined' ) {
                this[name] = copy;
            }
        }
    };

    // these methods will get added directly to 'JSL'
    JSL.extend({
        addEvent : function (thisElement, type, fn) {
            if (thisElement != null && typeof type === 'string' && typeof fn === 'function') {
                if (typeof thisElement.addEventListener === 'function') {
                    thisElement.addEventListener(type, fn, false);
                } else if (typeof thisElement.attachEvent === 'function') {
                    type = 'on' + type;
                    thisElement.attachEvent(type, fn);
                } else {
                    return;
                }

                handlers.add(thisElement, type, fn);
            }
        },

        // adds a script tag to the page
        // syntax: JSL.addScript( 'var x = 0;' , null , head_node )
        // 2nd argument required but technically optional. it will set the ID of the script tag. pass it null if you want a random ID
        // 3rd argument optional. it will add the style tag to the head if omitted
        addScript : function (contents, id, node) {
            var newElement = document.createElement('script');
            newElement.id = id || ( 'jsl-script-' + JSL.random(999) );
            newElement.innerHTML = contents;

            node = node || document.head || document.querySelector('html > head');
            node.appendChild(newElement);

            return {
                remove : function () {
                    node.removeChild(newElement);
                }
            };
        },

        // adds a style to the node you want, or the head node of the current document
        // syntax: JSL.addStyle( '.classname { color: red; }' , document )
        // 2nd argument is optional
        // 3rd argument is optional
        addStyle : function (css, id, node) {
            id = id || ( 'jsl-style-' + JSL.random(999) );
            node = node || document.head || document.querySelector('html > head');
            if (node) {
                node.appendChild(
                    JSL.create('style', {id : id, type : 'text/css'}, [ JSL.create('text', css) ] )
                );
            }
        },

        clearInterval : function (index) {
            if (typeof index === 'number' && index < intervals.length) {
                window.clearTimeout( intervals[index] );
                intervals[index] = null;
            }
        },

        // return a created element
        // syntax: JSL.create( 'div' , {id : 'some_id', style : 'color: red;' }, [ create('text', 'This is a red div') ] )
        // 1st argument: the tag name of the element you wish to create. OR 'text' and a text node will be created with the 2nd argument's text
        // 2nd argument (optional): an object with attributes to set to the element
        // 3rd argument (optional): an array of children, created with this function, to be added to the element
        create : function (elementName, descObj, kidsArray) {
            var prop, val, HTMLholder, documentFragment, ret;

            // handle text node creation
            // and HTML strings
            if (elementName === 'text' && typeof descObj === 'string') {
                return document.createTextNode(descObj);
            } else if ( typeof elementName === 'string' && rHTML.test(elementName) ) {
                // take the HTML string and put it inside a div
                HTMLholder = document.createElement('div');
                HTMLholder.innerHTML = elementName;

                // create a document fragment, and add each of the div's children into the document fragment
                // it would be similar to modifying documentFragment.innerHTML, if it were possible
                documentFragment = document.createDocumentFragment();
                JSL.each(HTMLholder.childNodes, function (child) {
                    documentFragment.appendChild( child.cloneNode(true) );
                });

                return documentFragment;
            }

            ret = document.createElement(elementName + '');

            if (typeof descObj === 'object') {
                for (prop in descObj) {
                    if ( core.hasOwnProperty.call(descObj, prop) ) {
                        val = descObj[prop];
                        if (prop.indexOf('on') === 0 && typeof val === 'function') {
                            JSL.addEvent(ret, prop.substring(2), val);
                        } else if ( prop in ret && typeof ret[prop] !== 'undefined' ) {
                            ret[prop] = val;
                        } else {
                            ret.setAttribute(prop, val);
                        }
                    }
                }
            }

            if (JSL.typeOf(kidsArray) === 'array') {
                JSL.each(kidsArray, function (kid) {
                    if (typeof kid === 'string') {
                        ret.appendChild( JSL.create(kid) );
                    } else if (typeof kid === 'object') {
                        ret.appendChild(kid);
                    }
                });
            }

            return ret;
        },

        each : function (passedArray, fn, oThis) {
            core.forEach.call(passedArray, function (value, index, array) {
                var otherThis = typeof oThis !== 'undefined' ? oThis : value;
                fn.call(otherThis, value, index, array);
            }, oThis);
        },

        loop : function (maxIterations, fn) {
            var args = JSL.toArray(arguments), i;

            if (maxIterations > 0 && fn) {
                args = [].slice.call(args, 2);
                for (i = 0; i < maxIterations; i += 1) {
                    fn.apply(null, args);
                }
            }
        },

        // return a random integer between 0 and max
        // syntax: JSL.random( 50 )
        random : function (maxInteger) {
            var rand = 0;

            while (rand <= 0 || rand > maxInteger) {
                rand = Math.floor( Math.random() * maxInteger ) + 1;
            }

            return rand;
        },

        removeEvent : function (thisElement, type) {
            JSL.each(handlers.get(thisElement, type), function (thisEventObj) {
                if (typeof thisElement.removeEventListener === 'function') {
                    //alert( obj_toString(thisEventObj) );
                    thisEventObj.element.removeEventListener(thisEventObj.type, thisEventObj.fn, false);
                } else if (typeof thisElement.detachEvent === 'function') {
                    type = 'on' + type;
                    thisEventObj.element.detachEvent(thisEventObj.type, thisEventObj.fn);
                }

                //handlers.remove(thisElement, type);
            });
        },

        // run a function at a specified document readyState
        // syntax: JSL.runAt( 'complete', someFunc [, thisValue] [, ...otherArguments] );
        runAt : function (state, func, oThis) {
            var args = JSL.toArray(arguments), intv,

                // compose a list of the 4 states, to use .indexOf() upon later
                states = ['uninitialized', 'loading', 'interactive', 'complete'],

                // in-case they pass [start/end] instead of [loading/complete]
                state = state.replace('start', 'loading').replace('end', 'complete');

            // this will run their function with the specified arguments, if any,
            // and a custom 'this' value, if specified
            function runFunc() {
                func.apply( oThis, args.slice(3) );
            }

            // this will run on each state change if the specified state is
            // not achieved yet. it will run their function when it is achieved
            function checkState() {
                if (document.readyState === state) {
                    runFunc();
                    JSL.clearInterval(intv);
                }
            }

            if ( core.arr_indexOf.call(states, state) <= core.arr_indexOf.call(states, document.readyState) ) {
                // we are at, or have missed, our desired state
                // run the specified function
                runFunc();
            } else {
                intv = JSL.setInterval(checkState, 200);
            }
        },

        // setInterval is unreliable. this is a replacement for it using setTimeout with drift accomodation
        // syntax: JSL.setInterval(func, delay)
        // runs exactly like a real setInterval, but it's based on setTimeout, which is more reliable
        setInterval : function (func, delay) {
            var index = intervals.length,
                delay_orig = delay,
                count = 1, startTime;

            function doRe(func, delay) {
                return window.setTimeout(function () {
                    // drift accomodation
                    var difference = ( new Date().getTime() ) - startTime,
                        correctTime = delay_orig * count,
                        drift = difference - correctTime;

                    // execute the function before setting a new timeout
                    func.call(null);

                    // fix for when a timeout takes longer than double the original delay time to execute
                    if (drift > delay_orig) {
                        drift = delay_orig;
                    }

                    // save the reference of the new timeout in our 'intervals' stack
                    if (intervals[index] !== null) {
                        intervals[index] = doRe(func, delay_orig - drift);
                    }

                    count += 1;
                }, delay);
            }

            startTime = new Date().getTime();
            intervals[index] = doRe(func, delay_orig);

            return index;
        },

        // converts a list of some sort to an array (e.g., NodeList, HTMLCollection, 'arguments' parameter, xpath snapshots, etc)
        // syntax: JSL.toArray( some_list )
        toArray : function (arr) {
            var newArr = [], // new array to store the values into
                len = arr.length || arr.snapshotLength,
                item, i;

            if (typeof len === 'number' && len > 0) {
                if (typeof arr.snapshotItem === 'function') {
                    for (i = 0; ( item = arr.snapshotItem(i) ); i += 1) {
                        newArr.push(item);
                    }
                } else {
                    // if the specified 'list' is array-like, use slice on it
                    // to convert it to an array
                    newArr = [].slice.call(arr, 0);
                }

                return newArr;
            }

            return [];
        },

        // typeOf by Douglas Crockford. modified by JoeSimmons
        typeOf : function (value) {
            var s = typeof value,
                ostr = core.toString.call(value);
            if (s === 'object') {
                if (value) {
                    if (ostr === '[object Array]') {
                        s = 'array';
                    } else if (ostr.indexOf('Element]') !== -1) {
                        s = 'element';
                    } else if (ostr === '[object HTMLCollection]') {
                        s = 'collection';
                    } else if (ostr === '[object NodeList]') {
                        s = 'nodelist';
                    } else if (ostr === '[object Arguments]') {
                        s = 'arguments';
                    }
                } else {
                    s = 'null';
                }
            }
            return s;
        },

        // return an xpath result    (type + context are optional)
        // syntax: JSL.xpath( { expression : '//a', type : 6, context : document } )
        xpath : function (obj) {
            var type = obj.type || 7,
                types = {
                    '1' : 'numberValue',
                    '2' : 'stringValue',
                    '3' : 'booleanValue',
                    '8' : 'singleNodeValue',
                    '9' : 'singleNodeValue'
                },
                expression = obj.expression,
                context = obj.context || document,
                doc = context.evaluate ? context : document,
                xp = doc.evaluate(expression, context, null, type, null);

            if (!expression) {
                error('An expression must be supplied for JSL.xpath()');
                return null;
            }

            if ( types[type] ) {
                return xp[ types[ type ] ];
            } else {
                return JSL.toArray(xp);
            }
        }
    });

    // assign JSL to the window object
    window.JSL = window._J = JSL;

}(window));