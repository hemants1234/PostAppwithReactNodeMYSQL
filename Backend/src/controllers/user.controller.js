import {asyncHandler} from "../utils/asyncHandler.js";
import { Op }  from 'sequelize';
import {ApiError} from "../utils/ApiError.js";
import User from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { oauth2Client } from '../utils/googleClient.js';
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import axios from 'axios';
import nodemailer from 'nodemailer';
import  {v4 as uuidv4}  from 'uuid';


const generateAccessAndRefreshTokens = async(userId) => {

  try {

     const user = await User.findByPk(userId)
     const accessToken = user.generateAccessToken()
     const refreshToken = user.generateRefreshToken()
    

      user.refreshToken = refreshToken
      //console.log("check token", user.refreshToken)
      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken}

    } catch (error) {

      throw new ApiError(500, "Something Went Wrong while generating refresh and access tokes")
    }
}

const registerUser = asyncHandler( async (req, res) => {

  const { fullname, email, password } = req.body;
  const role = req.body.role || 'user'; // Default role if not provided in request
  const verificationToken = uuidv4();


  if ([fullname, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if the user already exists by email
  const existedUser = await User.findOne({
    where: { email }
  });


  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  // Handle coverImage file upload
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  
  // Create new user record
  const user = await User.create({
    fullname,
    username: fullname,
    coverImage: coverImage?.url || "", // Ensure coverImage URL is used
    email,
    password,
    role,
    verificationToken,
    isVerified: false 
  });

  // Since Sequelize automatically returns the created user, no need for findByPk
  const createdUser = {
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    coverImage: user.coverImage,
    role: user.role,
 };

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const verificationLink = `${process.env.MAIL_VERIFY_URL}/api/v1/users/verify-email?token=${verificationToken}`;


  const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.OWNER_EMAIL,
        pass: process.env.OWNER_EMAIL_PASSWORD

      }
    });

    await transporter.sendMail({
      from: process.env.OWNER_EMAIL,
      to: email,
      subject: 'Verify your email',
      html: `<p>Please verify your email by clicking <a href="${verificationLink}">here</a>.</p>`
    });

  // Send response
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
  );

});

const verifyEmail = asyncHandler( async (req, res) => {
    console.log(req.query)
        const { token } = req.query;
        try {
          const user = await User.findOne({ where: { verificationToken: token } });
          if (!user || user.verificationToken == null) return res.status(400).sendsend(`
            <html>
              <head><title>Verification Failed</title></head>
              <body>
                <h1>Invalid or Expired Token</h1>
                <p>Your email verification link is invalid or has already been used.</p>
              </body>
            </html>
          `);
      
          user.isVerified = true;
          user.verificationToken = null;
          await user.save();
      
          res.send(`
            <html>
              <head><title>Email Verified</title></head>
              <body>
                <h1>Success!</h1>
                <p>Your email has been successfully verified.</p>
              </body>
            </html>
          `);
        } catch (err) {
          res.status(500).send(`
            <html>
              <head><title>Error</title></head>
              <body>
                <h1>Server Error</h1>
                <p>Something went wrong. Please try again later.</p>
              </body>
            </html>
          `);
        }
      })



