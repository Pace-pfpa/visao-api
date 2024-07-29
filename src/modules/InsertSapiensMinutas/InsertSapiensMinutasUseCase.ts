
import { getUsuarioUseCase } from '../GetUsuario';
import { loginUseCase } from '../LoginUsuario';
import { getTarefaUseCase } from '../GetTarefa';
import { uploadDocumentUseCase } from '../UploadDocument';
import { createDocumentoUseCase } from '../CreateDocumento';
import { IInserirMemoriaCalculoDTO } from '../../DTO/InserirMemoriaCalculoDTO';
import { updateEtiquetaUseCase } from '../UpdateEtiqueta';
import { getTarefaUseCaseNup } from '../GetTarefaNup';


export class InsertSapiensMinutasUseCase {

    async execute(data: IInserirMemoriaCalculoDTO): Promise<any> {
        console.log("CHEGOU MINUTA")
        console.log(data.minutas[0].conteudo)
        const cookie = await loginUseCase.execute(data.login);
        const usuario = (await getUsuarioUseCase.execute(cookie));
        const usuario_id = `${usuario[0].id}`;
       
        const usuario_nome = `${usuario[0].nome}`;
        var tidNumber = 3;
        const minutas = data.minutas;
        let response: Array<any> = [];
        for(let k= 0; k<data.minutas.length; k++){
            const tarefas = await getTarefaUseCaseNup.execute({ cookie, usuario_id, nup: data.minutas[k].nup})
            


            for (var i = 0; i < tarefas.length; i++) {
/*                 console.log("i tarefas anexar: " + i);
                console.log(tarefas[i]) */
                var processo: string;
                var processos: any;
                let processoAFazerPelaNup;
                let processoAfazer;
                for (let j = 0; j < tarefas[i].pasta.interessados.length ; j++) {
                    if((tarefas[i].pasta.interessados[j].pessoa.nome !== "MINIST�RIO P�BLICO fEDERAL (PROCURADORIA)" && 
                    tarefas[i].pasta.interessados[j].pessoa.nome !== "MINISTERIO PUBLICO FEDERAL (PROCURADORIA)" &&
                    tarefas[i].pasta.interessados[j].pessoa.nome !== "CENTRAL DE ANÁLISE DE BENEFÍCIO - CEAB/INSS" &&
                            tarefas[i].pasta.interessados[j].pessoa.nome !== "INSTITUTO NACIONAL DO SEGURO SOCIAL-INSS" &&
                            tarefas[i].pasta.interessados[j].pessoa.nome !== "INSTITUTO NACIONAL DO SEGURO SOCIAL - INSS")){
                                processo = tarefas[i].pasta.interessados[j].pessoa.nome
                                processos = tarefas[i]
                                break;
                    }
                }
                
                const tarefa_id = `${tarefas[i].id}`;
                const pasta_id = `${tarefas[i].pasta.id}`;
                const usuario_setor = `${tarefas[i].setorResponsavel_id}`
                const tid = `${tidNumber}`;
                //tarefas[i].postIt = "MEMÓRIA DE CALCULO INSERIDA NA MINUTA";
                tarefas[i].tid = tidNumber;
                
                processoAfazer = minutas.find(minuta => minuta.numeroprocesso == processo);
                processoAFazerPelaNup = processos.pasta.NUP == data.minutas[k].nup;

                if(!processoAfazer){
                    if(processoAFazerPelaNup && processo != undefined){
                        console.log(tarefas[i].pasta.NUP)
                        for await (let info of minutas){
                            if(info.nup == tarefas[i].pasta.NUP){
                                processoAfazer = info
                            }
                        }
                        
                    }
                }

                if (processoAfazer != null || processoAFazerPelaNup != false) {
                    const createDocument = await createDocumentoUseCase.execute({ cookie, usuario_nome, usuario_setor, tarefa_id, pasta_id, tid })
                    let documento_id = createDocument[0].id;
                    // o 1344 é a intificação da memoria de calculo
                    const tipo_documento = "1344"
                    let nome = await processo.split(" ");
                    const upload = await uploadDocumentUseCase.execute(cookie, `${nome[0]}${documento_id}MemoriaCalculo.html`, processoAfazer.conteudo, documento_id, tipo_documento);
                    await response.push({ createDocument: createDocument[0], upload });
                    (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `MEMORIA ANEXADA - ${tarefas[i].postIt}`, tarefaId: parseInt(tarefa_id) }));
                    console.log(tarefas[i])
                    tidNumber++;
                }

                /* if (i == tarefas.length - 1) {
                    return response
                } */

                

                
            }
        }
        response.pop();
        
        return response

    }
}