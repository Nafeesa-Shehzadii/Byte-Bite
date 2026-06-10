import { Router, type IRouter } from "express";
import healthRouter from "./health";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import driversRouter from "./drivers";
import checkoutRouter from "./checkout";
import webhooksRouter from "./webhooks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(driversRouter);
router.use(checkoutRouter);
router.use(webhooksRouter);

export default router;
