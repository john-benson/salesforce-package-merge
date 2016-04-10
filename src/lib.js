const Promise = require('promise');
const thenifyAll = require('thenify-all');
const xml2js = thenifyAll(require('xml2js'), {}, ['parseString']);
const union = require('lodash/union');
const groupBy = require('lodash/groupBy');
const values = require('lodash/values');
const uniq = require('lodash/uniq');
const filter = require('lodash/filter');
const includes = require('lodash/includes');
const fs = require('fs-promise');
const path = require('path'); 

const builder = new xml2js.Builder();

const PACKAGE_XML = 'package.xml';

module.exports = {
  writePackage: (packageJson, filePath) => (
    fs.writeFile(path.join(filePath, PACKAGE_XML), builder.buildObject(packageJson))
  ),

  fetchPackages: paths => {
    return Promise.all(paths.map(filePath => {
      return fs.readFile(path.join(filePath, PACKAGE_XML))
        .then(file => (xml2js.parseString(file)))
    }));
  },

  copyResources: (paths, dest) => {
    return paths.map(path => {
      fs.copySync(path, dest, (fileName) => (!fileName.endsWith(PACKAGE_XML)))
      return true;
    });
  },

  reducePackages: packages => {
    return packages.reduce((result, next) => {
      const groups = groupBy(union(next.Package.types, result.Package.types), (item) => {
        return item.name[0];
      });

      Object.keys(groups).forEach(groupName => {
        groups[groupName] = groups[groupName].reduce((result, next) => {
          const members = result.members.concat(next.members);

          const dupes = filter(members, function (value, index, iteratee) {
             return includes(iteratee, value, index + 1);
          });

          if(dupes.length > 0) {
            throw new Error(`Duplicate elements found for ${ groupName }: ${ dupes }`)
          }

          return {
            name: result.name,
            members
          }
        });
      });

      result.Package.types = values(groups);

      if(result.Package.version[0] !== next.Package.version[0]) {
        throw new Error(`Package version mismatch: ${ result.Package.version[0] } and ${ next.Package.version[0] }`)
      }

      return result;
    });

  }
}
