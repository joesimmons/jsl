// ==UserScript==
// @name          JoeSimmons' Library
// @namespace     http://userscripts.org/users/23652
// @description   A JavaScript library used by JoeSimmons
// @include       *
// @copyright     JoeSimmons
// @version       1.1.3
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

1.1.3 (9/20/2013)
    - added an alias to JSL
        JSL can now also be used (by default) by using _J()
        (underscore and upper-case J)
        e.g., _J('#foo').show()
    - drastic change. made JSL more similar to jQuery
        the main methods (JSL.runAt, JSL.addScript, etc) are the same but the
        DOM methods are different. the elements are in a wrapper now, like JSL('#foo').show()
        read the wiki.
    - added JSL.loop() ==> will take a function and call it a specified number of times
        e.g., JSL.loop(50, fn);
    - added ability to pass JSL.create a string of HTML and have it return a tree of elements
    - modified JSL.xpath to return an array if multiple elements are found

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

    // get an unwrapped window object. sometimes necessary for user scripts
    var win = function (elem) {
        if (typeof XPCNativeWrapper === 'function' && typeof XPCNativeWrapper.unwrap === 'function') {
            return XPCNativeWrapper.unwrap(elem);
        } else if (elem.wrappedJSObject) {
            return elem.wrappedJSObject;
        }
        return elem;
    }(window);

    var intervals = []; // initialize an array for the [set/clear]Interval methods
    var rSelector = /^\*$|^\.[a-zA-Z][a-zA-Z0-9-_]*|^#[^ ]+|^[a-zA-Z]+/; // RegExp for matching a CSS selector
    var rXpath = /^\.?\/{1,2}[a-zA-Z\*]+/; // RegExp for matching an XPath selector
    var rHTML = /<[^>]+>/; // RegExp for matching HTML strings

    // original methods for some common uses
    var core = {
        'slice' : Array.prototype.slice,
        'forEach' : Array.prototype.forEach,
        'map' : Array.prototype.map,
        'toString' : Object.prototype.toString,
        'getAttribute' : Element.prototype.getAttribute,
        'setAttribute' : Element.prototype.setAttribute,
        'hasAttribute' : Element.prototype.hasAttribute,
        'appendChild' : Node.prototype.appendChild,
        'removeChild' : Node.prototype.removeChild,
        'replaceChild' : Node.prototype.replaceChild,
        'insertBefore' : Element.prototype.insertBefore,
        'addEventListener' : EventTarget.prototype.addEventListener,
        'attachEvent' : EventTarget.prototype.attachEvent,
        'cloneNode' : Node.prototype.cloneNode
    };

    var JSL = function (selector, context) {
        return new JSL.fn.init(selector, context);
    };

    // a simple class for dealing with event listener handlers
    var handlers = {
        'stack' : [],

        'get' : function (elem) {
            var events = [];

            core.forEach.call(handlers.stack, function (thisEventObj) {
                if (thisEventObj.element === elem) {
                    events.push(thisEventObj);
                }
            });

            return events;
        },

        'add' : function (thisEventObj) {
            handlers.stack.push(thisEventObj);
        }
    };

    // internal function for throwing errors, so the user gets
    // some sort of hint as to why their operation failed
    function error(content) {
        var errorString = '!! - ' + content + ' - !!';

        if ( content && (typeof content === 'string' || typeof content === 'number') ) {
            if ('Error' in win) {
                throw new Error(errorString);
            } else if ( 'console' in win && (typeof console.error === 'function' || typeof console.error === 'function') ) {
                (console.log || console.error)(errorString);
            }
        }
    }

    // will copy an element and return a new copy with
    // the same event listeners
    function cloneElement(element) {
        var newElement = core.cloneNode.call(element, true);

        // clone event listeners of element
        core.forEach.call(handlers.get(element), function (thisEventObj) {
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

    // semi-pure function for changing the display style of an element
    function changeStyleDisplay(element) {
        element.style.display = this;
    }

    // function for attaching an event listener
    function addListener(elem, type, fn) {
        var method = core.addEventListener || core.attachEvent;

        method.call(elem, type, function () {
            return fn.apply(elem, arguments);
        }, false);
    }

    // define JSL's prototype, aka JSL.fn
    JSL.fn = JSL.prototype = {
        isJSL : true,
        constructor : JSL,
        length : 0,

        // similar to jQuery. JSL is just the init constructor
        init : function (selector, context) {
            var that = this, elems = [];

            if (typeof selector === 'string') {
                if ( rSelector.test(selector) ) {
                    elems = document.querySelectorAll(selector);
                } else if ( rXpath.test(selector) ) {
                    elems = JSL.xpath({expression : selector, type : 7});
                } else if ( rHTML.test(selector) ) {
                    // code
                }
            } else if (typeof selector === 'object') {
                if (selector.isJSL === true) {
                    return selector;
                } else {
                    elems = [selector];
                }
            }

            if (elems.length > 0) {

                // define the length property of our object wrapper
                that.length = elems.length;

                // bind the elements to array-like key:value pairs in our wrapper
                // e.g., this[0] ==> element
                core.forEach.call(elems, function (value, index) {
                    that[index] = value;
                });

            }

            return that;
        },

        addEvent : function (type, fn) {
            JSL.addEvent(this, type, fn);
            return this;
        },

        after : function (passedElement) {
            passedElement = handleHTMLcreation(passedElement);

            // filter null/undefined values
            if (passedElement != null) {
                this.each(function (element) {
                    var newElement = cloneElement(passedElement),
                        parent = element.parentNode,
                        next = element.nextSibling;

                    if (parent && next) {
                        // add the newElement after the current element, if possible
                        core.insertBefore.call(parent, newElement, next);
                    } else if (parent) {
                        // nextSibling didn't exist. just append to its parent
                        core.appendChild.call(parent, newElement);
                    }
                });
            }

            return this;
        },

        append : function (passedElement) {
            passedElement = handleHTMLcreation(passedElement);

            // filter null/undefined values
            if (passedElement != null) {
                this.each(function (element) {
                    var newElement = cloneElement(passedElement);
                    core.appendChild.call(element, newElement);
                });
            }

            return this;
        },

        attribute : function (name, value) {
            if (typeof name === 'string' && this.length > 0) {
                if (typeof value === 'string') {
                    // handle setting attributes
                    this.each(function (elem) {
                        core.setAttribute.call(elem, name, value);
                    });
                } else {
                    // handle getting attributes
                    return core.getAttribute.call(this[0], name);
                }
            }

            return this;
        },

        before : function (passedElement) {
            passedElement = handleHTMLcreation(passedElement);

            // filter null/undefined values
            if (passedElement != null) {
                this.each(function (element) {
                    var newElement = cloneElement(passedElement),
                        parent = element.parentNode;

                    if (parent) {
                        // add the newElement before the current element, if possible
                        core.insertBefore.call(parent, newElement, element);
                    }
                });
            }

            return this;
        },

        each : function (fn, oThis) {
            core.forEach.call(this, fn, oThis);
            return this;
        },

        exists : function () {
            return ('0' in this);
        },

        hide : function () {
            return this.each(changeStyleDisplay, 'none');
        },

        raw : function () {
            return core.slice.call(this, 0);
        },

        remove : function () {
            return this.each(function (element) {
                var parent = element.parentNode;
                if (element && parent) {
                    core.removeChild.call(parent, element);
                }
            });
        },

        replace : function (passedElement) {
            passedElement = handleHTMLcreation(passedElement);

            return this.each(function (element, index) {
                var newElement = cloneElement(passedElement),
                    parent = element.parentNode;
                if (element && parent) {
                    core.replaceChild.call(parent, newElement, element);
                    this[index] = newElement;
                }
            }, this);
        },

        show : function () {
            return this.each(changeStyleDisplay, '');
        },
        
        text : function () {
            return core.map.call(this, function (element) {
                return element.textContent;
            }).join('');
        },

        toggle : function () {
            return this.each(function (element) {
                element.style.display = element.style.display === 'none' ? '' : 'none';
            });
        }
    };

    // give the init function the JSL prototype for later instantiation
    JSL.fn.init.prototype = JSL.fn;

    // extend method. can extend any object it's run upon
    JSL.fn.extend = JSL.extend = function (obj) {
        var name, copy;

        for (name in obj) {
            copy = obj[name];

            if ( !this.hasOwnProperty(name) && typeof copy !== 'undefined' ) {
                Object.defineProperty(this, name, {
                    value : copy
                });
            }
        }
    };

    // these methods will get added directly to 'JSL'
    JSL.extend({
        // internal function for adding event listeners
        addEvent : function (element, type, fn) {
            if (element && typeof type === 'string' && typeof fn === 'function') {
                if (element.isJSL && typeof element.each === 'function') {
                    element.each(function (elem) {
                        addListener(elem, type, fn);
                        handlers.add({
                            'type' : type,
                            'fn' : fn,
                            'element' : elem
                        });
                    });
                } else {
                    addListener(element, type, fn);
                    handlers.add({
                        'type' : type,
                        'fn' : fn,
                        'element' : element
                    });
                }
            }

            return this;
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
                    core.removeChild.call(node, newElement);
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
        create : function (elemName, attr, kids) {
            var prop, val, HTMLholder, documentFragment, ret;

            // handle text node creation
            // and HTML strings
            if (elemName === 'text' && typeof attr === 'string') {
                return document.createTextNode(attr);
            } else if ( typeof elemName === 'string' && rHTML.test(elemName) ) {
                // take the HTML string and put it inside a div
                HTMLholder = document.createElement('div');
                HTMLholder.innerHTML = elemName;

                // create a document fragment, and add each of the div's children into the document fragment
                // it would be similar to modifying documentFragment.innerHTML, if it were possible
                documentFragment = document.createDocumentFragment();
                core.forEach.call(HTMLholder.childNodes, function (child) {
                    documentFragment.appendChild( child.cloneNode(true) );
                });

                return documentFragment;
            }

            ret = document.createElement(elemName + '');

            if (typeof attr === 'object') {
                for (prop in attr) {
                    val = attr[prop];
                    if (prop.indexOf('on') === 0 && typeof val === 'function') {
                        JSL.addEvent(ret, prop.substring(2), val);
                    } else if ( typeof ret.__lookupSetter__(prop) === 'function' ) {
                        ret[prop] = val;
                    } else {
                        core.setAttribute.call(ret, prop, val);
                    }
                }
            }

            if (JSL.typeOf(kids) === 'array') {
                core.forEach.call(kids, function (kid) {
                    core.appendChild.call(ret, kid);
                });
            }

            return ret;
        },

        loop : function (maxIterations, fn) {
            var args = JSL.toArray(arguments), i;

            if (maxIterations > 0 && fn) {
                args = core.slice.call(args, 2);
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

        // run a function at a specified document readyState
        // syntax: JSL.runAt( 'complete', someFunc [, thisValue] [, ...otherArguments] );
        runAt : function (state, func, oThis) {
            var args = JSL.toArray(arguments),

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
                    document.removeEventListener('readystatechange', checkState, false);
                }
            }

            if ( states.indexOf(state) <= states.indexOf(document.readyState) ) {
                // we are at, or have missed, our desired state
                // run the specified function
                runFunc();
            } else {
                document.addEventListener('readystatechange', checkState, false);
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
                } else if ('0' in arr) {
                    // if the specified 'list' is array-like, use slice on it
                    // to convert it to an array
                    newArr = core.slice.call(arr, 0);
                }

                return newArr;
            }

            return arr || [];
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
                xp = document.evaluate(expression, context, null, type, null);

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
    // (and unsafeWindow/unwrapped-window if in a user script)
    win.JSL = win._J = window.JSL = window._J = JSL;

}(window));