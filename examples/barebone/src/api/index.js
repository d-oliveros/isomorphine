var isomorphine = require('isomorphine');

/**
 * This will provide the entities in this folder.
 * It's similar to 'require-all' but in a browser-compatible way.
 *
 * You should require this file directly from the browser,
 * as it will let you use server-side modules located in this folder remotely.
 */
module.exports = isomorphine.proxy();
