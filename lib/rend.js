var isFunction = require('lodash.isfunction');

/**
 * Manages compiling, caching and rendering templates.
 * @param options.resolver - Provides templates. Must have a method "getAll" which passes back a dictionary mapping template names to contents.
 * @param options.compiler - Compiles templates provided from resolver. Must have a method "compileAll" which accepts a template name/content dictionary and passes back a dictionary mapping name to compiled template function.
 */
var Rend = function (options) {
    options = options || {};

    if (!options.resolver) {
        throw new Error('resolver is required');
    }
    else if (!options.compiler) {
        throw new Error('compiler is required');
    }

    this.resolver = options.resolver;
    this.compiler = options.compiler;
};

/**
 * Get compiled template functions.
 */
Rend.prototype.getTemplateFns = function (callback) {
    if (this.cache) {
        callback(null, this.cache);
    }
    else {
        var self = this;

        _compile(this.resolver, this.compiler, function (error, templateFns) {
            if (error) {
                callback(error);
            }
            else {
                self.cache = templateFns;
                callback(null, self.cache);
            }
        });
    }
};

Rend.prototype.render = function (template, vm, callback) {
    var self = this;

    if (!isFunction(callback)) {
        throw new Error('callback is required');
    }
    else if (!template) {
        callback(new Error('template is required'));
    }
    else {
        this.getTemplateFns(function (error, templateFns) {
            if (error) {
                callback(error);
            }
            else {
                var templateFn = templateFns[template];

                if (!templateFn) {
                    callback(new Error('template not found'));
                }
                else {
                    _render(templateFn, vm, callback);
                }
            }
        })
    }
};

/**
 * Build templates.
 */
var _compile = function (resolver, compiler, callback) {
    resolver.getAll(function (error, templates) {
        if (error) {
            callback(error);
        }
        else {
            compiler.compileAll(templates, function (error, templateFns) {
                if (error) {
                    callback(error);
                }
                else {
                    callback(null, templateFns);
                }
            });
        }
    });
};

var _render = function(templateFn, vm, callback) {
    var error;
    var html;
    
    try {
        html = templateFn(vm);
    }
    catch (e) {
        error = e;
    }

    callback(error, html);
};

module.exports = Rend;
