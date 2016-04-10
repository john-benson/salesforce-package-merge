const chai = require('chai');
const expect = chai.expect;
const lib = require('../src/lib');
const path = require('path');
const Promise = require('promise');
const fs = require('fs-promise');
const testUtils = require('./testUtils');

chai.use(require('chai-fs'));

describe('util', () => {
  describe('fetchPackages', () => {
    it('should return a list of packages as JSON', () => {
      const result = lib.fetchPackages([
        testUtils.getMockXmlPath('mock-package1'), testUtils.getMockXmlPath('mock-package1')
      ]);

      return result.then(packages => {
        expect(packages.length).to.be.equal(2);
        expect(packages[0].Package).to.be.a('object');
        expect(packages[1].Package).to.be.a('object');
      });
    });

    it('should fail to return if any package fails', () => {
      const result = lib.fetchPackages([
        testUtils.getMockXmlPath('mock-package1'), testUtils.getMockXmlPath('mock-packagefake')
      ]);

      return result.catch(err => {
        expect(err).to.be.a('Error');
      })
    });
  });

  describe('reducePackages', () => {
    it('should reduce all package.xml into a single package.xml', () => {
      return Promise.all([testUtils.getXmlMock('mock-package1/package.xml'), testUtils.getXmlMock('mock-package2/package.xml')])
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
      return Promise.all([testUtils.getXmlMock('mock-package1/package.xml'), testUtils.getXmlMock('mock-package2/package.xml')])
        .then((mocks) => {
          const boundFn = lib.reducePackages.bind(this, mocks[0], mocks[1]);
          expect(boundFn).to.throw(Error);
        });
    });

    it('should throw an error if two packages have matching resources', () => {
      return Promise.all([testUtils.getXmlMock('mock-package1/package.xml'), testUtils.getXmlMock('mock-package2/package.xml')])
        .then((mocks) => {
          const boundFn = lib.reducePackages.bind(this, mocks[0], mocks[1]);
          expect(boundFn).to.throw(Error);
        });
    });
  });

  describe('file writers', () => {
    const tmpDir = path.resolve(__dirname, 'tmp');

    beforeEach(() => ( fs.ensureDirSync(tmpDir) ));

    describe('writePackage', () => {
      it('should write a given package JSON as a package xml', () => {
        return Promise.all([testUtils.getXmlMock('mock-package1/package.xml'), testUtils.getXmlMock('mock-package2/package.xml')])
          .then((mocks) => {
            return lib.writePackage(lib.reducePackages(mocks, tmpDir), tmpDir);
          })
          .then(() => {
            expect(path.join(tmpDir, 'package.xml')).to.be.a.file();
          });
      });
    })

    describe('copyResources', () => {

      it('should take a list of paths, and copy the content to the destination, but not the package.xml', () => {
        const copyPromise = lib.copyResources([
          testUtils.getMockXmlPath('mock-package2'), testUtils.getMockXmlPath('mock-package1')
        ], tmpDir);

        expect(copyPromise.length).to.be.equal(2);

        expect(path.join(tmpDir, 'staticresources', 'otherjs.resource')).to.be.a.file();
        expect(path.join(tmpDir, 'staticresources', 'otherjs.resource-meta.xml')).to.be.a.file();
        expect(path.join(tmpDir, 'staticresources', 'manifestjs.resource')).to.be.a.file();
        expect(path.join(tmpDir, 'staticresources', 'manifestjs.resource-meta.xml')).to.be.a.file();
        expect(path.join(tmpDir, 'classes', 'FunnyClass.class')).to.be.a.file();
        expect(path.join(tmpDir, 'classes', 'FunnyClass.class-meta.xml')).to.be.a.file();
        expect(path.join(tmpDir, 'pages', 'FunnyPage.page')).to.be.a.file();
        expect(path.join(tmpDir, 'pages', 'FunnyPage.page-meta.xml')).to.be.a.file();

        // to.be.not.a.file is currently broken
        return fs.stat(path.join(tmpDir, 'package.xml'))
          .then(stats => (expect(stats).to.be.undefined))
          .catch(err => (expect(err.message).to.include('ENOENT')));
      });

      it('should throw an error if a folder DNE', () => {
        const boundFn = lib.copyResources.bind(this, [
          testUtils.getMockXmlPath('mock-packageDNE'), testUtils.getMockXmlPath('mock-package1')
        ], tmpDir);

        expect(boundFn).to.throw(Error);
      });
    });

    afterEach(() => (fs.remove(tmpDir)));
  })


})
