import { downloadPDFWithCookies } from "../../GetPdfSapiens/downloadPDFWithCookies";
import { readPDF } from "../../GetPdfSapiens/readPDF";

export async function coletarCitacaoTjam(arrayDeDocument: any, cookie: string, id: string) {

    try{

        var paginaProcessoJudicial: any = arrayDeDocument.reverse().filter(Documento => Documento.documentoJuntado.tipoDocumento.sigla == "PROCJUDIC");
        //console.log(paginaProcessoJudicial.length)
        let contador = 0
        for await (let judicial of paginaProcessoJudicial){
            
        let idProcessoJudicial = paginaProcessoJudicial[contador].documentoJuntado.componentesDigitais[0].id

        contador = contador + 1
        const urlProcesso = (`https://sapiens.agu.gov.br/documento/${idProcessoJudicial}`)
        await downloadPDFWithCookies(urlProcesso, cookie, id)
        const mesesDoAno = [
            "janeiro",
            "fevereiro",
            "março",
            "abril",
            "maio",
            "junho",
            "julho",
            "agosto",
            "setembro",
            "outubro",
            "novembro",
            "dezembro"
        ];
        const pdfString: string = (await readPDF(id))
        const pdfStringWithSplit = pdfString.split("EXPEDIÇÃO DE CITAÇÃO ONLINE")[1]

        if(pdfString.split("EXPEDIÇÃO DE CITAÇÃO ONLINE").length > 1) {
            const regex = /(\d{2}\/\d{2}\/\d{4})/;

            const resultado = pdfStringWithSplit.match(regex);
            return resultado[0]
         }
         const citacaoMaisAtoOrdinatorio = pdfString.indexOf("JUNTADA DE ATO ORDINATÓRIO. Arq: Ato Ordinatório")
         if(citacaoMaisAtoOrdinatorio != -1){


           
           const palavra1 = 'CITAÇÃO';
           const palavra2 = 'ATO ORDINATÓRIO';
           const regex = new RegExp(`\\b(${palavra1}|${palavra2})\\b`, 'g');
           let match;
           const indices: number[] = [];
   
           while ((match = regex.exec(pdfString)) !== null) {
               if(citacaoMaisAtoOrdinatorio < match.index){
                   if(citacaoMaisAtoOrdinatorio + 20 < match.index){
                       indices.push(null);
                   }else{
                       indices.push(match.index);
                   }
                  
               }
               
           }
           if(indices[0]){
               const palavra = pdfString.substring(indices[0], indices[0] + Math.max(palavra1.length, palavra2.length)).trim();
               if(palavra == "ATO ORDINATÓRIO"){
   
                   /* console.log(indices)
                   console.log(palavra) */
                   const substringAntes = pdfString.substring(0, citacaoMaisAtoOrdinatorio);
   
                   const regexData = /\d{2}\/\d{2}\/\d{4}/g;
                   let dataAntes: string | null = null;
                   let match: RegExpExecArray | null;
   
                   while ((match = regexData.exec(substringAntes)) !== null) {
                       dataAntes = match[0];
                   }
   
                   return dataAntes
               }
              
               
   
   
           }



         }

         const splitCerticao = pdfString.indexOf("CERTIDÃO AUTOMÁTICA")
         console.log(pdfString.split("CERTIDÃO AUTOMÁTICA").length)
         if(splitCerticao != -1){
            if(pdfString.split("CERTIDÃO AUTOMÁTICA").length > 1){
                const textoAposPalavraChave = pdfString.substring(splitCerticao + "CERTIDÃO AUTOMÁTICA".length);
                const regexData = /\b\d{2}\/\d{2}\/\d{4}\b/g;
                const match = regexData.exec(textoAposPalavraChave);
                if (match !== null) {
                    const primeiraData = match[0];
                    return primeiraData
                }


                }
            

         }


        
       /*  const gerexMeses = new RegExp(mesesDoAno.join("|"), "gi")
        const MonthSeacrch = pdfStringWithSplit.match(gerexMeses)[0]
        const MounthNumber = (mesesDoAno.indexOf(MonthSeacrch) + 1)
    
        const expressaoRegular = new RegExp(`\\b${MonthSeacrch}\\b`, "gi");
        const matchEletronico = pdfStringWithSplit.match(expressaoRegular);
    
        const indexPalavraChave = pdfStringWithSplit.indexOf(matchEletronico[0]);
    
        // Extrair os 6 caracteres antes da palavra-chave
        const dia = pdfStringWithSplit.substring(indexPalavraChave - 6, indexPalavraChave).trim().split(" ")[0]
        const ano = pdfStringWithSplit.substring(indexPalavraChave + 13, indexPalavraChave).trim().split(" ")[2]
        const mes = MounthNumber
    
        return `${dia}/${mes < 10 ? '0' + mes : mes}/${ano}` */


        }
    return null    
        


    }catch(e){
        console.log(e)
        console.log("ERRO NO COLETACITACAOTJAC")
        return null
    }
}