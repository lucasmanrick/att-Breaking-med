const { connection } = require(`../../config/db`);

class Pessoa {
  constructor (id=0,nomeDaPessoa='',cpf='',dataNasc='',genero='',email='',dataDeCadastro='',enderecoId=0) {
    this.id = id
    this.nome = nomeDaPessoa,
    this.cpf = cpf,
    this.dataNasc = dataNasc,
    this.genero = genero,
    this.email = email,
    this.dataDeCadastro = dataDeCadastro,
    this.enderecoId = enderecoId
  }

}

module.exports = Pessoa

