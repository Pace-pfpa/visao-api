import { ILoginDTO } from "./LoginDTO";

export interface IGetInformationsFromSapiensDTO {
    login: ILoginDTO;
    etiqueta: string;
    usuario_id: string;
    nb_processo?: string;
    nup?: string;
}





/**
 * @swagger
 * components:
 *   schemas:
 *     GetInformationsFromSapiens:
 *       type: object
 *       required:
 *         - login
 *         - etiqueta
 *       properties:
 *         login:
 *           type: '#/components/schemas/Login'
 *           description: login sapiens
 *         etiqueta:
 *           type: string
 *           description: etiqueta do processo
 *       example:
 *         login: {cpf: "021273374328244", senha: maionesse122}
 *         etiqueta: LIDO BOOT
 *         
 * */

