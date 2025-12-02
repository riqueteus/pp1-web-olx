import { useMemo, useState } from 'react'
import { Card, Input, Button } from '../components/ui'
import { Link } from 'react-router-dom'
import { registerVendor } from '../services/auth'
import olxLogo from '../assets/olx-logo.png'

function isEmail(value: string) {
  return /.+@.+\..+/.test(value)
}

function maskDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean)
  return parts.join('/')
}


function maskCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
    digits.slice(9, 11)
  ].filter(Boolean)
  
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]}.${parts[1]}`
  if (parts.length === 3) return `${parts[0]}.${parts[1]}.${parts[2]}`
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}-${parts[3]}`
  return value
}

function maskCNPJ(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 8),
    digits.slice(8, 12),
    digits.slice(12, 14)
  ].filter(Boolean)
  
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]}.${parts[1]}`
  if (parts.length === 3) return `${parts[0]}.${parts[1]}.${parts[2]}`
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3]}`
  if (parts.length === 5) return `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3]}-${parts[4]}`
  return value
}

function isValidCPF(cpf: string) {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return false
  
  // CPF validation logic here (you can implement the complete validation)
  return true
}

function isValidCNPJ(cnpj: string) {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return false
  
  // CNPJ validation logic here (you can implement the complete validation)
  return true
}

function isValidDateDDMMYYYY(value: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false
  const [dd, mm, yyyy] = value.split('/').map(Number)
  const date = new Date(yyyy, mm - 1, dd)
  return date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd
}

type AccountType = 'pf' | 'pj'

