class Perfis{
    constructor(id='', tipoPerfil='', loginId=0, loginPerfilId=0, loginPerfilEnderecoId=0){
        this.id = id;
        this.tipoPerfil = tipoPerfil;
        this.loginId = loginId;
        this.loginPerfilId = loginPerfilId;
        this.loginPerfilEnderecoId = loginPerfilEnderecoId;
    }
}

module.exports = Perfis