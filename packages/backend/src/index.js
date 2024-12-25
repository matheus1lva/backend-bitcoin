import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { userRouter } from './modules/users/user.routes';

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const v1Router = express.Router();
app.use('/v1', v1Router);

v1Router.use('/users', userRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
