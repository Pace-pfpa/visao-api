const { JSDOM } = require('jsdom');
import { IGetArvoreDocumentoDTO } from "../../DTO/GetArvoreDocumentoDTO";
import { IGetInformationsFromSapiensDTO } from "../../DTO/GetInformationsFromSapiensDTO";
import { ResponseArvoreDeDocumento } from "../../sapiensOperations/response/ResponseArvoreDeDocumento";
import { getTarefaUseCase } from "../GetTarefa";
import { getUsuarioUseCase } from "../GetUsuario";
import { loginUseCase } from "../LoginUsuario";
import { solicitarDossiePrevidenciarioUseCase } from '../SolicitarDossiePrevidenciario/index';
import { updateEtiquetaUseCase } from "../UpdateEtiqueta";
import { getArvoreDocumentoUseCase } from '../GetArvoreDocumento/index';
import { coletarArvoreDeDocumentoDoPassivo } from "../GetInformationFromSapienForSamir/helps/coletarArvoreDeDocumentoDoPassivo";
import { getDocumentoUseCase } from '../GetDocumento/index';
import { getXPathText } from '../../helps/GetTextoPorXPATH';
import { VerificaçaoSeDosPrevInvalido } from "../../helps/verificaçaoSeDosPrevInvalido";

export class VerificadorValidadeDossiePrevidenciarioUseCase {

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
                for (const tarefa of tarefas) {
                    const tarefaId = tarefa.id;
                    const objectGetArvoreDocumento: IGetArvoreDocumentoDTO = { nup: tarefa.pasta.NUP, chave: tarefa.pasta.chaveAcesso, cookie, tarefa_id: tarefa.id }
                    let arrayDeDocumentos: ResponseArvoreDeDocumento[];

                    try {
                        arrayDeDocumentos = (await getArvoreDocumentoUseCase.execute(objectGetArvoreDocumento)).reverse();
                    } catch (error) {
                        console.log(error);
                        (await updateEtiquetaUseCase.execute({ cookie, etiqueta: "DOSPREV COM FALHA NA GERAÇAO", tarefaId }));
                        continue
                    }

                    var objectDosPrev = arrayDeDocumentos.find(Documento => Documento.documentoJuntado.tipoDocumento.sigla == "DOSPREV");

                    var objectDosPrevNaoExisti = objectDosPrev == null;
                    if (objectDosPrevNaoExisti) {
                        arrayDeDocumentos = await coletarArvoreDeDocumentoDoPassivo(objectGetArvoreDocumento)
                        objectDosPrev = arrayDeDocumentos.find(Documento => Documento.documentoJuntado.tipoDocumento.sigla == "DOSPREV");
                        objectDosPrevNaoExisti = objectDosPrev == null;
                        if (objectDosPrevNaoExisti) {
                            console.log("DOSPREV NÃO ECONTRADO");
                            (await updateEtiquetaUseCase.execute({ cookie, etiqueta: "DOSPREV NÃO ECONTRADO", tarefaId }))
                            continue;
                        }
                    }

                    const dosPrevSemIdParaPesquisa = (objectDosPrev.documentoJuntado.componentesDigitais.length) <= 0;
                    if (dosPrevSemIdParaPesquisa) {
                        console.log("DOSPREV COM FALHA NA PESQUISA");
                        (await updateEtiquetaUseCase.execute({ cookie, etiqueta: "DOSPREV COM FALHA NA PESQUISA", tarefaId }))
                        continue;
                    }
                    const idDosprevParaPesquisa = objectDosPrev.documentoJuntado.componentesDigitais[0].id;
                    const parginaDosPrev = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisa });

                    const parginaDosPrevFormatada = new JSDOM(parginaDosPrev);


                    const xpathInformacaoDeCabeçalho = "/html/body/div/p[2]/b[1]"
                    const informacaoDeCabeçalho = getXPathText(parginaDosPrevFormatada, xpathInformacaoDeCabeçalho);
                    console.log("informacaoDeCabeçalho", informacaoDeCabeçalho)
                    const informacaoDeCabeçalhoNaoExiste = !informacaoDeCabeçalho;
                    if (informacaoDeCabeçalhoNaoExiste) {
                        console.log("DOSPREV FORA DO PRAZO DO PRAZO DE VALIDADE");
                        (await updateEtiquetaUseCase.execute({ cookie, etiqueta: "DOSPREV FORA DO PRAZO DO PRAZO DE VALIDADE", tarefaId }))
                        continue
                    }
                    // ative quando for para produçao
                    if (VerificaçaoSeDosPrevInvalido(informacaoDeCabeçalho)) {
                        console.log("DOSPREV FORA DO PRAZO DO PRAZO DE VALIDADE");
                        (await updateEtiquetaUseCase.execute({ cookie, etiqueta: "DOSPREV FORA DO PRAZO DO PRAZO DE VALIDADE", tarefaId }))
                        continue
                    }
                    console.log("DOSPREV VALIDADO");
                        (await updateEtiquetaUseCase.execute({ cookie, etiqueta: "PROCESSO VALIDADO", tarefaId }))
                }
            } while (tarefas.length >= qunatidadeDeProcesso);

            resolve(await response)
        })

    }
}