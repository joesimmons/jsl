// ==UserScript==
// @name          JoeSimmons' Library
// @namespace     http://userscripts.org/users/23652
// @description   A JavaScript library used by JoeSimmons
// @include       *
// @copyright     JoeSimmons
// @version       1.1.2
// @license       http://creativecommons.org/licenses/by-nc-nd/3.0/us/
// ==/UserScript==



//   !! - !!                       !! - !!                            !! - !!

// WARNING - I HIGHLY RECOMMEND YOU VIEW THIS SOURCE CODE IN A MONOSPACED FONT (Courier, Consolas, etc)

//   !! - !!                       !! - !!                            !! - !!



/* CHANGELOG

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

var JSL = new (function () {

    'use strict'; // use strict mode in ECMAScript-5

    var intervals = []; // initialize an array for the [set/clear]Interval methods
    var thisLib = { // 'thisLib' will be a reference to JSL's methods + properties

        // adds a script tag to the page
        // syntax: JSL.addScript( 'var x = 0;' , null , head_node )
        // 2nd argument required but technically optional. it will set the ID of the script tag. pass it null if you want a random ID
        // 3rd argument optional. it will add the style tag to the head if omitted
        addScript : function (contents, id, node) {
            node = node || thisLib.query('head');
            node.appendChild(
                thisLib.create('script', { 'id' : (id || ( 'jsl-script-' + thisLib.random(999) ) ), innerHTML: contents } )
            );
        },

        // adds a style to the node you want, or the head node of the current document
        // syntax: JSL.addStyle( '.classname { color: red; }' , document )
        // 2nd argument is optional
        addStyle : function (css, node) {
            var style = thisLib.create('style', {type : 'text/css'}, [ thisLib.create('text', css) ] );
            node = node || thisLib.query('head');
            if (node) {
                node.appendChild(style);
            }
        },

        // adds a node after the node you specify in the second argument
        // syntax: JSL.after(newElement, currentElement)
        after : function (newElement, currentElement) {
            currentElement = thisLib.elem(currentElement);
            if (currentElement) {
                currentElement.parentNode.insertBefore(newElement, currentElement.nextSibling);
            }
        },

        // adds a node before the node you specify in the second argument
        // syntax: JSL.before(newElement, currentElement)
        before : function (newElement, currentElement) {
            currentElement = thisLib.elem(currentElement);
            if (currentElement) {
                currentElement.parentNode.insertBefore(newElement, currentElement);
            }
        },

        // return the browser name
        // syntax: JSL.browser
        get browser() {
            // this feature isn't fully implemented yet
            // i suggest not using it. just use feature detection instead
            if (window.opera) {
                return 'opera';
            } else if (window.chrome) {
                return 'chrome';
            } else if (typeof GM_info !== 'undefined') {
                return 'firefox';
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

                if (thisLib.typeOf(attr) === 'object') {
                    for (prop in attr) {
                        val = attr[prop];
                        if (prop.indexOf('on') === 0 && typeof val === 'function') {
                            ret.addEventListener(prop.substring(2), val, false);
                        } else if (typeof ret[prop] !== 'undefined' && !blacklist.test(prop) ) {
                            ret[prop] = val;
                        } else {
                            ret.setAttribute(prop, val);
                        }
                    }
                }

                if (thisLib.typeOf(kids) === 'array') {
                    kids.forEach(function (kid) {
                        ret.appendChild(kid);
                    });
                }

                return ret;
            });
        }()),

        // function to take a string or an element and return an element/xpath-snapshots
        // not intended for user use, it's only used in other methods in this library
        elem : (function () {
            var query = /#|\.|\[|\]|"|'|=|,|:/;

            return function (val) {
                var ret = val;
                if (typeof val === 'string') {
                    if (val.indexOf('//') !== -1 || val.indexOf('./') !== -1) {    // test for xpath
                        ret = thisLib.xpath(val);
                    } else if ( query.test(val) ) {                                // test for query selector
                        ret = thisLib.queryAll(val);
                        if (ret.length === 1) {
                            ret = ret[0];
                        } else if (ret.length === 0) {
                            return null;
                        }
                    } else {                                                       // just get ID
                        ret = thisLib.id(val);
                    }
                }
                return ret;
            };
        }()),

        // hide an element
        // syntax: JSL.hide( element )
        hide : function (element) {
            element = thisLib.elem(element);
            if (element) {
                element.style.display = 'none';
            }
        },

        // return an element by id
        // syntax: JSL.id( 'some_id' , context_element )
        id : function (id, node) {
            return typeof node !== 'undefined' ? thisLib.query('#' + id, node) : document.getElementById(id);
        },

        // return an element by query selector
        // syntax: JSL.query( '.someclass' , context_element )
        // 2nd argument is optional
        query : function (query, n) {
            var node = typeof n !== 'undefined' ? (n || null) : document;
            return node === null ? null : node.querySelector(query);
        },

        // return elements by query selector
        // syntax: JSL.queryAll( '.someclass' , context_element )
        // 2nd argument is optional
        queryAll : function (query, n) {
            var node = typeof n !== 'undefined' ? (n || null) : document;
            return node.querySelectorAll(query);
        },

        // return a random integer, floored
        // syntax: JSL.random( 50 )
        random : function (max) {
            var rand = parseInt( ( (Math.random() * max) + '' ).split('.')[0], 10);
            return rand > 0 ? rand : 1;
        },

        // remove an element from its parent
        // syntax: JSL.remove( element )
        remove : function (element) {
            element = thisLib.elem(element);
            if (element) {
                element.parentNode.removeChild(element);
            }
        },

        // replace an old element with a new one
        // syntax: JSL.replace( old_elem, new_elem )
        replace : function (oldNode, newNode) {
            oldNode = thisLib.elem(oldNode);
            if (oldNode) {
                oldNode.parentNode.replaceChild(newNode, oldNode);
            }
        },

        // run a function at a specified document readyState
        // syntax: JSL.runAt( 'complete', someFunc, thisValue[, ...otherArguments] );
        runAt : function (state, func, oThis) {
            var args = Array.prototype.slice.call(arguments, 0),
                states = ['uninitialized', 'loading', 'interactive', 'complete'];

            // in-case they pass 'start' or 'end' instead of 'loading' or 'complete'
            state = state.replace('start', 'loading').replace('end', 'complete');

            // set 'this' for the passed function to be run
            oThis = oThis || window;

            // this will re-run this runAt function with the same arguments it was given
            function rerunThis() {
                thisLib.runAt.apply(null, args);
            }

            if ( states.indexOf(state) <= states.indexOf(document.readyState) ) {
                // we are at, or have missed, our desired state
                // run the function with the proper 'this' and arguments
                func.apply( oThis, args.slice(3) );
            } else {
                // re-run runAt until the desired state is achieved
                document.addEventListener('readystatechange', rerunThis, false);
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

        // show an element
        // syntax: JSL.show( element )
        show : function (element) {
            element = thisLib.elem(element);
            if (element) {
                element.style.display = '';
            }
        },

        // converts a list of some sort to an array (e.g., NodeList, HTMLCollection, 'arguments' parameter, xpath snapshots, etc)
        // syntax: JSL.toArray( some_list )
        toArray : function (arr) {
            var len = arr.length || arr.snapshotLength, newArr = [], item, i;
            if (typeof len === 'number' && thisLib.typeOf(arr) !== 'array') {
                for (i = 0; i < len; i += 1) {
                    if (typeof arr.snapshotItem === 'function') {
                        newArr.push( arr.snapshotItem(i) );
                    } else {
                        newArr.push( arr[i] );
                    }
                }
                return newArr;
            }
            return arr;
        },

        // toggle display of an element
        // syntax: JSL.toggle( element )
        toggle : function (element) {
            element = thisLib.elem(element);
            if (element) {
                if (element.style.display === 'none') {
                    thisLib.show(element);
                } else {
                    thisLib.hide(element);
                }
            }
        },

        // typeOf by Douglas Crockford. modified by JoeSimmons
        typeOf : function (value) {
            var s = typeof value,
                ostr = Object.prototype.toString.call(value);
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
            var type = obj['type'] || 6,
                xp = document.evaluate( ( obj['expression'] ), ( obj['context'] || document ), null, type, null);

            switch(type) {
                case 1: xp = xp.numberValue; break;
                case 2: xp = xp.stringValue; break;
                case 3: xp = xp.booleanValue; break;
                case 8: case 9: xp = xp.singleNodeValue; break;
                default: break;
            }

            return xp;
        }

    };

    return thisLib;

});