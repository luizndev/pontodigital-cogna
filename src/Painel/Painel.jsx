import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Hamburger from 'hamburger-react';
import './Painel.css'; 
import { FiUser, FiClock } from "react-icons/fi";
import { GrUserAdmin } from "react-icons/gr";
import { IoLogOutOutline } from "react-icons/io5";
import { MdOutlineWorkOutline, MdOutlineDateRange } from "react-icons/md";
import Geo from '../Components/Geo.jsx';
import { FaChevronDown, FaPlay, FaPause } from 'react-icons/fa';

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const getInitials = (name) => {
  if (typeof name !== 'string' || !name.trim()) {
    return '';
  }
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return names[0][0].toUpperCase() + (names[0][1] ? names[0][1].toUpperCase() : '');
};

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTime = (date) => {
  const hours = date.getHours(); 
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const Painel = () => {
  const [backgroundColor, setBackgroundColor] = useState('#ccc');
  const [time, setTime] = useState(new Date());
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [cargo, setCargo] = useState('');
  const [curso, setCurso] = useState('');
  const [disciplinas, setDisciplinas] = useState([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState(null);
  const [isAulaIniciada, setIsAulaIniciada] = useState(false);
  const [disciplinasError, setDisciplinasError] = useState('');
  const [disciplinasLoading, setDisciplinasLoading] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');

  const fetchUserData = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`https://api-pontodigital.onrender.com/user?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do usuário.');
      }

      const data = await response.json();
      setName(data.id);
      setCargo(data.cargo);
      setRole(data.role);
      setCurso(data.curso);
      setDisciplinas(data.disciplinas);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    setBackgroundColor(getRandomColor());
    fetchUserData();

    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [fetchUserData]);

  const fetchDisciplinasEmAndamento = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`https://api-pontodigital.onrender.com/logs?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar disciplinas em andamento.');
      }

      const logsEmAndamento = await response.json();
      const disciplinasAtualizadas = disciplinas.map(disciplina => ({
        ...disciplina,
        emAndamento: logsEmAndamento.some(log => log.disciplina === disciplina.nome && log.status === 'Em Andamento')
      }));

      setDisciplinas(disciplinasAtualizadas);
      setDisciplinasLoading(false);
    } catch (err) {
      setDisciplinasError(err.message);
      setDisciplinasLoading(false);
    }
  }, [disciplinas, email]);

  useEffect(() => {
    if (!loading) {
      fetchDisciplinasEmAndamento();
    }
  }, [loading, fetchDisciplinasEmAndamento]);

  const handleDisciplinaClick = (disciplina) => {
    setSelectedDisciplina(disciplina);
    setIsAulaIniciada(disciplina.emAndamento);
  };

  const handleIniciarAula = async () => {
    if (!selectedDisciplina) {
      setError('Nenhuma disciplina selecionada.');
      return;
    }
  
    const now = new Date();
    const diaAtual = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(now);
  
    if (selectedDisciplina.dia_da_semana.toLowerCase() !== diaAtual.toLowerCase()) {
      alert('Não é permitido iniciar aula em um dia diferente.');
      return;
    }
  
    const [horaInicio, minutoInicio] = selectedDisciplina.horario_inicio.split(':').map(Number);
    const limiteInicio = new Date(now);
    limiteInicio.setHours(horaInicio, minutoInicio - 5, 0, 0);
  
    if (now < limiteInicio) {
      alert('Não é permitido iniciar aula antes do horário permitido.');
      return;
    }
  
    const disciplinaEmAndamento = disciplinas.some(disciplina =>
      disciplina.nome === selectedDisciplina.nome && disciplina.emAndamento
    );
  
    if (disciplinaEmAndamento) {
      setError('Já existe uma aula em andamento para esta disciplina hoje.');
      return;
    }
  
    setIsAulaIniciada(true);
    const token = sessionStorage.getItem('token');
    const hoje = formatDate(now);
  
    try {
      const response = await fetch('https://api-pontodigital.onrender.com/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: name,
          email: email,
          disciplina: selectedDisciplina.nome,
          dia: selectedDisciplina.dia_da_semana,
          data: hoje,
          horario_inicio: formatTime(now),
          horario_fim: '',
          status: 'Em Andamento'
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Erro ao registrar o início da aula.');
        return;
      }
  
      const data = await response.json();
      console.log('Log de início registrado com sucesso:', data);
  
      // Armazenar o `aula_id` para finalizar a aula posteriormente
      const { aula_id } = data;
  
      const updatedDisciplinas = disciplinas.map(disciplina =>
        disciplina.nome === selectedDisciplina.nome ? { ...disciplina, emAndamento: true, aula_id } : disciplina
      );
      setDisciplinas(updatedDisciplinas);
      setSelectedDisciplina({ ...selectedDisciplina, emAndamento: true, aula_id });
  
    } catch (err) {
      console.error('Erro de rede ao registrar o início da aula:', err);
      setError('Erro de rede ao registrar o início da aula.');
    }
  };
  
  const handleFinalizarAula = async () => {
    if (!selectedDisciplina || !selectedDisciplina.emAndamento || !selectedDisciplina.aula_id) {
      alert('Nenhuma aula em andamento para finalizar.');
      return;
    }
  
    setIsAulaIniciada(false);
    const token = sessionStorage.getItem('token');
    const horarioFimAula = formatTime(new Date());
    const hoje = formatDate(new Date());
  
    try {
      const response = await fetch('https://api-pontodigital.onrender.com/logs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email,
          aula_id: selectedDisciplina.aula_id,  // Usando `aula_id` para finalizar
          horario_fim: horarioFimAula,
          data: hoje,
          status: 'Concluído'
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Erro ao registrar o fim da aula.');
        return;
      }
  
      const data = await response.json();
      console.log('Log de fim de aula registrado com sucesso:', data);
  
      const updatedDisciplinas = disciplinas.map(disciplina =>
        disciplina.nome === selectedDisciplina.nome ? { ...disciplina, emAndamento: false, aula_id: null } : disciplina
      );
      setDisciplinas(updatedDisciplinas);
      setSelectedDisciplina({ ...selectedDisciplina, emAndamento: false, aula_id: null });
  
    } catch (err) {
      console.error('Erro de rede ao registrar o fim da aula:', err);
      setError('Erro de rede ao registrar o fim da aula.');
    }
  };
  
  

  const isActive = (disciplinaNome) => {
    return selectedDisciplina && selectedDisciplina.nome === disciplinaNome ? 'active' : '';
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/acesso');
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div>
      <nav className="navbar">
      <img src="cogna-logo.svg" alt="Logo" />
      <div className="tituloHeader">PONTO DIGITAL</div>
      <div className="hamburger" onClick={toggleMenu}>
        <Hamburger toggled={menuOpen} />
      </div>
      {menuOpen && (
        <div className="menu">
          {role === 'admin' && (
            <Link to={'/admin'}>
              <GrUserAdmin /> Administração
            </Link>
          )}
          <button onClick={handleLogout} className="buttonLogout">
            <IoLogOutOutline /> Logout
          </button>
        </div>
      )}
    </nav>

      {loading && <p>Carregando...</p>}
      {error && !loading && <p className="error-msg">{error}</p>}
      {name && !error && !loading && (
        <>
          <div className="containerPainel">
            <div className="headerContent">
              <div className="imageProfile" style={{ backgroundColor: backgroundColor }}>
                {getInitials(name)}
              </div>
              <div className="groupProfile">
                <h1 className="name">{name}</h1>
                <h2 className="cargo"><MdOutlineWorkOutline /> {cargo} - {curso}</h2>
                <h3 className="unidade"><Geo /></h3>
              </div>
            </div>
            <div className="relogioContent">
              <h5 className="titleClock">Horário de Brasília</h5>
              <span>{formatTime(time)}</span>
            </div>
          </div>
          <div className="disciplinasContainer">
            <h1 className='titleDisciplina'>Minhas disciplinas</h1>
            {disciplinasLoading && <p>Carregando disciplinas...</p>}
            {disciplinasError && !disciplinasLoading && <p className="error-msg">{disciplinasError}</p>}
            {disciplinas.length > 0 && !disciplinasError && !disciplinasLoading && (
              <div className='containerItens'>
                {disciplinas.map((disciplina) => (
                  <div key={disciplina.nome} className={`disciplinaItemContainer ${disciplina.emAndamento ? 'disabled' : ''}`}>
                    <h1
                      className={`disciplinaItem ${isActive(disciplina.nome) ? 'active' : ''}`}
                      onClick={() => handleDisciplinaClick(disciplina)}
                    >
                      {disciplina.emAndamento ? (
                        <span>{disciplina.nome}<span className="status">● Em Andamento</span></span>
                      ) : <span>{disciplina.nome}</span>}
                      <FaChevronDown
                        className={`arrowIcon ${isActive(disciplina.nome) ? 'active' : ''}`}
                      />
                    </h1>
                    {selectedDisciplina && selectedDisciplina.nome === disciplina.nome && (
                      <div className="disciplinaDetails">
                        <p><MdOutlineDateRange /> <span> Dia:</span> {disciplina.dia_da_semana}</p>
                        <p><FiClock /> <span>Início:</span> {disciplina.horario_inicio}</p>
                        <p><FiClock /> <span>Fim:</span> {disciplina.horario_fim}</p>
                        <div className="buttons">
                          <button 
                            className={`playAula ${disciplina.emAndamento ? 'off' : ''}`} 
                            onClick={handleIniciarAula} 
                            disabled={disciplina.emAndamento}
                          >
                            <FaPlay /> Iniciar Aula
                          </button>
                          <button 
                            className={`stopAula ${!disciplina.emAndamento ? 'off' : ''}`} 
                            onClick={handleFinalizarAula}
                            disabled={!disciplina.emAndamento}
                          >
                            <FaPause /> Finalizar Aula
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relogioContent2">
            <h5 className="titleClock">Horário de Brasília</h5>
            <span>{formatTime(time)}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Painel;
