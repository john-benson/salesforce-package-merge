const chai = require('chai');
const expect = chai.expect;
const parseString = require('xml2js').parseString;
const lib = require('../src/lib');
const path = require('path');
const Promise = require('promise');
const fs = require('fs-promise');

const getXmlMock = (name) => {
  return new Promise((resolve, reject) => {

    fs.readFile(path.join(__dirname, name))
      .then((res) => {
        return parseString(res, (err, res) => {
          err ? reject(err) : resolve(res);
        });
      });
  });

};

describe('util', () => {
  describe('fetchPackages', () => {
    it('should return an array of Promise that return JSON objects', () => {
      const result = lib.fetchPackages([
        'mocks/mock-package1', 'mocks/mock-package1'
      ]);

      return result.then(packages => {
        console.log(packages);
        expect(packages.length).to.be.a(2);
        expect(packages[0].Package).to.be.a('object');
        expect(packages[1].Package).to.be.a('object');
      });
    });

    it('should still return a list of promises if a file DNE', () => {
      const result = lib.fetchPackages([
        'mocks/mock-package1', 'mocks/mock-packagefake'
      ]);

      expect(result.length).to.be.equal(2);
      expect(result[0]).to.eventually.be.a('object');
      expect(result[1]).to.be.rejected;
    });
  });

  describe('reducePackages', () => {
    it('should reduce all package.xml into a single package.xml', () => {
      return Promise.all([getXmlMock('mocks/mock-package1/package.xml'), getXmlMock('mocks/mock-package2/package.xml')])
        .then((mocks) => {
          const result = lib.reducePackages(mocks);
          expect(result.Package.version.length).to.be.equal(1);
          expect(result.Package.types.length).to.be.equal(3);
          expect(result.Package.types[0].name[0]).to.be.equal('ApexPage');
          expect(result.Package.types[1].name[0]).to.be.equal('StaticResource');
          expect(result.Package.types[2].name[0]).to.be.equal('ApexClass');
        })
    });

    it('should throw an error if two package versions are mis-matched', () => {
      return Promise.all([getXmlMock('mocks/mock-package1/package.xml'), getXmlMock('mocks/mock-package2/package.xml')])
        .then((mocks) => {
          const boundFn = lib.reducePackages.bind(this, mocks[0], mocks[1]);
          expect(boundFn).to.throw(Error);
        });
    });

    it('should throw an error if two packages have matching resources', () => {
      return Promise.all([getXmlMock('mocks/mock-package1/package.xml'), getXmlMock('mocks/mock-package2/package.xml')])
        .then((mocks) => {
          const boundFn = lib.reducePackages.bind(this, mocks[0], mocks[1]);
          expect(boundFn).to.throw(Error);
        });
    });
  });

  describe('copyResources', () => {
    const tmpDir = path.resolve(__dirname, 'tmp');

    beforeEach(() => {
      return fs.remove(tmpDir)
        .then(() => {
          return fs.mkdir(tmpDir);
        });
    });

    it('should take a list of paths, and copy the content to the destination, and eventually return true', () => {
      const copyPromise = lib.copyResources([
        path.resolve(__dirname, 'mocks/mock-package1'), path.resolve(__dirname, 'mocks/mock-package2')
      ], tmpDir);

      return copyPromise
        .then(res => {

        });
    });
  });

})
