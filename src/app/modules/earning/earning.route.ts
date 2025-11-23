import Express from "express";
import auth from "../../middleware/auth";
import { earningController } from "./earning.controller";

const router = Express.Router();

router.get(
  "/summary",
  auth("Lawyer"),
  earningController.lawerysEarningsSummary
);

router.post(
  "/withdraw-request",
  auth(),
  earningController.createWitdrawRequest
);
router.get(
  "/withdraw-history",
  auth("Lawyer"),
  earningController.withdrawHistory
);

export const earningRoutes = router;
