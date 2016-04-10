const chai = require('chai');
const expect = chai.expect;
const parseString = require('xml2js').parseString;
const lib = require('../src/lib');
const path = require('path');
const Promise = require('promise');
const fs = require('fs-promise');
const testUtils = require('./testUtils');
const spm = require('../src/index');

chai.use(require('chai-fs'));



describe('index', () => {
  const tmpDir = path.resolve(__dirname, 'tmp');
  beforeEach(() => ( fs.ensureDirSync(tmpDir) ));

  it('should take a list of packagepaths, and a destination path, copy the contents (minus the package.xml) and then write a merged package.xml', () => {
    return spm([
      testUtils.getMockXmlPath('mock-package1'),
      testUtils.getMockXmlPath('mock-package2')], tmpDir)
    .then(() => {

      expect(path.join(tmpDir, 'staticresources', 'otherjs.resource')).to.be.a.file();
      expect(path.join(tmpDir, 'staticresources', 'otherjs.resource-meta.xml')).to.be.a.file();
      expect(path.join(tmpDir, 'staticresources', 'manifestjs.resource')).to.be.a.file();
      expect(path.join(tmpDir, 'staticresources', 'manifestjs.resource-meta.xml')).to.be.a.file();
      expect(path.join(tmpDir, 'classes', 'FunnyClass.class')).to.be.a.file();
      expect(path.join(tmpDir, 'classes', 'FunnyClass.class-meta.xml')).to.be.a.file();
      expect(path.join(tmpDir, 'pages', 'FunnyPage.page')).to.be.a.file();
      expect(path.join(tmpDir, 'pages', 'FunnyPage.page-meta.xml')).to.be.a.file();
      expect(path.join(tmpDir, 'package.xml')).to.be.a.file();
    });
  });
  afterEach(() => ( fs.remove(tmpDir) ));

});
