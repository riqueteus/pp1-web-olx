import { useEffect, useState } from 'react';
import { Card, Input, Button } from '../components/ui';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../services/auth';
import { saveAuthData } from '../utils/auth';

// Add global styles for link hover effect
const linkStyle = 'text-purple-600 hover:text-purple-700 font-semibold hover:underline'

function isValidEmail(value: string) {
  if (!value) return false
  // Simple email check
  return /.+@.+\..+/.test(value)
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedEmail = localStorage.getItem('lastRegisteredEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      localStorage.removeItem('lastRegisteredEmail')
    }
  }, [])

  const showError = touched && !isValidEmail(email)
  const errorText = showError ? 'Campo obrigatório. Informe um e-mail válido.' : undefined
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    setServerError(null)

    // Validação básica do formulário
    if (!email.trim()) {
      setServerError('Por favor, informe seu e-mail.')
      return
    }
    
    if (!isValidEmail(email)) {
      setServerError('O e-mail informado não é válido. Verifique e tente novamente.')
      return
    }
    
    if (!password) {
      setServerError('Por favor, informe sua senha.')
      return
    }

    setIsSubmitting(true)
    
    try {
      const { token, ...userData } = await loginRequest({ email, senha: password });
      // Save auth data including user info
      saveAuthData(token, {
        name: userData.nomeUsuario,
        email: email,
        // Add any other user data you want to store
      });
      navigate('/');
    } catch (err) {
      let errorMessage = 'Não foi possível fazer login. Verifique suas credenciais e tente novamente.'
      
      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase()
        
        if (errorMsg.includes('credenciais') || errorMsg.includes('senha') || errorMsg.includes('incorret')) {
          errorMessage = 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.'
        } else if (errorMsg.includes('network') || errorMsg.includes('conexão') || errorMsg.includes('servidor')) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
        } else if (errorMsg.includes('email') || errorMsg.includes('não encontrado') || errorMsg.includes('não existe')) {
          errorMessage = 'Nenhuma conta encontrada com este e-mail. Verifique o endereço ou cadastre-se.'
        } else if (errorMsg.includes('senha') || errorMsg.includes('password')) {
          errorMessage = 'Senha incorreta. Tente novamente ou clique em "Esqueci a minha senha".'
        } else {
          errorMessage = `Erro ao tentar fazer login: ${err.message}`
        }
      }
      
      setServerError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <Card
            header={<h1 className="font-bold text-lg">Entre na sua conta e<br />negocie com segurança!</h1>}
            footer={(
              <div className="space-y-4">
                {serverError && (
                  <div className="p-3 mb-2 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-gray-800 dark:text-red-400" role="alert">
                    <div className="font-medium">Erro no login</div>
                    <div>{serverError}</div>
                  </div>
                )}
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Entrando...' : 'Acessar'}
                </Button>
                <div className="text-center">
                  <Link to="/recuperacao-senha" className={`text-sm ${linkStyle}`}>
                    Esqueci a minha senha
                  </Link>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Não tem uma conta?{' '}
                  <Link to="/cadastro" className={linkStyle}>
                    Cadastre-se
                  </Link>
                </p>
              </div>
            )}
          >
            <div className="space-y-4">
              <p className="text-gray-700">Acesse e aproveite uma experiência<br />segura dentro da OLX.</p>
              <div className="space-y-2">
                <Input
                  label={<span className="font-medium">E-mail</span>}
                  type="email"
                  name="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  error={errorText}
                />
                <Input
                  label={<span className="font-medium">Senha</span>}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPasswordToggle={true}
                  onTogglePassword={togglePasswordVisibility}
                />
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default Login


