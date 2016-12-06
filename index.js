'use strict';

// services exposed to outside
module.exports = require('./lib/setup');
module.exports.db = require('./lib/services/db');
module.exports.search = require('./lib/services/search');
module.exports.composer = require('./lib/services/composer');
module.exports.components = require('./lib/services/components');
module.exports.schedule = require('./lib/services/schedule');
module.exports.pages = require('./lib/services/pages');
module.exports.sites = require('./lib/services/sites');
module.exports.references = require('./lib/services/references');
module.exports.log = require('./lib/services/log');
module.exports.pageTitleService = require('./lib/services/page-list').pageTitleService;
module.exports.pageAuthorsService = require('./lib/services/page-list').pageAuthorsService;
