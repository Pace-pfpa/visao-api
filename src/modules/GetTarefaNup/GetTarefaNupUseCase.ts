import { IGetTarefaDTO } from "../../DTO/GetTarefaDTO";
import { IGetTarefaNupDTO } from "../../DTO/GetTarefaNupDTO";
import { RequestSapiens } from "../../pytonRequest/requestSapiens";
import { RequestGetTarefaNup } from "../../sapiensOperations/resquest/RequestGetTarefaNup"

export class GetTarefaNupUseCase {
    constructor(private RequestGetTarefaNup:RequestGetTarefaNup){};
    async execute(data: IGetTarefaNupDTO): Promise<Array<any>> {
        const getTarefa = await this.RequestGetTarefaNup.executeMerda(data.usuario_id, data.nup, data.processoJudicial ,data.qunatidadeDeProcesso);
        
        
        const response = (await RequestSapiens(data.cookie, getTarefa))
        return response;
    }
}