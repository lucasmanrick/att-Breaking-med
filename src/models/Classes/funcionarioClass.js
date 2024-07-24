class Funcionario{
    constructor(id='', dataAdmissao='', crm='', pessoaId=0, pessoaEnderecoId=0){
        this.id = id;
        this.dataAdmissao = dataAdmissao;
        this.crm = crm;
        this.pessoaId = pessoaId;
        this.pessoaEnderecoId = pessoaEnderecoId;
    }
}


module.exports=Funcionario