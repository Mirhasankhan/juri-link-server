import Express from "express";
import { FileUploadHelper } from "../../helpers/filUploadHelper";
import { parseBodyData } from "../../middleware/parseBodyData";
import { legalServiceController } from "./legalService.controller";
import validateRequest from "../../middleware/validateRequest";
import { LegalValidationSchema } from "./legal.validation";

const router = Express.Router();

router.post(
  "/create",
  FileUploadHelper.upload.array("serviceMedia", 1),
  parseBodyData,
  validateRequest(LegalValidationSchema),
  legalServiceController.createLegalService
);
router.get("/", legalServiceController.getLegalServices);
router.get("/:id", legalServiceController.getSingleService);

export const legalServiceRoutes = router;
