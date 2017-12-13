# babel7-jest

[Babel](https://github.com/babel/babel) [jest](https://github.com/facebook/jest) plugin

*Note: this is forked from `babel-jest` v21.2.0 modified to use babel core version 7.*

## Setup

```
npm install --save-dev babel7-jest
```

To explicitly define `babel7-jest` as a transformer for your JavaScript code, map _.js_ files to the `babel-jest` module.

```json
"jest": {
  "transform": {
    "^.+\\.jsx?$": "babel7-jest"
  }
},
```

If you would like to write your own preprocessor, uninstall and delete babel-jest and set the [config.transform](http://facebook.github.io/jest/docs/configuration.html#transform-object-string-string) option to your preprocessor.
