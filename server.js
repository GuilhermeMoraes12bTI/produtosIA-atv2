const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------
// CONFIGURAÇÃO DO BANCO DE DADOS
// ---------------------------------------------------------
const db = mysql.createConnection({
    host: 'benserverplex.ddns.net', // Seu host do MySQL
    user: 'alunos',       // Seu usuário do MySQL (padrão XAMPP é root)
    password: 'senhaAlunos',       // Sua senha do MySQL (padrão XAMPP é vazio)
    database: 'web_03mb' // Certifique-se que o banco existe
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar no MySQL:', err);
        return;
    }
    console.log('Conectado ao MySQL com sucesso na tabela productsGuilherme!');
});

// ---------------------------------------------------------
// ROTAS DA API
// ---------------------------------------------------------

// Rota 1: Listar Produtos (GET)
app.get('/api/products', (req, res) => {
    // Usando a tabela específica solicitada
    const sql = 'SELECT * FROM productsGuilherme ORDER BY id DESC';

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao buscar dados.' });
        }
        
        // Simulando delay de 500ms apenas para ver o "Loading..." (Heurística de Status)
        // Em produção, você removeria o setTimeout
        setTimeout(() => {
            res.json(results);
        }, 500);
    });
});

// Rota 2: Cadastrar Produto (POST)
app.post('/api/products', (req, res) => {
    // Pegamos os dados vindos do Frontend
    // Nota: O frontend atual envia name, price, category.
    // O campo description é opcional na tabela, então se não vier, fica NULL.
    const { name, price, category, description } = req.body;

    // Validação básica (Prevenção de Erros)
    if (!name || !price) {
        return res.status(400).json({ message: 'Nome e preço são obrigatórios.' });
    }

    const sql = `INSERT INTO productsGuilherme (name, price, category, description) VALUES (?, ?, ?, ?)`;

    // Se description não for enviado, salvamos como null
    const descValue = description || null; 

    db.query(sql, [name, price, category, descValue], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao salvar no banco.' });
        }

        // Retorna o objeto criado para o frontend atualizar a interface
        const newProduct = {
            id: result.insertId,
            name,
            price,
            category,
            description: descValue
        };

        res.status(201).json({ message: 'Produto salvo!', product: newProduct });
    });
});

    // ... (mantenha os códigos anteriores de conexão e rotas GET/POST)

// NOVA ROTA: Excluir Produto (DELETE)
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    
    const sql = 'DELETE FROM productsGuilherme WHERE id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao excluir do banco de dados.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produto nao encontrado.' });
        }

        res.json({ message: 'Produto excluido com sucesso.' });
    });
});

// app.listen ...
// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});