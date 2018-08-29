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
    const parserOptions = {
      cwd: process.cwd(),
    };
    
    if (this.options.minify) {
      parserOptions.optimize = true;
    }
    
    return parserOptions;
  }
  
  async collectDependencies() {
    const { findAllDependencies } = await localRequire('find-elm-dependencies', this.name);
    const dependencies = await findAllDependencies(this.name);
    
    dependencies.forEach(dependency => {
      this.addDependency(dependency, { includedInParent: true });
    });
  }
  
  async parse() {
    const options = this.getParserOptions();
    const elm = await localRequire('node-elm-compiler', this.name);
    const compiled = await elm.compileToString(this.name, options);
    
    this.contents = compiled.toString();
    
    if (this.options.hmr) {
      this.contents += `
        (function () {
          if (module.hot) {
            // Disable Hot Module Replacement
            module.hot.accept();
            // Force Page Reload
            module.hot.dispose(function () {
              window.location.reload();
            });
          }
        })();
      `;
    }
  }

  async generate() {
    return {
      [this.type]: this.outputCode || this.contents
    };
  }
  
  async transform() {
    if (this.options.minify) {
      await terser(this);
    }
  }
}

module.exports = ElmAsset;
