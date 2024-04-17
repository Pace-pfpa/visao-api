import { IGetInformationsFromSapiensDTO } from "../../DTO/GetInformationsFromSapiensDTO";
import { getTarefaUseCase } from "../GetTarefa";
import { getUsuarioUseCase } from "../GetUsuario";
import { loginUseCase } from "../LoginUsuario";
import { solicitarDossiePrevidenciarioUseCase } from '../SolicitarDossiePrevidenciario/index';
import { updateEtiquetaUseCase } from "../UpdateEtiqueta";
import { processoEhAdministrativo } from "./helps/processoEhAdministrativo"
import { getPastaDoProcessoAdministrativo } from "./helps/getPastaDoProcessoAdministrativo"

export class AtualizacaoDossiePrevidenciarioUseCase {

    async execute(data: IGetInformationsFromSapiensDTO): Promise<Array<string>> {
        return new Promise(async (resolve, reject) => {

            const cookie = await loginUseCase.execute(data.login);
            const usuario = (await getUsuarioUseCase.execute(cookie));

            const usuario_id = `${usuario[0].id}`;

            let response: Array<any> = [];
            data.etiqueta = await data.etiqueta.toUpperCase()
            const etiquetaInvalida = data.etiqueta.includes("FALHA") || data.etiqueta.includes("ATUALIZAÇAO")

            if (etiquetaInvalida) {
                console.log(etiquetaInvalida)
                reject(new Error("etiqueta não pode ter as palavras falha e/ou atualizaçao"))
            }
            console.log("data.etiqueta", data.etiqueta, "usuario_id", usuario_id);
            const qunatidadeDeProcesso = 50;
            var tarefas: any[]
            do {
                tarefas = await getTarefaUseCase.execute({ cookie, usuario_id, etiqueta: data.etiqueta, qunatidadeDeProcesso })
                let contadorFor = 0;
                for (const tarefa of tarefas) {
                    const etiquetaParaConcatenar = tarefas[contadorFor].postIt
                    var pessoaId: number;
                    for (let j = 0; j < tarefa.pasta.interessados.length; j++) {
                        if ((tarefa.pasta.interessados[j].pessoa.nome !== "MINIST�RIO P�BLICO fEDERAL (PROCURADORIA)" &&
                            tarefa.pasta.interessados[j].pessoa.nome !== "MINISTERIO PUBLICO FEDERAL (PROCURADORIA)" &&
                            tarefa.pasta.interessados[j].pessoa.nome !== "CENTRAL DE ANÁLISE DE BENEFÍCIO - CEAB/INSS" &&
                            tarefa.pasta.interessados[j].pessoa.nome !== "INSTITUTO NACIONAL DO SEGURO SOCIAL-INSS" &&
                            tarefa.pasta.interessados[j].pessoa.nome !== "INSTITUTO NACIONAL DO SEGURO SOCIAL - INSS")) {
                            pessoaId = tarefa.pasta.interessados[j].pessoa.id
                            break;
                        }
                    }

                    const tarefaId = tarefa.id;
                    try {
                        var pastaId: number;
                        if (await processoEhAdministrativo(tarefa, cookie)) {
                            pastaId = await getPastaDoProcessoAdministrativo(tarefa.pasta.NUP, cookie);
                        } else {
                            pastaId = tarefa.pasta.id;
                        }

                        response.push(await solicitarDossiePrevidenciarioUseCase.execute({ cookie, pastaId, pessoaId }));
                        await updateEtiquetaUseCase.execute({ cookie, etiqueta: `ATUALIZAÇAO DO DOSSIE PREVIDENCIARIO SOLICITADO PELO SISTEMA SAMIR  - ${etiquetaParaConcatenar}`, tarefaId });

                    } catch (error) {
                        console.log("ERRO no processo de atualizaçao do Dossie previdenciario")
                        await updateEtiquetaUseCase.execute({ cookie, etiqueta: `FALHA AO PEDIR ATUALIZACAO DE DOSSIE PREVIDENCIARIO PELO SISTEMA SAMIR - ${etiquetaParaConcatenar}`, tarefaId });
                    }
                    contadorFor = contadorFor + 1

                }
            } while (tarefas.length >= qunatidadeDeProcesso);

            resolve(await response)
        })

    }
}