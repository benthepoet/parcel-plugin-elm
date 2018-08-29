const process = require('process');
const Asset = require('parcel-bundler/src/Asset');
const localRequire = require('parcel-bundler/src/utils/localRequire');
const { minify } = require('terser');

class ElmAsset extends Asset {
  constructor(name, options) {
    super(name, options);
    this.type = 'js';
  }
  
  async collectDependencies() {
    const { findAllDependencies } = await localRequire('find-elm-dependencies', this.name);
    const dependencies = await findAllDependencies(this.name);
    
    dependencies.forEach(dependency => {
      this.addDependency(dependency, { includedInParent: true });
    });
  }
  
  async parse() {
    const elm = await localRequire('node-elm-compiler', this.name);
    
    const options = {
      cwd: process.cwd()
    };
    
    if (this.options.minify) {
      options.optimize = true;
    }
    
    const compiled = await elm.compileToString(this.name, options);
    this.contents = compiled.toString();
  }

  async generate() {
    let output = this.contents;
    
    if (this.options.hmr) {
      output += `
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
    
    if (this.options.minify) {
      output = mangle(compress(output));
    }
    
    return {
      [this.type]: output
    };
    
    function compress(source) {
        const options = {
          compress: {
            keep_fargs: false,
            pure_funcs: 'F2,F3,F4,F5,F6,F7,F8,F9,A2,A3,A4,A5,A6,A7,A8,A9'.split(','),
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true
          }
        };
      
        const { code } = minify(source, options);
        return code;
      }
      
      function mangle(contents) {
        const { code } = minify(contents, { mangle: true });
        return code;
      }
  }

}

module.exports = ElmAsset;
