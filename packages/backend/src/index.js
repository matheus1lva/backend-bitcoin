import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { userRouter } from './modules/users/user.routes.js';
import { passKeyRouter } from './modules/passkey/pass-key.routes.js';
import { bitcoinRouter } from './modules/bitcoin/bitcoin.routes.js';
import { plaidRouter } from './modules/plaid/plaid.routes.js';
import { loggerMiddleware } from './middleware/logger.middleware.js';
import {
  jsonParserMiddleware,
  urlencodedMiddleware,
} from './middleware/native.middleware.js';

const app = express();

app.use(
  cors({
    origin: 'localhost:5173',
    credentials: true,
  }),
);

app.use(jsonParserMiddleware);
app.use(urlencodedMiddleware);
app.use(loggerMiddleware);

const v1Router = express.Router();
app.use('/v1', v1Router);

v1Router.use('/users', userRouter);
v1Router.use('/passkey', passKeyRouter);
v1Router.use('/bitcoin', bitcoinRouter);
v1Router.use('/payment', plaidRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
