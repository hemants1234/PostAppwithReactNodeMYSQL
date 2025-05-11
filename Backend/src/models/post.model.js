// models/Post.js
import { DataTypes, Model } from 'sequelize';
import sequelize from './../db/index.js';  // Your Sequelize instance
import User from './user.model.js'; // Assuming default export from UserModel.js

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'posts',
  timestamps: true
});

// Add association to User
Post.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Post, { foreignKey: 'userId' });

export default Post;
