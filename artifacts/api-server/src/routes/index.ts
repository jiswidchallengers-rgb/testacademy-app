import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import eligibilityRouter from "./eligibility";
import mcqRouter from "./mcq";
import essayRouter from "./essay";
import physicalRouter from "./physical";
import finaltestRouter from "./finaltest";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(eligibilityRouter);
router.use(mcqRouter);
router.use(essayRouter);
router.use(physicalRouter);
router.use(finaltestRouter);
router.use(statsRouter);

export default router;
