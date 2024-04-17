import { ErroGetArvoreDocumentoController } from "./GetArvoreDocumentoController";
import { ErroGetArvoreDocumentoUseCase } from "./GetArvoreDocumentoUseCase";

export const ErrogetArvoreDocumentoUseCase = new ErroGetArvoreDocumentoUseCase();
export const ErrogetArvoreDocumentoController = new ErroGetArvoreDocumentoController(ErrogetArvoreDocumentoUseCase);
