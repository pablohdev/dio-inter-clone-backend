import { Router } from 'express';
import UserController from '../resources/user/user.controllers';

const useRouter = Router();
const userController = new UserController();

useRouter.post('/signin', userController.signin)
useRouter.post('/signup', userController.signup)

export default useRouter;