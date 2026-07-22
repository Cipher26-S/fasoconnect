import app from './app-express.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FasoConnect backend running on port ${PORT}`);
});
