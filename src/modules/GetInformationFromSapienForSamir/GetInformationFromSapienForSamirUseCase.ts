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
import { coletarCitacao } from "./helps/coletarCitacao";
import { VerificaçaoDaQuantidadeDeDiasParaInspirarODossie } from "../../helps/VerificaçaoDaQuantidadeDeDiasParaInspirarODossie";
import { getInformaçoesIniciasDosBeneficios } from './helps/getInformaçoesIniciasDosBeneficios';
import { getInformaçoesSecudariaDosBeneficios } from './helps/getInformaçoesSecudariaDosBeneficios';
import { fazerInformationsForCalculeDTO } from './helps/contruirInformationsForCalcule';
import { ResponseArvoreDeDocumento } from '../../sapiensOperations/response/ResponseArvoreDeDocumento';
import { coletarArvoreDeDocumentoDoPassivo } from './helps/coletarArvoreDeDocumentoDoPassivo';
import { isValidInformationsForCalculeDTO } from './helps/validadorDeInformationsForCalculeDTO';
import { getCapaDoPassivaUseCase } from '../GetCapaDoPassiva';
import { getTarefaUseCaseNup } from '../GetTarefaNup';
import { ErrogetArvoreDocumentoUseCase } from '../GetArvoreDocumentoErroProcesso';
import { verificarCapaTrue } from './helps/verificarCapaTrue';
import { buscarTableCpf } from './helps/procurarTableCpf';
import { superDossie } from './DossieSuperSapiens';
import { MinhaErroPersonalizado } from './helps/ErrorMensage';
import { json } from 'express';
import { coletarDateInCertidao } from './helps/coletarCitacaoInCertidao';
import { verificarAbreviacaoCapa } from './helps/verificarAbreviacaoCapa';
import { coletarCitacaoTjac } from './GetCitacao/coletarCitacaoTjac';
import { deletePDF } from '../GetPdfSapiens/deletePdf';
import { coletarCitacaoTjam } from './GetCitacao/coletarCitacaoTjam';
import jwt from 'jsonwebtoken'
import { id } from 'date-fns/locale';
import { verificationPdfExist } from './helps/verificationPdfExist';
import { verificarDossieMaisAtual } from './helps/verificarDossieMaisAtual';
import { CorrigirCpfComZeros } from './helps/CorrigirCpfComZeros';


export class GetInformationFromSapienForSamirUseCase {

