// ==UserScript==
// @name        JSL - AJAX plugin
// @namespace   http://userscripts.org/users/23652
// @description An AJAX extension for JSL
// @include     *
// @version     1.0.1
// @require     https://raw.github.com/joesimmons/jsl/master/jsl.user.js
// @grant       none
// ==/UserScript==

/* CHANGELOG

1.0.1 (10/3/2013)
    - fixed small bug with passing a url array
    - fixed bug not allowing HEAD requests to be recognized

1.0.0 (10/1/2013)
    - created

*/

(function (undefined) {

    'use strict'; // use strict mode in ECMAScript-5

    var queue = [],               // the request queue
        blank = function () {},   // blank function to use as default callback
        xhrInProgress = false;    // boolean to know if we should send another request or not

    var core = {
        // object
        'hasOwnProperty' : Object.prototype.hasOwnProperty
    };

    function copyObject(o) {
        var key, value, newO = {};

        for (key in o) {
            value = o[key];

            if (core.hasOwnProperty.call(o, key) && value != null) {
                newO[key] = value;
            }
        }

        return newO;
    }

    function toDataString(o) {
        var key, value, dataString = '';

        for (key in o) {
            value = o[key];

            if (core.hasOwnProperty.call(o, key) && value != null) {
                dataString += key + '=' + encodeURIComponent(value) + '&';
            }
        }

        return dataString.slice(0, -1);
    }

    function xhr() {
        var req, key, xhrObj = {};

        function handleEvents(type, resp, event) {
            var event = event || {}, newResp, context;

            if (req[type] !== blank) {
                // define a new response object to give to the user
                newResp = {
                    lengthComputable : resp.lengthComputable || event.lengthComputable || null,
                    loaded : resp.loaded || event.loaded || null,
                    readyState : resp.readyState,
                    responseHeaders : resp.responseHeaders ||
                        ( typeof resp.getAllResponseHeaders === 'function' ? resp.getAllResponseHeaders() : null) || '',
                    responseText : resp.responseText,
                    status : resp.status,
                    statusText : resp.statusText,
                    total : resp.total || event.total || null,
                    url : resp.finalUrl || req.url,
                };

                // allow new requests to be run if our request is done
                if (type === 'onerror' || type === 'onload') {
                    xhrInProgress = false;
                }

                // run the callback
                context = req.context || newResp;
                req[type].call(context, newResp);
            }

            // run the next in queue, if any
            if (req.delay > 0) {
                window.setTimeout(xhr, req.delay);
            } else {
                xhr();
            }
        }

        if (xhrInProgress === false && queue.length > 0) {
            // make it so no other requests get run while we run this one
            xhrInProgress = true;

            // get the object which is first in the queue
            req = queue.shift();

            if (typeof GM_xmlhttpRequest === 'function') {
                if (req.method.toUpperCase() === 'GET' && req.data !== '') {
                    req.url += '?' + req.data;
                    req.data = '';
                }

                GM_xmlhttpRequest({
                    'data' : req.data,
                    'headers' : req.headers,
                    'method' : req.method,
                    'onerror' : function (resp) {
                        handleEvents('onerror', resp);
                    },
                    'onload' : function (resp) {
                        handleEvents('onload', resp);
                    },
                    'onreadystatechange' : function (resp) {
                        handleEvents('onreadystatechange', resp);
                    },
                    'onprogress' : function (resp) {
                        handleEvents('onprogress', resp);
                    },
                    'url' : req.url,
                });
            } else if (typeof XMLHttpRequest === 'function' || typeof ActiveXObject === 'function') {
                xhrObj = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

                // set events
                xhrObj.onload = function (resp) {
                    handleEvents('onload', xhrObj);
                };
                xhrObj.onerror = function (resp) {
                    handleEvents('onerror', xhrObj);
                };
                xhrObj.onprogress = function (resp) {
                    handleEvents('onprogress', xhrObj, resp);
                };

                if (req.mimeType !== '') {
                    xhrObj.overrideMimeType(req.mimeType);
                }

                // add headers
                for (key in req.headers) {
                    xhrObj.setRequestHeader( key, req.headers[key] );
                }

                xhrObj.open(req.method, req.url, true);
                xhrObj.send( (req.data || null) );
            }
        }
    }

    function init(url, settings) {
        var urls = [],
            realSettings = { // defaults
                data : '',
                headers : {},
                method : 'GET',
                mimeType : '',
                onload : blank,
                onerror : blank,
                onprogress : blank,
                onreadystatechange : blank,
                delay : 0
            },
            key, value;

        if (typeof url === 'string') {
            urls.push(url);
        } else if (JSL.typeOf(url) === 'array') {
            urls = urls.concat(url);
        }

        if (JSL.typeOf(settings) === 'object') {
            for (key in settings) {
                value = settings[key];

                switch (key) {
                    case 'context': {
                        if (value != null) {
                            realSettings[key] = value;
                        }
                        break;
                    }
                    case 'data': {
                        if (typeof value === 'string') {
                            realSettings[key] = value;
                        } else if (JSL.typeOf(value) === 'object') {
                            realSettings[key] = toDataString(value);
                        }
                        break;
                    }
                    case 'headers': {
                        if (JSL.typeOf(value) === 'object') {
                            realSettings[key] = toDataString(value);
                        }
                        break;
                    }
                    case 'method': {
                        if ( typeof value === 'string' && /get|post|head/i.test(value) ) {
                            realSettings[key] = value.toUpperCase();
                        }
                        break;
                    }
                    case 'mimeType': {
                        if (typeof value === 'string') {
                            realSettings[key] = value;
                        }
                        break;
                    }
                    case 'onload': case 'onerror': case 'onreadystatechange': case 'onprogress': {
                        if (typeof value === 'function') {
                            realSettings[key] = value;
                        }
                        break;
                    }
                }
            }
        }

        // add an object to the queue for each url
        if (urls.length > 0) {
            JSL.each(urls, function (url) {
                var newO = copyObject(realSettings);
                newO.url = url;
                queue.push(newO);
            });
        }

        // run the xhr function
        // it will determine whether or not a request needs to be sent
        xhr();

        return {
            get length() {
                return queue.length;
            }
        };
    }

    JSL.extend({
        ajax : function (url, settings) {
            return new init(url, settings);
        }
    });

}());