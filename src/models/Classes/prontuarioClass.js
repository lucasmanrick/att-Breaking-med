class Prontuario{
    constructor(id='', diagnostico='',  medicacao='', especialidadeId=0, consultaId=0, consultaPacienteId=0, consultaPacientePessoaId=0, consultaFuncionarioId=0, consultaFuncionarioPessoaId=0){
        this.id = id;
        this.diagnostico = diagnostico;
        this.medicacao = medicacao;
        this.especialidadeId = especialidadeId;
        this.consultaId = consultaId;
        this.consultaPacienteId = consultaPacienteId;
        this.consultaPacientePessoaId = consultaPacientePessoaId;
        this.consultaFuncionarioId = consultaFuncionarioId;
        this.consultaFuncionarioPessoaId = consultaFuncionarioPessoaId;
    }
}

module.exports=Prontuario