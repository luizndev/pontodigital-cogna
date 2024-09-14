import { MdDelete } from "react-icons/md";
import { FaRegClock } from "react-icons/fa";
import { MdOutlineCalendarToday } from "react-icons/md";
import { IoMdBook } from "react-icons/io";
import React, { useState, useEffect } from 'react';
import { FiUser } from "react-icons/fi";
import { LiaUniversitySolid } from "react-icons/lia";
import './Admin.css';
import { Link } from 'react-router-dom';
import { MdOutlineMail, MdOutlineWorkOutline } from "react-icons/md";

const Painel = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [novaDisciplina, setNovaDisciplina] = useState({
    nome: '',
    dia: '',
    horarioInicio: '',
    horarioFim: ''
  });
  const [editUser, setEditUser] = useState({
    cargo: '',
    curso: '',
    city: ''
  });

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const [viewDisciplina, setViewDisciplina] =  useState(false)

  const buscarUsuario = async () => {
    try {
      const response = await fetch(`http://localhost:30120/user?email=${email}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar usuário');
      }
      const data = await response.json();
      setViewDisciplina(true);
      // console.log(data);
      setUser(data);
      setDisciplinas(data.disciplinas || []);
      setEditUser({
        cargo: data.cargo,
        curso: data.curso,
        city: data.city
      });
    } catch (error) {
      // console.error('Erro ao buscar usuário:', error);
    }
  };

  const adicionarDisciplina = async () => {
    try {
      const response = await fetch('http://localhost:30120/add/disciplina', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          nome: novaDisciplina.nome,
          dia: novaDisciplina.dia,
          horarioInicio: novaDisciplina.horarioInicio,
          horarioFim: novaDisciplina.horarioFim
        })
      });
      if (!response.ok) {
        throw new Error('Erro ao adicionar disciplina');
      }
      await buscarUsuario();
      setNovaDisciplina({
        nome: '',
        dia: '',
        horarioInicio: '',
        horarioFim: ''
      });
    } catch (error) {
      // console.error('Erro ao adicionar disciplina:', error);
    }
  };

  const excluirDisciplina = async (nomeDisciplina) => {
    try {
      const response = await fetch('http://localhost:30120/delete/disciplina', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, nome: nomeDisciplina })
      });
      if (!response.ok) {
        throw new Error('Erro ao excluir disciplina');
      }
      await buscarUsuario();
    } catch (error) {
      // console.error('Erro ao excluir disciplina:', error);
    }
  };

  const editarInformacoesUsuario = async () => {
    try {
      const response = await fetch('http://localhost:30120/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          cargo: editUser.cargo,
          curso: editUser.curso,
          city: editUser.city
        })
      });
      if (!response.ok) {
        throw new Error('Erro ao editar informações do usuário');
      }
      await buscarUsuario();
    } catch (error) {
      // console.error('Erro ao editar informações do usuário:', error);
    }
  };

  const extrairRelatorio = async () => {
    try {
        const response = await fetch('http://localhost:30120/extrair-relatorio', {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Erro ao extrair relatório');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0'); 
        const ano = dataAtual.getFullYear();
        const dataFormatada = `${dia}-${mes}-${ano}`;

        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-pontodigital-${dataFormatada}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        // console.error('Erro ao extrair relatório:', error);
    }
};


  return (
    <div>
      <nav className="navbar">
        <img src="cogna-logo.svg" alt="Logo" />
        <div className="listOptions">
          <p onClick={extrairRelatorio}>Extrair Relatório</p>
          <Link to={'/acesso'}>Voltar para o Início</Link>
        </div>
      </nav>
      <div className="containerBuscar">
        <div className='buscarUser'>
          <h2 className='titleBusca'>Buscar Usuário</h2>
          <div className="inputBuscaContainer">
            <div className="inputBusca">
              <FiUser />
              <input
                type="text"
                placeholder="Email do usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className='buttonBusca' onClick={buscarUsuario}>Buscar</button>
          </div>
        </div>
        {user && (
          <div className='infoUser'>
            <h2>Informações do Usuário</h2>
            <label>Email: <div className="inputInfo"><MdOutlineMail /><input type="text" value={user.email} readOnly /></div></label>
            <label  id="leftLabel">Nome: <div className="inputInfo"><FiUser /><input type="text" value={user.id} readOnly /></div></label>
            <label>Cargo: <div className="inputInfo"><MdOutlineWorkOutline /><input
              type="text"
              value={editUser.cargo}
              onChange={(e) => setEditUser({ ...editUser, cargo: e.target.value })}
            /></div></label>
            <label  id="leftLabel">Curso: <div className="inputInfo"><LiaUniversitySolid /><input
              type="text"
              value={editUser.curso}
              onChange={(e) => setEditUser({ ...editUser, curso: e.target.value })}
            /></div></label>
            <button className="buttonInfo" onClick={editarInformacoesUsuario}>Salvar Alterações</button>
          </div>
        )}
        <div className='disciplinasContainerConfig'>
          {viewDisciplina && (
            <div className='disciplinasConfig'>
              <div className="leftGroup">
                <h2>Disciplinas</h2>
                <button 
                  className='addNewDisciplina' 
                  onClick={() => setNovaDisciplina({
                    nome: '',
                    dia: '',
                    horarioInicio: '',
                    horarioFim: ''
                  })}
                >
                  Adicionar Nova Disciplina
                </button>

                {novaDisciplina && (
                  <div className="felxInputs">
                    <div className="inputDisciplina">
                      <IoMdBook />
                      <input
                        type="text"
                        placeholder="Nome da Disciplina"
                        value={novaDisciplina.nome}
                        onChange={(e) => setNovaDisciplina({ ...novaDisciplina, nome: e.target.value })}
                      />
                    </div>
                    <div className="inputDisciplina">
                      <MdOutlineCalendarToday />
                      <select
                        value={novaDisciplina.dia}
                        onChange={(e) => setNovaDisciplina({ ...novaDisciplina, dia: e.target.value })}
                      >
                        <option value="">Selecione o dia</option>
                        <option value="segunda-feira">Segunda-feira</option>
                        <option value="terça-feira">Terça-feira</option>
                        <option value="quarta-feira">Quarta-feira</option>
                        <option value="quinta-feira">Quinta-feira</option>
                        <option value="sexta-feira">Sexta-feira</option>
                      </select>
                    </div>
                    <div className="inputDisciplina">
                      <FaRegClock />
                      <label htmlFor="">Horario Início</label>
                      <input
                        type="time"
                        placeholder="Horário Início"
                        value={novaDisciplina.horarioInicio}
                        onChange={(e) => setNovaDisciplina({ ...novaDisciplina, horarioInicio: e.target.value })}
                      />
                    </div>
                    <div className="inputDisciplina">
                      <FaRegClock />
                      <label htmlFor="">Horario Fim</label>
                      <input
                        type="time"
                        placeholder="Horário Fim"
                        value={novaDisciplina.horarioFim}
                        onChange={(e) => setNovaDisciplina({ ...novaDisciplina, horarioFim: e.target.value })}
                      />
                    </div>
                    <button className="buttomAdd" onClick={adicionarDisciplina}>
                      Adicionar
                    </button>
                  </div>
                )}
              </div>

              <div className="rightGroup">
                {disciplinas.length > 0 && (
                  <div className="disciplinasAtuais">
                    <h3>Disciplinas Atuais</h3>
                    <table className="disciplinasTable">
                      <thead>
                        <tr>
                          <th>Disciplina</th>
                          <th>Dia da Semana</th>
                          <th>Horário Início</th>
                          <th>Horário Fim</th>
                          <th className="action">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {disciplinas.map((disciplina, index) => (
                          <tr key={index}>
                            <td>{disciplina.nome}</td>
                            <td className="diaSemana">{disciplina.dia_da_semana}</td>
                            <td>{disciplina.horario_inicio}</td>
                            <td>{disciplina.horario_fim}</td>
                            <td className="actionButton">
                              <button class="noselect"  onClick={() => excluirDisciplina(disciplina.nome)}><span class="text">Excluir</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Painel;
