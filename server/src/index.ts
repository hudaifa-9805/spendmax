import express from 'express';
import cors from 'cors';
import router from './routes';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`SpendMax API running on http://localhost:${PORT}`);
});
