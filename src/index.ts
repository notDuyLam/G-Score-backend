import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './config/db';
import './models/student.model';
// import studentRoutes from './routes/student.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// app.use('/api/students', studentRoutes);

sequelize.sync().then(() => {
  console.log('Database synced!');
});

app.get('/', (_req, res) => {
    res.send('server is running')
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
