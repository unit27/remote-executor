/*******************************************************************************
 * Name: Remote executor (execute remote command via GET/POST method)
 * Version: 1.0.0
 * Author: Przemyslaw Ankowski (przemyslaw.ankowski@gmail.com)
 ******************************************************************************/


/**
 * Remote executor constructor
 */
var Remote = function() {
    /**
     * Asynchronous request
     */
    this.Asynchronous = {
        /**
         * Execute remote command
         *
         * @param method
         * @param url
         * @param data
         * @param headers
         * @param success
         * @param error
         * @param exception
         */
        execute: function(method, url, data, headers, success, error, exception) {
            // Data is undefined
            if ((typeof data === "undefined") || (data === null)) {
                data = {};
            }

            // Headers are undefined
            if ((typeof headers === "undefined") || (headers === null)) {
                headers = {};
            }

            // Merge function (merge two objects)
            var merge = null;

            // URL parse (parsed object)
            var URL = null;

            // Http nodejs module
            var http = null;

            // Querystring nodejs module
            var querystring = null;

            // Try to include important stuff
            try {
                // Try to import merge nodejs module
                merge = require("recursive-merge");

                // Try to parse url
                URL = require("url").parse(url);

                // Try to import http nodejs module
                http = require("https");

                // Try to import querystring nodejs module
                querystring = require("querystring");
            }

            // Something goes wrong with web socket module
            catch (exception) {
                // Show error message
                console.error("[FATAL ERROR]: " + exception.message);

                // Exit
                process.exit(exception.code);
            }

            // Prepare data
            data = querystring.stringify(data);

            // Request options
            var options = {
                host    : URL.host,
                path    : URL.pathname,

                headers: {
                    "Accept": "application/json"
                }
            };

            // Merge default headers with user predefined headers
            options.headers = merge(options.headers, headers);

            // Different method type
            switch (method) {
                // POST
                case "POST":
                    // Set options method
                    options.method = "POST";

                    // Set headers
                    options.headers = {
                        "Accept"        : "application/json",
                        "Content-Type"  : "application/x-www-form-urlencoded",
                        "Content-Length": data.length
                    };

                    // Merge default headers with user predefined headers
                    options.headers = merge(options.headers, headers);

                    // Exit
                    break;

                // GET - by default
                default:
                    // Set options methods
                    options.method = "GET";

                    // Add data to path
                    options.path += (URL.query === null && data.length > 0 ? "?" + data : "");

                    // Exit
                    break;
            }

            // Create http request
            var request = http.request(options, function(response) {
                // Set UTF-8
                response.setEncoding("utf8");

                // Data received from request
                var data = "";

                // Run when got some part of data from remote host
                response.on("data", function(chunk) {
                    data += chunk;
                });

                // Run when got all data from remote host
                response.on("end", function() {
                    // Try to convert response to json
                    try {
                        var json = typeof data === "object" ? data : JSON.parse(data);
                    }

                        // Response is not in json data format
                    catch (exception) {
                        json = false;
                    }

                    // Got exception - change flow
                    if (typeof data.data !== "undefined" && typeof data.data.exception !== "undefined") {
                        // Run exception interceptor
                        if (typeof exception === "function") {
                            exception(data.data.exception);
                        }
                    }

                    // Run callback function
                    else if (typeof success === "function") {
                        if (json) {
                            success(json);
                        }

                        else {
                            success(data);
                        }
                    }
                });

                // Run when got http client error
                if (typeof error === "function") {
                    response.on("error", error);
                }
            });

            // Post data
            if (options.method === "POST") {
                request.write(data);
            }

            // Close connection
            request.end();
        },

        /**
         * Execute remote command using GET method
         *
         * @param url
         * @param data
         * @param headers
         * @param success
         * @param error
         * @param exception
         */
        get: function(url, data, headers, success, error, exception) {
            // Get content using get method
            this.execute("GET", url, data, headers, success, error, exception);
        },

        /**
         * Execute remote command using POST method
         *
         * @param url
         * @param data
         * @param headers
         * @param success
         * @param error
         * @param exception
         */
        post: function(url, data, headers, success, error, exception) {
            // Get content using post method
            this.execute("POST", url, data, headers, success, error, exception);
        }
    };

    /**
     * Synchronous request
     */
    this.Synchronous = {
        /**
         * Execute remote command
         *
         * @param method
         * @param url
         * @param data
         * @param headers
         * @returns {number}|{string}|null
         */
        execute: function(method, url, data, headers) {
            // Data is undefined
            if ((typeof data === "undefined") || (data === null)) {
                data = {};
            }

            // Headers are undefined
            if ((typeof headers === "undefined") || (headers === null)) {
                headers = {};
            }

            // Merge function (merge two objects)
            var merge = null;

            // sync-request nodejs module
            var request = null;

            // querystring nodejs module
            var querystring = null;

            // Try to include important stuff
            try {
                // Try to import merge nodejs module
                merge = require("recursive-merge");

                // Try to import sync-request nodejs module
                request = require("sync-request");

                // Try to import querystring nodejs module
                querystring = require("querystring");
            }

            // Something goes wrong with web socket module
            catch (exception) {
                // Show error message
                console.error("[FATAL ERROR]: " + exception.message);

                // Exit
                process.exit(exception.code);
            }

            // Prepare data
            data = querystring.stringify(data);

            // Options
            var options = {
                url     : url,
                method  : method.toUpperCase(),

                headers : {
                    "Accept": "application/json"
                }
            };

            // Merge default headers with user predefined headers
            options.headers = merge(options.headers, headers);

            // Different method type
            switch (method) {
                // POST
                case "POST":
                    // Set headers
                    options.headers = {
                        "Accept"        : "application/json",
                        "Content-Type"  : "application/x-www-form-urlencoded",
                        "Content-Length": data.length
                    };

                    // Merge default headers with user predefined headers
                    options.headers = merge(options.headers, headers);

                    // Add body with data to options
                    options.body = data;

                    // Exit
                    break;

                // GET - by default
                default:
                    // Set options - add data if needed
                    if (data.length > 0) {
                        options.url = options.url + "?" + data;
                    }

                    // Exit
                    break;
            }

            // Response from remote host
            var response = undefined;

            // Make request and get response from remote host
            try {
                // Make request
                response = request(method, options.url, options);
            }

            // Could not make request because of something - throw exception
            catch (exception) {
                throw exception;
            }

            // Don't have any data in response
            if (typeof response == "undefined" || typeof response.body == "undefined") {
                return void(0);
            }

            // Get response data as string
            response = response.body.toString();

            // Try to convert response to json
            try {
                var json = typeof response === "object" ? response : JSON.parse(response);
            }

            // Response is not in json data format
            catch (exception) {
                json = false;
            }

            // Return JSON if is converted - in other case return what we god in response
            return json != false ? json : response;
        },

        /**
         * Execute remote command using GET method
         *
         * @param url
         * @param data
         * @param headers
         * @returns {number}|{string}|null
         */
        get: function(url, data, headers) {
            // Get content using get method
            return this.execute("GET", url, data, headers);
        },

        /**
         * Execute remote command using POST method
         *
         * @param url
         * @param data
         * @param headers
         * @returns {number}|{string}|null
         */
        post: function(url, data, headers) {
            // Get content using post method
            return this.execute("POST", url, data, headers);
        }
    };
};

/**
 * Export remote executor with all properties
 */
module.exports = new Remote();