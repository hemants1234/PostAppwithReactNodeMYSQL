import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('postapp', 'root', '19061996', {  host: 'localhost',
  dialect: 'mysql',
});

export default sequelize;

