import React, { useEffect, useState } from 'react';
import { RiLockPasswordLine, RiLockPasswordFill } from 'react-icons/ri';
import { FiUser, FiMapPin } from 'react-icons/fi';
import { MdHeight, MdOutlineMailOutline } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import './Acesso.css';

const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const φ1 = (lat1 * Math.PI) / 180; 
  const φ2 = (lat2 * Math.PI) / 180; 
  const Δφ = ((lat2 - lat1) * Math.PI) / 180; 
  const Δλ = ((lon2 - lon1) * Math.PI) / 180; 

  const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

const Acesso = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [isLocked, setIsLocked] = useState(false); 

  const locations = [
    { id: 1, name: 'Anhanguera, Teixeira de Freitas - BA', latitude: -17.550718952593535, longitude: -39.72263806866866  },
    { id: 2, name: 'Anhanguera, Camaçari - BA', latitude:  -12.711083328795038, longitude: -38.30701252393009 },
    { id: 3, name: 'Anhanguera, Caruaru - BA', latitude:  -8.282379915967674, longitude: -35.96760826358396 },
    { id: 4, name: 'Anhanguera, Feira de Santana - BA', latitude:  -12.243717088492133, longitude: -38.963916509424145 },
    { id: 5, name: 'Anhanguera, Fortaleza - CE', latitude: 0, longitude: 0 },
    { id: 6, name: 'Anhanguera, Imperatriz - MA', latitude: -5.522885939111842, longitude: -47.48509220401758 },
    { id: 7, name: 'Anhanguera, Jequie - BA', latitude:  -13.862683353775592, longitude: -40.09569446276788 },
    { id: 8, name: 'Anhanguera, Maceio - AL', latitude:  -9.560585555276035, longitude: -35.74489900961917 },
    { id: 9, name: 'Anhanguera - Iguatemi, Salvador - BA', latitude: -12.980132216575832, longitude: -38.47097242967175 },
    { id: 10, name: 'Unime Anhanguera - Paralela, Salvador - BA', latitude: -12.936692066718859, longitude: -38.3945919816151 }, 
    { id: 11, name: 'Anhanguera, Santo Antonio de Jesus - BA', latitude:  -12.965882440385107, longitude: -39.26406397048434  },
    { id: 12, name: 'Anhanguera, São Luís - MA', latitude: -2.5309225347365594, longitude: -44.22512597865192 },
    { id: 13, name: 'Anhanguera, Sobral - CE', latitude:  -3.698821196120959, longitude: -40.34814242829021 },
    { id: 14, name: 'Anhanguera, Vitoria da Conquista - BA', latitude:  -14.891589864384246, longitude: -40.845390966730804 },
  ];

  useEffect(() => {
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ latitude, longitude });
          },
          (error) => {
              setMessage('Erro ao obter a localização.');
          }
      );
  }, []);

  useEffect(() => {
    let timeoutId;
    if (userLocation) {
      const { latitude, longitude } = userLocation;
      const radius = 1000000; 
      const nearby = locations.find((loc) =>
        getDistanceFromLatLonInMeters(latitude, longitude, loc.latitude, loc.longitude) <= radius
      );

      if (nearby) {
        setMessage(`${nearby.name}`);
        setIsLocked(false); 
      } else {
        setMessage('Você está longe demais de todas as localizações.');
        setIsLocked(true); 
        timeoutId = setTimeout(() => {
          window.close();
        }, 3000);
      }
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [userLocation]);

  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sucessMessage, setSucessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '', 
    email: '',
    password: '',
    confirmPassword: '',
    city: ''
  });

  const navigate = useNavigate();

  const handleCreateAccountClick = () => {
    setShowCreateAccount(true);
    setErrorMessage('');
  };

  const handleLoginClick = () => {
    setShowCreateAccount(false);
    setErrorMessage('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:30120/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
  
      // Verificar o status da resposta antes de tentar converter para JSON
      if (response.ok) {
        const result = await response.json();
        sessionStorage.setItem('token', result.token);
        navigate(`/painel?email=${encodeURIComponent(formData.email)}`);
      } else {
        const result = await response.json();
        setErrorMessage(result.message || 'Erro desconhecido');
      }
    } catch (error) {
      setErrorMessage('Erro ao tentar fazer login.');
      console.error('Error:', error);
    }
  };
  
  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      return setErrorMessage("Senhas não correspondem!");
    }

    try {
      const response = await fetch('http://localhost:30120/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.name, 
          email: formData.email,
          password: formData.password,
          city: formData.city
        })
      });
      const result = await response.json();
      if (response.ok) {
        sessionStorage.setItem('token', result.token);
        setErrorMessage("");
        setSucessMessage("Usuário registrado com sucesso!");
        setTimeout(() => navigate(`/painel?email=${encodeURIComponent(formData.email)}`), 2000);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('Erro ao tentar criar usuário.');
      console.error('Error:', error);
    }
  };

  return (
    <div className={`containerGeneral ${isLocked ? 'locked' : ''}`}>
      <div className={`interactContainer ${showCreateAccount ? 'hidden' : 'visible2'}`}>
        <div className="headerLogin">
          <img src="cogna-logo.svg" alt="Logo Cogna" />
          <h1>PONTO DIGITAL</h1>
          <h2>Boas-vindas</h2>
        </div>
        <div className="formLogin">
          {errorMessage && <div className="error-msg">{errorMessage}</div>}
          <div className="inputBox">
            <MdOutlineMailOutline />
            <input
              type="email"
              autoComplete="on"
              placeholder="Informe seu e-mail"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="inputBox">
            <RiLockPasswordLine />
            <input
              type="password" 
              autoComplete="on"
              placeholder="Informe sua senha"
              required
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="loginAuto">
            Login automático
            <label className="toggle-switch">
              <input type="checkbox" />
              <div className="toggle-switch-background">
                <div className="toggle-switch-handle"></div>
              </div>
            </label>
          </div>
          <button className='buttonLogin' onClick={handleLogin}>Entrar</button>
          <div className="inforContainer">
            <Link to={'/'}>Esqueceu a senha?</Link>
            <div className="Criarconta" onClick={handleCreateAccountClick}>Registre-se</div>
          </div>
          <div>
            <p className='localizacao'><FiMapPin /> <span>Você está em:  <span>{message}</span></span></p>
          </div>
        </div>
      </div>

      <div className="imageContainer">
        <p>Onde a Educação Encontra a Inovação Digital.</p>
      </div>

      <div className={`interactContainer2 ${showCreateAccount ? 'visible' : 'hidden'}`}>
        <div className="headerLogin">
          <img src="cogna-logo.svg" alt="Logo Cogna" />
          <h1>PONTO DIGITAL</h1>
          <h2>Faça seu registro</h2>
        </div>
        <div className="formLogin">
          {errorMessage && <div className="error-msg">{errorMessage}</div>}
          {sucessMessage && <div className="sucess-msg">{sucessMessage}</div>}
          <div className="inputBox">
            <FiUser />
            <input
              type="text"
              autoComplete="on"
              placeholder="Informe seu nome completo"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="inputBox">
            <MdOutlineMailOutline />
            <input
              type="email"
              autoComplete="on"
              placeholder="Informe seu e-mail"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="inputBox">
            <RiLockPasswordLine />
            <input
              type="password"
              autoComplete="on"
              placeholder="Informe sua senha"
              required
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="inputBox">
            <RiLockPasswordFill />
            <input
              type="password"
              autoComplete="on"
              placeholder="Confirme sua senha"
              required
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className="inputBox">
            <FiMapPin />
            <select
                autoComplete="off" 
                placeholder="Informe sua cidade"
                required
                name="city"
                value={formData.city}
                onChange={handleChange}
            >
                <option value="" disabled>Selecione sua cidade</option>
                <option value="camacari_ba">Camaçari/BA</option>
                <option value="caruaru_pe">Caruaru/PE</option>
                <option value="feira_de_santana_ba">Feira de Santana/BA</option>
                <option value="fortaleza_ce">Fortaleza/CE</option>
                <option value="imperatriz_ma">Imperatriz/MA</option>
                <option value="itabuna_ba">Itabuna/BA</option>
                <option value="jequie_ba">Jequié/BA</option>
                <option value="maceio_al">Maceió/AL</option>
                <option value="salvador_ba_iguatemi">Salvador/BA - Iguatemi</option>
                <option value="salvador_ba_paralela">Salvador/BA - Paralela</option>
                <option value="santo_antonio_de_jesus_ba">Santo Antônio de Jesus/BA</option>
                <option value="sao_luis_ma">São Luís/MA</option>
                <option value="sobral_ce">Sobral/CE</option>
                <option value="teixeira_de_freitas_ba">Teixeira de Freitas/BA</option>
                <option value="vitoria_da_conquista_ba">Vitória da Conquista/BA</option>
            </select>
          </div>
          <button className='buttonLogin' onClick={handleRegister}>Registrar</button>
          <div className="inforContainer">
            <Link to={'/'}></Link>
            <div className="Criarconta" onClick={handleLoginClick}>Fazer Login</div>
          </div>
          <div className='containerLocalizacao'>
            <p className='localizacao'><FiMapPin /> <span>Você está em: <span>{message}</span></span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Acesso;
