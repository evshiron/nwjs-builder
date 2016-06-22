# nwjs-builder - Contributing

First of all, thanks for taking the time to contribute!

`nwjs-builder` uses [node-async-flow](https://github.com/evshiron/node-async-flow) to achieve an async in sync grammar, it's non-standard and I use it just for convenience for the moment (but it works pretty well). You may want to read about it first so you know how `nwjs-builder` works.

`nwjs-builder` has some scripts in `package.json`, and a usual development procedure is:

```shell
git clone https://github.com/evshiron/nwjs-builder
cd nwjs-builder
npm install

# Editing...

#npm run build
npm test

# Committing...

git push
```

Testing is powered by `mocha` and it's excellent if there is a test for your code.