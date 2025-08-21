import Express from "express";
import validateRequest from "../../middleware/validateRequest";
import { postController } from "./post.controller";
import { PostValidationSchema } from "./post.validation";
import auth from "../../middleware/auth";

const router = Express.Router();

router.post(
  "/create",
  auth("User"),
  validateRequest(PostValidationSchema),
  postController.createPost
);

export const postRoutes = router;
