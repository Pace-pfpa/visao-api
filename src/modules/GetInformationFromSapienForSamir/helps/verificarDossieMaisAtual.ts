const { JSDOM } = require('jsdom');
import { getXPathText } from "../../../helps/GetTextoPorXPATH";
import { CorrigirCpfComZeros } from "./CorrigirCpfComZeros";
import { getDocumentoUseCase } from "../../GetDocumento";
import { getCPFDosPrevNormal } from "./getCPFDosPrevNormal";
import { getCPFDosPrevSuper } from "./getCPFDosPrevSuper";

export async function verificarDossieMaisAtual(cpf: string, cookie:string ,normalDossie?: any[], superDossie?: any[]){

    


  



 try{
     if(normalDossie && !superDossie){
         for(let i = 0; i < normalDossie.length; i++){
            
             let objetoDosprev =  (normalDossie[i].documentoJuntado.componentesDigitais.length) <= 0 ||  (!normalDossie[i].documentoJuntado.componentesDigitais[0].id) 
             if(objetoDosprev){
                continue;
                 /* return new Error("DOSPREV COM FALHA NA PESQUISA") */
             }
             
             const idDosprevParaPesquisa = normalDossie[i].documentoJuntado.componentesDigitais[0].id;
             const parginaDosPrev = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisa });
     
             const parginaDosPrevFormatada = new JSDOM(parginaDosPrev); 
     
             const xpathCpfDosprev = "/html/body/div/div[1]/table/tbody/tr[7]/td"
             const cpfDosprev = getXPathText(parginaDosPrevFormatada, xpathCpfDosprev);

             if(!cpfDosprev) throw new Error("cpf com falha na pesquisa dosprev")
     
             if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                
                 return [normalDossie[i], 0]
             }    
         }
     }
     
     
     
     if(!normalDossie && superDossie){
         for(let i = 0; i < superDossie.length; i++){
            console.log("exectou")
             try{
                 console.log("ahdkjasjagjydgadjyasfgdsahtdfah")
                 const idDosprevParaPesquisa = superDossie[i].documentoJuntado.componentesDigitais[0].id;
                 const parginaDosPrev = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisa });
               
                 const parginaDosPrevFormatada = new JSDOM(parginaDosPrev); 
         
                 const xpathCpfDosprev = "/html/body/div/div[4]/table/tbody/tr[7]/td"
                 const cpfDosprev = getXPathText(parginaDosPrevFormatada, xpathCpfDosprev);
                 
                 if(!cpfDosprev) return new Error("cpf com falha na pesquisa dosprev")
                    
                 if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                     return [superDossie[i], 1]
                 }    
                 
             }catch(e){
                continue;;
                 /* return new Error("DOSPREV COM FALHA NA PESQUISA") */
             }
             /* let objetoDosprev =  (normalDossie[i].documentoJuntado.componentesDigitais[0] == undefined)  || (!normalDossie[i].documentoJuntado.componentesDigitais[0].id) 
             
             if(objetoDosprev){
                 console.log("erro aquiiiiiiiiiii")
                 return new Error("DOSPREV COM FALHA NA PESQUISA")
             } */
     
         }
     }

    

     if(normalDossie && superDossie){
         if(normalDossie.length >= superDossie.length){
             for(let i = 0; i < superDossie.length; i++){
                console.log("atatatatata")
                 let objetoDosprevNormal =  (normalDossie[i].documentoJuntado.componentesDigitais.length) <= 0 ||  (!normalDossie[i].documentoJuntado.componentesDigitais[0].id) 
                 
                
                 let objetoDosprevSuper = (superDossie[i].documentoJuntado.componentesDigitais.length) <= 0 ||  (!superDossie[i].documentoJuntado.componentesDigitais[0].id)
                console.log("objetoDosprevNormal", objetoDosprevNormal)
                console.log("objetoDosprevSuper", objetoDosprevSuper)
                 
                

                        if(!objetoDosprevNormal && objetoDosprevSuper){
                            console.log("entrou no primeiro if")
                            const idDosprevParaPesquisaDossieSuper = normalDossie[i].documentoJuntado.componentesDigitais[0].id;
                            const parginaDosPrevDossieSuper = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisaDossieSuper });
            
                            const parginaDosPrevFormatadaDossieNormal = new JSDOM(parginaDosPrevDossieSuper); 
            
            
            
                            const xpathCpfDosprev = "/html/body/div/div[1]/table/tbody/tr[7]/td"
                            const cpfDosprev = getXPathText(parginaDosPrevFormatadaDossieNormal, xpathCpfDosprev);
                           
                            
                            if(!cpfDosprev) return new Error("cpf com falha na pesquisa dosprev")
                                console.log("por aqu porr")
                            if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                                console.log("retornou")
                                return [normalDossie[i], 1]
                            }    
                        } else if(!objetoDosprevSuper && objetoDosprevNormal){

                            const idDosprevParaPesquisaDossieNormal = superDossie[i].documentoJuntado.componentesDigitais[0].id;
                            const parginaDosPrevDossieNormal = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisaDossieNormal });
            
                            const parginaDosPrevFormatadaDossieNormal = new JSDOM(parginaDosPrevDossieNormal); 
            
            
                            const xpathCpfDosprev = "/html/body/div/div[4]/table/tbody/tr[7]/td"
                            const cpfDosprev = getXPathText(parginaDosPrevFormatadaDossieNormal, xpathCpfDosprev);
            
                            if(!cpfDosprev) return new Error("cpf com falha na pesquisa dosprev")
            
                            if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                                return [superDossie[i], 0]
                            }    


                        }else{



                            if(normalDossie[i].numeracaoSequencial > superDossie[i].numeracaoSequencial){
                            console.log("ta caindo aqui")
            
                                const idDosprevParaPesquisaDossieNormal = normalDossie[i].documentoJuntado.componentesDigitais[0].id;
                                const parginaDosPrevDossieNormal = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisaDossieNormal });
                
                                const parginaDosPrevFormatadaDossieNormal = new JSDOM(parginaDosPrevDossieNormal); 
                
                
                                const xpathCpfDosprev = "/html/body/div/div[1]/table/tbody/tr[7]/td"
                                const cpfDosprev = getXPathText(parginaDosPrevFormatadaDossieNormal, xpathCpfDosprev);

                            
                                if(!cpfDosprev) return new Error("cpf com falha na pesquisa dosprev")
                                    console.log("fala mano")
                                if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                                    return [normalDossie[i], 0]
                                }    
                                
                                console.log("fala mano 1213")
                            }else{
                
                                const idDosprevParaPesquisaDossieSuper = superDossie[i].documentoJuntado.componentesDigitais[0].id;
                                const parginaDosPrevDossieSuper = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisaDossieSuper });
                
                                const parginaDosPrevFormatadaDossieNormal = new JSDOM(parginaDosPrevDossieSuper); 
                
                
                
                                const xpathCpfDosprev = "/html/body/div/div[4]/table/tbody/tr[7]/td"
                                const cpfDosprev = getXPathText(parginaDosPrevFormatadaDossieNormal, xpathCpfDosprev);
                
                                if(!cpfDosprev) return new Error("cpf com falha na pesquisa dosprev")
                
                                if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                                    return [superDossie[i], 1]
                                }    
                
                            }





                        }
     
                
                 
     
     
                
     
             }
     
             
             for(let i = 0; i < normalDossie.length; i++){
     
                 let objetoDosprev =  (normalDossie[i].documentoJuntado.componentesDigitais.length) <= 0 ||  (!normalDossie[i].documentoJuntado.componentesDigitais[0].id)
     
                 if(objetoDosprev){
                    continue;
                     /* return new Error("DOSPREV COM FALHA NA PESQUISA") */
                 }
     
                 const idDosprevParaPesquisa = normalDossie[i].documentoJuntado.componentesDigitais[0].id;
                 const parginaDosPrev = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisa });
     
                 const parginaDosPrevFormatada = new JSDOM(parginaDosPrev); 
     
                 const xpathCpfDosprev = "/html/body/div/div[1]/table/tbody/tr[7]/td"
                 const cpfDosprev = getXPathText(parginaDosPrevFormatada, xpathCpfDosprev);
     
                 if(!cpfDosprev) return new Error("cpf com falha na pesquisa dosprev")
     
                 if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                     return [normalDossie[i], 1]
                 }    
     
     
     
     
     
             }
             

             for(let i = 0; i < superDossie.length; i++){


                let objetoDosprev =  (superDossie[i].documentoJuntado.componentesDigitais.length) <= 0 ||  (!superDossie[i].documentoJuntado.componentesDigitais[0].id)
     
                 if(objetoDosprev){
                    continue;
                     /* return new Error("DOSPREV COM FALHA NA PESQUISA") */
                 }


                const idDosprevParaPesquisaDossieNormal = superDossie[i].documentoJuntado.componentesDigitais[0].id;
                     const parginaDosPrevDossieNormal = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisaDossieNormal });
     
                     const parginaDosPrevFormatadaDossieNormal = new JSDOM(parginaDosPrevDossieNormal); 
     
     
                     const xpathCpfDosprev = "/html/body/div/div[4]/table/tbody/tr[7]/td"
                     const cpfDosprev = getXPathText(parginaDosPrevFormatadaDossieNormal, xpathCpfDosprev);
     
                     if(!cpfDosprev) return new Error("cpf com falha na pesquisa dosprev")
     
                     if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                         return [superDossie[i], 0]
                     }    

             }
     
     
     
     
     
     
         }else{
     
             for(let i=0; i < normalDossie.length; i++){
     
                 let objetoDosprevNormal =  (normalDossie[i].documentoJuntado.componentesDigitais.length) <= 0 ||  (!normalDossie[i].documentoJuntado.componentesDigitais[0].id) 
     
                 
     
                
                 let objetoDosprevSuper = (superDossie[i].documentoJuntado.componentesDigitais.length) <= 0 ||  (!normalDossie[i].documentoJuntado.componentesDigitais[0].id)
     
                
     

                 if(!objetoDosprevNormal && !objetoDosprevSuper){


                     if(normalDossie[i].numeracaoSequencial > superDossie[i].numeracaoSequencial){
         
         
                         const idDosprevParaPesquisaDossieNormal = normalDossie[i].documentoJuntado.componentesDigitais[0].id;
                         const parginaDosPrevDossieNormal = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisaDossieNormal });
         
                         const parginaDosPrevFormatadaDossieNormal = new JSDOM(parginaDosPrevDossieNormal); 
         
         
                         const xpathCpfDosprev = "/html/body/div/div[1]/table/tbody/tr[7]/td"
                         const cpfDosprev = getXPathText(parginaDosPrevFormatadaDossieNormal, xpathCpfDosprev);
         
                         if(!cpfDosprev) return new Error("cpf com falha na pesquisa dosprev")
         
                         if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                             return [normalDossie[i], 0]
                         }    
         
         
                     }else{
         
                         const idDosprevParaPesquisaDossieSuper = superDossie[i].documentoJuntado.componentesDigitais[0].id;
                         const parginaDosPrevDossieSuper = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisaDossieSuper });
         
                         const parginaDosPrevFormatadaDossieNormal = new JSDOM(parginaDosPrevDossieSuper); 
         
         
         
                         const xpathCpfDosprev = "/html/body/div/div[4]/table/tbody/tr[7]/td"
                         const cpfDosprev = getXPathText(parginaDosPrevFormatadaDossieNormal, xpathCpfDosprev);
         
                         if(!cpfDosprev) return new Error("cpf com falha na pesquisa dosprev")
         
                         if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                             return [superDossie[i], 1]
                         }    
         
                     }




                 }else if(!objetoDosprevNormal && objetoDosprevSuper){


                    const idDosprevParaPesquisaDossieNormal = normalDossie[i].documentoJuntado.componentesDigitais[0].id;
                         const parginaDosPrevDossieNormal = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisaDossieNormal });
         
                         const parginaDosPrevFormatadaDossieNormal = new JSDOM(parginaDosPrevDossieNormal); 
         
         
                         const xpathCpfDosprev = "/html/body/div/div[1]/table/tbody/tr[7]/td"
                         const cpfDosprev = getXPathText(parginaDosPrevFormatadaDossieNormal, xpathCpfDosprev);
         
                         if(!cpfDosprev) return new Error("cpf com falha na pesquisa dosprev")
         
                         if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                             return [normalDossie[i], 0]
                         }    




                 }else if(objetoDosprevNormal && !objetoDosprevSuper){



                    const idDosprevParaPesquisaDossieSuper = superDossie[i].documentoJuntado.componentesDigitais[0].id;
                    const parginaDosPrevDossieSuper = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisaDossieSuper });
    
                    const parginaDosPrevFormatadaDossieNormal = new JSDOM(parginaDosPrevDossieSuper); 
    
    
    
                    const xpathCpfDosprev = "/html/body/div/div[4]/table/tbody/tr[7]/td"
                    const cpfDosprev = getXPathText(parginaDosPrevFormatadaDossieNormal, xpathCpfDosprev);
    
                    if(!cpfDosprev) return new Error("cpf com falha na pesquisa dosprev")
    
                    if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                        return [superDossie[i], 1]
                    }    




                 }
     
     
             }
     
     
     
     
             for(let i = 0; i < superDossie.length; i++){
                 let objetoDosprev =  (superDossie[i].documentoJuntado.componentesDigitais.length) <= 0 ||  (!normalDossie[i].documentoJuntado.componentesDigitais[0].id)
         
                 if(objetoDosprev){
                    continue;
                     return new Error("DOSPREV COM FALHA NA PESQUISA")
                 }
         
                 const idDosprevParaPesquisa = superDossie[i].documentoJuntado.componentesDigitais[0].id;
                 const parginaDosPrev = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisa });
         
                 const parginaDosPrevFormatada = new JSDOM(parginaDosPrev); 
         
                 const xpathCpfDosprev = "/html/body/div/div[4]/table/tbody/tr[7]/td"
                 const cpfDosprev = getXPathText(parginaDosPrevFormatada, xpathCpfDosprev);
         
                 if(!cpfDosprev) return new Error("cpf com falha na pesquisa dosprev")
         
                 if(cpf.trim() == CorrigirCpfComZeros(cpfDosprev.trim())){
                     return [superDossie[i], 1]
                 }    
             }
     
     
     
     
     
         }
     
     
     }
     
     return new Error("DOSPREV COM FALHA NA PESQUISA")


 }  catch(e){
    console.log(e)
    return new Error("DOSPREV COM FALHA NA PESQUISA")
 }     


 




}

