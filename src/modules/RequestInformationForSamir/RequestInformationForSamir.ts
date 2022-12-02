
import { getUsuarioUseCase } from '../GetUsuario';
import { loginUseCase } from '../LoginUsuario';
import { ILoginDTO } from '../../DTO/LoginDTO';
import { getTarefaUseCase } from '../GetTarefa';
import { TesteDeHTML } from '../../sapiensOperations/resquest/TesteDeHTML';
import { uploadDocumentUseCase } from '../UploadDocument';
import { createDocumentoUseCase } from '../CreateDocumento';
import { updateTarefaUseCase } from '../UpdateTarefa';
import { IInserirMemoriaCalculoDTO } from '../../DTO/InserirMemoriaCalculoDTO';


export class RequestInformationForSamir {

    async execute(data: IInserirMemoriaCalculoDTO): Promise<any> {
        const cookie = await loginUseCase.execute(data.login);
        const usuario = (await getUsuarioUseCase.execute(cookie));

        const usuario_id = `${usuario[0].id}`;
        // const usuario_setor = `${usuario[0].colaborador.lotacoes[0].setor.id}`;
        const usuario_nome = `${usuario[0].nome}`;
        var tidNumber = 3;
        const minutas = data.minutas;
        let response: Array<any> = [];
        const tarefas = await getTarefaUseCase.execute({ cookie, usuario_id, etiqueta: data.etiqueta})
        //console.log(JSON.stringify(tarefas[0]));
        const numero_processoJudicial = tarefas[0].pasta.processoJudicial.numero;
        //console.log(tarefas[0].pasta.processoJudicial.numero);

        for (var i = 0; i < tarefas.length; i++) {
            const processo = tarefas[i].pasta.processoJudicial.numero;
            console.log(processo, tarefas.length);
            const tarefa_id = `${tarefas[i].id}`;
            const pasta_id = `${tarefas[i].pasta.id}`;
            const usuario_setor = `${tarefas[i].setorResponsavel_id}`
            const tid = `${tidNumber}`;
            tarefas[i].postIt = "MEMÓRIA DE CALCULO INSERIDA NA MINUTA";
            tarefas[i].tid = tidNumber;
            // console.log(JSON.stringify(tarefas[i]));
            // const updateTarefa = await updateTarefaUseCase.execute(cookie, (tarefas[i]));
            // response.push(updateTarefa[0]);
            const processoAfazer = minutas.find(minuta => minuta.numeroprocesso == processo);
            if (processoAfazer != null) {
                const createDocument = await createDocumentoUseCase.execute({ cookie, usuario_nome, usuario_setor, tarefa_id, pasta_id, tid })
                // console.log("createDocument", createDocument[0]);
                let documento_id = createDocument[0].id;
                const tipo_documento = "1344"
                // const conteudo = new TesteDeHTML()
                // console.log(JSON.stringify({texto: conteudo.execute()}))
                const upload = await uploadDocumentUseCase.execute(cookie, `${processo}MemoriaCalculo.html`, processoAfazer.conteudo, documento_id, tipo_documento);
                await response.push({ createDocument: createDocument[0], upload });
            }

            if (i == tarefas.length - 1) {
                return response
            }

            tidNumber++;
        }


        // const usuario_setor = `41430`;
        // const usuario_nome = `MOISES ALEXANDRE POMPILHO DA COSTA`;
        // const tarefa_id = `135835019`;
        // const pasta_id = `18348345`;
        // const tid = `${tidNumber}`;
        // const createDocument = await createDocumentoUseCase.execute({ cookie, usuario_nome, usuario_setor, tarefa_id, pasta_id, tid }); 
        // return createDocument[0];
        //const conteudo = new TesteDeHTML()

        //console.log("setor", usuario_setor, "nome", usuario_nome)


        //return usuario[0].id;
        // return uploadDocumentUseCase.execute(coockie, "testeDeHTML.html", await conteudo.execute());

    }
}