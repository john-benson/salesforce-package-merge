const path = require('path');
const Promise = require('promise');
const parseString = require('xml2js').parseString;
const fs = require('fs-promise');

const getMockXmlPath = (name) => {
  return path.join(__dirname, 'mocks', name)
}

const getXmlMock = (name) => {
  return new Promise((resolve, reject) => {
    const mockPath = getMockXmlPath(name);
    fs.readFile(mockPath)
      .then((res) => {
        return parseString(res, (err, res) => {
          err ? reject(err) : resolve(res);
        });
      });
  });
}

module.exports = {
  getMockXmlPath: getMockXmlPath,
  getXmlMock: getXmlMock
}
