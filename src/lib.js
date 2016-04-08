const Promise = require('promise');
const parseString = require('xml2js').parseString;
const union = require('lodash/union');
const groupBy = require('lodash/groupBy');
const values = require('lodash/values');
const uniq = require('lodash/uniq');
const filter = require('lodash/filter');
const includes = require('lodash/includes');
const fse = require('fs-extra');
const fs = require('fs-promise');
const path = require('path');

module.exports = {
  fetchPackages: paths => {
    return Promise.all(paths.map(filePath => {
      return new Promise((resolve, reject) => {
        fs.readFile(path.join(filePath, 'package.xml'))
          .then((err, res) => {
            console.log(res);
            if(err) {
              reject(err);
            }

            parseString(res, (jsonRes) => {
              resolve(jsonRes);
            });
          })
      });
    }));
  },

  copyResources: (paths, dest) => {
    return Promise.all(paths.map(path => {
      return fs.copy(path, dest, { filter: /\package.xml?$/ });
    }));
  },

  reducePackages: packages => {
    return packages.reduce((result, next) => {
      const groups = groupBy(union(next.Package.types, result.Package.types), (item) => {
        return item.name[0];
      });

      Object.keys(groups).forEach(groupName => {
        groups[groupName] = groups[groupName].reduce((result, next) => {
          const members = [...result.members, ...next.members];

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
