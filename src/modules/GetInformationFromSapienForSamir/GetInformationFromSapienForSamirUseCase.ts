const { JSDOM } = require('jsdom');
import { getUsuarioUseCase } from '../GetUsuario';
import { loginUseCase } from '../LoginUsuario';
import { getTarefaUseCase } from '../GetTarefa';
import { IGetInformationsFromSapiensDTO } from '../../DTO/GetInformationsFromSapiensDTO';
import { IGetArvoreDocumentoDTO } from '../../DTO/GetArvoreDocumentoDTO';
import { getArvoreDocumentoUseCase } from '../GetArvoreDocumento/index';
import { IInformationsForCalculeDTO } from '../../DTO/InformationsForCalcule';
import { getDocumentoUseCase } from '../GetDocumento';
import { updateEtiquetaUseCase } from '../UpdateEtiqueta';
import { getXPathText } from "../../helps/GetTextoPorXPATH";
import { coletarCitacao } from "./coletarCitacao";
import { VerificaçaoSeDosPrevInvalido } from "./verificaçaoSeDosPrevInvalido";
import { getInformaçoesIniciasDosBeneficios } from './getInformaçoesIniciasDosBeneficios';
import { getInformaçoesSecudariaDosBeneficios } from './getInformaçoesSecudariaDosBeneficios';
import { fazerInformationsForCalculeDTO } from './contruirInformationsForCalcule';
import { ResponseArvoreDeDocumento } from '../../sapiensOperations/response/ResponseArvoreDeDocumento';
import { coletarArvoreDeDocumentoDoPassivo } from './coletarArvoreDeDocumentoDoPassivo';


export class GetInformationFromSapienForSamirUseCase {

    async execute(data: IGetInformationsFromSapiensDTO): Promise<any> {
        const cookie = await loginUseCase.execute(data.login);
        const usuario = (await getUsuarioUseCase.execute(cookie));

        const usuario_id = `${usuario[0].id}`;

        let response: Array<IInformationsForCalculeDTO> = [];
        try {
            const tarefas = await getTarefaUseCase.execute({ cookie, usuario_id, etiqueta: data.etiqueta });

            for (var i = 0; i <= tarefas.length - 1; i++) {
                console.log("Qantidade faltando triar", (tarefas.length - i));
                const tarefaId = tarefas[i].id;
                const objectGetArvoreDocumento: IGetArvoreDocumentoDTO = { nup: tarefas[i].pasta.NUP, chave: tarefas[i].pasta.chaveAcesso, cookie, tarefa_id: tarefas[i].id }
                let arrayDeDocumentos: ResponseArvoreDeDocumento[];

                try {
                    arrayDeDocumentos = (await getArvoreDocumentoUseCase.execute(objectGetArvoreDocumento)).reverse();
                } catch (error) {
                    console.log(error);
                    (await updateEtiquetaUseCase.execute({ cookie, etiqueta: "DOSPREV COM FALHA NA PESQUISA", tarefaId }));
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
                    console.log("DOSPREV INVALIDO");
                    (await updateEtiquetaUseCase.execute({ cookie, etiqueta: "DOSPREV INVALIDO", tarefaId }))
                    continue
                }
                // ative quando for para produçao
                if (VerificaçaoSeDosPrevInvalido(informacaoDeCabeçalho)) {
                    console.log("DOSPREV INVALIDO");
                    (await updateEtiquetaUseCase.execute({ cookie, etiqueta: "DOSPREV INVALIDO", tarefaId }))
                    continue
                }

                var beneficios = await getInformaçoesIniciasDosBeneficios(parginaDosPrevFormatada)
                if (beneficios.length <= 0) {
                    console.log("DOSPREV SEM BENEFICIO VALIDOS");
                    (await updateEtiquetaUseCase.execute({ cookie, etiqueta: "DOSPREV SEM BENEFICIO VALIDOS", tarefaId }))
                    continue
                }
                beneficios = await getInformaçoesSecudariaDosBeneficios(beneficios, parginaDosPrevFormatada)

                const xpathNumeroDoProcesso = "/html/body/div/div/table/tbody/tr/td"
                const numeroDoProcesso: string = getXPathText(parginaDosPrevFormatada, xpathNumeroDoProcesso);

                const xpathdataAjuizamento = "/html/body/div/div[1]/table/tbody/tr[2]/td"
                const dataAjuizamento: string = getXPathText(parginaDosPrevFormatada, xpathdataAjuizamento);

                const xpathNome = "/html/body/div/div[1]/table/tbody/tr[6]/td[1]"
                const nome: string = getXPathText(parginaDosPrevFormatada, xpathNome);

                const xpathCpf = "/html/body/div/div[1]/table/tbody/tr[7]/td"
                const cpf: string = getXPathText(parginaDosPrevFormatada, xpathCpf);

                const urlProcesso = `https://sapiens.agu.gov.br/visualizador?nup=${tarefas[i].pasta.NUP}&chave=${tarefas[i].pasta.chaveAcesso}&tarefaId=${tarefas[i].id}`
                // console.log("urlProcesso", urlProcesso, "cpf", cpf, "nome", nome, "dataAjuizamento", dataAjuizamento, "numeroDoProcesso", numeroDoProcesso);
                const citacao = coletarCitacao(arrayDeDocumentos)
                let informationsForCalculeDTO: IInformationsForCalculeDTO = await fazerInformationsForCalculeDTO(beneficios, numeroDoProcesso, dataAjuizamento, nome, cpf, urlProcesso, citacao, parseInt(tarefaId))
                // { beneficio: "teste", dibAnterior: "teste", beneficioAcumuladoBoolean: false, dibInicial: "teste", dip: "teste", id: parseInt(tarefaId), nb: "teste", rmi: "teste", tipo: "teste", numeroDoProcesso, dataAjuizamento, nome, cpf, urlProcesso, citacao }
                response.push(informationsForCalculeDTO);
                // Ativar quando entrar em produção
                await updateEtiquetaUseCase.execute({ cookie, etiqueta: "LIDO BOOT", tarefaId })

            }
            return await response
        } catch (error) {
            console.log(error);
            console.log(response.length)
            if (response.length > 0) {
                return await response
            }
            else {
                new error;
            }
        }
    }

}

