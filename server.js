import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';

const app = express();
const PORT = 3000;
const DB_FILE = './db.json';

app.use(cors());
app.use(express.json());

// Função para carregar e salvar dados
const loadDB = async () => await fs.readJson(DB_FILE);
const saveDB = async (data) => await fs.writeJson(DB_FILE, data, { spaces: 2 });

// POST /checkin - faz um check-in para um usuário
app.post('/checkin', async (req, res) => {
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome é obrigatório.' });
  }

  const data = await loadDB();
  const hoje = new Date().toISOString().split('T')[0];

  if (!data.usuarios[nome]) {
    data.usuarios[nome] = { pontos: 0, checkins: [] };
  }

  if (data.usuarios[nome].checkins.includes(hoje)) {
    return res.status(400).json({ erro: 'Você já fez check-in hoje!' });
  }

  data.usuarios[nome].pontos += 10;
  data.usuarios[nome].checkins.push(hoje);

  await saveDB(data);
  res.json({ mensagem: 'Check-in realizado!', pontos: data.usuarios[nome].pontos });
});

// GET /pontuacao/:nome - retorna os pontos de um usuário
app.get('/pontuacao/:nome', async (req, res) => {
  const { nome } = req.params;
  const data = await loadDB();

  if (!data.usuarios[nome]) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  res.json({
    nome,
    pontos: data.usuarios[nome].pontos,
    checkins: data.usuarios[nome].checkins
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
