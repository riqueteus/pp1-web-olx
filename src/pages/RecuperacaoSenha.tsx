import { useState } from 'react'
import { Card, Input, Button } from '../components/ui'
import { Link } from 'react-router-dom'
import olxLogo from '../assets/olx-logo.png'

function isEmail(value: string) {
  return /.+@.+\..+/.test(value)
}

function RecuperacaoSenha() {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const error = touched ? (!email ? 'Campo obrigatório.' : (!isEmail(email) ? 'Informe um e-mail válido.' : undefined)) : undefined

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
            <div className="w-full space-y-4">
              <Input
                label={<span className="font-medium">E-mail</span>}
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                error={error}
              />
              <Button type="button" className="bg-orange-500 hover:bg-orange-600 text-white w-full">Receber instruções por e-mail</Button>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Voltar para<br />
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">Entrar</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RecuperacaoSenha





