import { IInformationsForCalculeDTO } from "../../../DTO/InformationsForCalcule";
import { getXPathText } from "../../../helps/GetTextoPorXPATH";
import { VerificaçaoDaQuantidadeDeDiasParaInspirarOSuperDossie } from "../../../helps/VerificaçaoDaQuantidadeDeDiasParaInspirarOSuperDossie";
import { deletePDF } from "../../GetPdfSapiens/deletePdf";
import { coletarCitacaoTjac } from "../GetCitacao/coletarCitacaoTjac";
import { coletarCitacaoTjam } from "../GetCitacao/coletarCitacaoTjam";
import { MinhaErroPersonalizado } from "../helps/ErrorMensage";
import { coletarCitacao } from "../helps/coletarCitacao";
import { coletarDateInCertidao } from "../helps/coletarCitacaoInCertidao";
import { fazerInformationsForCalculeDTO } from "../helps/contruirInformationsForCalcule";
import { getInformaçoesIniciasDosBeneficiosSuperDosprev } from "../helps/getInformaçoesIniciasDosBeneficiosSuperDosprev";
import { getInformaçoesSecudariaDosBeneficiosSuperDossie } from "../helps/getInformaçoesSecudariaDosBeneficiosSuperDossie";
import { isValidInformationsForCalculeDTO } from "../helps/validadorDeInformationsForCalculeDTO";
import { verificarAbreviacaoCapa } from "../helps/verificarAbreviacaoCapa";
import { coletarCitacaoTjgo } from "../GetCitacao/coletarCitacaoTjgo";

export class SuperDossie {
    async handle(paginaDosprev: any, arrayDeDocumentos: any, nup: any ,chaveAcesso: any, id, tarefaId, novaCapa, cookie, userIdControlerPdf, data): Promise<IInformationsForCalculeDTO> {
        const xpaththInformacaoCabecalho = "/html/body/div/div[3]/p/strong/text()"

        const informacaoDeCabeçalho = getXPathText(paginaDosprev, xpaththInformacaoCabecalho);
        const informacaoDeCabecalhoNaoExiste = !informacaoDeCabeçalho;
        if (informacaoDeCabecalhoNaoExiste) {
            throw new MinhaErroPersonalizado('DOSPREV FORA DO PRAZO DO PRAZO DE VALIDADE');
        }

        if (0 > VerificaçaoDaQuantidadeDeDiasParaInspirarOSuperDossie(informacaoDeCabeçalho)) {
            throw new MinhaErroPersonalizado('DOSPREV FORA DO PRAZO DO PRAZO DE VALIDADE');
        }

        var beneficios = await getInformaçoesIniciasDosBeneficiosSuperDosprev(paginaDosprev);
        if (beneficios.length <= 0) {
            throw new MinhaErroPersonalizado('DOSPREV SEM BENEFICIO VALIDOS');
        }
        try{
            beneficios = await getInformaçoesSecudariaDosBeneficiosSuperDossie(beneficios, paginaDosprev);

        }catch(e){
            throw new MinhaErroPersonalizado('FALHA NA LEITURA DOS BENEFICIOS');
        }


        let tipoBeneficioProcurado = "";
                if(data.nb_processo){
                    beneficios.forEach((beneficio) => {
                        if(beneficio.tipo == "ATIVO"){
                            beneficio.tipo = "CESSADO"
                        }
                    })
                    beneficios.forEach(beneficio => {
                        if(beneficio.nb === data.nb_processo){
                            tipoBeneficioProcurado = beneficio.tipo;
                            beneficio.tipo = "ATIVO";
                        }
                    })
                    
                }



        const xpathOrgaoJulgador = "/html/body/div/div[4]/table/tbody/tr[3]/td";
        const orgaoJulgador: string = getXPathText(paginaDosprev, xpathOrgaoJulgador);

        const xptahNumeroProcesso = "/html/body/div/div[4]/table/tbody/tr[1]/td";
        const numeroDoProcesso: string = (getXPathText(paginaDosprev, xptahNumeroProcesso)).replace(/\D/g, '');
//
        const xpathdataAjuizamento = "/html/body/div/div[4]/table/tbody/tr[2]/td"
        const dataAjuizamento: string = getXPathText(paginaDosprev, xpathdataAjuizamento);

        const xpathNome = "/html/body/div/div[4]/table/tbody/tr[6]/td"
        const nome: string = getXPathText(paginaDosprev, xpathNome);

        const xpathCpf = "/html/body/div/div[4]/table/tbody/tr[7]/td"
        const cpf: string = getXPathText(paginaDosprev, xpathCpf);

        const urlProcesso = `https://sapiens.agu.gov.br/visualizador?nup=${nup}&chave=${chaveAcesso}&tarefaId=${id}`
        
        

        //ALINE AFIRMOUUUUU!!!!!12/06/2024
        let citacao = coletarCitacao(arrayDeDocumentos);
        if (!citacao) coletarDateInCertidao(arrayDeDocumentos);
                if(!citacao){
                    const searchTypeCape = await verificarAbreviacaoCapa(novaCapa)
                    if(searchTypeCape == "TJAC"){
                        citacao = await coletarCitacaoTjac(arrayDeDocumentos, cookie, userIdControlerPdf);
                    }else if(searchTypeCape == "TJAM"){
                        citacao = await coletarCitacaoTjam(arrayDeDocumentos, cookie, userIdControlerPdf);
                    }else if(searchTypeCape == "TJGO"){
                        citacao = await coletarCitacaoTjgo(arrayDeDocumentos, cookie, userIdControlerPdf);
                    }
                     if(!citacao){
                        citacao = ""
                    }
                   
                    deletePDF(userIdControlerPdf)
                }

        try{

            let informationsForCalculeDTO: IInformationsForCalculeDTO = await fazerInformationsForCalculeDTO(beneficios, numeroDoProcesso, dataAjuizamento, nome, cpf, urlProcesso, citacao, tarefaId,orgaoJulgador)

            if(isValidInformationsForCalculeDTO(informationsForCalculeDTO)){
                if(data.nb_processo){
                    informationsForCalculeDTO.tipo = tipoBeneficioProcurado;
                }
                return informationsForCalculeDTO
            }else{
                throw new MinhaErroPersonalizado('FALHA NA LEITURA DOS BENEFICIOS');
            }

        }catch(e){
            console.log(e)
            throw new MinhaErroPersonalizado('FALHA NA LEITURA DOS BENEFICIOS');

        }

    }

}