class Endereco{

  logradouro;
  bairro;
  estado;
  numero;
  complemento; 
  cep;
  constructor(id=0,logradouroEndereco='', bairroEndereco='', estadoEndereco='', numeroEndereco='', complementoEndereco='', cepEndereco='' ){
      this.id = id;
      this.logradouro = logradouroEndereco;
      this.bairro = bairroEndereco;
      this.estado = estadoEndereco;
      this.numero = numeroEndereco;
      this.complemento = complementoEndereco;
      this.cep = cepEndereco;
  }
}

module.exports = Endereco