const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, " email is required");
  }

  // Find user by either email or
  const user = await User.findOne({
    where: { email }
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
 
  if(user.isVerified === false){
    throw new ApiError(401, "Please verify your email before logging in");
  }
  // Check if the provided password matches
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate Access and Refresh Tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id);

  // Exclude sensitive data from the user object before sending the response
  const loggedInUser = {
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    coverImage: user.coverImage,
    role: user.role, // Include role if needed
    
  };

  // Set cookie options (you can add domain and path if needed)
  const options = {
    httpOnly: true,
      secure: true
  }

  // Send cookies and response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});


// google login method 

const googleAuth = asyncHandler(async (req, res) => {
  const code = req.query.code;
  console.log(code);
  
  try {
      const googleRes = await oauth2Client.getToken(code);
      console.log(googleRes);

      oauth2Client.setCredentials(googleRes.tokens);
      const userRes = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
      );
      const { email, name, picture } = userRes.data;
      console.log(userRes);
      let user =  await User.findOne({
        where: { email }
      });


      if (!user) {
          user = await User.create({
            fullname:name,
            username: name,
            coverImage: picture || "", // Ensure coverImage URL is used
            email: email,
            password: 'google_test',
            role: 'user',
            verificationToken: null,
            isVerified: true 
          });
      }
      const { id } = user;
     // const token = jwt.sign({ id, email },
     //     process.env.JWT_SECRET, {
     //     expiresIn: process.env.JWT_TIMEOUT,
     // });
      const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(id)

      const updatedUser = await User.update(
        { refreshToken: refreshToken },
        { where: { id: id } }
      );
      let UserData =  await User.findOne({
        where: { email }
      });
      console.log("thisis updated user", UserData)
      const options = {
          httpOnly: true,
          secure: true
      }

      res.status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json({
          message: 'success',
          accessToken,
          refreshToken,
          UserData
      });
  } catch (err) {
      console.log(err);
      res.status(500).json({
          message: "Internal Server Error"
      })
  }
});



const logoutUser = asyncHandler(async (req, res) => {
    try {
      // Find the user by their primary key (id)
      const user = await User.findByPk(req.user.id);
  
      if (!user) {
        throw new ApiError(404, "User not found");
      }
  
      // Clear the refresh token (this would typically be done in the database)
      await user.update({
        refreshToken: null,  // Set refreshToken to null to log out
      });
  
      // Clear cookies from the response
      const options = {
        httpOnly: true,
          secure: true
      }
  
      // Clear both accessToken and refreshToken cookies
      return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
      
    } catch (error) {
      throw new ApiError(500, "An error occurred while logging out");
    }
  });

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    // Verify the refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the user using the ID from the decoded token
    const user = await User.findByPk(decodedToken.id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Validate that the incoming refresh token matches the user's stored token
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // Generate new access and refresh tokens
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user.id);

    // Set cookie options
    const options = {
        httpOnly: true,
          secure: true
      }

    // Update the user's refresh token in the database
    await user.update({ refreshToken: newRefreshToken });

    // Send back the new access and refresh tokens in the response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200, 
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
  
const changeCurrentUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    console.log("this is old password", oldPassword, newPassword)
    // Find the user by primary key (id)
    console.log("this is user id", req.user.id)
    const user = await User.findByPk(req.user.id);

    console.log(user)
  
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    // Compare the old password with the stored password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  
    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password");
    }
  
    // Update the user's password (the password will be hashed by the beforeSave hook)
    user.password = newPassword;
  
    // Save the updated user record
    await user.save();
  
    // Respond with success
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
  });

const getCurrentUser = asyncHandler(async (req, res) => {
    // Check if the user exists in the request object
    if (!req.user) {
      throw new ApiError(401, "User not authenticated");
    }
  
    // Return the user data in the response
    return res.json(new ApiResponse(200, req.user, "Current user fetched successfully"));
  });
  
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;
  
    if (!fullname && !email) {
      throw new ApiError(400, "At least one field (fullname or email) is required");
    }
  
    // Find user by primary key
    const user = await User.findByPk(req.user?.id); // or req.user.id if you're using id consistently
  
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    // Update user fields
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
  
    await user.save(); // Save changes to DB
  
    // Remove sensitive fields
    const userData = {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      coverImage: user.coverImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  
    return res
      .status(200)
      .json(new ApiResponse(200, userData, "Account details updated successfully"));
  });

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
  
    if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover image file is missing");
    }
  
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  
    if (!coverImage?.url) {
      throw new ApiError(400, "Error while uploading cover image");
    }
  
    const user = await User.findByPk(req.user?.id); // or req.user?.id depending on your auth setup
  
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    // Update cover image and save
    user.coverImage = coverImage.url;
    await user.save();
  
    // Prepare response data (excluding sensitive fields)
    const userData = {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      coverImage: user.coverImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  
    return res
      .status(200)
      .json(new ApiResponse(200, userData, "Cover image updated successfully"));
  });
  

export {
    registerUser,
    verifyEmail,
    loginUser,
    googleAuth,
    logoutUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserCoverImage,
  }