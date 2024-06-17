import { getDocumentoUseCase } from "../../GetDocumento";
import { downloadPDFWithCookies } from "../../GetPdfSapiens/downloadPDFWithCookies";
import { readPDF } from "../../GetPdfSapiens/readPDF";
import { extrairPrimeiraData } from "../helps/ExtrairPrimeiraData";
import { validarData } from "../helps/validarData";
const { JSDOM } = require('jsdom');

export async function coletarCitacaoTjgo(arrayDeDocument: any, cookie: string, id: string){


try{
    

    
    let paginaTermo: any = arrayDeDocument.find(Documento => Documento.documentoJuntado.tipoDocumento.sigla == "TERM" 
    && Documento.movimento == "JUNTADA DE DOCUMENTO - TERMO ADMINISTRATIVO - PROCEDENTE");


    if(!paginaTermo){
        return null
    }

    
    
    

    /* const idTermo = paginaTermo.documentoJuntado.componentesDigitais[0].id;
    const parginaTermo = await getDocumentoUseCase.execute({ cookie, idDocument: idTermo });

    const parginaDosPrevFormatada = new JSDOM(parginaTermo); */
    const idProcesso = paginaTermo.documentoJuntado.componentesDigitais[0].id;


    const urlProcesso = `https://sapiens.agu.gov.br/documento/${idProcesso}`

    await downloadPDFWithCookies(urlProcesso, cookie, id)


    const pdfString: string = (await readPDF(id))
    const returnObject: any = {};

    try{


        const sentenca = pdfString.split("Sentença");
        if(sentenca[1].indexOf("Procedência") != -1){
        const sentencaIdSequencial = sentenca[1].split(":")[1].trim()
            if(typeof Number(sentencaIdSequencial) === "number"){
                const paginaSentenca = arrayDeDocument.find(Documento => Documento.numeracaoSequencial == Number(sentencaIdSequencial))
                if(paginaSentenca){
                    const dataHonorariosAdvocatiiciosAte = paginaSentenca.movimento.split("DATA:")[1].trim()
                    const dataEncotradaSentenca = extrairPrimeiraData(dataHonorariosAdvocatiiciosAte)
                    if(dataEncotradaSentenca && validarData(dataEncotradaSentenca)){
                       returnObject.dataHonorariosAdvocatiiciosAte = dataEncotradaSentenca
                    }
                }
            }
        }




    }catch(e){
        console.log(e)
        returnObject.dataHonorariosAdvocatiiciosAte = null
    }




    const data = pdfString.split(" ")[3]
    returnObject.horonariosAdvocaticiosPercentual = 10;



    if(validarData(data)){
        returnObject.citacao = data
        return returnObject
    }else{
        returnObject.citacao = null
        return returnObject
    }


}catch(error){
    console.log(error)
    return null
}
    













}

