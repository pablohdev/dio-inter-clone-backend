import {getRepository} from "typeorm"
import {encodeKey, decodeKey} from '../../utils/pix';

import {User} from '../../entity/User';
import {Pix} from '../../entity/Pix';
import AppError from '../../shared/error/AppError';


export default class PixService {


   async request(value: number, user: Partial<User>) {
    const pixRepository = getRepository(Pix); 

    const userRepository = getRepository(User);
    const currentUser = await userRepository.findOne({where: {id: user.id}})

    const requestData = {
        requestingUser: currentUser,
        value,
        status: 'open',

    }
    const register = await pixRepository.save(requestData);

    const key = encodeKey(user.id || '', value, register.id)

    return key
   }

   async pay(key: string, user: Partial<User>) {
       const keyDecoded = decodeKey(key)

       if(keyDecoded.userId === user.id){
           throw new AppError("Não é possivel receber o PIX do mesmo usuário",401)
       }

       const pixRepository = getRepository(Pix); 
       const userRepository = getRepository(User);

       const requestingUser = await userRepository.findOne({where: {id: keyDecoded.userId}})
       const payingUser = await userRepository.findOne({where: {id: user.id}})

       if(payingUser?.wallet && payingUser.wallet < Number(keyDecoded.value)){
           throw new AppError('Não há saldo suficiente para fazer o pagamento', 401)
       }
 
       if(!requestingUser || !payingUser){
        throw new AppError('Não encontramos os clientes da transação, gere uma nova chave', 401)
       }
       
       
       requestingUser.wallet = Number(requestingUser?.wallet) + Number(keyDecoded.value);
       await userRepository.save(requestingUser)
   
        payingUser.wallet = Number(payingUser?.wallet) - Number(keyDecoded.value);
        await userRepository.save(payingUser)
        
        
        const pixTransaction = await pixRepository.findOne({where: {id: keyDecoded.registerId, status: 'open'}})

       if(!pixTransaction){
        throw new AppError('Chave inválida par pagamento', 401)
       }

       pixTransaction.status = 'close';
       pixTransaction.payingUser = payingUser

       await pixRepository.save(pixTransaction)

       return {mag: 'Pagamento efetudo com sucesso'}
   }

   async transactions(user: Partial<User>) {
    const pixRepository = getRepository(Pix); 
   

    const pixReceived = await (await pixRepository.find({where: {requestingUser: user.id, status: 'close'}, relations: ['payingUser']}))

    const pixPaying = await pixRepository.find({where: {payingUser: user.id, status: 'close'}, relations: ['requestingUser']})

    const received = pixReceived.map(transaction => ({
        value: transaction.value, 
        user: {
            firstname: transaction.payingUser.firstName,
            lastName: transaction.payingUser.lastName,
        },
        updatedAt: transaction.updatedAt,
        type: 'received'
    }));

    const paying = pixPaying.map(transaction => ({
        value: transaction.value, 
        user: {
            firstname: transaction.requestingUser.firstName,
            lastName: transaction.requestingUser.lastName,
        },
        updatedAt: transaction.updatedAt,
        type: 'paid'
    }));

    const allTransactions = received.concat(paying);

    allTransactions.sort(function (a, b) {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateA < dateB ? 1 : -1;  
      });

    return allTransactions
   }
}