    async execute(data: IGetInformationsFromSapiensDTO): Promise<any> {
        console.log("SADSADAS " + JSON.stringify(data))
        const cookie = await loginUseCase.execute(data.login);
        console.log("Login " + cookie)
        const usuario = (await getUsuarioUseCase.execute(cookie));
        const userIdControlerPdf = (jwt.decode(data.usuario_id).id)
        /* const userIdControlerPdf = (data.usuario_id) */
        console.log(userIdControlerPdf)
        const usuario_id = `${usuario[0].id}`;
        let novaCapa: any = false;
        var objectDosPrev
        let objectDosPrev2
        let superDosprevExist = false;
        let dossieNormal = false;
        let dosprevEncontrado = false;
        let response: Array<IInformationsForCalculeDTO> = [];
        try {
            const tarefas = await getTarefaUseCase.execute({ cookie, usuario_id, etiqueta: data.etiqueta });
            /* const tarefas = await getTarefaUseCaseNup.execute({ cookie, usuario_id, nup: data.nup }); */
            
            for (var i = 0; i <= tarefas.length - 1; i++) {
                console.log("Qantidade faltando triar", (tarefas.length - i));
                let superDosprevExist = false;
                const tarefaId = tarefas[i].id;
                const etiquetaParaConcatenar = tarefas[i].postIt
                const objectGetArvoreDocumento: IGetArvoreDocumentoDTO = { nup: tarefas[i].pasta.NUP, chave: tarefas[i].pasta.chaveAcesso, cookie, tarefa_id: tarefas[i].id }
                let arrayDeDocumentos: ResponseArvoreDeDocumento[];

                try {
                    arrayDeDocumentos = (await getArvoreDocumentoUseCase.execute(objectGetArvoreDocumento)).reverse();
                } catch (error) {
                    console.log(error);
                    (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV COM FALHA NA GERAÇAO - ${etiquetaParaConcatenar}`, tarefaId }));
                    continue
                }









                const tcapaParaVerificar: string = await getCapaDoPassivaUseCase.execute(tarefas[i].pasta.NUP, cookie);
                const tcapaFormatada = new JSDOM(tcapaParaVerificar)
                const txPathClasse = "/html/body/div/div[4]/table/tbody/tr[2]/td[1]"
                //const tinfoClasseExist = getXPathText(tcapaFormatada, txPathClasse) == "Classe:"
                
                const tinfoClasseExist = await verificarCapaTrue(tcapaFormatada)

                
               

                if(tinfoClasseExist){
                    
                    objectDosPrev = arrayDeDocumentos.filter(Documento => Documento.documentoJuntado.tipoDocumento.sigla == "DOSPREV" && Documento.documentoJuntado.origemDados.fonteDados === "SAT_INSS");
                    
                    /* var objectDosPrev2 = arrayDeDocumentos.find(Documento => {
                        const movimento = (Documento.movimento).split(".");
                        return movimento[0] == "JUNTADA DOSSIE DOSSIE PREVIDENCIARIO REF";
                    });
                    
                    if(objectDosPrev == undefined && objectDosPrev2 == undefined){
                        (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV NÃO ENCONTRADO - ${etiquetaParaConcatenar}`, tarefaId }));
                        continue
                    }else if(objectDosPrev2 != undefined && objectDosPrev == undefined){
                        objectDosPrev = objectDosPrev2;
                        superDosprevExist = true;
                    }else if(objectDosPrev != undefined &&  objectDosPrev2 != undefined){
                        if(objectDosPrev.numeracaoSequencial < objectDosPrev2.numeracaoSequencial){
                            objectDosPrev = objectDosPrev2;
                            superDosprevExist = true;
                        }
                    } */
                    if(objectDosPrev.length > 0){
                       
                        dossieNormal = true;
                        dosprevEncontrado = true;

                         objectDosPrev2 = arrayDeDocumentos.filter(Documento => {
                            const movimento = (Documento.movimento).split(".");
                            return movimento[0] == "JUNTADA DOSSIE DOSSIE PREVIDENCIARIO REF";
                        });
                        
                        

                        if(objectDosPrev2.length > 0){
                            superDosprevExist = true;
                        }

                       
                    }else{
                       
                        objectDosPrev2 = arrayDeDocumentos.filter(Documento => {
                            const movimento = (Documento.movimento).split(".");
                            return movimento[0] == "JUNTADA DOSSIE DOSSIE PREVIDENCIARIO REF";
                        });

                        if(objectDosPrev2.length > 0){
                            dosprevEncontrado = true;
                            superDosprevExist = true;
                        }else{

                            (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV NAO ENCONTRADO - ${etiquetaParaConcatenar}`, tarefaId }));
                             continue
                        }
                        


                        /* dosprevThisTrue = false;
                        response = response + " DOSPREV NÃO EXISTE -" */
                    }
                     
                    

                } else{
                    
                    const capaParaVerificar: string = await getCapaDoPassivaUseCase.execute(tarefas[i].pasta.NUP, cookie);
                    const capaFormatada = new JSDOM(capaParaVerificar)
                    const xpathNovaNup = "/html/body/div/div[4]/table/tbody/tr[13]/td[2]/a[1]/b"
                    const novaNup = getXPathText(capaFormatada, xpathNovaNup)
                    const novoObjectGetArvoreDocumento: IGetArvoreDocumentoDTO = { nup: novaNup, chave: tarefas[i].pasta.chaveAcesso, cookie, tarefa_id: tarefas[i].id }
                    try { 
                        const novaNupTratada = novaNup.split("(")[0].trim().replace(/[-/.]/g, "")
                        novoObjectGetArvoreDocumento.nup = novaNupTratada
                        arrayDeDocumentos = (await getArvoreDocumentoUseCase.execute(novoObjectGetArvoreDocumento)).reverse();
                        objectDosPrev = arrayDeDocumentos.filter(Documento => Documento.documentoJuntado.tipoDocumento.sigla == "DOSPREV" && Documento.documentoJuntado.origemDados.fonteDados === "SAT_INSS");
                        
                       /*  var objectDosPrev2 = arrayDeDocumentos.find(Documento => {
                            const movimento = (Documento.movimento).split(".");
                            return movimento[0] == "JUNTADA DOSSIE DOSSIE PREVIDENCIARIO REF";
                        });


                        if(objectDosPrev == undefined && objectDosPrev2 == undefined){
                            (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV NÃO ENCONTRADO - ${etiquetaParaConcatenar}`, tarefaId }));
                            continue
                        }else if(objectDosPrev2 != undefined && objectDosPrev == undefined){
                            objectDosPrev = objectDosPrev2;
                            superDosprevExist = true;
                        }else if(objectDosPrev != undefined &&  objectDosPrev2 != undefined){
                            if(objectDosPrev.numeracaoSequencial < objectDosPrev2.numeracaoSequencial){
                                objectDosPrev = objectDosPrev2;
                                superDosprevExist = true;
                            }
                        } */


