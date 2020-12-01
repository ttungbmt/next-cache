import LRUCache from 'lru-cache';
import { isNil, merge } from 'lodash';

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

const dev = process.env.NODE_ENV !== 'production';

class NextCache {
  constructor(app, _ref = {}) {
    let {
      enabled,
      getCacheKey
    } = _ref,
        options = _objectWithoutPropertiesLoose(_ref, ["enabled", "getCacheKey"]);

    this.app = app;
    this.cacheKey = null;
    this.enabled = isNil(enabled) ? process.env.NODE_ENV !== 'production' : enabled;
    let defaultOptions = {
      max: 100 * 1024 * 1024,
      length: n => n.length,
      maxAge: 1000 * 60 * 60 * 24 * 30 // 1 month

    };
    this.options = merge(defaultOptions, options);
    this.getCacheKey = getCacheKey ? getCacheKey : req => req.headers.host + req.url;
    this.cache = new LRUCache(this.options);
  }

  async render(req, res, pagePath, queryParams) {
    const key = this.getCacheKey(req); // If we have a page in the cache, let's serve it

    if (this.cache.has(key)) {
      res.setHeader('X-LRU-Cache', 'HIT');
      res.send(this.cache.get(key));
      return;
    } // No cache present for specific key? let's try to render and cache


    try {
      const html = await this.app.renderToHTML(req, res, pagePath, queryParams); // If something is wrong with the request, let's not cache
      // Send the generated content as is for further inspection

      if (this.enabled || res.statusCode !== 200) {
        res.setHeader('X-LRU-Cache', 'SKIP');
        res.send(html);
        return;
      } // Everything seems OK... let's cache


      this.cache.set(key, html);
      res.setHeader('X-LRU-Cache', 'MISS');
      res.send(html);
    } catch (err) {
      this.app.renderError(err, req, res, pagePath, queryParams);
    }
  }

}

export default NextCache;
