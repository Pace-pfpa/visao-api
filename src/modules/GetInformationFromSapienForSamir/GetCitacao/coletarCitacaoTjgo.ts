import { getDocumentoUseCase } from "../../GetDocumento";
import { downloadPDFWithCookies } from "../../GetPdfSapiens/downloadPDFWithCookies";
import { readPDF } from "../../GetPdfSapiens/readPDF";
import { validarData } from "../helps/validarData";
const { JSDOM } = require('jsdom');

export async function coletarCitacaoTjgo(arrayDeDocument: any, cookie: string, id: string){


try{
    

    
    var paginaTermo: any = arrayDeDocument.find(Documento => Documento.documentoJuntado.tipoDocumento.sigla == "TERM" 
    && Documento.movimento == "JUNTADA DE DOCUMENTO - TERMO ADMINISTRATIVO - PROCEDENTE");


    if(!paginaTermo){
        return null
    }
    console.log(paginaTermo)

    /* const idTermo = paginaTermo.documentoJuntado.componentesDigitais[0].id;
    const parginaTermo = await getDocumentoUseCase.execute({ cookie, idDocument: idTermo });

    const parginaDosPrevFormatada = new JSDOM(parginaTermo); */
    const idProcesso = paginaTermo.documentoJuntado.componentesDigitais[0].id;


    const urlProcesso = `https://sapiens.agu.gov.br/documento/${idProcesso}`

    await downloadPDFWithCookies(urlProcesso, cookie, id)


    const pdfString: string = (await readPDF(id))
    const data = pdfString.split(" ")[3]

    if(validarData(data)){
        return data
    }else{
        return null
    }


}catch(error){
    console.log(error)
    return null
}
    













}

