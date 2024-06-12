import { getXPathText } from "../../../helps/GetTextoPorXPATH";

export function buscarTableCpf(capa: string){
    for(let i=0; i<10; i++){
        let pathTableCpf = `/html/body/div/div[${i}]`
        let tableIsTrue = getXPathText(capa, pathTableCpf);
        if(tableIsTrue){  
            let verificarLinhaPoloAtivo = tableIsTrue.indexOf("PÓLO ATIVO")
            if(verificarLinhaPoloAtivo != -1){
                 for(let j=0; j<10;j++){ 
                    let xpathCpf = `html/body/div/div[${i}]/table/tbody/tr[${j}]`
                    let poloAtivo = getXPathText(capa, xpathCpf)
                    if(poloAtivo){
                         let poloAtivoCpf = poloAtivo.indexOf("PÓLO ATIVO")
                         if(poloAtivoCpf != -1){
                            return (poloAtivo.split(/[()]/)[1]).replaceAll(/[.-]/g, "")
                         }
                    }
                 }
            }
        }
    }
    return undefined
}
///html/body/div/div[7]/table/tbody/tr[2]

///html/body/div/div[6]/table/tbody/tr[2]