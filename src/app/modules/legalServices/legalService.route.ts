import Express from "express";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import { parseBodyData } from "../../middleware/parseBodyData";
import { legalServiceController } from "./legalService.controller";

const router = Express.Router();

router.post(
  "/create",
  FileUploadHelper.upload.array("files", 1),
  parseBodyData,
  legalServiceController.createLegalService
);
router.get("/", legalServiceController.getLegalServices)
router.get("/:id", legalServiceController.getSingleService)

export const legalServiceRoutes = router;
