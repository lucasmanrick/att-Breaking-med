const { connection } = require(`../../config/db`);
const Login = require("../Classes/loginClass");
const jwt = require('jsonwebtoken');

const QuerysPessoa = {

  // QUERYS DE REGISTROS DE PESSOA

  async verificaExistenciaDeUmUsuario(cpf) { //retorna todos clientes registrados. não esta sendo utilizado.
    const conn = await connection();
    try {
      const result = await conn.query('select p.*, pac.id as pac_id from tbl_pessoa as p join tbl_paciente as pac on pac.pessoa_id=p.id where p.cpf=?;',[cpf]);
      if(result[0].length === 0) {
        return {consultaMessage:'o CPF informado não possui um cadastro, por favor tente novamente',result:false}
      }else {
        return {consultaMessage:'o CPF informado possui um cadastro no banco de dados',result:true,moreInfos:result[0][0]}
      }

    } catch (error) {
      throw error;
    }
  },
  async novoRegistroPessoa(pessoaObj, enderecoObj, telefoneObj, loginObj, perfisObj, funcionarioObj, especialidadeObj) {
    const conn = await connection();
    try {

      await conn.beginTransaction();

      console.log(pessoaObj.cpf)
      let confirmaExistenciaRegistro = await conn.query('select id from tbl_pessoa where cpf=? ;', [pessoaObj.cpf])
      console.log(confirmaExistenciaRegistro)
      if(confirmaExistenciaRegistro[0].length > 0) {
        return {cadastroMessage: "Ja possui um cadastro com este mesmo CPF", result: false }
      }

      console.log(perfisObj.tipoPerfil)
      if(perfisObj.tipoPerfil !== 'paciente' && perfisObj.tipoPerfil !== 'medico' && perfisObj.tipoPerfil !== 'administrador') {
        return {cadastroMessage:"O tipo de perfil indicado não existe", result:false }
      }

      //confirmação se o endereço do novo usuario ja existe

      let confirmaExistenciaEndereco = await conn.query(`select id from tbl_endereco where cep=? AND numero=?;`, [enderecoObj.cep,enderecoObj.numero])

      let eRes;

      if(confirmaExistenciaEndereco[0].length > 0) {
        eRes = confirmaExistenciaEndereco[0][0].id
      } else {
        eRes = await conn.query(`insert into tbl_endereco (logradouro,bairro,estado,numero,complemento,cep) VALUES (?,?,?,?,?,?)`, [enderecoObj.logradouro, enderecoObj.bairro, enderecoObj.estado, enderecoObj.numero, enderecoObj.complemento,enderecoObj.cep])
        eRes = eRes[0].insertId   
      }

      //confirmação se o usuario ja não possui um cadastro.

      const pRes = await conn.query(`insert into tbl_pessoa (nome,cpf,data_nasc,genero,email,data_cad,endereco_id) values (?,?,?,?,?,?,?)`, [pessoaObj.nome,pessoaObj.cpf,pessoaObj.dataNasc,pessoaObj.genero,pessoaObj.email,pessoaObj.dataDeCadastro,eRes])


      const lRes = await conn.query(`insert into tbl_login (login,senha,status,pessoa_id,pessoa_endereco_id) values (?,?,?,?,?)`, [loginObj.loginPessoa, loginObj.senhaPessoa,1, pRes[0].insertId,eRes])

     
      const perfisRes = await conn.query(`insert into tbl_perfis (tipo,login_id,login_pessoa_id,login_pessoa_endereco_id) values (?,?,?,?)`, [perfisObj.tipoPerfil, lRes[0].insertId, pRes[0].insertId,eRes])

      if (telefoneObj.numero.length !== 0) {
        telefoneObj.numero.forEach(async (tel,index) => {
           let parse = tel.toString()

          if (parse.length === 10 || parse.length === 11) {
          const hasTel = await conn.query(`select * from tbl_telefone WHERE numero=?`, [tel])
          if (hasTel[0].length != 0) { //caso ja tenha um dos telefones registrado não registra de novo, só vincula o novo registro de cliente ao telefone ja existente
            await conn.query(`insert into tbl_pessoa_has_tbl_telefone (pessoa_id,telefone_id,pessoa_tbl_endereco_id) values (?,?,?)`, [pRes[0].insertId, hasTel[0][0].id,eRes])
            return
          }
          let tRes = await conn.query(`insert into tbl_telefone (numero) values (?)`, [tel])
          await conn.query(`insert into tbl_pessoa_has_tbl_telefone (pessoa_id,telefone_id,pessoa_tbl_endereco_id) values (?,?,?)`, [pRes[0].insertId, tRes[0].insertId,eRes])
        }
        })

      }


      let pacienteRes = await conn.query(`insert into tbl_paciente (pessoa_id) values (?)`, [pRes[0].insertId])

      if (funcionarioObj !== null && especialidadeObj !== null) {
        let fRes = await conn.query(`insert into tbl_funcionario (data_admissao, crm, pessoa_id, pessoa_endereco_id) Values (?,?,?,?)`, [funcionarioObj.dataAdmissao, funcionarioObj.crm, pRes[0].insertId,eRes])
        if (funcionarioObj.crm === null) {
          return
        }
        const especialidadeRes = await conn.query(`insert into tbl_funcionario_has_tbl_especialidade (funcionario_id,funcionario_pessoa_id,funcionario_pessoa_endereco_id,especialidade_id) values (?,?,?,?)`, [fRes[0].insertId, pRes[0].insertId,eRes, especialidadeObj.id])
      }



      await conn.commit();

      return { cadastroMessage: "usuario registrado com sucesso!!", result: true }


    } catch (error) {
      await conn.rollback();

      return { cadastroMessage: `usuario não foi registrado devido ao erro: ${error}`, result: false }


    }
  },


  // QUERYS DE ESPECIALIDADE\/

   retornaEspecialidade: async (idFuncionario=0) => { //essa função pode retornar os dados de todos funcionarios e suas especialidades ou retornar as especialidades de um funcionario especifico caso seja passado id
    const conn = await connection();

    try {
      let results;
      if(idFuncionario !== 0) {
        console.log(idFuncionario)
        results = await conn.query('select e.id, e.desc_especialidade from tbl_funcionario_has_tbl_especialidade as the join tbl_especialidade as e on the.especialidade_id=e.id WHERE the.funcionario_id=?',[idFuncionario])
        if(results[0].length === 0) {
          return {especialidadeMessage:'O funcionario não possui especialidades registradas ou não existe um funcionario com este id.', results:false, moreInfos: results[0]}
        }
        return {especialidadeMessage:'retornado especialidades do funcionario disponiveis.', results:true, moreInfos: results[0]}
      }else {
        results = await conn.query('select * from tbl_especialidade ')
      }
      return {especialidadeMessage:'retornado todas especialidades disponiveis pra uso.', results:true, moreInfos: results[0] }  
    }catch(e) {
      console.log(e)
    }
  },

  retornaFuncionarioComDeDeterminadaEspecialidade: async (idEspecialidade=0) => {
    const conn = await connection();
    try {
      console.log(idEspecialidade)
     
      if(idEspecialidade !== 0 && typeof(idEspecialidade) === 'number') {
        const funcionarioReturn = await conn.query('select p.nome, the.funcionario_id as funcionario_id, the.funcionario_pessoa_id from tbl_pessoa as p join tbl_funcionario_has_tbl_especialidade as the on the.funcionario_pessoa_id=p.id WHERE the.especialidade_id=?;',[idEspecialidade])
        console.log(funcionarioReturn)
        return {funcionarioReturn:'retornando funcionarios que tem a especialidade solicitada', result:true, moreInfos:funcionarioReturn[0]}
      }else {
        return {funcionarioReturn:'não foi possivel fazer retorno de funcionario com base na especialidade pois o parametro não é compativel',result:false}
      }
     
    }catch(e) {
      console.log(e)
    }
  },

  logandoCliente: async (loginObj) => {
    const conn = await connection();
    try {
      const returnLoginQuery = await conn.query('select l.status,perf.tipo, pess.id as pessId, pess.nome as nomeUsuario from tbl_login as l join tbl_perfis as perf on perf.login_id=l.id join tbl_pessoa as pess on pess.id=l.pessoa_id WHERE l.login=? AND l.senha=?',[loginObj.loginPessoa,loginObj.senhaPessoa])
      // if(returnLoginQuery[0][0].status == 0) {
      //   return {loginMessage:'Cadastro não se encontra ativo consulte um administrador para reativa-lo', result:false}
      // }
      if(returnLoginQuery[0].length === 0) {
        return {loginMessage:'nenhum cadastro com estas credenciais foi identificado, tente novamente', result:false}
      }else {
        console.log('retornou um registro')
        if(returnLoginQuery[0][0].tipo === 'administrador') {
          let pessId = returnLoginQuery[0][0].pessId
          const token = jwt.sign({ pessId }, process.env.SECRET, {
            expiresIn: 1000 // expires in 5min
          });
          return {loginMessage:'o cadastro é administrador, tem permissão total', result:true, token:token, moreInfos:returnLoginQuery[0][0]}
        }
        else if(returnLoginQuery[0][0].tipo === 'medico') {
          let pessId = returnLoginQuery[0][0].pessId
          const token = jwt.sign({ pessId }, process.env.MEDIC, {
            expiresIn: 300 // expires in 5min
          });
          return {loginMessage:'o cadastro é de um MEDICO, tem permissão a verificar suas consultas', result:true,token:token, moreInfos:returnLoginQuery[0][0]}
        }
        else if (returnLoginQuery[0][0].tipo === 'paciente') {
          let pessId = returnLoginQuery[0][0].pessId
          const token = jwt.sign({ pessId }, process.env.PACIENT, {
            expiresIn: 300 // expires in 5min
          });
          return {loginMessage:'o cadastro é de um paciente, tem permissão a verificar suas consultas', result:true, token:token,moreInfos:returnLoginQuery[0][0]}
        }else {
         return {loginMessage:'O cadastro não tem perfil, ou o perfil não é valido por favor valide.', result:false}
        }
      }
    }
    catch(e) {
      console.log(e)
    }
  }


}

module.exports = QuerysPessoa