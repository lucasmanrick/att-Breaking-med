const Pessoa = require('../models/Classes/PessoaClass');
const Consulta = require('../models/Classes/consultaClass');
const Prontuario = require('../models/Classes/prontuarioClass');
const { registraNovaConsulta, retornaConsultaDePacienteLogado, retornaConsultaDeMedicoLogado, cancelaAgendamentoConsulta, retornaConsultasAdm, retornaEspecialidadesEFuncionarioVinculado, updateDadosProntuário } = require('../models/Queries/ConsultaQuerie');
const { verificaExistenciaDeUmUsuario } = require('../models/Queries/PessoaQuerie');


const consultaController = {

  retornaEspecialidadesEFuncionario: async (req, res) => {
    const { funcionarioId } = req.params
    let result;
    if (funcionarioId) {
      result = await retornaEspecialidadesEFuncionarioVinculado(funcionarioId)
      res.json(result)
    } else {
      result = await retornaEspecialidadesEFuncionarioVinculado()
      res.json(result)
    }
  },
  retornaTodasConsultas: async (req, res) => {
    try {
      const retornoConsulta = await retornaConsultasAdm()
      res.json(retornoConsulta)
    }
    catch (e) {
      console.log(e)
      res.json({ consultaMessage: 'não foi possivel retornar consultas ao adm, por favor tente novamente', result: false })
    }
  },

  novaConsulta: async (req, res) => {
    try {
      const { data, hora, cpfPaciente, funcionario_id, funcionario_pessoa_id, especialidade_id } = req.body;

      console.log(funcionario_pessoa_id)
      const verificaExistenciaPaciente = await verificaExistenciaDeUmUsuario(cpfPaciente)

      if (verificaExistenciaPaciente.result === true) {
       const consultaObj = new Consulta(null, data, hora,1, verificaExistenciaPaciente.moreInfos.pac_id, verificaExistenciaPaciente.moreInfos.id, funcionario_id, funcionario_pessoa_id, especialidade_id)
        res.json(await registraNovaConsulta(consultaObj))
      } else {
        res.json(verificaExistenciaPaciente)
        return
      }

    }
    catch (e) {
      res.json({ consultaMessage: 'não foi possivel registrar consulta tente novamente.', result: false })
      console.log(e)
    }
  },

  verificaConsultasPaciente: async (req, res) => {
    const idPessoa = req.headers['idpessoa']  //o id recebido aki é o do paciente
    console.log('entrou')
    if (idPessoa) {
      const recebeConsultas = new Pessoa(idPessoa)
      res.json(await retornaConsultaDePacienteLogado(recebeConsultas))
      return
    } else {
      res.json({ consultaMessage: 'o id do paciente que está solicitando consultas pendentes não foi passado', result: false })
    }
  },

  verificaConsultasMedico: async (req, res) => {
    const idPessoa = req.headers['idpessoa']
    if (idPessoa) {
      const recebeConsultas = new Pessoa(idPessoa)
      res.json(await retornaConsultaDeMedicoLogado(recebeConsultas))
    }
  },

  cancelaConsulta: async (req, res) => {
    try {
      const idDaConsulta = req.headers['idconsulta'];
      console.log(req.headers)
      if (!idDaConsulta) {
        res.json({ consultaMessage: 'o id da consulta não chegou corretamente ao servidor, tente novamente!', result: false })
        return
      }

      res.json(await cancelaAgendamentoConsulta(idDaConsulta))
    } catch (e) {
      console.log(e)
    }


  },

  preencheProntuario: async (req, res) => {
    try {
      const { diagnostico, medicacao } = req.body;
      const { idPront } = req.body;

      const instanciaPront = new Prontuario(idPront, diagnostico, medicacao)

      const sendReceiveUpdate = updateDadosProntuário(instanciaPront)
    } catch (e) {
      console.log(e)
    }
  }
}


module.exports = consultaController