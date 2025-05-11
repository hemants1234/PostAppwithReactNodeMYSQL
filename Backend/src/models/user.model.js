// models/UserModel.js
import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sequelize from './../db/index.js';  // Your Sequelize instance

class User extends Model {
  // Compare passwords
  async isPasswordCorrect(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Generate Access Token
  generateAccessToken() {
    return jwt.sign(
      {
        id: this.id,
        email: this.email,
        fullname: this.fullname,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
  }

  // Generate Refresh Token
  generateRefreshToken() {
    return jwt.sign(
      { id: this.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
  }
}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'editor', 'user'),
      defaultValue: 'user'
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
  verificationToken: {
      type: DataTypes.STRING
  }
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true,
    indexes: [
      { fields: ['username'] },
      { fields: ['fullname'] }
    ]
  }
);

// Normalize input before validation
User.addHook('beforeValidate', (user) => {
  if (user.username) user.username = user.username.trim().toLowerCase();
  if (user.email) user.email = user.email.trim().toLowerCase();
  if (user.fullname) user.fullname = user.fullname.trim();
});

// Hash password before saving
User.addHook('beforeSave', async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

export default User;
