![Build Status](https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO/actions/workflows/ci.yml/badge.svg)

# 💊 MedCheck: O seu aliado na saúde diária

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)
![Build Status](https://img.shields.io/github/actions/workflow/status/usuario/medcheck/ci.yml?branch=main&style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)

---

## 🌻 Por que o MedCheck existe?

Todos nós já passámos por momentos em que precisamos de cuidar de alguém que amamos ou gerir a nossa própria saúde com maior atenção. Quantas vezes uma mãe, um avô, ou até nós mesmos nos esquecemos se já tomámos o comprimido da manhã? 

A dificuldade de familiares em gerir múltiplas medicações — caixas misturadas, horários que se sobrepõem e a rotina corrida — traz um peso invisível: a preocupação constante e o risco real que um esquecimento ou uma toma dupla trazem para a saúde. A incerteza rouba a tranquilidade da casa.

O **MedCheck** não é apenas um "software" que roda num ecrã escuro. É uma ferramenta nascida da empatia e projetada para ser o seu **aliado na rotina de cuidados**. O objetivo? Tirar esse peso da sua memória e garantir que a atenção se foque no mais importante: o bem-estar e a partilha de momentos com quem se ama.

---

## 🕊️ O Papel Social da Tecnologia

A tecnologia só ganha verdadeiro significado quando resolve dores reais e aproxima as pessoas. Pequenas soluções de software, desenhadas com carinho e propósito, têm o extraordinário poder de **devolver autonomia aos utentes e idosos** que desejam conduzir os seus próprios tratamentos de forma independente. 

Simultaneamente, estas ferramentas ajudam a **reduzir drasticamente a carga mental de cuidadores** — pessoas que, muitas vezes de forma não remunerada, dedicam as suas vidas ao bem-estar do próximo e que precisam de alívio na sua pesada jornada diária. É a tecnologia ao serviço da dignidade humana.

---

## 🤝 Como o MedCheck ajuda você a cuidar

Desenhámos as funções para que reflitam atividades naturais do seu dia a dia, de forma acessível e direta:

💊 **Crie a sua farmacinha digital: adicione um cuidado**
Mais do que "inserir dados", o sistema recebe o nome do tratamento, a dosagem exata e o horário ideal, de forma a estar pronto para lhe lembrar na hora certa.

📋 **Sua visão clara do dia: acompanhe o que já foi tomado**
A qualquer momento, pode consultar a lista limpa e organizada. É a sua janela para conferir a rotina sem confusão.

⏰ **Lembretes carinhosos na altura certa**
Diga adeus ao stress de estar constantemente a olhar para o relógio. O assistente mostra os tratamentos que estão perto ou os que possam ter escapado no meio da sua ocupação diária.

🗑️ **Retire medicamentos concluídos sem complicação**
O tratamento acabou? Com uma simples indicação, removemos as antigas caixas do nosso armário virtual para manter o seu painel sempre atualizado e limpo.

---

## 👣 Primeiros Passos

Não se deixe assustar pela janela de comandos pretos habituais dos programadores. Utilizar o MedCheck é como conversar, e é extremamente simples! Siga a pequena ajuda visual abaixo:

### Passo 1: Como interagir consigo
Quando quiser interagir no terminal, só tem de digitar a palavra sagrada: `medcheck` seguida da ação que quer tomar. Uma janela de diálogo irá acompanhá-lo.

![Demonstração Passo a Passo: "Aqui você vê como é simples pedir ajuda ao MedCheck no ecrã principal"](images/placeholder-start-screen.png)

### Passo 2: O seu primeiro Registo Interativo
A melhor forma de começar é usar o modo de ajuda, escrevendo `medcheck add -i` (o "i" significa interativo!). A aplicação vai começar as perguntas, uma a uma: qual é o medicamento, qual a quantidade e a que horas!

![Exemplo de Registo: "Aqui você vê como é simples cadastrar uma nova vitamina de forma dialogada"](images/placeholder-interactive-add.png)

### Passo 3: Verifique as pendências
Com o dia a correr, pode sentar-se por um momento e escrever `medcheck remind` para garantir que toda a família cumpriu a sua medicação do dia.

![Exemplo de Lembretes: "Visão rápida que lhe confirma se algum idoso esqueceu o comprimido do coração!"](images/placeholder-reminders.png)

---

## 🖋️ Um recado de quem construiu

> *"Programar não é sobre criar códigos complexos que só máquinas e especialistas entendem. É sobre usar cada linha para aliviar a carga das pessoas, facilitar vidas e devolver um pouco do tempo perdido. A minha verdadeira motivação enquanto desenvolvedor é construir soluções que tirem sorrisos, transmitam paz e protejam quem mais amamos."* — **Desenvolvedor(a)**

---
<br>

<details>
<summary><b>🛠️ Apêndice Técnico (Para Desenvolvedores e QA)</b></summary>
<br>

Para especialistas e contribuidores que queiram melhorar o código fonte ou realizar os seus próprios testes locais.

#### > Como Configurar a Máquina
Necessitas da instalação prévia do Node.js v18+.
```bash
git clone https://github.com/usuario/medcheck.git
cd medcheck
npm install
```

#### > Como utilizar os parâmetros diretos (CLI Tradicional)
```bash
node src/index.js add --name "Aspirina" --dose "100mg" --time "14:00"
node src/index.js list
node src/index.js remind
node src/index.js remove --id "1234abcd-..."
```

#### > CI e Automação de QA
Este projeto aplica o standard **ESLint v8** e **Jest** para garantir comportamento correto através de `ci.yml` hospedado em GitHub Actions via Node 20 environment:
- **Correr o Linter Estático:**
```bash
npm run lint
```
- **Rodar os Testes Lógicos:**
A lógica valida cenários de Sucesso de dados, cenários isolantes (lista vazia) e cenários com falhas intencionais (doses negativas e sem nome).
```bash
npm test
```

Licença **MIT**.
</details>
