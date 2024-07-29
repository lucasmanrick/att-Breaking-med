const { connection } = require(`../../config/db`);


const QuerieConsulta = {

  async retornaConsultasAdm() {
    const conn = await connection();
    try {
      const consultas = await conn.query('select c.id, c.data,c.hora, p.nome as paciente_nome, func.nome as funcionario_nome, espec.desc_especialidade from tbl_consulta as c join tbl_pessoa as func on func.id=c.funcionario_pessoa_id join tbl_pessoa as p on p.id=c.paciente_pessoa_id join tbl_especialidade as espec on espec.id=c.especialidade_id where c.status=1')
      if (consultas[0].length === 0) {
        return { consultaMessage: 'não foi possivel retornar as consultas, ou não tem consultas a serem retornadas, por favor tente novamente', result: false }
      }
      return { consultaMessage: 'retornando todas consultas pendentes ao adm', result: true, moreInfos:consultas[0] }
    }
    catch (e) {
      console.log(e)
    }
  },

  async retornaEspecialidadesEFuncionarioVinculado(idFuncionario=0) {
    const conn = await connection();
    try {
      let results;
      if (idFuncionario !== 0) {
        results = await conn.query('select e.id, e.desc_especialidade from tbl_funcionario_has_tbl_especialidade as the join tbl_especialidade as e on the.especialidade_id=e.id WHERE the.funcionario_id=?', [idFuncionario])
        console.log(results)
        if (results[0].length === 0) {
          return { especialidadeMessage: 'O funcionario não possui especialidades registradas ou não existe um funcionario com este id.', results: false, moreInfos: results[0] }
        }
        return { especialidadeMessage: 'retornado especialidades do funcionario disponiveis.', results: true, moreInfos: results[0] }
      } else {
        results = await conn.query('select f.id as funcionario_id, p.id as funcionario_pessoa_id ,p.nome as nomeFuncionario,e.id as especialidade_id,e.desc_especialidade from tbl_especialidade as e join tbl_funcionario_has_tbl_especialidade as the on the.especialidade_id=e.id join tbl_pessoa as p on p.id=the.funcionario_pessoa_id join tbl_funcionario as f on f.id=the.funcionario_id ')
      }
      return { especialidadeMessage: 'retornado todas especialidades disponiveis pra uso.', results: true, moreInfos: results[0] }
    } catch (e) {
      console.log(e)
    }
  },

  async registraNovaConsulta(consultaObj) {
    const conn = await connection();
    try {
      await conn.beginTransaction();
      console.log('entramos no registro de nova consulta')

  

      if (consultaObj.dataConsulta === '' || consultaObj.horaConsulta === '' || consultaObj.statusConsulta === 0 || consultaObj.pacientePessoaId === 0 || consultaObj.funcionarioId === 0 || consultaObj.funcionarioPessoaId === 0 || consultaObj.especialidadeId === 0) {
        return { consultaMessage: 'não foi possivel marcar a consulta, pois falta informações para o registro da mesma, insira todos campos corretamente', result: false }
      }

      console.log('passou primeira verificação')

      const verificaConsultasAtivas = await conn.query('select * from tbl_consulta where status=1 AND paciente_id=?', [consultaObj.paciente_id])

      console.log(verificaConsultasAtivas < 5)
      if (verificaConsultasAtivas[0].length >= 5) {
        return { consultaMessage: 'não foi possivel marcar a consulta, pois o usuário tem muitas consultas pendentes', result: false }
      }

      const cRes = await conn.query('insert into tbl_consulta (data,hora,status,paciente_id,paciente_pessoa_id,funcionario_id,funcionario_pessoa_id,especialidade_id) VALUES (?,?,?,?,?,?,?,?)', [consultaObj.dataConsulta, consultaObj.horaConsulta, consultaObj.statusConsulta, consultaObj.pacienteId, consultaObj.pacientePessoaId, consultaObj.funcionarioId, consultaObj.funcionarioPessoaId, consultaObj.especialidadeId])

      if (cRes[0].affectedRows === 1) {
        const pacientName = await conn.query('select nome from tbl_pessoa where id=?', [consultaObj.pacientePessoaId])
        const doctorName = await conn.query('select nome from tbl_pessoa where id=?', [consultaObj.funcionarioPessoaId])
        const createPront = await conn.query ('insert into tbl_prontuario (diagnostico,medicacao,especialidade_id,consulta_id,consulta_paciente_id,consulta_paciente_pessoa_id,consulta_funcionario_id,consulta_funcionario_pessoa_id) VALUES (?,?,?,?,?,?,?,?)', ['','',consultaObj.especialidadeId,cRes[0].insertId,consultaObj.pacienteId,consultaObj.pacientePessoaId,consultaObj.funcionarioId,consultaObj.funcionarioPessoaId])
        await conn.commit();
        return { consultaMessage: 'consulta registrada com sucesso', result: true, moreInfos: { data: consultaObj.dataConsulta, hora: consultaObj.horaConsulta, pacientName: pacientName[0][0].nome, doctorName: doctorName[0][0].nome } }
      }


    } catch (e) {
      console.log(e)
      await conn.rollback();
      return { consultaMessage: 'não foi possivel registrar consulta tente novamente.', result: false }
    }
  },

  retornaConsultaDePacienteLogado: async (pessoaObj) => {

    const conn = await connection();

    let returnMessage;
    try {
      const pegaConsultasDoPaciente = await conn.query('select id as idConsulta,data as dataConsulta,hora as horaConsulta,status as statusConsulta,paciente_id,paciente_pessoa_id,funcionario_id,funcionario_pessoa_id,especialidade_id from tbl_consulta where paciente_pessoa_id=? and status=1', [pessoaObj.id]);
      if (pegaConsultasDoPaciente[0].length !== 0) {
        returnMessage = { consultaMessage: 'O Paciente tem consultas pendentes', result: true };
        returnMessage.moreInfos = pegaConsultasDoPaciente[0];

        const promessasConsultas = returnMessage.moreInfos.map(async (el) => {
          el.status = 'ativo';
          const pegaNomeMedicoEEspecialidade = await conn.query('select p.nome as nomeDoMedico, e.desc_especialidade as consultaEspecialidade from tbl_especialidade as e join tbl_funcionario_has_tbl_especialidade as the on the.especialidade_id=e.id join tbl_funcionario as f on the.funcionario_id=f.id join tbl_pessoa as p on p.id=f.pessoa_id where e.id=?', [el.especialidade_id]);
          el.dadosMedico = pegaNomeMedicoEEspecialidade[0][0];
          el.dadosMedico.funcionario_id = el.funcionario_id
          el.dadosMedico.funcionario_pessoa_id = el.funcionario_pessoa_id
          el.dadosMedico.especialidade_id = el.especialidade_id;

          delete el.funcionario_id;
          delete el.funcionario_pessoa_id;
          delete el.especialidade_id;
          delete el.paciente_id;
          delete el.paciente_pessoa_id;
          return el;
        });

        // Aguarda todas as queries serem executdas antes de prosseguir com o returnr message
        returnMessage.moreInfos = await Promise.all(promessasConsultas);
        return returnMessage;
      }
    } catch (e) {
      console.error('não foi possivel verificar as consultas do usuario, por favor tente novamente erro:', e);
    }
  },

  retornaConsultaDeMedicoLogado: async (pessoaObj) => {
    const conn = await connection();
    let returnMessage;

      try {
        const pegaConsultasDoMedico = await conn.query('select id as idConsulta,data as dataConsulta,hora as horaConsulta,status as statusConsulta,paciente_id,paciente_pessoa_id,funcionario_id,funcionario_pessoa_id,especialidade_id from tbl_consulta where funcionario_pessoa_id=? and status=1', [pessoaObj.id]);
        if(pegaConsultasDoMedico[0].length === 0) {
          return {consultaMessage:'o Médico não possui consultas pendentes ou não foi possivel retornar os dados no momento, por favor tente novamente!', result:false}
        }else {
          returnMessage = { consultaMessage: 'O Medico tem consultas pendentes', result: true };
          returnMessage.moreInfos = pegaConsultasDoMedico[0];

          const promessasConsultas = returnMessage.moreInfos.map(async (el) => {
            el.status = 'ativo';
            const pegaNomeMedicoEEspecialidade = await conn.query('select id as idDoPaciente, nome as nomeDoPaciente, data_nasc as dataDeNascimento, email as emailDoPaciente, cpf from tbl_pessoa Where id=?', [el.paciente_pessoa_id]);
            const pegaProntuarioConsulta = await conn.query('select id as idPront,medicacao,diagnostico from tbl_prontuario where consulta_id=?',[el.idConsulta])
            el.dadosPaciente = pegaNomeMedicoEEspecialidade[0][0];
            el.dadosPaciente.funcionario_id = el.funcionario_id
            el.dadosPaciente.funcionario_pessoa_id = el.funcionario_pessoa_id
            el.dadosPaciente.especialidade_id = el.especialidade_id;
            el.dadosProntuario = pegaProntuarioConsulta[0][0]
  
            delete el.funcionario_id;
            delete el.funcionario_pessoa_id;
            delete el.especialidade_id;
            delete el.paciente_id;
            delete el.paciente_pessoa_id;
            return el;
          });  
          returnMessage.moreInfos = await Promise.all(promessasConsultas);
          console.log(returnMessage, "esses dados são as consultas pendentes do medico logado.")
          return returnMessage;
          
        }
      }catch(e) {
        console.log(e)
      }
  },

  cancelaAgendamentoConsulta: async (idConsulta) => {
    const conn = await connection();

    const consultaASerCancelada = await conn.query('Update tbl_consulta set status=0 WHERE ID=?', [idConsulta])


    if (consultaASerCancelada[0].affectedRows === 1) {
      return { consultaMessage: `o Agendamento de ID ${idConsulta} foi cancelado`, result: true }
    } else {
      return { consultaMessage: `a solicitação foi enviada porem nenhum agendamento foi alterado, por favor tente novamente`, result: false }
    }
  },

  updateDadosProntuário:async (prontObj) => {
    const conn = await connection();
    try{
      let returnUpdateStatment;
      if(prontObj.diagnostico !== '' && prontObj.medicacao !== '') {
        returnUpdateStatment = await conn.query('UPDATE tbl_prontuario set diagnostico=? AND medicacao=? WHERE id=?',[prontObj.diagnostico,prontObj.medicacao,prontObj.id])
      }else if (prontObj.diagnostico !== '' && prontObj.medicacao == '') {
        returnUpdateStatment = await conn.query('UPDATE tbl_prontuario SET diagnostico=? WHERE ID=?',[prontObj.diagnostico, prontObj.id])
      }else if (prontObj.diagnostico === '' && prontObj.medicacao !== '') {
        returnUpdateStatment = await conn.query('UPDATE tbl_prontuario SET medicacao=? WHERE ID=?',[prontObj.medicacao, prontObj.id])
      }
      if(returnUpdateStatment) {
        return {prontuarioMessage:'dados alterados com sucesso', result:true}
      }else {
        return {prontuarioMessage:'não tem nenhum dado registrado referente a prontuario, por favor preencha os dados para fazer a requisição corretamente', result:false}
      }
    }
    catch(e) {
      console.log(e)
    }
   
  }
}

module.exports = QuerieConsulta;