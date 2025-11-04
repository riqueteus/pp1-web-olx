import { useMemo, useState } from 'react'
import { Card, Input, Button } from '../components/ui'
import { Link } from 'react-router-dom'
import olxLogo from '../assets/olx-logo.png'

function isEmail(value: string) {
  return /.+@.+\..+/.test(value)
}

function maskDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean)
  return parts.join('/')
}

function isValidDateDDMMYYYY(value: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false
  const [dd, mm, yyyy] = value.split('/').map(Number)
  const date = new Date(yyyy, mm - 1, dd)
  return date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd
}

function Register() {
  const [cpf, setCpf] = useState('')
  const [fullName, setFullName] = useState('')
  const [nickname, setNickname] = useState('')
  const [birth, setBirth] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const passRules = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }), [password])

  const errors: Record<string, string | undefined> = {
    cpf: !cpf && touched.cpf ? 'Campo obrigatório.' : undefined,
    fullName: !fullName && touched.fullName ? 'Campo obrigatório.' : undefined,
    nickname: !nickname && touched.nickname ? 'Campo obrigatório.' : undefined,
    birth: touched.birth
      ? (!birth
        ? 'Campo obrigatório.'
        : (!isValidDateDDMMYYYY(birth) ? 'Informe uma data válida (dd/mm/aaaa).' : undefined))
      : undefined,
    email: touched.email
      ? (!email
        ? 'Campo obrigatório.'
        : (!isEmail(email) ? 'Informe um e-mail válido.' : undefined))
      : undefined,
    password: touched.password ? (!password ? 'Campo obrigatório.' : undefined) : undefined,
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const allTouched: Record<string, boolean> = { cpf: true, fullName: true, nickname: true, birth: true, email: true, password: true }
    setTouched((prev) => ({ ...prev, ...allTouched }))
  }

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

  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-full max-w-xl">
        <Card>
          <div className="flex flex-col items-center gap-6">
            <img src={olxLogo} alt="OLX" className="h-12 w-auto" />
            <div className="text-center space-y-2">
              <h1 className="font-bold text-lg">Crie a sua conta. É grátis!</h1>
              <p className="text-gray-700">Nos informe alguns dados para que possamos melhorar a sua experiência na OLX.</p>
            </div>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <Input
                label={<span className="font-medium">CPF</span>}
                name="cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, cpf: true }))}
                error={errors.cpf}
              />
              <Input
                label={<span className="font-medium">Nome completo</span>}
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                error={errors.fullName}
              />
              <Input
                label={<span className="font-medium">Como você quer ser chamado(a)?</span>}
                name="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, nickname: true }))}
                error={errors.nickname}
              />
              <Input
                label={<span className="font-medium">Data de nascimento</span>}
                name="birth"
                placeholder="dd/mm/aaaa"
                value={birth}
                onChange={(e) => setBirth(maskDate(e.target.value))}
                onBlur={() => setTouched((t) => ({ ...t, birth: true }))}
                error={errors.birth}
              />
              <Input
                label={<span className="font-medium">E-mail</span>}
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                error={errors.email}
              />
              <div className="space-y-2">
                <Input
                  label={<span className="font-medium">Senha</span>}
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  error={errors.password}
                />
                <div className="text-sm text-gray-700">Para sua segurança, crie uma senha com no mínimo:</div>
                <div className="grid gap-1">
                  <Rule ok={passRules.length}>8 ou mais caracteres</Rule>
                  <Rule ok={passRules.upper}>Uma letra maiúscula</Rule>
                  <Rule ok={passRules.lower}>Uma letra minúscula</Rule>
                  <Rule ok={passRules.digit}>Um número</Rule>
                  <Rule ok={passRules.special}>Um caracter especial (exemplo: @ ! $ & #)</Rule>
                </div>
              </div>

              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white w-full">Cadastre-se</Button>
            </form>

            <div className="w-full border-t border-gray-200" />
            <p className="text-sm text-gray-600 text-center">
              Já tem uma conta? <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">Entrar</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Register


