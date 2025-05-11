import {Router} from 'express';
import { createPost, getAllPost, deletePost, updatePost } from '../controllers/post.controller.js';
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {authorizeRoles} from "../middlewares/authRoleCheck.middleware.js";

const router = Router()

router.use(verifyJWT, authorizeRoles("admin", "editor"));


router.route("/create-post").post(createPost);
router.route("/get-post").get(getAllPost);
router.route("/delete-post/:postId").delete(deletePost);
router.route("/update-post/:pId").patch(updatePost);

export default router;


