/**
 * Controller for URIs
 *
 * @module
 */

'use strict';

const _ = require('lodash'),
  responses = require('../responses');

/**
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
function onlyJSONLists(req, res, next) {
  if (req.body && !_.isArray(req.body)) {
    responses.clientError(new Error('Only accepts lists.'), res);
  } else {
    next();
  }
}

function routes(router) {
  router.use(responses.varyWithoutExtension({varyBy: ['Accept']}));
  router.get('/', responses.list());
  router.get('/:name', responses.getRouteFromDB);
  router.use('/:name', onlyJSONLists);
  router.put('/:name', responses.putRouteFromDB);
}

module.exports = routes;
module.exports.onlyJSONLists = onlyJSONLists;
