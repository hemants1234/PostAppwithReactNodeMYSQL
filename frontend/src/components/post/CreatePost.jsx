import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../redux/postSlice';



export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const dispatch = useDispatch();

    // Get posts and status from Redux state
    const posts = useSelector(state => state.posts.posts);
    const status = useSelector(state => state.posts.status);
    const error = useSelector(state => state.posts.error);
     
    console.log(posts);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(createPost({ title: title, content: content }));  
        // handle API call or state update here
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md mt-10">
            <h2 className="text-2xl font-bold mb-4">Create a Post</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter post title"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="5"
                        placeholder="Write your post content..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Post
                </button>
            </form>
        </div>
    );
}
