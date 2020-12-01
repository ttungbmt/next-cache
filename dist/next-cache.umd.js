(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('lru-cache'), require('lodash')) :
  typeof define === 'function' && define.amd ? define(['lru-cache', 'lodash'], factory) :
  (global = global || self, global.nextCache = factory(global.lruCache, global.lodash));
}(this, (function (LRUCache, lodash) {
  LRUCache = LRUCache && Object.prototype.hasOwnProperty.call(LRUCache, 'default') ? LRUCache['default'] : LRUCache;

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

  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }

    if (result && result.then) {
      return result.then(void 0, recover);
    }

    return result;
  }

  var dev = process.env.NODE_ENV !== 'production';

  var NextCache = /*#__PURE__*/function () {
    function NextCache(app, _temp) {
      var _ref = _temp === void 0 ? {} : _temp,
          enabled = _ref.enabled,
          getCacheKey = _ref.getCacheKey,
          options = _objectWithoutPropertiesLoose(_ref, ["enabled", "getCacheKey"]);

      this.app = app;
      this.cacheKey = null;
      this.enabled = lodash.isNil(enabled) ? process.env.NODE_ENV !== 'production' : enabled;
      var defaultOptions = {
        max: 100 * 1024 * 1024,
        length: function length(n) {
          return n.length;
        },
        maxAge: 1000 * 60 * 60 * 24 * 30 // 1 month

      };
      this.options = lodash.merge(defaultOptions, options);
      this.getCacheKey = getCacheKey ? getCacheKey : function (req) {
        return req.headers.host + req.url;
      };
      this.cache = new LRUCache(this.options);
    }

    var _proto = NextCache.prototype;

    _proto.render = function render(req, res, pagePath, queryParams) {
      try {
        var _this2 = this;

        var key = _this2.getCacheKey(req); // If we have a page in the cache, let's serve it


        if (_this2.cache.has(key)) {
          res.setHeader('X-LRU-Cache', 'HIT');
          res.send(_this2.cache.get(key));
          return Promise.resolve();
        } // No cache present for specific key? let's try to render and cache


        return Promise.resolve(_catch(function () {
          return Promise.resolve(_this2.app.renderToHTML(req, res, pagePath, queryParams)).then(function (html) {
            // If something is wrong with the request, let's not cache
            // Send the generated content as is for further inspection
            if (_this2.enabled || res.statusCode !== 200) {
              res.setHeader('X-LRU-Cache', 'SKIP');
              res.send(html);
              return;
            } // Everything seems OK... let's cache


            _this2.cache.set(key, html);

            res.setHeader('X-LRU-Cache', 'MISS');
            res.send(html);
          });
        }, function (err) {
          _this2.app.renderError(err, req, res, pagePath, queryParams);
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    };

    return NextCache;
  }();

  return NextCache;

})));
