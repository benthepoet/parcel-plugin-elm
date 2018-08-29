const { findAllDependencies } = require('find-elm-dependencies');
const process = require('process');
const Asset = require('parcel-bundler/src/Asset');
const localRequire = require('parcel-bundler/src/utils/localRequire');

class ElmAsset extends Asset {
  constructor(name, options) {
    super(name, options);
    this.type = 'js';
  }

  getParserOptions() {
    const defaultOptions = {
      cwd: process.cwd(),
    };
    
    if (this.options.minify) {
      defaultOptions.optimize = true;
    }
    
    return defaultOptions;
  }
  
  async collectDependencies() {
    const deps = await findAllDependencies(this.name);
    deps.forEach(dep => {
      this.addDependency(dep, { includedInParent: true });
    });
  }

  async generate() {
    const options = this.getParserOptions();
    const elm = await localRequire('node-elm-compiler', this.name);
    const compiled = await elm.compileToString(this.name, options);
    return compiled.toString();
  }
}

module.exports = ElmAsset;
