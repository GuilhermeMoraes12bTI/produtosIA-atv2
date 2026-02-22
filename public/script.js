const app = {
    // URL base da API (Conecta com o seu server.js)
    apiUrl: '/api/products',

    // 1. Inicialização e Configurações
    init: () => {
        // Verifica se o usuário já tinha escolhido modo escuro antes
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }

        // Adiciona o evento de envio ao formulário
        const form = document.getElementById('form-create');
        if (form) {
            form.addEventListener('submit', app.createProduct);
        }
    },

    // 2. Navegação entre Abas (Home, Cadastrar, Lista)
    navigate: (viewId) => {
        // Esconde todas as seções
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active', 'hidden'));
        document.querySelectorAll('.view').forEach(el => {
            if(el.id !== viewId) el.classList.add('hidden');
        });
        
        // Mostra a seção desejada
        const target = document.getElementById(viewId);
        if(target) target.classList.add('active');

        // Atualiza a cor dos botões do menu
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Ativa o botão correto baseado na tela
        if(viewId === 'home') document.querySelectorAll('.nav-btn')[0].classList.add('active');
        if(viewId === 'create') document.querySelectorAll('.nav-btn')[1].classList.add('active');
        if(viewId === 'list') document.querySelectorAll('.nav-btn')[2].classList.add('active');
    },

    // 3. Alternar Tema (Claro / Escuro)
    toggleTheme: () => {
        document.body.classList.toggle('dark-mode');
        // Salva a preferência do usuário no navegador
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    },

    // 4. Mostrar Mensagens (Toast)
    showToast: (msg, type) => {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        // Reseta as classes para garantir a cor certa (success ou error)
        toast.className = `toast ${type}`; 
        toast.classList.remove('hidden');

        // Some após 3 segundos
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    },

    // 5. Cadastrar Produto (POST)
    createProduct: async (e) => {
        e.preventDefault(); // Impede a página de recarregar
        
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        
        // Feedback visual (Desabilita botão)
        btn.textContent = 'Salvando...';
        btn.disabled = true;

        // Pega os dados dos inputs
        const data = {
            name: document.getElementById('name').value,
            price: document.getElementById('price').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value
        };

        try {
            const response = await fetch(app.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                app.showToast('Produto cadastrado com sucesso!', 'success');
                app.clearForm();
            } else {
                app.showToast('Erro ao cadastrar produto.', 'error');
            }
        } catch (error) {
            console.error(error);
            app.showToast('Erro de conexão com o servidor.', 'error');
        } finally {
            // Restaura o botão
            btn.textContent = originalText;
            btn.disabled = false;
        }
    },

    // 6. Carregar Lista (GET)
    loadList: async () => {
        app.navigate('list'); // Muda para a tela de lista
        
        const grid = document.getElementById('grid-products');
        const loading = document.getElementById('loading');
        const empty = document.getElementById('empty-state');

        // Limpa a tela e mostra loading
        grid.innerHTML = '';
        loading.classList.remove('hidden');
        empty.classList.add('hidden');

        try {
            const response = await fetch(app.apiUrl);
            
            if (!response.ok) throw new Error('Erro na API');

            const products = await response.json();
            
            // Esconde loading
            loading.classList.add('hidden');

            // Se não tiver produtos, mostra mensagem de vazio
            if (products.length === 0) {
                empty.classList.remove('hidden');
                return;
            }

            // Cria os cards para cada produto
            products.forEach(prod => {
                const card = document.createElement('div');
                card.className = 'product-card';
                
                // Formata o preço para R$ 00.00
                const priceFormatted = parseFloat(prod.price).toFixed(2);

                card.innerHTML = `
                    <div class="product-cat">${prod.category || 'Geral'}</div>
                    <h3>${prod.name}</h3>
                    <div class="product-price">R$ ${priceFormatted}</div>
                    <p style="font-size: 0.9rem; color: var(--secondary); margin-bottom: 15px;">
                        ${prod.description || 'Sem descrição'}
                    </p>
                    
                    <button onclick="app.deleteProduct(${prod.id})" class="btn-danger">
                        Excluir
                    </button>
                `;
                grid.appendChild(card);
            });

        } catch (error) {
            console.error(error);
            loading.classList.add('hidden');
            app.showToast('Erro ao carregar lista.', 'error');
        }
    },

    // 7. Excluir Produto (DELETE)
    deleteProduct: async (id) => {
        // Confirmação antes de apagar
        const confirmDelete = confirm("Tem certeza que deseja excluir este produto?");
        
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${app.apiUrl}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Mensagem de sucesso usando alert, conforme solicitado
                alert('Produto excluído com sucesso!'); 
                
                // Recarrega a lista para o item sumir da tela
                app.loadList();
            } else {
                alert('Erro ao excluir o produto.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao tentar excluir.');
        }
    },

    // 8. Limpar Formulário
    clearForm: () => {
        document.getElementById('form-create').reset();
    }
};

// Inicia o app quando a página carregar
document.addEventListener('DOMContentLoaded', app.init);