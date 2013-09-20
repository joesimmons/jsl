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



//   !! - !!                       !! - !!                            !! - !!

// WARNING - I HIGHLY RECOMMEND YOU VIEW THIS SOURCE CODE IN A MONOSPACED FONT (Courier, Consolas, etc)

//   !! - !!                       !! - !!                            !! - !!



/*

    Wiki page ==> https://github.com/joesimmons/jsl/wiki/

*/



/* CHANGELOG

1.1.3 (9/20/2013)
    - drastic change. made JSL more similar jQuery
        the main methods (JSL.runAt, JSL.addScript, etc) are the same but the
        DOM methods are different. read the wiki

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

    var intervals = []; // initialize an array for the [set/clear]Interval methods
    var rSelector = /^\*$|^\.[a-zA-Z][a-zA-Z0-9-_]*|^#[^ ]+|^[a-zA-Z]+/; // RegExp for matching a CSS selector
    var rXpath = /^\.?\/{1,2}[a-zA-Z]+/; // RegExp for matching an XPath selector

    // 'core' original methods
    var core = {
        'array' : {
            'slice' : Array.prototype.slice,
            'forEach' : Array.prototype.forEach
        },
        'object' : {
            'toString' : Object.prototype.toString
        },
        'element' : {
            'getAttribute' : Element.prototype.getAttribute,
            'setAttribute' : Element.prototype.setAttribute,
            'hasAttribute' : Element.prototype.hasAttribute
        },
        'node' : {
            'appendChild' : Node.prototype.appendChild
        },
        'eventtarget' : {
            'addEventListener' : EventTarget.prototype.addEventListener,
            'attachEvent' : EventTarget.prototype.attachEvent
        }
    };

    var JSL = function (selector, context) {
        return new JSL.fn.init(selector, context);
    };

    var handlers = {
        'stack' : [],

        'get' : function (elem) {
            var events = [], name;

            core.array.forEach.call(this.stack, function (thisEventObj) {
                if (thisEventObj.element === elem) {
                    events.push(thisEventObj);
                }
            });

            return events;
        },

        'add' : function (thisEventObj) {
            this.stack.push(thisEventObj);
        }
    };

    // internal function for throwing errors, so the user gets
    // some sort of hint as to why their operation failed
    function error(content) {
        var errorString = '!! - ' + content + ' - !!';

        if ( content && (typeof content === 'string' || typeof content === 'number') ) {
            if ('Error' in window) {
                throw new Error(errorString);
            } else if ( 'console' in window && (typeof console.error === 'function' || typeof console.error === 'function') ) {
                (console.log || console.error)(errorString);
            }
        }
    }

    // function to easily allow an original function to be called
    // even if it gets changed later on
    function orig(fn, otherThis) {
        return function () {
            var oThis = otherThis || this;
            return fn.apply(oThis, arguments);
        };
    }

    // define JSL's prototype, aka JSL.fn
    JSL.fn = JSL.prototype = {
        isJSL : true,
        constructor : JSL,
        length : 0,

        // similar to jQuery. JSL is just the init constructor
        init : function (selector, context) {
            var that = this, elems;

            //delete that.init;

            if (typeof selector === 'string') {
                if ( rSelector.test(selector) ) {
                    elems = document.querySelectorAll(selector);
                } else if ( rXpath.test(selector) ) {
                    elems = JSL.toArray( JSL.xpath({expression : selector}) );
                }
            } else if (typeof selector === 'object') {
                elems = [selector];
            }

            if (elems.length > 0) {
                that.length = elems.length;
                core.array.forEach.call(elems, function (value, index) {
                    that[index] = value;
                });
            }

            return that;
        },

        addEvent : function (type, fn) {
            JSL.addEvent(this, type, fn);
            return this;
        },

        after : function (newElement) {
            var thisElement = !!this ? this[0] : null,
                parent = thisElement.parentNode,
                next = thisElement.nextSibling;

            if (thisElement && parent && next) {
                parent.insertBefore(newElement, next);
            }

            return this;
        },

        append : function (passedElement) {
            // filter null/undefined values
            if (passedElement != null) {
                this.each(function (thisElement, index, thisArray) {
                    var newElement = passedElement.cloneNode(true),
                        theseEvents;

                    // clone event listeners of passedElement
                    core.array.forEach.call(handlers.get(passedElement), function (thisEventObj) {
                        JSL.addEvent(newElement, thisEventObj.type, thisEventObj.fn);
                    });

                    if (typeof thisElement.appendChild === 'function') {
                        core.node.appendChild.call( thisElement, newElement );
                    }
                });
            }

            return this;
        },

        array : function () {
            return JSL.toArray(this);
        },

        attribute : function (name, value) {
            if (typeof name === 'string' && this.length > 0) {
                if (typeof value === 'string') {
                    // handle setting attributes
                    this.each(function (elem) {
                        core.element.setAttribute.call(elem, name, value);
                    });
                } else {
                    // handle getting attributes
                    return this[0].getAttribute(name);
                }
            }

            return this;
        },

        before : function (newElement) {
            var thisElement = !!this ? this[0] : null,
                parent = thisElement.parentNode;

            if (thisElement && parent) {
                parent.insertBefore(newElement, thisElement);
            }

            return this;
        },

        each : function (fn, oThis) {
            core.array.forEach.call(this, fn, oThis);
            return this;
        }
    };

    // give the init function the JSL prototype for later instantiation
    JSL.fn.init.prototype = JSL.fn;

    // extend method. can extend any object it's run upon
    JSL.fn.extend = JSL.extend = function (obj) {
        var name, copy;

        for (name in obj) {
            copy = obj[name];

            if ( !this.hasOwnProperty(name) && copy !== undefined ) {
                Object.defineProperty(this, name, {
                    value : copy
                });
            }
        }
    }

    // these methods will get added directly to 'JSL'
    JSL.extend({
        // internal function for adding event listeners
        addEvent : function (element, type, fn) {
            // function for attaching the listener
            function doAdd(elem, type, fn) {
                var method = core.eventtarget.addEventListener || core.eventtarget.attachEvent;

                method.call(elem, type, function () {
                    return fn.apply(elem, arguments);
                }, false);
            }

            if (element && typeof type === 'string' && typeof fn === 'function') {
                if (element.isJSL && typeof element.each === 'function') {
                    element.each(function (elem) {
                        doAdd(elem, type, fn);
                        handlers.add({
                            'type' : type,
                            'fn' : fn,
                            'element' : elem
                        });
                    });
                } else {
                    doAdd(element, type, fn);
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
            id = id || ( 'jsl-script-' + this.random(999) );
            node = node || this.query('head');
            node.appendChild(
                this.create('script', { 'id' : id, innerHTML: contents } )
            );
        },

        // adds a style to the node you want, or the head node of the current document
        // syntax: JSL.addStyle( '.classname { color: red; }' , document )
        // 2nd argument is optional
        // 3rd argument is optional
        addStyle : function (css, id, node) {
            id = id || ( 'jsl-style-' + this.random(999) );
            node = node || this.query('head');
            if (node) {
                node.appendChild(
                    this.create('style', {type : 'text/css'}, [ this.create('text', css) ] )
                );
            }
        },

        // this will clear a set interval
        // syntax: JSL.clearInterval( my_int )
        clearInterval : function (index) {
            if (typeof index === 'number' && index < intervals.length) {
                clearTimeout( intervals[index] );
                intervals[index] = null;
            }
        },

        // return a created element
        // syntax: JSL.create( 'div' , {id : 'some_id', style : 'color: red;' }, [ create('text', 'This is a red div') ] )
        // 1st argument: the tag name of the element you wish to create. OR 'text' and a text node will be created with the 2nd argument's text
        // 2nd argument (optional): an object with attributes to set to the element
        // 3rd argument (optional): an array of childred, created with this function, to be added to the element
        create : (function () {
            var blacklist = /style|class(?!Name)/;

            return (function (elemName, attr, kids) {
                var prop, val, ret = document.createElement(elemName + '');

                if (elemName === 'text' && typeof attr === 'string') {
                    return document.createTextNode(attr);
                }

                if (this.typeOf(attr) === 'object') {
                    for (prop in attr) {
                        val = attr[prop];
                        if (prop.indexOf('on') === 0 && typeof val === 'function') {
                            JSL.addEvent(ret, prop.substring(2), val);
                        } else if (typeof ret[prop] !== 'undefined' && !blacklist.test(prop) ) {
                            ret[prop] = val;
                        } else {
                            ret.setAttribute(prop, val);
                        }
                    }
                }

                if (this.typeOf(kids) === 'array') {
                    kids.forEach(function (kid) {
                        ret.appendChild(kid);
                    });
                }

                return ret;
            });
        }()),

        // function to take a string or an element and return an element/xpath-snapshots
        // not intended for user use, it's only used in other methods in this library
        elem : function (val) {
            if (typeof val === 'string') {
                if ( rXpath.test(val) ) {                      // test for xpath
                    val = this.xpath(val);
                } else if ( rSelector.test(val) ) {           // test for query selector
                    val = document.querySelectorAll(val);
                    if (val.length === 1) {
                        val = val[0];
                    } else if (val.length === 0) {
                        return null;
                    }
                } else {                                      // just get ID
                    val = document.getElementById(val);
                }
            }

            return val;
        },

        // return a random integer, floored
        // syntax: JSL.random( 50 )
        random : function (max) {
            var rand = parseInt( ( (Math.random() * max) + '' ).split('.')[0], 10);
            return rand > 0 ? rand : 1;
        },

        // run a function at a specified document readyState
        // syntax: JSL.runAt( 'complete', someFunc, thisValue[, ...otherArguments] );
        runAt : function (state, func, oThis) {
            var args = JSL.toArray(arguments),
                states = ['uninitialized', 'loading', 'interactive', 'complete'],
                that = this, runFunc, checkState

            // in-case they pass 'start' or 'end' instead of 'loading' or 'complete'
            state = state.replace('start', 'loading').replace('end', 'complete');

            // set 'this' for the passed function to be run
            oThis = oThis || window;

            runFunc = function () {
                func.apply( oThis, args.slice(3) );
            };

            checkState = function () {
                if (document.readyState === state) {
                    runFunc();
                    document.removeEventListener('readystatechange', checkState, false);
                }
            };

            if ( states.indexOf(state) <= states.indexOf(document.readyState) ) {
                // we are at, or have missed, our desired state
                // run the function with the proper 'this' and arguments
                runFunc();
            } else {
                // re-run runAt until the desired state is achieved
                document.addEventListener('readystatechange', checkState, false);
            }
        },

        // setInterval is unreliable. this is a replacement for it using setTimeout with drift accomodation
        // syntax: JSL.setInterval(func, delay)
        // runs exactly like a real setInterval, but it's based on setTimeout, which is more reliable
        setInterval : function (func, delay) {
            var index = intervals.length,
                info = document.getElementById('info'),
                delay_orig = delay,
                count = 1, start;

            function doRe(func, delay) {
                return setTimeout(function () {
                    var drift;

                    // run the passed func in separate execution context, to minimize drifting
                    // we want to run it as soon as possible in this function, to minimize drifting as well
                    setTimeout(func, 0);

                    // drift accomodation
                    var diff = ( new Date().getTime() ) - start,
                        corr = delay_orig * count,
                        drift = diff - corr;
                    //drift = ( ( new Date().getTime() ) - start ) - (delay_orig & count);

                    // fix for when a timeout takes longer than the original delay time to execute
                    if (drift > delay_orig) {
                        drift = delay_orig;
                    }

                    // save the reference of the new timeout in our 'intervals' stack
                    if ( intervals[index] !== null) {
                        intervals[index] = doRe(func, delay_orig - drift);
                    }

                    count += 1;
                }, delay);
            }

            start = new Date().getTime();
            intervals[index] = doRe(func, delay_orig);

            return index;
        },

        // converts a list of some sort to an array (e.g., NodeList, HTMLCollection, 'arguments' parameter, xpath snapshots, etc)
        // syntax: JSL.toArray( some_list )
        toArray : function (arr) {
            var len = arr.length || arr.snapshotLength,
                newArr = [],
                xpath = typeof arr.snapshotItem === 'function',
                item, i;

            if (typeof len === 'number' && this.typeOf(arr) !== 'array') {
                for (i = 0; i < len; i += 1) {
                    newArr.push( xpath === true ? arr.snapshotItem(i) : arr[i] );
                }
                return newArr;
            }

            return arr;
        },

        // typeOf by Douglas Crockford. modified by JoeSimmons
        typeOf : function (value) {
            var s = typeof value,
                ostr = core.object.toString.call(value);
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
            var type = obj.type || 6,
                types = {
                    '1' : 'numberValue',
                    '2' : 'stringValue',
                    '3' : 'booleanValue',
                    '8' : 'singleNodeValue',
                    '9' : 'singleNodeValue'
                },
                expression = obj.expression || '',
                context = obj.context || document,
                xp;

            if (!expression) {
                error('An expression must be supplied for JSL.xpath()');
            }

            return typeof types[type] === 'string' ? xp[ types[type] ] : xp;
        }
    });

    window.JSL = JSL;

}(window));



// -
// --
// ---
// -----
// ------- BELOW IS FOR TESTING --------
// -----
// ---
// --
// -



// Make sure the page is not in a frame
if (window.self !== window.top) { return; }


JSL.runAt('end', function () {

    // grab the element[s]
    var a = JSL('body div');

    // do stuff to them
    a.append(
        JSL.create('a', {href: '#', onclick : function () {
            alert('JSL.create() onclick cloned node, with cloned event listeners.');
        }, textContent : '-- JSL TEST --', style : 'z-index: 999999; padding: 2px 4px; margin: 4px; color: red; font-size: 18pt;'})
    );

});