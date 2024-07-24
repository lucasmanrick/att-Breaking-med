class Login{

    constructor(id=0,loginPessoa, senhaPessoa, statusPessoa=1, pessoaId='', enderecoId=''){
        this.id = id;
        this.loginPessoa = loginPessoa;
        this.senhaPessoa = senhaPessoa;
        this.statusPessoa = statusPessoa;
        this.pessoaId = pessoaId;
        this.enderecoId = enderecoId;
    }

    
}

module.exports = Login