function Register() {
  const [accountType, setAccountType] = useState<AccountType>('pf')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [nickname, setNickname] = useState('')
  const [birth, setBirth] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isMei, setIsMei] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', title: string, message: React.ReactNode, showFor?: number} | null>(null)
  const [serverError, setServerError] = useState<{type: 'error', title: string, message: string, showFor?: number} | null>(null)
  const [cep, setCep] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [isLoadingCep, setIsLoadingCep] = useState(false)

  // Função para buscar informações do CEP
  const buscarCep = async (cep: string) => {
    try {
      setIsLoadingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setEstado(data.uf || '');
        setCidade(data.localidade || '');
        setRua(data.logradouro || '');
        // Foca no campo de número quando o CEP for preenchido
        document.getElementById('numero')?.focus();
      } else {
        setEstado('');
        setCidade('');
        setRua('');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      // Limpa os campos em caso de erro
      setEstado('');
      setCidade('');
      setRua('');
    } finally {
      setIsLoadingCep(false);
    }
  };

  const passRules = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }), [password])

  const errors: Record<string, string | undefined> = {
    cpfCnpj: !cpfCnpj && touched.cpfCnpj 
      ? 'Campo obrigatório.' 
      : (touched.cpfCnpj && accountType === 'pf' && !isValidCPF(cpfCnpj.replace(/\D/g, '')) 
        ? 'CPF inválido.' 
        : (touched.cpfCnpj && accountType === 'pj' && !isValidCNPJ(cpfCnpj.replace(/\D/g, ''))
          ? 'CNPJ inválido.'
          : undefined)),
    nickname: !nickname && touched.nickname ? 'Campo obrigatório.' : undefined,
    birth: accountType === 'pf' && touched.birth
      ? (!birth
        ? 'Campo obrigatório.'
        : (!isValidDateDDMMYYYY(birth) ? 'Informe uma data válida (dd/mm/aaaa).' : undefined))
      : undefined,
    email: touched.email
      ? (!email
        ? 'Campo obrigatório.'
        : (!isEmail(email) ? 'Informe um e-mail válido.' : undefined))
      : undefined,
    password: touched.password 
      ? (!password 
        ? 'Campo obrigatório.' 
        : (password !== confirmPassword && confirmPassword ? 'As senhas não conferem.' : undefined)) 
      : undefined,
    confirmPassword: touched.confirmPassword 
      ? (!confirmPassword 
        ? 'Confirme sua senha.' 
        : (password !== confirmPassword ? 'As senhas não conferem.' : undefined)) 
      : undefined,
    cep: !cep && touched.cep ? 'Campo obrigatório.' : undefined,
    estado: !estado && touched.estado ? 'Campo obrigatório.' : undefined,
    cidade: !cidade && touched.cidade ? 'Campo obrigatório.' : undefined,
    rua: !rua && touched.rua ? 'Campo obrigatório.' : undefined,
    numero: !numero && touched.numero ? 'Campo obrigatório.' : undefined,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fieldsToTouch: Record<string, boolean> = { 
      cpfCnpj: true, 
      nickname: true, 
      email: true, 
      password: true,
      confirmPassword: true,
      cep: true,
      estado: true,
      cidade: true,
      rua: true,
      numero: true
    }
    
    if (accountType === 'pf') {
      fieldsToTouch.birth = true
    }
    
    setTouched((prev) => ({ ...prev, ...fieldsToTouch }))
    
    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error !== undefined)
    
    if (hasErrors) return

    setServerError(null)
    setFeedback(null)
    setIsSubmitting(true)

    try {
      let dataNascimento = '';
      
      // Verificar se todos os campos obrigatórios estão preenchidos
      // Só valida e formata a data de nascimento se for pessoa física e o campo estiver preenchido
      if (accountType === 'pf') {
        if (!birth) {
          throw new Error('Data de nascimento é obrigatória para pessoa física');
        }
        
        // Formatar a data para YYYY-MM-DD
        const [day, month, year] = birth.split('/');
        if (!day || !month || !year || year.length !== 4) {
          throw new Error('Data de nascimento inválida. Use o formato DD/MM/AAAA');
        }
        
        dataNascimento = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Formatar CEP (apenas números)
      const formattedCep = cep.replace(/\D/g, '');
      if (formattedCep.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }
      
      const userData = {
        nome: nickname,
        email,
        senha: password,
        cpfCnpj: cpfCnpj.replace(/\D/g, ''), // Se o backend esperar cpf_cnpj, precisaremos ajustar isso também
        telefone: telefone.replace(/\D/g, ''),
        data_nascimento: dataNascimento, // Nome do campo alterado para corresponder ao banco
        cep: formattedCep,
        estado,
        cidade,
        rua,
        numero: parseInt(numero) || 0
      };
      
      console.log('Enviando dados:', userData);
      
      await registerVendor(userData)

      setFeedback({
        type: 'success',
        title: 'Cadastro realizado com sucesso!',
        message: (
          <>
            Seu cadastro foi concluído com sucesso. 
            <Link to="/login" className="text-orange-500 hover:underline font-medium ml-1">
              Clique aqui para fazer login
            </Link>
          </>
        ),
        showFor: 10000
      })
      
      localStorage.setItem('lastRegisteredEmail', email)
    } catch (err) {
      let errorMessage = 'Ocorreu um erro ao processar seu cadastro. Por favor, tente novamente.'
      
      if (err instanceof Error) {
        if (err.message.includes('already exists') || err.message.includes('já existe') || err.message.toLowerCase().includes('email')) {
          errorMessage = 'Já existe uma conta cadastrada com este e-mail. Por favor, faça login ou utilize outro e-mail.';
        } else if (err.message.includes('senha') || err.message.includes('password')) {
          errorMessage = 'A senha não atende aos requisitos mínimos. Por favor, verifique as regras de senha.';
        } else if (err.message.includes('inválido') || err.message.includes('inválida')) {
          errorMessage = 'Dados inválidos. Verifique as informações fornecidas e tente novamente.'
        } else {
          errorMessage = err.message
        }
      }
      
      setServerError({
        type: 'error',
        title: 'Erro no cadastro',
        message: errorMessage,
        showFor: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
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
            <Link to="/login" className="block">
              <img src={olxLogo} alt="OLX" className="h-16 w-auto" />
            </Link>
            <div className="text-center space-y-2">
              <h1 className="font-bold text-lg">Crie a sua conta. É grátis!</h1>
              <p className="text-gray-700">Nos informe alguns dados para que possamos melhorar a sua experiência na OLX.</p>
            </div>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escolha o tipo da sua conta <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                      checked={accountType === 'pf'}
                      onChange={() => setAccountType('pf')}
                    />
                    <span className="ml-2 text-gray-700">Pessoa Física</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300"
                      checked={accountType === 'pj'}
                      onChange={() => setAccountType('pj')}
                    />
                    <span className="ml-2 text-gray-700">Pessoa Jurídica</span>
                  </label>
                </div>
                {touched.accountType && errors.accountType && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountType}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={<span className="font-medium">{accountType === 'pf' ? 'CPF' : 'CNPJ'}</span>}
                    name="cpfCnpj"
                    placeholder={accountType === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(accountType === 'pf' ? maskCPF(e.target.value) : maskCNPJ(e.target.value))}
                    onBlur={() => setTouched((t) => ({ ...t, cpfCnpj: true }))}
                    error={errors.cpfCnpj}
                  />
                </div>
                <div>
                  <Input
                    label={<span className="font-medium">Como você quer ser chamado(a)?</span>}
                    name="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, nickname: true }))}
                    error={errors.nickname}
                  />
                </div>
                
                {accountType === 'pf' && (
                  <>
                    <div>
                      <Input
                        label={<span className="font-medium">Data de nascimento</span>}
                        name="birth"
                        placeholder="dd/mm/aaaa"
                        value={birth}
                        onChange={(e) => setBirth(maskDate(e.target.value))}
                        onBlur={() => setTouched((t) => ({ ...t, birth: true }))}
                        error={errors.birth}
                      />
                    </div>
                    <div>
                      <Input
                        label={<span className="font-medium">Telefone</span>}
                        name="telefone"
                        placeholder="(00) 00000-0000"
                        value={telefone}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '')
                          let formattedValue = value
                          
                          if (value.length > 11) value = value.slice(0, 11)
                          if (value.length > 10) {
                            formattedValue = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
                          } else if (value.length > 5) {
                            formattedValue = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
                          } else if (value.length > 2) {
                            formattedValue = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
                          } else if (value.length > 0) {
                            formattedValue = value.replace(/^(\d*)/, '($1')
                          }
                          
                          setTelefone(formattedValue)
                        }}
                        onBlur={() => setTouched((t) => ({ ...t, telefone: true }))}
                      />
                    </div>
                  </>
                )}
              </div>
              
              {accountType === 'pj' && (
                <div className="flex items-center">
                  <input
                    id="isMei"
                    name="isMei"
                    type="checkbox"
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    checked={isMei}
                    onChange={(e) => setIsMei(e.target.checked)}
                  />
                  <label htmlFor="isMei" className="ml-2 block text-sm text-gray-700">
                    Sou MEI
                  </label>
                </div>
              )}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="relative">
                          <Input
                            label={<span className="font-medium">CEP</span>}
                            name="cep"
                            placeholder="00000000"
                            value={cep}
                            onChange={(e) => {
                              // Aceita apenas números e limita a 8 dígitos
                              const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                              setCep(value);
                              
                              // Se o CEP tiver 8 dígitos, busca automaticamente
                              if (value.length === 8) {
                                buscarCep(value);
                              }
                            }}
                            onBlur={() => setTouched((t) => ({ ...t, cep: true }))}
                            error={errors.cep}
                            disabled={isLoadingCep}
                          />
                          {isLoadingCep && (
                            <div className="absolute right-3 top-9">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <Input
                            label={<span className="font-medium">Cidade</span>}
                            name="cidade"
                            placeholder="Sua cidade"
                            value={cidade}
                            onChange={(e) => setCidade(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, cidade: true }))}
                            error={errors.cidade}
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Input
                            label={<span className="font-medium">Estado (UF)</span>}
                            name="estado"
                            placeholder="UF"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                            onBlur={() => setTouched((t) => ({ ...t, estado: true }))}
                            error={errors.estado}
                            maxLength={2}
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Input
                            label={<span className="font-medium">Número</span>}
                            name="numero"
                            id="numero"
                            placeholder="Número"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
                            onBlur={() => setTouched((t) => ({ ...t, numero: true }))}
                            error={errors.numero}
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label={<span className="font-medium">Rua</span>}
                          name="rua"
                          placeholder="Sua rua"
                          value={rua}
                          onChange={(e) => setRua(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, rua: true }))}
                          error={errors.rua}
                        />
                      </div>
                    </div>
                  </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1">
                  <Input
                    label={<span className="font-medium">E-mail</span>}
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    error={errors.email}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        label={<span className="font-medium">Senha</span>}
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                        error={errors.password}
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
                        label={<span className="font-medium">Confirmar Senha</span>}
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                        error={errors.confirmPassword || (touched.confirmPassword && password !== confirmPassword ? 'As senhas não conferem' : undefined)}
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
                </div>
              </div>

              {serverError && (
                <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                  <div className="font-medium">{serverError.title}</div>
                  <div>{serverError.message}</div>
                </div>
              )}
              {feedback && (
                <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                  <div className="font-medium">{feedback.title}</div>
                  <div>{feedback.message}</div>
                </div>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white w-full disabled:opacity-60"
              >
                {isSubmitting ? 'Enviando...' : 'Cadastre-se'}
              </Button>
            </form>

            <div className="w-full border-t border-gray-200" />
            <p className="text-sm text-gray-600 text-center">
              Já tem uma conta? <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">Entrar</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Register


