import { ResponseArvoreDeDocumento } from "../../../sapiensOperations/response/ResponseArvoreDeDocumento";

export function coletarCitacao(arrayDeDocumentos: ResponseArvoreDeDocumento[]): string {
    let ObjectCitacao = arrayDeDocumentos.find(Documento => Documento.documentoJuntado.tipoDocumento.nome == "CITAÇÃO");
    if(!ObjectCitacao){                
        ObjectCitacao = arrayDeDocumentos.find((Documento) => {
            if(Documento.documentoJuntado.descricaoOutros){
                return Documento.documentoJuntado.descricaoOutros.includes("CITAÇÃO")
            }
        })
    }


    if (ObjectCitacao == null) {
        return null
    }
    
    try {
        const ArrayDataCitacaoParaFormatacao = ObjectCitacao.documentoJuntado.dataHoraProducao.date.split(" ")[0].split("-");
        const dataCitacao: string = `${ArrayDataCitacaoParaFormatacao[2]}/${ArrayDataCitacaoParaFormatacao[1]}/${ArrayDataCitacaoParaFormatacao[0]}`
        return dataCitacao;
    } catch (error) {
        return null
    }
}

