import { app } from "./app";
import dotenv from 'dotenv';

dotenv.config();

app.get('/', (req, res) => res.send('Hello World 100!'))

app.listen(3000, () => console.log('Visao runing in PORT 3000'));