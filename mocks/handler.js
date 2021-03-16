import { rest } from 'msw';

const resp = { file: 'uploaded file' };
export const handlers = [
  // Capture a GET /user/:userId request,
  rest.post('http://localhost:5000/item', (req, res, ctx) =>
    // ...and respond with this mocked response.
    res(
      ctx.status(200),
      ctx.delay(500),
      ctx.set('Content-Length', JSON.stringify(resp).length),
      ctx.set('Content-Type', 'appication/json'),
      ctx.body(JSON.stringify(resp)),
    )),
];
