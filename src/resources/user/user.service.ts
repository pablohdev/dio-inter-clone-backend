import {getRepository} from "typeorm"
import { sign } from 'jsonwebtoken';
import {User} from '../../entity/User';
import AppError from '../../shared/error/AppError';
import authConfig from '../../config/auth';

import {UserSignIn} from './dtos/user.signin.dtos'
import {UserSignUp} from './dtos/user.signup.dtos'

export default class UserService {


    async signin(user: UserSignIn) {
       const userRepository = getRepository(User);
       const existUser = await userRepository.findOne({where: {email: user.email, password: user.password}})

       if(!existUser){
         throw new AppError('Usuário não encontrato', 401);
       }


       const { secret, expiresIn } = authConfig.jwt;

       const token = sign({
           firstName: existUser.firstName,
           lastName: existUser.lastName,
           accountNumber: existUser.accountNumber,
           accountDigit: existUser.accountDigit,
           wallet: existUser.wallet
       }, secret, {
           subject: existUser.id,
           expiresIn,
       });
 
       const { password, ...rest} = existUser
        
       return {rest, token}
    }

    async signup(user: UserSignUp) {
        const userRepository = getRepository(User);

        const existUser = await userRepository.findOne({where: {email: user.email}})

        if(existUser){
          throw new AppError('Já existe um usuário cadastrado com esse email', 401);
        }

        const userData = {
            ...user,
            wallet: 0,
            accountNumber: Math.floor(Math.random() * 999999),
            accountDigit: Math.floor(Math.random() * 99)
        }

        const userCreate =  await userRepository.save(userData);

        const { secret, expiresIn } = authConfig.jwt;
        
        const token = sign({
            firstName: user.firstName,
            lastName: user.lastName,
        }, secret, {
            subject: userCreate.id,
            expiresIn,
        });
  
        
        return {userCreate, token};
     }
}