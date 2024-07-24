class Consulta{
    constructor(id='', dataConsulta='', horaConsulta='', statusConsulta=1, pacienteId=0, pacientePessoaId=0, funcionarioId=0, funcionarioPessoaId=0, especialidadeId=0){
        this.id = id;
        this.dataConsulta = dataConsulta;
        this.horaConsulta = horaConsulta;
        this.statusConsulta = statusConsulta;
        this.pacienteId = pacienteId;
        this.pacientePessoaId = pacientePessoaId;
        this.funcionarioId = funcionarioId;
        this.funcionarioPessoaId = funcionarioPessoaId;
        this.especialidadeId = especialidadeId;
    }
}

module.exports = Consulta