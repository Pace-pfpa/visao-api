const { JSDOM } = require('jsdom');
import { getXPathText } from "../../../helps/GetTextoPorXPATH";
import { getDocumentoUseCase } from "../../GetDocumento";

export async function getCPFDosPrevSuper (superDossie: any, cookie: string) {

    const idDosprevParaPesquisaDossieSuper = superDossie.documentoJuntado.componentesDigitais[0].id;
    const parginaDosPrevDossieSuper = await getDocumentoUseCase.execute({ cookie, idDocument: idDosprevParaPesquisaDossieSuper });
        
    const parginaDosPrevFormatadaDossieNormal = new JSDOM(parginaDosPrevDossieSuper); 
        
    const xpathCpfDosprev = "/html/body/div/div[4]/table/tbody/tr[7]/td"
    const cpfDosprev = getXPathText(parginaDosPrevFormatadaDossieNormal, xpathCpfDosprev);

    return cpfDosprev
}