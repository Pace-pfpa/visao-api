import { ILoginDTO } from '../../DTO/LoginDTO'
import {LoginSapiens} from '../../pytonRequest/loginSapiens'

export class LoginUseCase {
    async execute(data: ILoginDTO): Promise<string> {
        console.log("login inicializado")
        try{
            const user =  await LoginSapiens(data);
            console.log(user)
            return user
        }catch(e){
            console.log("ENTROU NO ERRO")
            console.log(e)
        }
        
    }
}