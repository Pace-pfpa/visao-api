import { getXPathText } from "../../../helps/GetTextoPorXPATH";

export async function verificarAbreviacaoCapa(novaCapa: any) {
    /* console.log("TESSSS " +(getXPathText(novaCapa, "/html/body/div/div[5]/table/tbody/tr[3]/td[2]/text()"))) */
    const xpathDaSigla: Array<string> = ["/html/body/div/div[4]/table/tbody/tr[3]/td[2]", "/html/body/div/div[5]/table/tbody/tr[3]/td[2]/text()"]
    let BuscarPelaTjmg = false;
    for (let i = 0; i < 2; i++) {
        let VerificarSeExiste = (getXPathText(novaCapa, xpathDaSigla[i]));
        if (VerificarSeExiste) {
            if (VerificarSeExiste.split("(")[1]) {
                return ((VerificarSeExiste.split("(")[1]).replace(/[)]/g, "").trim())
            }
        }

    }
}