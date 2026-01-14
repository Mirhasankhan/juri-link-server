import Express from "express";
import validateRequest from "../../middleware/validateRequest";
import { postController } from "./post.controller";
import { PostValidationSchema } from "./post.validation";
import auth from "../../middleware/auth";
import rateLimiter from "../../middleware/rateLimiter";

const router = Express.Router();

router.post(
  "/create",
  auth("User"),
  validateRequest(PostValidationSchema),
  postController.createPost
);
router.get("/",rateLimiter(1, 5), postController.allPosts);
router.get("/:id", postController.postDetails);
router.patch("/:id", auth(), postController.likeUnlikePost);
router.post(
  "/comment/create",
  auth(),
  postController.createComment
);
router.post(
  "/reply/create",
  auth(),
  postController.createReply
);

export const postRoutes = router;
