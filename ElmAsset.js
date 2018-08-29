const elmCompiler = require('node-elm-compiler');
const { findAllDependencies } = require('find-elm-dependencies');
const process = require('process');
const Asset = require('parcel-bundler/src/Asset');

class ElmAsset extends Asset {

  getParserOptions() {
    const defaultOptions = {
      cwd: process.cwd(),
    };
    
    if (this.options.minify) {
      defaultOptions.optimize = true;
    }
    
    return defaultOptions;
  }
  
  async getDependencies() {
    await super.getDependencies();
    const deps = await findAllDependencies(this.name);
    deps.forEach(dep => {
      this.addDependency(dep, { includedInParent: true });
    });
  }

  async generate() {
    const options = this.getParserOptions();
    const compiled = await elmCompiler.compileToString(this.name, options);
    return [
      {
        type: 'js',
        value: compiled.toString()
      }
    ];
  }
}

module.exports = ElmAsset;
