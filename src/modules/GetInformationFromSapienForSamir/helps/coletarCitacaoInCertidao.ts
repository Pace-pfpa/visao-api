export async function coletarDateInCertidao(arrayDeDocument: any): Promise<string[] | null | undefined> {
    
   try{
    let numeroCertidao;
    for (let i = arrayDeDocument.length - 1; i >= 0; i--) {
      const movimento = arrayDeDocument[i].movimento.split('.');
      if (movimento[0] == 'JUNTADA DOSSIE DOSSIE PREVIDENCIARIO REF') {
        numeroCertidao = i;
        break;
      }
  
      if (arrayDeDocument[i]?.documento?.tipoDocumento?.sigla == 'DOSPREV') {
        numeroCertidao = i;
        break;
      }
    }
    console.log(arrayDeDocument[numeroCertidao + 1])
    if (
      !numeroCertidao ||
      arrayDeDocument[numeroCertidao + 1].documento.tipoDocumento.descricao !=
        'CERTIDÃO'
    )
      return null;
  
    if (
      arrayDeDocument[numeroCertidao + 1].documento.tipoDocumento.descricao ==
      'CERTIDÃO'
    )
      return arrayDeDocument[numeroCertidao + 1].documento.dataHoraProducao
        .split(' ')[0]
        .split('-');
   }catch(e){
    console.log(e + "erro na citacao")
    return null
   } 
    
  }