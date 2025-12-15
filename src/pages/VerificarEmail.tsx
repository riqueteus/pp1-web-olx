import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { verifyEmail } from '../services/auth';
import olxLogo from '../assets/olx-logo.png';
import { Link } from 'react-router-dom';

function VerificarEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const verificadoRef = useRef(false);

  useEffect(() => {
    if (verificadoRef.current) return;
    verificadoRef.current = true;

    const codigo = searchParams.get('codigo');
    
    if (!codigo) {
      setStatus('error');
      setMessage('Código de verificação não encontrado.');
      return;
    }

    const verificar = async () => {
      try {
        const response = await verifyEmail(codigo);
        setStatus('success');
        setMessage(response.message || 'Sua conta foi ativada com sucesso!');
      } catch (error) {
        setStatus('error');
        if (error instanceof Error) {
          setMessage(error.message || 'Erro ao verificar email. O código pode estar inválido ou expirado.');
        } else {
          setMessage('Erro ao verificar email. Tente novamente mais tarde.');
        }
      }
    };

    verificar();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-10">
      <div className="w-full max-w-md">
        <Card>
          <div className="flex flex-col items-center gap-6 p-6">
            <Link to="/login" className="block">
              <img src={olxLogo} alt="OLX" className="h-16 w-auto" />
            </Link>

            {status === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                <p className="text-gray-600 text-center">Verificando sua conta...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900">Conta Ativada! Agora faça o login para acessar.</h1>
                  <p className="text-gray-600">{message}</p>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900">Erro na Verificação</h1>
                  <p className="text-gray-600">{message}</p>
                </div>
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={() => navigate('/login')}
                    variant="secondary"
                    className="flex-1"
                  >
                    Ir para Login
                  </Button>
                  <Button
                    onClick={() => navigate('/cadastro')}
                    className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                  >
                    Fazer Cadastro
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default VerificarEmail;

