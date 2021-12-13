import { Router } from 'express';

import userRouter from './user.routes';
import pixRouter from './pix.routes';


const routes = Router();

routes.use('/user', userRouter);
routes.use('/pix', pixRouter);

export default routes;