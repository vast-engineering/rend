var async = require('async');
var _ = require('lodash');
var findit = require('findit');
var path = require('path');
var fs = require('fs');

/**
 * Resolves a template using the file system.
 */
var FSViewResolver = function (options) {
    options = options || {};

    _.defaults(options, {
        base: process.cwd(),
        ext: 'html'
    });

    // normalize base
    options.base = path.normalize(options.base);

    this.options = options;
};

FSViewResolver.prototype.getAll = function (callback) {
    var self = this;

    var regexExt = new RegExp("\\." + this.options.ext + "$");
    var templates = {};

    // walk the contents of the base path
    var finder = findit(this.options.base);

    var paths = [];

    // for each file...
    finder.on('file', function(file, stat) {
        // ...if this is a file of the expected extension...
        if (regexExt.test(file)) {
            // ... then hold onto the path
            paths.push(file);
        }
    });

    finder.on('error', function(error) {
        callback(error);
    });

    finder.on('end', function() {
        // we got all the templates. load their contents asynchronously
        async.forEach(
            // arr
            paths,
            // iterator
            function(path, callback) {
                fs.readFile(path, 'utf-8', function(err, data) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        // simplify the key to be relative to base path and omit file extension
                        var key = path.replace(self.options.base + '/', '').replace(regexExt, '');
                        templates[key] = data;
                        callback();
                    }
                })
            },
            // callback
            function(error) {
                callback(error, templates);
            }

        );
    });
};

module.exports = FSViewResolver;