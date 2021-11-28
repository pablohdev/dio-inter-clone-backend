import { Router } from 'express';
import useRouter from './user.routes';


const routes = Router();

routes.use('/user', useRouter);

export default routes;