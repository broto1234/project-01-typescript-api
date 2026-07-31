import 'dotenv/config';
import app from './app';
import { env } from './config/env';

const PORT = env.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});