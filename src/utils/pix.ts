import {encode, decode} from 'js-base64';

export const encodeKey = (userID: string, value: number, registerID: string)=>{
     const part1 = encode(userID);
     const part2 = encode(value.toString());
     const part3 = encode(registerID);

     return `${part1}-${part2}-${part3}`
}

export const decodeKey = (key: string)=>{

    const keyDecode = key.split('-');

    const userId = decode(keyDecode[0]);
    const value = decode(keyDecode[1]);
    const registerId = decode(keyDecode[2]);

    return {
        userId,
        value,
        registerId
    }
}