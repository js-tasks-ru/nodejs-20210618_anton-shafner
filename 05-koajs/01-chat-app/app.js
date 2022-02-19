const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();
const arrayResolve = [];

router.get('/subscribe', async (ctx, next) => {
  try {
    promise = new Promise((resolve) => {
      arrayResolve.push(resolve);
    });
    const res = await promise;
    ctx.body = res;
  } catch (e) {
    ctx.status = 500;
    ctx.boby = 'server error';
    console.error(e);
  }
});

router.post('/publish', async (ctx, next) => {
  if (ctx.request.body.message && arrayResolve.length) {
    arrayResolve.forEach((resolve) => resolve(ctx.request.body.message));
    ctx.response.body = ctx.request.body.message;
  }
});

app.use(router.routes());

module.exports = app;
