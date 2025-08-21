async function validarSenha(senha) {
    if (senha.length < 8)
        return false

    const contemMaiuscula = /[A-Z]/.test(senha)
    const contemMinuscula = /[a-z]/.test(senha)
    const contemNumero = /[0-9]/.test(senha)
    const contemSimbolo = /[^A-Za-z0-9]/.test(senha)
  
    if(!contemMaiuscula || !contemMinuscula || !contemNumero || !contemSimbolo)
        return false

    return true
}

module.exports = validarSenha