import { useState } from 'react'
import { Card } from '../components/ui'
import { Input } from '../components/ui'
import { Button } from '../components/ui'
import { Link } from 'react-router-dom'

function isValidEmail(value: string) {
  if (!value) return false
  // Simple email check
  return /.+@.+\..+/.test(value)
}

function Login() {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)

  const showError = touched && !isValidEmail(email)
  const errorText = showError ? 'Campo obrigatório. Informe um e-mail válido.' : undefined

  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-full max-w-md">
        <Card
          header={<h1 className="font-bold text-lg">Entre na sua conta e<br />negocie com segurança!</h1>}
          footer={(
            <div className="space-y-3">
              <Button
                type="button"
                className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                onClick={() => setTouched(true)}
              >
                Acessar
              </Button>
              <p className="text-sm text-gray-600 text-center">
                Não tem uma conta?
                <br />
                <Link to="/cadastro" className="text-purple-600 hover:text-purple-700 font-semibold">Cadastre-se</Link>
              </p>
            </div>
          )}
        >
          <div className="space-y-2">
            <p className="text-gray-700">Acesse e aproveite uma experiência<br />segura dentro da OLX.</p>
            <div className="pt-2">
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
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login


