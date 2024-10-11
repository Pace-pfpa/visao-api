import { getXPathText } from "../../../helps/GetTextoPorXPATH";

export async function verificarCapaTrue(capaToVerivy: string){ 
///html/body/div/div[5]
    for(let i=0; i<10;i++){
        let pathDivTable = `/html/body/div/div[${i}]`;
        let infoxPath = getXPathText(capaToVerivy, pathDivTable);
        ///html/body/div/div[5]/table/tbody/tr[1]/td[1]
        if(infoxPath){
            for(let j=0;j<20; j++){
                let xpathDivLinha = `html/body/div/div[${i}]/table/tbody/tr[${j}]/td[1]`
                let infoXptahLinha = getXPathText(capaToVerivy, xpathDivLinha);
                if(infoXptahLinha){
                    if("Classe:" == infoXptahLinha){
                        return true;
                    }
                }
                

            }
        }

    }
    return false;



    ///html/body/div/div[5]/table/tbody/tr[10]/td[1]

}