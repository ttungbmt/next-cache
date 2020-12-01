# next-cache
> Little LRU cache for Next.js

## Table of Contents

- [About](#about)
- [Usage](#usage)
- [Install](#install)
- [Contribute](#contribute)
- [License](#License)

## About

Based on [this article](https://medium.com/@igordata/how-to-cache-all-pages-in-next-js-at-server-side-1850aace87dc) by Igor Data.

## Usage

```js
const express = require('express')
const next = require('next')

const nextCache = require('next-lru-cache')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev  })
const ssrCache = nextCache(app, {enabled: !dev})

app
  .prepare()
  .then(() => {
    const server = express()
    
    server.get('/', (req, res) => {
      ssrCache.render(req, res, '/', {});
    });

    server.listen(3000, err => {
      if (err) {
        throw err
      }
      console.log('> Running on port 3000')
    })
  })
  .catch(error => {
    console.error(error.stack)
    process.exit(1)
  })

```


## Install

This project uses [node](https://nodejs.org) and [npm](https://www.npmjs.com).

It requires [express](https://expressjs.com/) and [next](https://nextjs.org/) as peer dependencies.

```sh
$ npm install next-cache
$ # OR
$ yarn add next-cache
```

## Contribute

1. Fork it and create your feature branch: `git checkout -b my-new-feature`
2. Commit your changes: `git commit -am "Add some feature"`
3. Push to the branch: `git push origin my-new-feature`
4. Submit a pull request

## License

MIT