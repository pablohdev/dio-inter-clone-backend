import { Router } from 'express';
import PixController from '../resources/pix/pix.controllers';
import userAuthenticated from '../middlewares/userAuthenticated'; 


const pixRouter = Router();
const pixController = new PixController();

pixRouter.use(userAuthenticated)

pixRouter.post('/request', pixController.request)
pixRouter.post('/pay/:key', pixController.pay)
pixRouter.get('/transactions', pixController.transactions)

export default pixRouter;