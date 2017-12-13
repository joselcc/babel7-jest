"use strict";

var _crypto = _interopRequireDefault(require("crypto"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _babelPresetJest = _interopRequireDefault(require("babel-preset-jest"));

var _core = require("@babel/core");

var _babelPluginIstanbul = _interopRequireDefault(require("babel-plugin-istanbul"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
var BABELRC_FILENAME = '.babelrc';
var BABELRC_JS_FILENAME = '.babelrc.js';
var BABEL_CONFIG_KEY = 'babel';
var PACKAGE_JSON = 'package.json';

var THIS_FILE = _fs.default.readFileSync(__filename);

var createTransformer = function createTransformer(options) {
  var cache = Object.create(null);

  var getBabelRC = function getBabelRC(filename) {
    var paths = [];
    var directory = filename;

    while (directory !== (directory = _path.default.dirname(directory))) {
      if (cache[directory]) {
        break;
      }

      paths.push(directory);

      var configFilePath = _path.default.join(directory, BABELRC_FILENAME);

      if (_fs.default.existsSync(configFilePath)) {
        cache[directory] = _fs.default.readFileSync(configFilePath, 'utf8');
        break;
      }

      var configJsFilePath = _path.default.join(directory, BABELRC_JS_FILENAME);

      if (_fs.default.existsSync(configJsFilePath)) {
        // $FlowFixMe
        cache[directory] = JSON.stringify(require(configJsFilePath));
        break;
      }

      var resolvedJsonFilePath = _path.default.join(directory, PACKAGE_JSON);

      var packageJsonFilePath = resolvedJsonFilePath === PACKAGE_JSON ? _path.default.resolve(directory, PACKAGE_JSON) : resolvedJsonFilePath;

      if (_fs.default.existsSync(packageJsonFilePath)) {
        // $FlowFixMe
        var packageJsonFileContents = require(packageJsonFilePath);

        if (packageJsonFileContents[BABEL_CONFIG_KEY]) {
          cache[directory] = JSON.stringify(packageJsonFileContents[BABEL_CONFIG_KEY]);
          break;
        }
      }
    }

    paths.forEach(function (directoryPath) {
      return cache[directoryPath] = cache[directory];
    });
    return cache[directory] || '';
  };

  options = Object.assign({}, options, {
    plugins: options && options.plugins || [],
    presets: (options && options.presets || []).concat([_babelPresetJest.default]),
    retainLines: true,
    sourceMaps: 'inline'
  });
  delete options.cacheDirectory;
  delete options.filename;
  return {
    canInstrument: true,
    getCacheKey: function getCacheKey(fileData, filename, configString, _ref) {
      var instrument = _ref.instrument,
          rootDir = _ref.rootDir;
      return _crypto.default.createHash('md5').update(THIS_FILE).update('\0', 'utf8').update(fileData).update('\0', 'utf8').update(_path.default.relative(rootDir, filename)).update('\0', 'utf8').update(configString).update('\0', 'utf8').update(getBabelRC(filename)).update('\0', 'utf8').update(instrument ? 'instrument' : '').digest('hex');
    },
    process: function process(src, filename, config, transformOptions) {
      if (_core.util && !_core.util.canCompile(filename)) {
        return src;
      }

      var theseOptions = Object.assign({
        filename: filename
      }, options);

      if (transformOptions && transformOptions.instrument) {
        theseOptions.auxiliaryCommentBefore = ' istanbul ignore next '; // Copied from jest-runtime transform.js

        theseOptions.plugins = theseOptions.plugins.concat([[_babelPluginIstanbul.default, {
          // files outside `cwd` will not be instrumented
          cwd: config.rootDir,
          exclude: []
        }]]);
      } // babel v7 might return null in the case when the file has been ignored.


      var transformResult = (0, _core.transform)(src, theseOptions);
      return transformResult ? transformResult.code : src;
    }
  };
};

module.exports = createTransformer();
module.exports.createTransformer = createTransformer;
