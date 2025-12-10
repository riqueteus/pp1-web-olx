import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Input, Button } from '../components/ui'
import { Link } from 'react-router-dom'
import olxLogo from '../assets/olx-logo.png'
import { redefinirSenha } from '../services/auth'

const Rule = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-sm">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-4 w-4 ${ok ? 'text-green-600' : 'text-gray-300'}`}
      aria-hidden="true"
    >
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 10-1.214-.882l-3.483 4.79-1.96-1.96a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.14-.09l4.077-5.418z" clipRule="evenodd" />
    </svg>
    <span className={ok ? 'text-gray-700' : 'text-gray-500'}>{children}</span>
  </div>
)

function RedefinirSenha() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!token) {
      setErrorMessage('Token de redefinição não encontrado. Solicite um novo link.')
    }
  }, [token])

  const passRules = useMemo(() => ({
    length: senha.length >= 8,
    upper: /[A-Z]/.test(senha),
    lower: /[a-z]/.test(senha),
    digit: /\d/.test(senha),
    special: /[^A-Za-z0-9]/.test(senha),
  }), [senha])

  const senhaValida = passRules.length && passRules.upper && passRules.lower && passRules.digit && passRules.special

  const errors = {
    senha: touched.senha 
      ? (!senha 
        ? 'Campo obrigatório.' 
        : (!senhaValida ? 'A senha não atende aos requisitos.' : undefined))
      : undefined,
    confirmarSenha: touched.confirmarSenha 
      ? (!confirmarSenha 
        ? 'Confirme sua senha.' 
        : (senha !== confirmarSenha ? 'As senhas não conferem.' : undefined))
      : undefined,
  }

  const handleSubmit = async () => {
    setTouched({ senha: true, confirmarSenha: true })
    setErrorMessage(undefined)

    if (!token) {
      setErrorMessage('Token de redefinição não encontrado.')
      return
    }

    if (!senha || !confirmarSenha || !senhaValida || senha !== confirmarSenha) {
      return
    }

    setLoading(true)
    try {
      await redefinirSenha(token, senha)
      setSuccess(true)
      setErrorMessage(undefined)
    } catch (err) {
      setSuccess(false)
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Erro ao redefinir senha. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-full max-w-md">
          <Card>
            <div className="flex flex-col items-center gap-6">
              <img src={olxLogo} alt="OLX" className="h-12 w-auto" />
              <div className="text-center space-y-2">
                <h1 className="font-bold text-lg">Token inválido</h1>
                <p className="text-gray-700">
                  O link de redefinição de senha é inválido ou expirou.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-md p-3 w-full">
                <p className="text-red-800 text-sm">{errorMessage}</p>
              </div>
              <Link to="/recuperacao-senha">
                <Button type="button" className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                  Solicitar novo link
                </Button>
              </Link>
              <p className="text-sm text-gray-600 text-center">
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">
                  Voltar para o login
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-full max-w-md">
          <Card>
            <div className="flex flex-col items-center gap-6">
              <img src={olxLogo} alt="OLX" className="h-12 w-auto" />
              <div className="text-center space-y-2">
                <h1 className="font-bold text-lg">Senha redefinida com sucesso!</h1>
                <p className="text-gray-700">
                  Sua senha foi alterada com sucesso.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center w-full">
                <p className="text-green-800 font-medium">✓ Senha alterada com sucesso</p>
              </div>
              <Link to="/login">
                <Button type="button" className="bg-orange-500 hover:bg-orange-600 text-white w-full cursor-pointer">
                  Ir para o login
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-full max-w-md">
        <Card>
          <div className="flex flex-col items-center gap-6">
            <img src={olxLogo} alt="OLX" className="h-12 w-auto" />
            <div className="text-center space-y-2">
              <h1 className="font-bold text-lg">Redefinir senha</h1>
              <p className="text-gray-700">Digite sua nova senha abaixo.</p>
            </div>
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    label={<span className="font-medium">Nova senha</span>}
                    type={showPassword ? 'text' : 'password'}
                    name="senha"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value)
                      setErrorMessage(undefined)
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, senha: true }))}
                    error={errors.senha}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label={<span className="font-medium">Confirmar nova senha</span>}
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmarSenha"
                    value={confirmarSenha}
                    onChange={(e) => {
                      setConfirmarSenha(e.target.value)
                      setErrorMessage(undefined)
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, confirmarSenha: true }))}
                    error={errors.confirmarSenha}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-700">Para sua segurança, crie uma senha com no mínimo:</div>
              <div className="grid gap-1">
                <Rule ok={passRules.length}>8 ou mais caracteres</Rule>
                <Rule ok={passRules.upper}>Uma letra maiúscula</Rule>
                <Rule ok={passRules.lower}>Uma letra minúscula</Rule>
                <Rule ok={passRules.digit}>Um número</Rule>
                <Rule ok={passRules.special}>Um caracter especial (exemplo: @ ! $ & #)</Rule>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm">{errorMessage}</p>
                </div>
              )}

              <Button 
                type="button" 
                className="bg-orange-500 hover:bg-orange-600 text-white w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={loading || !senha || !confirmarSenha || !senhaValida || senha !== confirmarSenha}
              >
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RedefinirSenha
