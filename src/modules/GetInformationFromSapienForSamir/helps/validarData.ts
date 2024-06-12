export function validarData(dataString: string){
    try{

        const regexData = /^\d{2}\/\d{2}\/\d{4}$/;

        if (!regexData.test(dataString)) {
            return false;
        }

        const partes = dataString.split('/');
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; // mês no JavaScript começa em 0
        const ano = parseInt(partes[2], 10);

        const data = new Date(ano, mes, dia);

        return data.getDate() === dia && data.getMonth() === mes && data.getFullYear() === ano;


    }catch(error){
        console.log(error)
        return false
    }
}

