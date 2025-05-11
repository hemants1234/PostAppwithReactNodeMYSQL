import dotenv from "dotenv"
import sequelize from './db/index.js';
import {app} from './app.js'
dotenv.config({
    path: './.env'
})


app.listen(3002, async () => {
    console.log('🚀 Server running on http://localhost:3002');
  
    try {
      
      await sequelize.authenticate();
      console.log('✅ DB connected');
      await sequelize.sync({ alter: true }); // This creates/updates the tables
  
    } catch (error) {
      console.error('❌ DB connection error:', error.message);
    }
  });
  
