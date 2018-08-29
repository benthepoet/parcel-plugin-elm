const { findAllDependencies } = require('find-elm-dependencies');
const process = require('process');
const Asset = require('parcel-bundler/src/Asset');
const localRequire = require('parcel-bundler/src/utils/localRequire');
const terser = require('parcel-bundler/src/transforms/terser');

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
  
  async parse() {
    const options = this.getParserOptions();
    const elm = await localRequire('node-elm-compiler', this.name);
    const compiled = await elm.compileToString(this.name, options);
    this.contents = compiled.toString();
  }

  async generate() {
    let code = this.outputCode != null ? this.outputCode : this.contents;
    
    return {
      [this.type]: code
    };
  }
  
  async transform() {
    if (this.options.minify) {
      await terser(this);
    }
  }
}

module.exports = ElmAsset;
