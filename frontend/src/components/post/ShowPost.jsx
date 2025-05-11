import React, {useEffect} from 'react'
import PostList from './PostList';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, deletePost } from '../../redux/postSlice'; 

/*
dispatch(fetchPosts());
dispatch(createPost({ title: 'New', content: 'Post' }));
dispatch(updatePost({ id: 1, title: 'Updated', content: 'Content' }));
dispatch(deletePost(1));
*/

function ShowPost() {
    const dispatch = useDispatch();

    // Get posts and status from Redux state
    const posts = useSelector(state => state.posts.posts);
    const status = useSelector(state => state.posts.status);
    const error = useSelector(state => state.posts.error);
    //console.log("this is posts", posts);
    // Fetch posts on component mount
    useEffect(() => {
      if (status === 'idle') {
        dispatch(fetchPosts());
      }
    }, [dispatch, status]);
  
    if (status === 'loading') return <p>Loading...</p>;
    if (status === 'failed') return <p>Error: {error}</p>;

    const delPosts = async(postId) => { 
        dispatch(deletePost(postId));
    }
    
    return (
        <>
         <PostList posts={posts} delPosts={delPosts} />
        </>
    )
}

export default ShowPost;
