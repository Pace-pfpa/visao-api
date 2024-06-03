export  function CorrigirCpfComZeros(cpf: string){

    if(cpf.length !== 11){
        const quantNumeroFaltandoCpf = 11 - cpf.length;

    let zerosParaContar = "";
    for(let i = 0; i< quantNumeroFaltandoCpf; i++){
        zerosParaContar = zerosParaContar + "0"
    }

    return  `${zerosParaContar}${cpf}`
    }
    return cpf
}