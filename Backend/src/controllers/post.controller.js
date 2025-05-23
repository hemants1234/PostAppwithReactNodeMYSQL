import { asyncHandler } from "../utils/asyncHandler.js";
import redisClient from "../utils/redisClient.js";

import { Op } from 'sequelize';
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import Post from "../models/post.model.js";


const createPost = async (req, res) => {

    try {
        // Check if the user exists in the database
        const isUserPresent = await User.findByPk(req.user?.id); // findByPk is used to fetch by primary key (id)

        if (!isUserPresent) {
            throw new ApiError(404, "User does not exist");
        }

        // Extract data from request body
        const { title, content } = req.body;

        // Create a new post and associate it with the user

        const newPost = await Post.create({
            userId: req.user?.id, // Foreign key to User    
            title,
            content,
            published: true,
            //createdBy: req.user?.id, // Foreign key to User
        });

        // Save the post to the database

        res.status(201).json({ message: 'Post created successfully', post: newPost });

    } catch (error) {
        res.status(500).json({ error: 'Failed to create post', details: error.message });
    }
};


// ...

const getAllPost = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?.id;

        const isUserPresent = await User.findOne({ where: { id: userId } });
        if (!isUserPresent) {
            throw new ApiError(401, "Unauthorized Access");
        }

        // Try to fetch from Redis
        const cacheKey = `posts:user:${userId}`;
        const cachedPosts = await redisClient.get(cacheKey);

        if (cachedPosts) {
            return res.status(200).json({
                message: 'All posts fetched from cache',
                posts: JSON.parse(cachedPosts)
            });
        }

        // Fetch from DB
        const posts = await Post.findAll();

        // Cache the result for future requests
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(posts)); // Cache for 1 hour

        res.status(200).json({
            message: 'All posts fetched from DB',
            posts: posts
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch posts',
            details: error.message
        });
    }
});

const updatePost = asyncHandler(async (req, res) => {
    const pId = req.params.pId;
    try {
        const isUserPresent = await User.findOne({
            where: { id: req.user?.id }
        });

        if (!isUserPresent) {
            throw new ApiError(401, "Unauthorized Access");
        }

        const { title, content } = req.body;
        const post = await Post.findOne({
            where: { id: pId }
        });

        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        if (title) post.title = title;
        if (content) post.content = content;

        await post.save();

        // 🔄 Invalidate related Redis cache keys
        await redisClient.del(`posts:user:${req.user?.id}`);
        await redisClient.del(`post:${pId}`);

        res.status(200).json({
            message: 'Post updated successfully',
            posts: post
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to update post',
            details: error.message
        });
    }
});


const deletePost = asyncHandler(async (req, res) => {
    try {
        const isUserPresent = await User.findOne({
            where: { id: req.user?.id }
        });

        if (!isUserPresent) {
            throw new ApiError(401, "Unauthorized Access");
        }

        const postId = req.params.postId;
        const post = await Post.findOne({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        await post.destroy(); // Delete from DB

        // 🔄 Invalidate Redis cache
        await redisClient.del(`posts:user:${req.user?.id}`);
        await redisClient.del(`post:${postId}`);

        res.status(200).json({
            message: 'Post deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete post',
            details: error.message
        });
    }
});


export {
    createPost,
    deletePost,
    getAllPost,
    updatePost
}
