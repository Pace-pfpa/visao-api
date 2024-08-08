import { IBeneficiosDTO } from "../../../DTO/BeneficiosDTO";



export async function verificarBeneficioInformacoesIniciais(informationsForCalculeDTO: IBeneficiosDTO[]) {


    try{

        informationsForCalculeDTO.forEach((element) => {

            if(!element.tipo || element.tipo.length <= 1){
                return false
            }

            if(!element.dcb || element.dcb.length <= 1){
                return false
            }


            if(!element.dib || element.dib.length <= 1){
                return false
            }

            if(!element.beneficio || element.beneficio.length <= 1){
                return false
            }



        })



    }catch(err){
        console.log(err)
        return false
    }




}