                        if(objectDosPrev.length > 0){
                            dossieNormal = true;
                            dosprevEncontrado = true;

                            objectDosPrev2 = arrayDeDocumentos.filter(Documento => {
                                const movimento = (Documento.movimento).split(".");
                                return movimento[0] == "JUNTADA DOSSIE DOSSIE PREVIDENCIARIO REF";
                            });

                            



                            if(objectDosPrev2.length > 0){
                                superDosprevExist = true;
                            }





                        }else{

                             objectDosPrev2 = arrayDeDocumentos.filter(Documento => {
                                const movimento = (Documento.movimento).split(".");
                                return movimento[0] == "JUNTADA DOSSIE DOSSIE PREVIDENCIARIO REF";
                            });
                            
                            if(objectDosPrev2.length > 0){
                                superDosprevExist = true;
                                dosprevEncontrado = true;
                            }else{
                                (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV NAO ENCONTRADO - ${etiquetaParaConcatenar}`, tarefaId }));
                                continue
                            }

                            
                        }    


                        console.log("aqui oorr")
                        console.log(objectDosPrev2)



                    } catch (error) {
                        console.log(error);
                        (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV COM FALHA NA GERAÇAO - ${etiquetaParaConcatenar}`, tarefaId }));
                        continue
                    }
                }


                



                

                //Verificar a capa caso exista outra capa com os dados necessários
                const capaParaVerificar: string = await getCapaDoPassivaUseCase.execute(tarefas[i].pasta.NUP, cookie);
                const capaFormatada = new JSDOM(capaParaVerificar)
                //const xPathClasse = "/html/body/div/div[4]/table/tbody/tr[2]/td[1]"
                const infoClasseExist = await verificarCapaTrue(capaFormatada) 
                if(!infoClasseExist){
             
                    const xpathNovaNup = "/html/body/div/div[4]/table/tbody/tr[13]/td[2]/a[1]/b"
                    const novaNup = getXPathText(capaFormatada, xpathNovaNup)
                    const nupFormatada:string = (novaNup.split('(')[0]).replace(/[./-]/g, "").trim();
                    const capa = (await getCapaDoPassivaUseCase.execute(nupFormatada, cookie));
                    novaCapa = new JSDOM(capa)
                }else{
                    
                    const capa = (await getCapaDoPassivaUseCase.execute(tarefas[i].pasta.NUP, cookie));
                    novaCapa = new JSDOM(capa)
                }
                let BuscarPelaTjmg: any = false;
                //Buscar pela sigla TJMG
                const xpathDaSigla: Array<string> = ["/html/body/div/div[4]/table/tbody/tr[3]/td[2]", "/html/body/div/div[5]/table/tbody/tr[3]/td[2]/text()"]
                for(let i=0; i<2; i++){
                    let VerificarSeExisteTjmg = (getXPathText(novaCapa, xpathDaSigla[i]));
                    if(VerificarSeExisteTjmg){
                        if(VerificarSeExisteTjmg.split("(")[1]){
                            if(((VerificarSeExisteTjmg.split("(")[1]).replace(/[)]/g, "").trim() === "TJMG") ){
                                BuscarPelaTjmg = true;
                            }
                        }
                        
                        
                    }

                }

                if(BuscarPelaTjmg){
                    (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `PROCESSO TJMG - ${etiquetaParaConcatenar}`, tarefaId }))
                    continue;
                }
                

                //Buscar cpf para verificação
              
                let cpfCapa = buscarTableCpf(novaCapa);
                if(!cpfCapa){
                    (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `CPF NÃO ENCONTRADO - ${etiquetaParaConcatenar}`, tarefaId }))
                    continue;
                }

                cpfCapa = CorrigirCpfComZeros(cpfCapa)
                console.log(cpfCapa)
                if(dossieNormal && !superDosprevExist){
                    console.log("foi auqi1")
                    const dossieIsvalid = await verificarDossieMaisAtual(cpfCapa, cookie, objectDosPrev, null);
                    

                    if(dossieIsvalid instanceof Error){
                        (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV COM FALHA NA PESQUISA`, tarefaId }))
                         continue
                    }else{

                        objectDosPrev = dossieIsvalid[0]
                    }

                   
                    
                }else if(!dossieNormal && superDosprevExist){
                    
                    console.log("foi auqi2")
                    const dossieIsvalid = await verificarDossieMaisAtual(cpfCapa, cookie, null, objectDosPrev2);
                    
                    if(dossieIsvalid instanceof Error){
                        (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV COM FALHA NA PESQUISA`, tarefaId }))
                         continue
                    }else{
                        
                        objectDosPrev = dossieIsvalid[0]
                    }
                }else{
                    console.log("foi auqi3")
                    const dossieIsvalid = await verificarDossieMaisAtual(cpfCapa, cookie, objectDosPrev, objectDosPrev2);
                    console.log(dossieIsvalid)
                    console.log("alo")
                    if(dossieIsvalid instanceof Error){
                        (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV COM FALHA NA PESQUISA`, tarefaId }))
                         continue
                    }else{
                        if(dossieIsvalid[1] == 0){
                            dossieNormal = true;
                            superDosprevExist = false;
                        }else if(dossieIsvalid[1] == 1){
                            dossieNormal = false;
                            superDosprevExist = true;
                        }
                       
                        objectDosPrev = dossieIsvalid[0]
                    }
                }




                












                const dosPrevSemIdParaPesquisa = (objectDosPrev.documentoJuntado.componentesDigitais.length) <= 0;
                if (dosPrevSemIdParaPesquisa) {
                    console.log("DOSPREV COM FALHA NA PESQUISA");
                    (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV COM FALHA NA PESQUISA - ${etiquetaParaConcatenar}`, tarefaId }))
                    continue;
                }
                const idDosprevParaPesquisa = objectDosPrev.documentoJuntado.componentesDigitais[0].id;
                const parginaDosPrev = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisa });

                const parginaDosPrevFormatada = new JSDOM(parginaDosPrev);
                console.log("TAREFAAAAAAAAA " + tarefaId)
                if(superDosprevExist){
                    try{
                        const superDossiePrevidenciario: IInformationsForCalculeDTO =  await superDossie.handle(parginaDosPrevFormatada, arrayDeDocumentos, tarefas[i].pasta.NUP, tarefas[i].pasta.chaveAcesso, tarefas[i].id, parseInt(tarefaId), novaCapa, cookie, userIdControlerPdf);
                        response.push(superDossiePrevidenciario);
                        await updateEtiquetaUseCase.execute({ cookie, etiqueta: `LIDO BOT - ${etiquetaParaConcatenar}`, tarefaId })
                        continue

                    }catch(e){
                        if(e instanceof MinhaErroPersonalizado && e.message == "DOSPREV FORA DO PRAZO DO PRAZO DE VALIDADE"){
                            (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV FORA DO PRAZO DO PRAZO DE VALIDADE - ${etiquetaParaConcatenar}`, tarefaId }))
                            continue
                        }
                        if(e instanceof MinhaErroPersonalizado && e.message == "DOSPREV SEM BENEFICIO VALIDOS"){
                            (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV SEM BENEFICIO VALIDOS - ${etiquetaParaConcatenar}`, tarefaId }))
                            continue
                        }
                        if(e instanceof MinhaErroPersonalizado && e.message == "FALHA NA LEITURA DOS BENEFICIOS"){
                            (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `FALHA NA LEITURA DOS BENEFICIOS - ${etiquetaParaConcatenar}`, tarefaId }))
                            continue
                        }
                    }
                }

                const xpathInformacaoDeCabeçalho = "/html/body/div/p[2]/b[1]"
                const informacaoDeCabeçalho = getXPathText(parginaDosPrevFormatada, xpathInformacaoDeCabeçalho);
                console.log("informacaoDeCabeçalho", informacaoDeCabeçalho)
                const informacaoDeCabeçalhoNaoExiste = !informacaoDeCabeçalho;
                if (informacaoDeCabeçalhoNaoExiste) {
                    console.log("DOSPREV FORA DO PRAZO DO PRAZO DE VALIDADE");
                    (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV FORA DO PRAZO DO PRAZO DE VALIDADE - ${etiquetaParaConcatenar}`, tarefaId }))
                    continue
                }
                // verifica se o dossie ja inspirou, se o VerificaçaoDaQuantidadeDeDiasParaInspirarODossie for negativo que dizer que ja inspirou
                if (0 > VerificaçaoDaQuantidadeDeDiasParaInspirarODossie(informacaoDeCabeçalho)) {
                    console.log("DOSPREV FORA DO PRAZO DO PRAZO DE VALIDADE");
                    (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV FORA DO PRAZO DO PRAZO DE VALIDADE - ${etiquetaParaConcatenar}`, tarefaId }))
                    continue
                }
                console.log("aquiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
                var beneficios = await getInformaçoesIniciasDosBeneficios(parginaDosPrevFormatada)
                if (beneficios.length <= 0) {
                    console.log("DOSPREV SEM BENEFICIO VALIDOS");
                    (await updateEtiquetaUseCase.execute({ cookie, etiqueta: `DOSPREV SEM BENEFICIOS VALIDOS - ${etiquetaParaConcatenar}`, tarefaId }))
                    continue
                }
                beneficios = await getInformaçoesSecudariaDosBeneficios(beneficios, parginaDosPrevFormatada)

                const xpathOrgaoJulgador = "/html/body/div/div[1]/table/tbody/tr[3]/td";
                const orgaoJulgador: string = getXPathText(parginaDosPrevFormatada, xpathOrgaoJulgador);

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
                let citacao = coletarCitacao(arrayDeDocumentos)
                if (!citacao) coletarDateInCertidao(arrayDeDocumentos);
                if(!citacao){ 
                    const searchTypeCape = await verificarAbreviacaoCapa(novaCapa)
                    if(searchTypeCape == "TJAC"){
                        citacao = await coletarCitacaoTjac(arrayDeDocumentos, cookie, userIdControlerPdf)
                    }else if(searchTypeCape == "TJAM"){
                        citacao = await coletarCitacaoTjam(arrayDeDocumentos, cookie, userIdControlerPdf)
                    }
                    if(!citacao){
                        citacao = ""
                    }
                    deletePDF(userIdControlerPdf)
                }
                let informationsForCalculeDTO: IInformationsForCalculeDTO = await fazerInformationsForCalculeDTO(beneficios, numeroDoProcesso, dataAjuizamento, nome, cpf, urlProcesso, citacao, parseInt(tarefaId),orgaoJulgador)
                //console.log(informationsForCalculeDTO)
                // { beneficio: "teste", dibAnterior: "teste", beneficioAcumuladoBoolean: false, dibInicial: "teste", dip: "teste", id: parseInt(tarefaId), nb: "teste", rmi: "teste", tipo: "teste", numeroDoProcesso, dataAjuizamento, nome, cpf, urlProcesso, citacao },
                //console.log(informationsForCalculeDTO);
                // console.log("processo coletado");
                // console.log(informationsForCalculeDTO);
                if (isValidInformationsForCalculeDTO(informationsForCalculeDTO)) {
                    response.push(informationsForCalculeDTO);
                    await updateEtiquetaUseCase.execute({ cookie, etiqueta: `LIDO BOT - ${etiquetaParaConcatenar}`, tarefaId })
                } else {
                    await updateEtiquetaUseCase.execute({ cookie, etiqueta: `FALHA NA LEITURA DOS BENEFICIOS - ${etiquetaParaConcatenar}`, tarefaId })
                }


            }
           
            if( await verificationPdfExist(userIdControlerPdf)) deletePDF(userIdControlerPdf)
            return await response
        } catch (error) {
            console.log(error);
            console.log(response.length)
            if(await verificationPdfExist(userIdControlerPdf)) deletePDF(userIdControlerPdf)
            if (response.length > 0) {
                return response
            }
            else {
                return error;
            }
        }
    }

}

