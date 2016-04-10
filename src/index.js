'use strict';

const lib = require('./lib');
const path = require('path');
const Promise = require('promise'); 


module.exports = (packagePaths, destPath) => {
  const copyPromise = lib.copyResources(packagePaths, destPath);

  const packagePromise =
    lib.fetchPackages(packagePaths)
    .then(lib.reducePackages)
    .then((reducedPackage) => {
      lib.writePackage(reducedPackage, destPath);
    });

    return Promise.all([copyPromise, packagePromise]);
};
