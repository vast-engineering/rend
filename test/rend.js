var assert = require('assert');
var path = require('path');

var Rend = require('../');
var HandlebarsCompiler = require('./compiler');
var FSViewResolver = require('./fsViewResolver');

suite('Rend', function () {
    test('constructor', function () {
        assert.throws(function () {
            new Rend();
        }, /resolver is required/, 'should require view resolver');
    });

    var render;

    setup(function () {
        var resolver = new FSViewResolver({
            base: path.normalize(__dirname + '/templates')
        });

        var compiler = new HandlebarsCompiler();

        render = new Rend({
            resolver: resolver,
            compiler: compiler
        });
    });

    test('renders test template', function (done) {
        render.render('test', {name: 'Zanzibar'}, function (error, data) {
            assert.ifError(error, 'should not have error');
            assert.equal(data, 'Hello Zanzibar', 'should match expected output');

            done();
        })
    });

    test('works with partials', function (done) {
        render.render('includer', {}, function (error, data) {
            assert.ifError(error, 'should not have error');
            assert.equal(data, 'add a partial: partially', 'should match expected output');

            done();
        });
    });

    test('throws error when callback is missing', function () {
        assert.throws(function () {
            render.render('test', {name: 'Zanzibar'});
        }, 'should throw error')
    })

    test('passes error when template is missing', function (done) {
        assert.doesNotThrow(function () {
            render.render(null, null, function (error, html) {
                assert.ok(error, 'should pass an error to callback when template is missing');
                done();
            })
        }, 'should not throw error when callback is present');
    });

    test('passes error when template does not exist', function (done) {
        assert.doesNotThrow(function () {
            render.render('superdogs', null, function (error, html) {
                assert.ok(error, 'should pass an error to callback when template does not exist');
                done();
            })
        }, 'should not throw error when callback is present');
    });

    test('passes error when template has compile errors', function (done) {
        assert.doesNotThrow(function () {
            render.render('bad', null, function (error, html) {
                assert.ok(error, 'should pass an error to callback when template has compile errors');
                done();
            })
        }, 'should not throw error when callback is present');
    });
});
