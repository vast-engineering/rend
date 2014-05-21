var _ = require('lodash');
var Handlebars = require('handlebars');

var HandlebarsCompiler = function () {
    // TODO register helpers here?
};

HandlebarsCompiler.prototype.compileAll = function (templates, callback) {
    var templateFns = {};

    _.each(templates, function (content, name) {
        try {
            // if the template name starts with an underscore, register it as a partial
            if (_.last(name.split('/')).indexOf('_') === 0) {
                Handlebars.registerPartial(name, content);
            }
            else {
                templateFns[name] = Handlebars.compile(content);
            }                    
        }
        catch (error) {
            callback(error);
        }
    });

    callback(null, templateFns);
};

module.exports = HandlebarsCompiler;
