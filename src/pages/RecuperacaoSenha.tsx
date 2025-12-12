import { useState } from 'react'
import { Card, Input, Button } from '../components/ui'
import { Link } from 'react-router-dom'
import olxLogo from '../assets/olx-logo.png'
import { solicitarRedefinicaoSenha } from '../services/auth'

function isEmail(value: string) {
  return /.+@.+\..+/.test(value)
}

function RecuperacaoSenha() {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  
  const error = touched ? (!email ? 'Campo obrigatório.' : (!isEmail(email) ? 'Informe um e-mail válido.' : undefined)) : undefined

  const handleSubmit = async () => {
    setTouched(true)
    setErrorMessage(undefined)
    
    if (!email || !isEmail(email)) {
      return
    }

    setLoading(true)
    try {
      await solicitarRedefinicaoSenha(email)
      setSuccess(true)
      setErrorMessage(undefined)
    } catch (err) {
      setSuccess(false)
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Erro ao solicitar redefinição de senha. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-full max-w-md">
        <Card>
          <div className="flex flex-col items-center gap-6">
            <img src={olxLogo} alt="OLX" className="h-12 w-auto" />
            <div className="text-center space-y-2">
              <h1 className="font-bold text-lg">Esqueceu sua senha?</h1>
              <p className="text-gray-700">Não se preocupe! Insira o seu e-mail de cadastro e enviaremos instruções para você.</p>
            </div>
            
            {success ? (
              <div className="w-full space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                  <p className="text-green-800 font-medium">E-mail enviado com sucesso!</p>
                  <p className="text-green-700 text-sm mt-1">
                    Verifique sua caixa de entrada ou no spam e siga as instruções para redefinir sua senha.
                  </p>
                </div>
                <Link to="/login">
                  <Button type="button" className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="w-full space-y-4">
                <Input
                  label={<span className="font-medium">E-mail</span>}
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrorMessage(undefined)
                  }}
                  onBlur={() => setTouched(true)}
                  error={error || errorMessage}
                  disabled={loading}
                />
                <Button 
                  type="button" 
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                  disabled={loading || !email || !!error}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    'Receber instruções por e-mail'
                  )}
                </Button>
              </div>
            )}
            
            {!success && (
              <p className="text-sm text-gray-600 text-center">
                Voltar para<br />
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">Entrar</Link>
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RecuperacaoSenha





