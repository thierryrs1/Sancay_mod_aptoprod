// Função helper para criar elementos DOM
function el(tag, props, ...children) {
    const element = document.createElement(tag);
    if (props) {
        for (const [key, value] of Object.entries(props)) {
            if (key === 'className') element.className = value;
            else if (key === 'id') element.id = value;
            else if (key.startsWith('on')) element[key] = value;
            else if (key === 'style' && typeof value === 'object') {
                for (const [sKey, sVal] of Object.entries(value)) element.style[sKey] = sVal;
            }
            else element.setAttribute(key, value);
        }
    }
    for (const child of children) {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    }
    return element;
}

export function buildUI() {
    // --- Tabs ---
    const tabsContainer = el('div', { className: 'tabs-container' },
        el('button', { className: 'tab-btn active', id: 'tabBtn1', onclick: () => app.voltarParaLista() },
            el('i', { className: 'fa-solid fa-layer-group' }), ' 1. Ordens de Produção'
        ),
        el('button', { className: 'tab-btn', id: 'tabBtn2', disabled: 'true' },
            el('i', { className: 'fa-solid fa-stopwatch' }), ' 2. Apontamentos'
        )
    );

    // --- Tab 1 ---
    const tabContent1 = el('div', { id: 'tabContent1', className: 'tab-pane active' },
        el('div', { style: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' } },
            el('div', { className: 'filter-wrapper', style: { flex: 1, minWidth: '180px', marginBottom: 0 } },
                el('i', { className: 'fa-solid fa-hashtag' }),
                el('input', { type: 'text', id: 'filterOp', className: 'filter-input', placeholder: 'Filtrar OPs (ex: 50, 52)', onkeyup: () => app.filtrarLista() })
            ),
            el('div', { className: 'filter-wrapper', style: { flex: 1, minWidth: '180px', marginBottom: 0 } },
                el('i', { className: 'fa-solid fa-list-ol' }),
                el('input', { type: 'text', id: 'filterPos', className: 'filter-input', placeholder: 'Filtrar Posições (ex: 10, 20)', onkeyup: () => app.filtrarLista() })
            ),
            el('div', { className: 'filter-wrapper', style: { flex: 2, minWidth: '240px', marginBottom: 0 } },
                el('i', { className: 'fa-solid fa-search' }),
                el('input', { type: 'text', id: 'filterText', className: 'filter-input', placeholder: 'Pesquisar Item, Descrição, Lote ou Operação...', onkeyup: () => app.filtrarLista() })
            ),
            el('button', { className: 'btn btn-primary', style: { padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px' }, onclick: () => app.iniciarSelecionadas() },
                el('i', { className: 'fa-solid fa-play' }), 'Iniciar Selecionadas'
            ),
            el('button', { className: 'btn btn-outline', style: { padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px' }, onclick: () => { app.init(); app.showToast('Atualizando lista...', 'info'); } },
                el('i', { className: 'fa-solid fa-rotate-right' }), 'Atualizar'
            )
        ),
        el('div', { className: 'table-wrapper' },
            el('table', { className: 'data-table' },
                el('thead', null,
                    el('tr', null,
                        el('th', { style: { width: '40px', textAlign: 'center' } }, el('input', { type: 'checkbox', id: 'selectAllOps', onclick: 'app.toggleSelectAll(this)' })),
                        el('th', null, 'OP'),
                        el('th', null, 'Pos'),
                        el('th', null, 'Seq'),
                        el('th', null, 'Operação'),
                        el('th', null, 'Código / Descrição'),
                        el('th', null, 'Qtd Planejada'),
                        el('th', null, 'Qtd. Total'),
                        el('th', null, 'Colaboradores'),
                        el('th', { style: { textAlign: 'right' } }, 'Ação')
                    )
                ),
                el('tbody', { id: 'listaTbody' })
            )
        )
    );

    // --- Tab 2 ---
    const tabContent2 = el('div', { id: 'tabContent2', className: 'tab-pane' },
        el('div', { className: 'header-panel', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' } },
            el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
                el('div', null,
                    el('h2', { id: 'matTitle', style: { margin: 0 } }, 'Registro de Apontamentos'),
                    el('p', { id: 'matOpName', style: { margin: '4px 0 0 0' } })
                ),
                el('label', { style: { display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569', fontWeight: '600', fontSize: '0.85rem', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: 'max-content', transition: 'background-color 0.2s' }, onmouseover: (e) => e.currentTarget.style.backgroundColor = '#e2e8f0', onmouseout: (e) => e.currentTarget.style.backgroundColor = '#f1f5f9' },
                    el('input', { type: 'checkbox', id: 'chkOcultarSalvos', checked: true, onchange: () => app.renderApontamentos(), style: { margin: 0, width: '16px', height: '16px', accentColor: 'var(--primary)' } }),
                    'Ocultar Salvos'
                )
            ),
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
                el('button', { className: 'btn', style: { backgroundColor: '#10b981', color: 'white', border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', fontWeight: '600' }, onclick: () => app.iniciarTodos(), title: 'Iniciar todos os registros' },
                    el('i', { className: 'fa-solid fa-play', style: { marginRight: '6px' } }),
                    'Iniciar Todos'
                ),
                el('button', { className: 'btn', style: { backgroundColor: '#f59e0b', color: 'white', border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', fontWeight: '600' }, onclick: () => app.pararTodos(), title: 'Parar todos os registros' },
                    el('i', { className: 'fa-solid fa-stop', style: { marginRight: '6px' } }),
                    'Parar Todos'
                ),
                el('button', { className: 'btn btn-outline', style: { display: 'none' }, disabled: true, onclick: () => app.finalizarOp() }, 'Finalizar OP'),
                el('button', { className: 'btn', style: { backgroundColor: 'var(--primary)', color: 'white', border: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', fontWeight: '600', transition: 'filter 0.2s' }, onmouseover: (e) => e.currentTarget.style.filter = 'brightness(0.9)', onmouseout: (e) => e.currentTarget.style.filter = 'brightness(1)', onclick: () => app.abrirModalColaborador() },
                    el('i', { className: 'fa-solid fa-plus', style: { marginRight: '6px' } }),
                    'Registro de Tempo'
                )
            )
        ),
        el('div', { className: 'table-wrapper', style: { marginBottom: '25px' } },
            el('table', { className: 'data-table', style: { width: '100%' } },
                el('thead', null,
                    el('tr', null,
                        el('th', { style: { width: '260px' } }, 'OP / OPERAÇÃO'),
                        el('th', { style: { width: '110px', textAlign: 'center' } }, 'COLABORADOR'),
                        el('th', { style: { width: '120px' } }, 'OBSERVAÇÃO'),
                        el('th', { style: { width: '100px' } }, 'TIPO PESO'),
                        el('th', { style: { textAlign: 'center', width: '200px' } }, 'PESAGEM'),
                        el('th', { style: { textAlign: 'right', width: '90px' } }, 'TOTAL PROC.'),
                        el('th', { style: { textAlign: 'right', width: '80px' } }, 'TEMPO'),
                        el('th', { style: { textAlign: 'center', width: '90px' } }, 'REGISTRO'),
                        el('th', { style: { textAlign: 'center', width: '100px' } }, 'AÇÕES')
                    )
                ),
                el('tbody', { id: 'apontamentosTbody' })
            )
        )
    );

    const contentBox = el('div', { className: 'content-box' }, tabContent1, tabContent2);
    const mainContainer = el('div', { className: 'main-container' }, tabsContainer, contentBox);

    // --- Modal Colaborador ---
    const modalColaborador = el('div', { className: 'custom-modal', id: 'modalColaborador' },
        el('div', { className: 'custom-modal-content', style: { maxWidth: '650px', width: '92%', display: 'flex', flexDirection: 'column' } },
            el('h3', null, 'Adicionar Registro'),
            el('p', { className: 'custom-modal-desc' }, 'Informe o colaborador e selecione a operação.'),
            el('div', { className: 'form-group' },
                el('label', { style: { display: 'block', marginBottom: '5px', fontWeight: '500', color: '#475569', fontSize: '0.9rem' } }, 'Colaborador'),
                el('input', { type: 'text', id: 'inputPersId', list: 'persList', className: 'form-control', placeholder: 'Ex: 9999 ou digite o nome...', autocomplete: 'off' }),
                el('datalist', { id: 'persList' })
            ),
            el('div', { className: 'form-group' },
                el('label', { style: { display: 'block', marginBottom: '5px', fontWeight: '500', color: '#475569', fontSize: '0.9rem' } }, 'Selecione a Operação'),
                el('div', { id: 'cardsOpModal', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px', maxHeight: '320px', overflowY: 'auto', padding: '8px 10px 8px 6px' } })
            ),
            el('div', { className: 'btn-group', style: { marginTop: 'auto', paddingTop: '10px' } },
                el('button', { className: 'btn btn-outline', onclick: () => app.fecharModalColaborador() }, 'Cancelar'),
                el('button', { className: 'btn btn-success', onclick: () => app.confirmarColaborador() }, 'Adicionar')
            )
        )
    );

    const modalOpsSelecionadas = el('div', { className: 'custom-modal', id: 'modalOpsSelecionadas', onclick: (e) => { if (e.target.id === 'modalOpsSelecionadas') document.getElementById('modalOpsSelecionadas').classList.remove('active') } },
        el('div', { className: 'custom-modal-content', style: { maxWidth: '600px', display: 'flex', flexDirection: 'column' } },
            el('h3', { style: { flexShrink: 0 } }, 'Operações Selecionadas'),
            el('div', { id: 'listaOpsSelecionadasModal', style: { flexGrow: 1, maxHeight: '400px', overflowY: 'auto', marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' } }),
            el('div', { className: 'btn-group', style: { marginTop: 'auto', paddingTop: '20px', flexShrink: 0 } },
                el('button', { className: 'btn btn-outline', onclick: () => document.getElementById('modalOpsSelecionadas').classList.remove('active') }, 'Fechar')
            )
        )
    );

    // Ajusta o modalColaborador para fechar ao clicar fora
    modalColaborador.onclick = function (e) {
        if (e.target === modalColaborador) {
            app.fecharModalColaborador();
        }
    };

    // Injetar estilos dinamicamente
    if (!document.getElementById('sancay-app-style')) {
        const link = document.createElement('link');
        link.id = 'sancay-app-style';
        link.rel = 'stylesheet';
        link.href = import.meta.url.replace(/\/[^\/]+$/, '') + '/style.css';
        document.head.appendChild(link);

        // Font Awesome 6 (Ícones)
        const fa = document.createElement('link');
        fa.id = 'sancay-fa-style';
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fa);

        // Fonte Inter
        const font = document.createElement('link');
        font.id = 'sancay-font-style';
        font.rel = 'stylesheet';
        font.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
        document.head.appendChild(font);
    }

    const container = document.getElementById('app-container') || document.body;
    container.appendChild(mainContainer);
    container.appendChild(modalColaborador);
    container.appendChild(modalOpsSelecionadas);
}
