import { useNavigate } from 'react-router-dom';



export default function PostList({ posts, delPosts }) {


  const user = JSON.parse(localStorage.getItem('LoginUser'));
    
  let role = user?.role || null;
  let imgurl = user?.coverImage || null;
  let data = localStorage.getItem('user-info');
 // let fbData = localStorage.getItem('fb-user-info');

  let userData = JSON.parse(data);
  if(!user){
      imgurl= userData?.image || null;
      role = userData.role || null;
  }
    const navigate = useNavigate();

    return (
      <div className="w-full flex flex-wrap gap-4 p-4  mx-auto mt-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-gray-100 flex flex-col justify-between  w-80 h-96 shadow-md p-4 rounded-md mb-4 ml-5">
            <div className="overflowx-auto">
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <p className="text-gray-700 mt-2">{post.content}</p>
            </div>
            <div >
                {role == 'user'?  <div></div> : <div className='flex flex-row justify-between'>
                    <button onClick={() => delPosts(post.id)} className="text-red-500">🗑️ Delete</button>  
                    <button className="text-red-500" 
                onClick={() => navigate(`/post-update/${post.id}`, { state: { post } })}
              >✏️ Edit</button>
              </div>  
              }
            </div>
          </div>
        ))}
      </div>
    );
  }
  