async function buscarCpfNoDossie(dossie: any, tipo: 'normal' | 'super', cookie: string): Promise<string | null> {
    if (tipo === 'normal') {
        return getCPFDosPrevNormal(dossie, cookie);
    } else {
        return getCPFDosPrevSuper(dossie, cookie);
    }
}

function validarDossie(dossie: any): boolean {
    return dossie.documentoJuntado?.componentesDigitais?.length > 0 && !!dossie.documentoJuntado.componentesDigitais[0].id;
}

async function verificarCpfCorrespondente(dossie: any, cpf: string, tipo: 'normal' | 'super', cookie: string): Promise<boolean> {
    const cpfDossie = await buscarCpfNoDossie(dossie, tipo, cookie);
    if (!cpfDossie) return false;
    return cpf.trim() === CorrigirCpfComZeros(cpfDossie.trim());
}

function compararDossiesPorSequencial(dossieNormal: any, dossieSuper: any): number {
    return dossieNormal.numeracaoSequencial - dossieSuper.numeracaoSequencial;
}

export async function verificarDossieMaisAtualRefactor(cpf: string, cookie:string, normalDossie?: any[], superDossie?: any[]): Promise<any> {
    try {
        // 1. Verifica apenas dossiês normais
        if (normalDossie && !superDossie) {
           console.log("-> DOSPREV: CASILLAS (Somente dossiês normais)");
           for (let i = 0; i < normalDossie.length; i++) {
               if (!validarDossie(normalDossie[i])) {
                   console.warn(`Alerta: Dossiê normal inválido detectado na posição ${i}. Continuando a busca.`);
                   continue;
               }
   
               if (await verificarCpfCorrespondente(normalDossie[i], cpf, 'normal', cookie)) {
                   console.log(`Dossiê normal retornado da posição ${i}, ${normalDossie[i].numeracaoSequencial} do array normal.`);
                   return [normalDossie[i], 0];
               }
           }
           return new Error("Nenhum dossiê normal encontrado para o CPF fornecido.");
       }
   
       // 2. Verifica apenas dossiês super
       if (!normalDossie && superDossie) {
           console.log("-> DOSPREV: RAMOS (Somente dossiês super)");
           for (let i = 0; i < superDossie.length; i++) {
               if (!validarDossie(superDossie[i])) {
                   console.warn(`Alerta: Dossiê super inválido detectado na posição ${i}. Continuando a busca.`);
                   continue;
               }
   
               if (await verificarCpfCorrespondente(superDossie[i], cpf, 'super', cookie)) {
                   console.log(`Dossiê super retornado da posição ${i}, ${superDossie[i].numeracaoSequencial} do array super.`);
                   return [superDossie[i], 1];
               }
           }
           return new Error("Nenhum dossiê super encontrado para o CPF fornecido.");
       }
       
       // 3. Quando existem dossiês normais e super
       if (normalDossie && superDossie) {
           console.log('-> DOSPREV: ARBELOA (Dossiês normais e super)');
   
           let dossieNormalEncontrado: any = null;
           let dossieSuperEncontrado: any = null;
           let posicaoNormalEncontrado: number = -1;
           let posicaoSuperEncontrado: number = -1;
   
           for (let i = 0; i < normalDossie.length; i++) {
               if (!validarDossie(normalDossie[i])) {
                   console.warn(`Alerta: Dossiê normal inválido detectado na posição ${i}. Continuando a busca.`);
                   continue;
               }
   
               if (await verificarCpfCorrespondente(normalDossie[i], cpf, 'normal', cookie)) {
                   dossieNormalEncontrado = normalDossie[i];
                   posicaoNormalEncontrado = i;
                   break;
               }
           }
   
           for (let i = 0; i < superDossie.length; i++) {
               if (!validarDossie(superDossie[i])) {
                   console.warn(`Alerta: Dossiê super inválido detectado na posição ${i}. Continuando a busca.`);
                   continue;
               }
   
               if (await verificarCpfCorrespondente(superDossie[i], cpf, 'super', cookie)) {
                   dossieSuperEncontrado = superDossie[i];
                   posicaoSuperEncontrado = i;
                   break;
               }
           }
   
           if (dossieNormalEncontrado && dossieSuperEncontrado) {
               if (compararDossiesPorSequencial(dossieNormalEncontrado, dossieSuperEncontrado) > 0) {
                   console.log(`Dossiê normal retornado da posição ${posicaoNormalEncontrado}, ${dossieNormalEncontrado.numeracaoSequencial} do array normal.`);
                   return [dossieNormalEncontrado, 0];
               } else {
                   console.log(`Dossiê super retornado da posição ${posicaoSuperEncontrado}, ${dossieSuperEncontrado.numeracaoSequencial} do array super.`);
                   return [dossieSuperEncontrado, 1];
               }
           }
   
            if (dossieNormalEncontrado) {
               console.log(`Dossiê normal retornado da posição ${posicaoNormalEncontrado}, ${dossieNormalEncontrado.numeracaoSequencial} do array normal.`);
               return [dossieNormalEncontrado, 0];
           }
   
           if (dossieSuperEncontrado) {
               console.log(`Dossiê super retornado da posição ${posicaoSuperEncontrado}, ${dossieSuperEncontrado.numeracaoSequencial} do array super.`);
               return [dossieSuperEncontrado, 1];
           }
   
           return new Error("Nenhum dossiê encontrado para o CPF fornecido.");
       }
   
       return new Error("Nenhum dossiê fornecido.");
     } catch(e){
        return new Error("DOSPREV COM FALHA NA PESQUISA")
     }
}