'use strict';

const path = require('path'),
      domParser = require('xmldom').DOMParser,
      pkg = require('./package.json'),
      dependencies = Object.keys(pkg.dependencies),
      fs = require('fs'),
      parseString = require('xml2js').parseString,
      Builder = require('xml2js').Builder,
      merge = require('webpack-merge');

const list = dependencies.map(dep => {
  const depPath = path.resolve(path.join(PATHS.npm, dep)),
        depPkg = require(path.join(depPath, 'package.json')),
        salesforcePackage = depPkg.salesforcePackage,
        packageXml = fs.readFileSync(path.join(depPath, salesforcePackage, 'package.xml'));

  const resp = new Promise((resolve, reject) => {
    parseString(packageXml, { mergeAttrs: true }, (err, res) => (err ? reject(err) : resolve(res)));
  });

  return resp;
});

Promise.all(list)
  .then(items => {
    return items.reduce((res, next) => {
      console.log(JSON.stringify(res));
      console.log(JSON.stringify(next));
      const nextTypes = next.Package.types;
      const version = next.Package.version;

      const resTypes = res.Package.types;
      const resVersion = res.Package.version;

      for(const nextType of nextTypes) {
        const typeName = nextType.name[0];

        const existingType = resTypes.find(item => {
          return item === item.name[0]
        });
      }
    });
  })
  .then(reduced => {
    const builder = new Builder();
    return builder.buildObject(reduced);
  })
  .then(xml => {
    console.log(xml);
  });
