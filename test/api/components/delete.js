'use strict';

var app,
  _ = require('lodash'),
  express = require('express'),
  endpointName = _.startCase(__dirname.split('/').pop()),
  filename = _.startCase(__filename.split('/').pop().split('.').shift()),
  request = require('supertest-as-promised'),
  sinon = require('sinon'),
  routes = require('../../../services/routes'),
  files = require('../../../services/files'),
  db = require('../../../services/db'),
  bluebird = require('bluebird'),
  hostname = 'localhost.vulture.com';

/**
 * @param path
 * @param status
 * @param [data]
 */
function acceptsJson(path, status, data) {
  it('accepts json', function () {
    var promise = request(app)
      .del(path)
      .set('Host', hostname)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(status);

    if (data) {
      promise.expect(data);
    }

    return promise;
  });
}

/**
 * @param path
 * @param status
 */
function acceptsHtml(path, status) {
  it('accepts html', function () {
    return request(app)
      .del(path)
      .set('Host', hostname)
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect(status);
  });
}

describe(endpointName, function () {
  var sandbox,
    data = { name: 'Manny', species: 'cat' };

  before(function () {
    return bluebird.all([
      db.put('/components/valid', JSON.stringify(data)),
      db.put('/components/valid/instances/valid', JSON.stringify(data))
    ]);
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe(filename, function () {
    var getComponentPath;
    beforeEach(function () {
      getComponentPath = sandbox.stub(files, 'getComponentPath');
      getComponentPath.withArgs('valid').returns('validThing');
      getComponentPath.withArgs('missing').returns('missingThing');
      getComponentPath.withArgs('invalid').returns(null);

      app = express();
      routes.addHost(app, hostname);
    });

    describe('/components', function () {
      var uriPath = this.title;
      acceptsJson(uriPath, 405);
      acceptsHtml(uriPath, 405);
    });

    describe('/components/:name', function () {
      var uriPath = this.title;

      /**
       * An invalid component should give 404, because there is no resource (component) by that name.
       */
      describe('invalid component', function () {
        var invalidComponentPath = uriPath.replace(':name', 'invalid');
        acceptsJson(invalidComponentPath, 404);
        acceptsHtml(invalidComponentPath, 404);
      });

      /**
       * If it exists, that resource should be 200 if successful.
       *
       * Should return the data that was deleted.
       */
      describe('when exists', function () {
        var validComponentPath = uriPath.replace(':name', 'valid');
        acceptsJson(validComponentPath, 200, data);
        acceptsHtml(validComponentPath, 406);
      });

      /**
       * When the component exists, but there is simply no data.
       */
      describe('when missing', function () {
        var missingComponentPath = uriPath.replace(':name', 'missing');
        acceptsJson(missingComponentPath, 404);
        acceptsHtml(missingComponentPath, 406);
      });
    });

    /**
     * Deleting the instances namespace is simply not allowed
     */
    describe('/components/:name/instances', function () {
      var uriPath = this.title.replace(':name', 'valid');
      acceptsJson(uriPath, 405);
      acceptsHtml(uriPath, 406);
    });

    describe('/components/:name/instances/:id', function () {
      var uriPath = this.title;

      /**
       * An invalid component should give 404, because there is no resource (component) by that name.
       */
      describe('invalid component', function () {
        var invalidComponentPath = uriPath.replace(':name', 'invalid').replace(':id', 'valid');
        acceptsJson(invalidComponentPath, 404);
        acceptsHtml(invalidComponentPath, 404);
      });

      /**
       * If it exists, that resource should be 200 if successful.
       *
       * Should return the data that was deleted.
       */
      describe('when exists', function () {
        var validComponentPath = uriPath.replace(':name', 'valid').replace(':id', 'valid');
        acceptsJson(validComponentPath, 200, data);
        acceptsHtml(validComponentPath, 406);
      });

      /**
       * When the component exists, but there is simply no data.
       */
      describe('when missing', function () {
        var missingComponentPath = uriPath.replace(':name', 'valid').replace(':id', 'missing');
        acceptsJson(missingComponentPath, 404);
        acceptsHtml(missingComponentPath, 406);
      });
    });
  });
});