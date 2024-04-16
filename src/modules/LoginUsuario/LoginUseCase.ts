import { ILoginDTO } from '../../DTO/LoginDTO'
import {LoginSapiens} from '../../pytonRequest/loginSapiens'

export class LoginUseCase {
    async execute(data: ILoginDTO): Promise<string> {
        const loginIsTrue = await LoginSapiens(data)
            const verifyBoolean = loginIsTrue.split("(")[1].split(",")[0].trim();
            if(verifyBoolean == "False") throw new Error()
            return await loginIsTrue.split("(")[1].split("'")[1];
        
    }
}