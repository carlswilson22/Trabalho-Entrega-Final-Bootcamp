# 💊 MedRemind - Lembrete de Medicamentos CLI

**Versão:** 1.1.0

## 🎯 Sobre o Projeto

### O Problema (Dor Real)
O esquecimento de doses ou a confusão com múltiplos horários de medicamentos é um risco real à saúde de idosos e pacientes crônicos, gerando ansiedade e sobrecarga mental para cuidadores e famílias.

### A Solução
O MedRemind é uma aplicação de linha de comando (CLI) focada em **simplicidade** e **segurança**, permitindo cadastrar, listar e remover lembretes de medicação com validações rigorosas para evitar erros de registro.

### Público-Alvo
Idosos com autonomia tecnológica, pacientes em tratamento contínuo e cuidadores que buscam uma ferramenta leve, gratuita e livre de distrações visuais.

---

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologia |
|-----------|-----------|
| **Linguagem** | JavaScript (Node.js) |
| **Interface** | CLI (readline-sync / process.stdin) |
| **Testes** | Jest |
| **Qualidade de Código** | ESLint |
| **CI/CD** | GitHub Actions |

---

## ⚙️ Como Executar

### 1. Instalação

Certifique-se de ter o **Node.js** instalado. Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/medremind-cli.git
cd medremind-cli
npm install
```

### 2. Execução

Para iniciar o sistema e acessar o menu interativo de cuidados:

```bash
npm start
```

### 3. Testes e Lint

```bash
# Executa os testes automatizados (validação de entradas, fluxos e erros)
npm test

# Executa a verificação estática de qualidade do código
npm run lint
```

---

## 🚀 Execução Pública

Qualquer pessoa pode executar o MedLembrete **diretamente do terminal**, sem precisar clonar o repositório, usando o `npx`:

```bash
npx medlembrete
```

> ☝️ O `npx` baixa e executa o pacote automaticamente. Não é necessário instalar nada globalmente.

### 📦 Link do pacote no NPM

**https://www.npmjs.com/package/medlembrete**

### Instalação global (opcional)

Para instalar o comando permanentemente no seu sistema:

```bash
npm install -g medlembrete
```

Depois, basta rodar em qualquer terminal:

```bash
medlembrete
```

---

## 🌐 Integração com BrasilAPI

O sistema consulta a [BrasilAPI](https://brasilapi.com.br) durante o cadastro de medicamentos para buscar a localização do usuário a partir do CEP informado.

- **Endpoint utilizado:** `GET https://brasilapi.com.br/api/cep/v1/{cep}`
- **Biblioteca:** [axios](https://www.npmjs.com/package/axios)
- **Tratamento de erros:** CEP inválido, não encontrado (404), falha de conexão e timeout

---

## 👨‍💻 Autor

Desenvolvido por **Carlos Wilson** para o desafio de desenvolvimento de software com impacto social.
