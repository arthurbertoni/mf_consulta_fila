import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Building2,
  Hospital,
  Users,
  Clock,
  Navigation,
  CheckCircle,
  Footprints,
  RefreshCw,
  Loader,
  CircleAlert,
  Sparkle,
  MapPin,
} from 'lucide-react'
import { listarUnidadesComFila } from '../api/fila.js'
import './ConsultaFila.css'

function UnidadeCard({ unidade, sugerida, aCaminho, onACaminho }) {
  const tipoUBS = unidade.tipo === 'UBS'
  const TipoIcon = tipoUBS ? Building2 : Hospital

  return (
    <article
      className={`unidade-card${sugerida ? ' sugerida' : ''}${aCaminho ? ' a-caminho' : ''}`}
    >
      <div className="unidade-topo">
        <div className="unidade-icone-tipo">
          <TipoIcon size={22} />
        </div>
        <div className="unidade-info">
          <div className="unidade-nome">{unidade.nome}</div>
          <span className={`unidade-tipo tipo-${unidade.tipo.toLowerCase()}`}>
            {unidade.tipo}
          </span>
        </div>
        {sugerida && (
          <div className="selo-sugerida">
            <Sparkle size={14} />
            <span>Sugerida</span>
          </div>
        )}
      </div>

      <div className="unidade-metricas">
        <div className="metrica">
          <Users size={18} />
          <div className="metrica-texto">
            <span className="metrica-valor">{unidade.tamanhoFila}</span>
            <span className="metrica-rotulo">na fila</span>
          </div>
        </div>
        <div className="metrica">
          <Clock size={18} />
          <div className="metrica-texto">
            <span className="metrica-valor">
              {unidade.tempoMedioEsperaMin}
            </span>
            <span className="metrica-rotulo">min de espera</span>
          </div>
        </div>
      </div>

      {aCaminho ? (
        <div className="status-a-caminho">
          <CheckCircle size={18} />
          <span>Você está a caminho desta unidade</span>
        </div>
      ) : (
        <button
          className="botao-caminho"
          onClick={() => onACaminho(unidade.id)}
          aria-label={`Estou a caminho de ${unidade.nome}`}
        >
          <Footprints size={18} />
          <span>Estou a caminho</span>
        </button>
      )}
    </article>
  )
}

export default function ConsultaFila() {
  const [unidades, setUnidades] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [busca, setBusca] = useState('')
  const [aCaminhoId, setACaminhoId] = useState(null)

  const carregar = async () => {
    setCarregando(true)
    setErro(null)
    try {
      const dados = await listarUnidadesComFila()
      setUnidades(dados)
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar as filas.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const unidadesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const lista = termo
      ? unidades.filter((u) => u.nome.toLowerCase().includes(termo))
      : unidades
    return [...lista].sort(
      (a, b) => a.tempoMedioEsperaMin - b.tempoMedioEsperaMin,
    )
  }, [unidades, busca])

  const sugerida = useMemo(() => {
    if (unidadesFiltradas.length === 0) return null
    return unidadesFiltradas[0]
  }, [unidadesFiltradas])

  return (
    <div className="consulta-fila">
      <header className="cf-cabecalho">
        <div className="cf-titulo-bloco">
          <div className="cf-logo">
            <MapPin size={26} />
          </div>
          <div>
            <h1 className="cf-titulo">Consulta de Fila</h1>
            <p className="cf-subtitulo">
              Veja o status das unidades de saúde em tempo real
            </p>
          </div>
        </div>
        <button
          className="cf-atualizar"
          onClick={carregar}
          disabled={carregando}
          aria-label="Atualizar lista"
        >
          <RefreshCw size={18} className={carregando ? 'girando' : ''} />
          <span>Atualizar</span>
        </button>
      </header>

      <div className="cf-busca">
        <Search size={20} className="cf-busca-icone" />
        <input
          type="text"
          className="cf-busca-input"
          placeholder="Digite o nome da unidade (ex.: UBS Jardim das Flores)"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar unidade de saúde"
        />
      </div>

      {carregando && (
        <div className="cf-estado">
          <Loader size={28} className="girando" />
          <p>Carregando unidades...</p>
        </div>
      )}

      {!carregando && erro && (
        <div className="cf-estado cf-erro">
          <CircleAlert size={28} />
          <p>{erro}</p>
          <button className="cf-tentar" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !erro && unidadesFiltradas.length === 0 && (
        <div className="cf-estado">
          <Search size={28} />
          <p>Nenhuma unidade encontrada para "{busca}".</p>
        </div>
      )}

      {!carregando && !erro && unidadesFiltradas.length > 0 && (
        <div className="cf-lista">
          {sugerida && (
            <div className="cf-sugerida-aviso">
              <Sparkle size={16} />
              <span>
                Unidade sugerida: <strong>{sugerida.nome}</strong> — menor tempo
                de espera no momento.
              </span>
            </div>
          )}
          {unidadesFiltradas.map((u) => (
            <UnidadeCard
              key={u.id}
              unidade={u}
              sugerida={sugerida?.id === u.id}
              aCaminho={aCaminhoId === u.id}
              onACaminho={setACaminhoId}
            />
          ))}
        </div>
      )}

      <footer className="cf-rodape">
        <Navigation size={14} />
        <span>Dados via API mock — atualização sob demanda</span>
      </footer>
    </div>
  )
}
