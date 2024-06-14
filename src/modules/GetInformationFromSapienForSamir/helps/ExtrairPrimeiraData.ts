export function extrairPrimeiraData(data: string){
    const regexData = /\d{2}\/\d{2}\/\d{4}/;
    const resultado = regexData.exec(data);
    return resultado ? resultado[0] : null;
}

