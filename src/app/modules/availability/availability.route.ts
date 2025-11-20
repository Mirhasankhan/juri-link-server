import express from "express";
import { availabilityController } from "./availability.controller";
import auth from "../../middleware/auth";

const router = express.Router();

router.post(
  "/create",
  auth("Lawyer"),
  availabilityController.createAvailability
);
router.get("/", availabilityController.availabilityForDay);
router.get("/expert-slots", availabilityController.getExpertDayWiseSlots);
router.get("/all-slots", auth("Lawyer"), availabilityController.expertAllSlots);
router.post("/create-slot", auth("Lawyer"), availabilityController.addNewSlot);
router.put("/update-slot", availabilityController.updateSlot);
router.delete("/slot/:id", availabilityController.deleteSlot);

export const availabilityRoutes = router;
