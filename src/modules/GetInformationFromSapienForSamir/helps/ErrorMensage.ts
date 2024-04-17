export class MinhaErroPersonalizado extends Error {
    constructor(mensagem: string) {
      super(mensagem);
      this.name = 'MinhaErroPersonalizado';
    }
  }