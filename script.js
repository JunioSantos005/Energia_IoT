const consumoDiarioEl = document.querySelector('.card-secondary .value');
const previsaoMensalEl = document.querySelector('.card-warning .value');
const custoEstimadoEl = document.querySelector('.valor');

let consumoDiario = 0;
let totalMensal = 0;

const incremento = 0.016 / 120; // kWh por segundo
const precoPorKWh = 0.76447;
const minutosPorSegundo = 10;

// Simulação de tempo completa (dia/mês/ano/hora/minuto)
let calendarioSimulado = {
  data: new Date(2025, 4, 1, 7, 0, 0), // Início em 01/05/2025 07:00
  avancar(minutos) {
    this.data.setMinutes(this.data.getMinutes() + minutos);
  },
  getHora() {
    return this.data.getHours();
  },
  getMinuto() {
    return this.data.getMinutes();
  },
  getDia() {
    return this.data.getDate();
  },
  getMes() {
    return this.data.getMonth();
  },
  getAno() {
    return this.data.getFullYear();
  },
  getDataFormatada() {
    return this.data.toLocaleDateString('pt-BR') + ' ' + this.data.toTimeString().slice(0, 5);
  }
};

// Gráfico
const ctx = document.getElementById('graficoConsumoDiario').getContext('2d');
let labelsGrafico = [];
let dadosConsumo = [];

const graficoConsumo = new Chart(ctx, {
  type: 'line',
  data: {
    labels: labelsGrafico,
    datasets: [{
      label: 'Consumo acumulado (kWh)',
      data: dadosConsumo,
      borderColor: '#0066cc',
      backgroundColor: 'rgba(0, 102, 204, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: '#0066cc'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false, // Permite que o gráfico se adapte ao container
    animation: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: true,
        position: window.innerWidth < 768 ? 'bottom' : 'top' 
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#0066cc',
        borderWidth: 1
      }
    },
    scales: {
      x: { 
        title: { 
          display: true, 
          text: 'Horário',
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        },
        ticks: {
          maxTicksLimit: window.innerWidth < 768 ? 5 : 10, 
          font: {
            size: window.innerWidth < 768 ? 9 : 11
          }
        },
        grid: {
          display: window.innerWidth > 768 
        }
      },
      y: { 
        beginAtZero: true, 
        title: { 
          display: true, 
          text: 'kWh',
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 9 : 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    elements: {
      point: {
        radius: window.innerWidth < 768 ? 2 : 3, // Pontos menores no Celular
        hoverRadius: window.innerWidth < 768 ? 4 : 6
      },
      line: {
        borderWidth: window.innerWidth < 768 ? 1.5 : 2 // Linha mais fina no Celular
      }
    }
  }
});

function redimensionarGrafico() {
  // Atualiza opções baseadas no tamanho da tela
  const isCelular = window.innerWidth < 768;
  
  graficoConsumo.options.plugins.legend.position = isCelular ? 'bottom' : 'top';
  graficoConsumo.options.scales.x.title.font.size = isCelular ? 10 : 12;
  graficoConsumo.options.scales.x.ticks.font.size = isCelular ? 9 : 11;
  graficoConsumo.options.scales.x.ticks.maxTicksLimit = isCelular ? 5 : 10;
  graficoConsumo.options.scales.x.grid.display = !isCelular;
  graficoConsumo.options.scales.y.title.font.size = isCelular ? 10 : 12;
  graficoConsumo.options.scales.y.ticks.font.size = isCelular ? 9 : 11;
  graficoConsumo.options.elements.point.radius = isCelular ? 2 : 3;
  graficoConsumo.options.elements.point.hoverRadius = isCelular ? 4 : 6;
  graficoConsumo.options.elements.line.borderWidth = isCelular ? 1.5 : 2;
  
  graficoConsumo.update('none'); // Update sem animação
}

// ⭐ Event listener para mudanças de tamanho da tela
window.addEventListener('resize', redimensionarGrafico);
window.addEventListener('orientationchange', () => {
  setTimeout(redimensionarGrafico, 100); // Pequeno delay para aguardar a mudança de orientação
});

function atualizarSimulacao() {
  const hora = calendarioSimulado.getHora();
  const minuto = calendarioSimulado.getMinuto();
  const dia = calendarioSimulado.getDia();
  const mes = calendarioSimulado.getMes();
  const ano = calendarioSimulado.getAno();

  // Horário ativo
  const ativo = (hora >= 7 && hora < 12) || (hora >= 13 && hora < 16);
  if (ativo) consumoDiario += incremento * minutosPorSegundo * 60;

  const previsaoMensal = totalMensal + consumoDiario;
  const custoEstimado = previsaoMensal * precoPorKWh;

  let deveAtualizar = true;
  if (hora >= 18 || hora < 6) {
    deveAtualizar = (minuto % 30 === 0);
  }

  if (deveAtualizar) {
    consumoDiarioEl.textContent = consumoDiario.toFixed(2);
    previsaoMensalEl.textContent = previsaoMensal.toFixed(2);
    custoEstimadoEl.textContent = custoEstimado.toFixed(2);

    labelsGrafico.push(calendarioSimulado.getDataFormatada());
    dadosConsumo.push(consumoDiario.toFixed(3));
    
    const maxPontos = window.innerWidth < 768 ? 20 : 50;
    if (labelsGrafico.length > maxPontos) {
      labelsGrafico.shift();
      dadosConsumo.shift();
    }
    
    graficoConsumo.update('none');
  }

  // Reset diário
  if (hora === 0 && minuto === 0) {
    totalMensal += consumoDiario;
    consumoDiario = 0;

    labelsGrafico = [];
    dadosConsumo = [];
    graficoConsumo.data.labels = labelsGrafico;
    graficoConsumo.data.datasets[0].data = dadosConsumo;
    graficoConsumo.update('none');
  }

  // Reset mensal (quando virar pro dia 1)
  const proximaData = new Date(calendarioSimulado.data.getTime());
  proximaData.setMinutes(proximaData.getMinutes() + minutosPorSegundo);
  if (proximaData.getDate() === 1 && proximaData.getMonth() !== mes) {
    totalMensal = 0;
    consumoDiario = 0;
    custoEstimadoEl.textContent = 'R$ 0.00';
  }

  // Avança o tempo
  calendarioSimulado.avancar(minutosPorSegundo);
}

// Inicializa e executa a cada 7 segundo
atualizarSimulacao();
setInterval(atualizarSimulacao, 7000);