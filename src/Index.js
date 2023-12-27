import axios from 'axios';
import { load } from 'cheerio';
import express from 'express';

const app = express();
const port = 3000;

const urlTeams = "https://fbref.com/pt/comps/24/Serie-A-Estatisticas"

const fetchAllTeams = async () => {
  try {
    const response = await axios.get(urlTeams)

    const $ = load(response.data);
    const teamsRows = $('table.stats_table#results2023241_overall tbody tr');
    const teamsFetched = []
  
    teamsRows.each((index, element) => {
      const link = $(element).find('td[data-stat="team"] a');
      const href = link.attr('href');
  
      href.split("/")[4].split("-")[0]
      const team = getPlayers(`https://fbref.com/${href}`, href.split("/")[4].split("-")[0])
      teamsFetched.push(team)
    });
  
    return teamsFetched
  } catch(error) {
    return `Erro ao acessar a página: ${error.message}`;
  }
}

const getPlayers = async (urlTeam, teamName) => {
  try {
    const response = await axios.get(urlTeam)

    const $ = load(response.data);
      const playersData = []
      const teamsData = {}
      const playersRows = $('table.stats_table#stats_standard_24 tbody tr');
  
      playersRows.each((index, element) => {
        const playerData = {};
        
        playerData.Nome = $(element).find('th[data-stat="player"]').text().trim();
        playerData.Nacionalidade = $(element).find('td[data-stat="nationality"]').text().trim();
        playerData.Posicao = $(element).find('td[data-stat="position"]').text().trim();
        playerData.Idade = $(element).find('td[data-stat="age"]').text().trim();
        playerData.Jogos = $(element).find('td[data-stat="games"]').text().trim();
        playerData.Minutos = $(element).find('td[data-stat="minutes"]').text().trim();
        
        playersData.push(playerData)
      });

      teamsData[teamName] = playersData
      return teamsData
  } catch (error) {
    return `Erro ao acessar a página: ${error.message}`;
  }
}

app.get('/', async (req, res) => {
  const teams = await fetchAllTeams();
  res.json(teams);
});

app.listen(port, () => {
  console.log(`Servidor rodando em ${port}`);
});