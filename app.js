import { api } from './api.js';
import { readWeightFromAPI } from './scale.js';

export const app = {
    opsCache: [],
    listaPlana: [],
    stopReasonsCache: [],
    apontamentosManuais: [], // Store current rows
    selectedOperations: [],
    checkedKeys: new Set(), // Armazena checkboxes marcados
    currentOp: null,
    currentPos: null,
    currentOperacao: null,

    init: async function () {
        if (document.getElementById('filterOp')) document.getElementById('filterOp').value = '';
        if (document.getElementById('filterText')) document.getElementById('filterText').value = '';

        try {
            const rawOps = await api.getOps();
            if (Array.isArray(rawOps)) {
                this.opsCache = rawOps;
            } else if (rawOps && rawOps.value) {
                this.opsCache = rawOps.value; // Fallback caso a API realmente mude
            } else {
                console.warn("A API não retornou o array de OPs esperado.", rawOps);
            }

            // Busca motivos de parada
            this.stopReasonsCache = await api.getStopReasons();

        } catch (e) {
            console.error("Falha ao buscar OPs da API.", e);
        }

        if (typeof ux !== 'undefined') ux.set('appSave', 'hidden');
        this.loadColaboradores();
        this.buildListaPlana();
        this.renderLista();
    },

    loadColaboradores: async function () {
        try {
            const persData = await api.getColaboradores();
            const datalist = document.getElementById('persList');
            if (datalist && persData && persData.length > 0) {
                datalist.innerHTML = '';
                persData.forEach(p => {
                    const id = p.Code || p.PERS_ID || p.PersID || p.id || p.ID || p;
                    const name = p.NAME || p.Name || p.Nome || p.Description || '';
                    const opt = document.createElement('option');
                    opt.value = name ? `${id} - ${name}` : id;
                    datalist.appendChild(opt);
                });
            }
        } catch (e) {
            console.error("Falha ao carregar lista de colaboradores.", e);
        }
    },

    switchTab: function (tabNum) {
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));

        document.getElementById('tabBtn' + tabNum).classList.add('active');
        document.getElementById('tabContent' + tabNum).classList.add('active');
    },

    voltarParaLista: function () {
        this.switchTab(1);
        this.init(); // Refresh OPs list
    },

    buildListaPlana: function () {
        this.listaPlana = [];

        this.opsCache.forEach(op => {
            if (op.WorkOrderPos) {
                op.WorkOrderPos.forEach(pos => {
                    this.listaPlana.push({ op, pos });
                });
            }
        });
    },

    renderLista: function (filtroOp = '', filtroText = '') {
        const tbody = document.getElementById('listaTbody');
        tbody.innerHTML = '';

        const fOp = filtroOp.trim();
        const fText = filtroText.toLowerCase().trim();

        const termosOp = fOp ? fOp.split(/[\s,]+/).filter(t => t.length > 0) : [];

        const fragment = document.createDocumentFragment();

        this.opsCache.forEach(op => {
            if (op.WorkOrderPos) {
                op.WorkOrderPos.forEach(pos => {

                    // 1. Filtro estrito por OP (OR lógico: se digitar "50, 12", mostra a OP 50 e a OP 12)
                    if (termosOp.length > 0) {
                        const strBelnr = String(op.BELNR_ID);
                        if (!termosOp.includes(strBelnr)) return;
                    }

                    // 2. Filtro de Texto (Item, Descrição, Ordem, Lote/DistNumber)
                    if (fText) {
                        const loteAux = `${op.DistNumber || ''} ${pos.DistNumber || ''}`;
                        const searchableText = `${op.AUFTRAG} ${pos.ItemCode} ${pos.ItemName} ${loteAux}`.toLowerCase();
                        if (!searchableText.includes(fText)) return;
                    }

                    // Ignorar posições que não possuem roteiro (WorkorderRouting)
                    if (!pos.WorkorderRouting || pos.WorkorderRouting.length === 0) return;

                    // Calcula Qtd Atual (Produzida)
                    let myProducedQty = pos.CurrentQuantity || 0;
                    if (myProducedQty === 0 && pos.Receipt && pos.Receipt.length > 0) {
                        myProducedQty = pos.Receipt.reduce((acc, r) => acc + r.Quantity, 0);
                    }

                    pos.WorkorderRouting.forEach(rot => {
                        const planned = parseFloat(pos.PlannedQty) || 0;
                        const total = parseFloat(rot.TotalQuantity) || 0;
                        let perc = planned > 0 ? (total / planned) * 100 : 0;
                        const cappedPerc = perc > 100 ? 100 : perc;

                        const key = `${op.BELNR_ID}_${pos.BELPOS_ID}_${rot.POS_ID}`;
                        const isChecked = this.checkedKeys.has(key);

                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td style="text-align: center;">
                                <input type="checkbox" class="op-checkbox" style="transform: scale(1.3); cursor: pointer;"
                                       data-belnrid="${op.BELNR_ID}" 
                                       data-belposid="${pos.BELPOS_ID}" 
                                       data-posid="${rot.POS_ID}"
                                       onchange="app.toggleOpCheck('${op.BELNR_ID}', '${pos.BELPOS_ID}', '${rot.POS_ID}', this.checked)"
                                       ${isChecked ? 'checked' : ''}>
                            </td>
                            <td><div class="text-bold" style="color: var(--primary);">${op.BELNR_ID}</div></td>
                            <td><div class="text-bold" style="color: var(--primary);">${pos.BELPOS_ID}</div></td>
                            <td><div class="text-bold" style="color: var(--primary);">${rot.POS_TEXT || rot.POS_ID}</div></td>
                            <td><div class="text-bold" style="color: #475569;">${rot.AG_ID}</div></td>
                            <td>
                                <div class="text-bold">${pos.ItemCode} - ${pos.ItemName}</div>
                                <div class="text-muted" style="font-size: 0.85em;">${op.AUFTRAG}</div>
                            </td>
                            <td><span class="badge badge-gray">${pos.PlannedQty}</span></td>
                            <td>
                                <div style="display: flex; flex-direction: column; gap: 4px; min-width: 90px;">
                                    <span class="badge badge-gray" style="width: fit-content;">${total.toFixed(2)}</span>
                                    <div style="width: 100%; background-color: #e2e8f0; border-radius: 4px; height: 6px; overflow: hidden; margin-top: 2px;">
                                        <div style="height: 100%; background-color: ${perc >= 100 ? '#059669' : '#3b82f6'}; width: ${cappedPerc}%; transition: width 0.3s;"></div>
                                    </div>
                                    <span style="font-size: 0.65rem; color: #64748b; text-align: right; margin-top: -2px; font-weight: 600;">${perc.toFixed(1)}%</span>
                                </div>
                            </td>
                            <td><span class="badge badge-gray" style="background-color: #64748b; color: white;"><i class="fa-solid fa-users" style="margin-right: 4px;"></i> ${rot.DistinctUsers || 0}</span></td>
                            <td style="text-align: right;">
                                <button class="btn" onclick="app.abrirApontamento(${op.BELNR_ID}, ${pos.BELPOS_ID}, ${rot.POS_ID})">
                                    <i class="fa-solid fa-play"></i> Iniciar
                                </button>
                            </td>
                        `;
                        fragment.appendChild(tr);
                    });
                });
            }
        });

        tbody.appendChild(fragment);
    },

    toggleOpCheck: function (belnr, belpos, pos, isChecked) {
        const key = `${belnr}_${belpos}_${pos}`;
        if (isChecked) {
            this.checkedKeys.add(key);
        } else {
            this.checkedKeys.delete(key);
            this.selectedOperations = this.selectedOperations.filter(s => !(s.op.BELNR_ID == belnr && s.pos.BELPOS_ID == belpos && s.rot.POS_ID == pos));
        }
    },

    toggleSelectAll: function (el) {
        const checkboxes = document.querySelectorAll('.op-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = el.checked;
            app.toggleOpCheck(cb.dataset.belnrid, cb.dataset.belposid, cb.dataset.posid, el.checked);
        });
    },

    iniciarSelecionadas: function () {
        if (this.checkedKeys.size === 0) {
            this.showToast('Selecione pelo menos uma operação.', 'error');
            return;
        }

        this.selectedOperations = [];
        this.checkedKeys.forEach(key => {
            const parts = key.split('_');
            const belnr = parts[0], belpos = parts[1], posId = parts[2];
            const op = this.opsCache.find(o => o.BELNR_ID == belnr);
            const pos = op ? op.WorkOrderPos.find(p => p.BELPOS_ID == belpos) : null;
            const rot = pos ? pos.WorkorderRouting.find(r => r.POS_ID == posId) : null;
            if (op && pos && rot) this.selectedOperations.push({ op, pos, rot });
        });

        this.abrirApontamentoMultiplo();
    },

    filtrarLista: function () {
        const valOp = document.getElementById('filterOp') ? document.getElementById('filterOp').value : '';
        const valText = document.getElementById('filterText') ? document.getElementById('filterText').value : '';
        this.renderLista(valOp, valText);
    },

    abrirApontamento: function (belnrId, belposId, posId) {
        const op = this.opsCache.find(o => o.BELNR_ID == belnrId);
        const pos = op.WorkOrderPos.find(p => p.BELPOS_ID == belposId);
        const rot = pos.WorkorderRouting.find(r => r.POS_ID == posId);

        this.selectedOperations = [{ op, pos, rot }];
        this.abrirApontamentoMultiplo();
    },

    abrirApontamentoMultiplo: function () {
        this.apontamentosManuais = [];

        this.selectedOperations.forEach(sel => {
            const op = sel.op;
            const pos = sel.pos;
            const operacao = sel.rot;

            // Drafts
            const draftKey = `sancay_drafts_${op.BELNR_ID}_${pos.BELPOS_ID}_${operacao.POS_ID}`;
            const savedDrafts = localStorage.getItem(draftKey);
            if (savedDrafts) {
                try {
                    const drafts = JSON.parse(savedDrafts);
                    drafts.forEach(d => this.apontamentosManuais.push(d));
                } catch (e) { console.error('Erro ler drafts', e); }
            }

            // Existentes
            if (operacao.TimeReceipt && operacao.TimeReceipt.length > 0) {
                const sortedReceipts = [...operacao.TimeReceipt].sort((a, b) => {
                    return new Date(b.UpdateDate || 0) - new Date(a.UpdateDate || 0);
                });
                sortedReceipts.forEach(tr => {
                    this.apontamentosManuais.push({
                        id: tr.LineNum || tr.DocEntry || Math.random(),
                        belnrId: op.BELNR_ID,
                        belposId: pos.BELPOS_ID,
                        posId: operacao.POS_ID,
                        posText: operacao.POS_TEXT || operacao.POS_ID,
                        lote: pos.DistNumber || '',
                        itemCode: pos.ItemCode,
                        itemName: pos.ItemName,
                        colaborador: tr.PersonnelId || tr.PERS_ID || '',
                        operacaoNome: operacao.AG_ID,
                        observacao: tr.Remarks || '',
                        tara: 0,
                        pesoBruto: '',
                        pesoLiquido: tr.QuantityGoodRUoM || tr.Quantity || 0,
                        totalProcesso: tr.QuantityGoodRUoM || tr.Quantity || 0,
                        tempo: tr.Duration || 0,
                        status: 'Finalizado'
                    });
                });
            }
        });

        document.getElementById('tabBtn2').removeAttribute('disabled');
        this.switchTab(2);

        if (this.selectedOperations.length === 1) {
            const sel = this.selectedOperations[0];
            document.getElementById('matOpName').innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px; flex-wrap: wrap;">
                    <span style="font-size: 0.95rem; color: #475569;"><strong>OP:</strong> <span style="color: var(--primary); font-weight: bold; font-size: 1.05rem;">${sel.op.BELNR_ID}</span></span>
                    <span style="color: #cbd5e1;">|</span>
                    <span style="font-size: 0.95rem; color: #475569;"><strong>Pos:</strong> <span style="color: var(--primary); font-weight: bold; font-size: 1.05rem;">${sel.pos.BELPOS_ID}</span></span>
                    <span style="color: #cbd5e1;">|</span>
                    <span style="font-size: 0.95rem; color: #475569;"><strong>Seq:</strong> <span style="color: var(--primary); font-weight: bold; font-size: 1.05rem;">${sel.rot.POS_ID}</span></span>
                    <span style="color: #cbd5e1;">|</span>
                    <span style="font-size: 0.95rem; color: #475569;"><strong>Operação:</strong> <span style="color: #64748b; font-weight: bold; font-size: 1.05rem;">${sel.rot.AG_ID}</span></span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px; flex-wrap: wrap;">
                    <span style="font-size: 0.9rem; color: #64748b;"><strong>Item:</strong> ${sel.pos.ItemCode} - ${sel.pos.ItemName}</span>
                    <span style="color: #cbd5e1;">|</span>
                    <span style="font-size: 0.9rem; color: #64748b;"><strong>Lote:</strong> ${sel.op.AUFTRAG}</span>
                </div>
            `;
        } else {
            document.getElementById('matOpName').innerHTML = `
                <div style="margin-top: 6px; font-size: 1.1rem; color: var(--primary); font-weight: bold; cursor: pointer; display: inline-block; padding: 4px; border-radius: 4px;" onclick="app.abrirListaOpsSelecionadas()" onmouseover="this.style.backgroundColor='#e0f2fe'" onmouseout="this.style.backgroundColor='transparent'" title="Clique para ver a lista de operações">
                    <i class="fa-solid fa-list-check" style="margin-right:5px;"></i> ${this.selectedOperations.length} Operações Selecionadas
                </div>
                <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">
                    Selecione a operação desejada ao adicionar um registro de tempo.
                </div>
            `;
        }

        this.renderApontamentos();
    },

    abrirListaOpsSelecionadas: function() {
        const modal = document.getElementById('modalOpsSelecionadas');
        const container = document.getElementById('listaOpsSelecionadasModal');
        if (!modal || !container) return;
        
        container.innerHTML = '';
        this.selectedOperations.forEach(sel => {
            const row = document.createElement('div');
            row.style.padding = '10px';
            row.style.border = '1px solid #e2e8f0';
            row.style.borderRadius = '6px';
            row.style.backgroundColor = '#f8fafc';
            row.innerHTML = `
                <div style="font-weight:bold; color:var(--primary); font-size: 0.95rem;">OP ${sel.op.BELNR_ID} | Pos ${sel.pos.BELPOS_ID} | Seq ${sel.rot.POS_TEXT || sel.rot.POS_ID}</div>
                <div style="font-size: 0.85rem; color: #475569; margin-top: 2px;">${sel.rot.AG_ID}</div>
                <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;"><strong>Item:</strong> ${sel.pos.ItemCode} - ${sel.pos.ItemName}</div>
            `;
            container.appendChild(row);
        });
        
        modal.classList.add('active');
    },

    abrirModalColaborador: function () {
        document.getElementById('inputPersId').value = '';

        const container = document.getElementById('cardsOpModal');
        if (container) {
            container.innerHTML = '';
            this.selectedOpModalIndex = 0; // Padrão: 0

            this.selectedOperations.forEach((sel, index) => {
                const card = document.createElement('div');
                card.className = 'op-card' + (index === 0 ? ' selected' : '');
                
                // Trunca o nome da operação caso seja muito grande e ajusta o layout para premium
                const opName = sel.rot.BEZ || sel.rot.AG_ID || '';
                
                card.innerHTML = `
                    <div class="op-card-top" style="justify-content: center;">
                        <span class="op-label">OP: ${sel.op.BELNR_ID}/${sel.pos.BELPOS_ID}/${sel.rot.POS_TEXT || sel.rot.POS_ID}</span>
                    </div>
                    <div class="op-card-bot" title="${opName}" style="margin-top: 6px;">${opName}</div>
                `;

                card.onclick = () => {
                    this.selectedOpModalIndex = index;
                    Array.from(container.children).forEach((c, i) => {
                        if (i === index) c.classList.add('selected');
                        else c.classList.remove('selected');
                    });
                };

                container.appendChild(card);
            });
        }

        document.getElementById('modalColaborador').classList.add('active');
    },

    fecharModalColaborador: function () {
        document.getElementById('modalColaborador').classList.remove('active');
    },

    confirmarColaborador: function () {
        const persInput = document.getElementById('inputPersId').value.trim();
        if (!persInput) {
            alert('Informe um colaborador.');
            return;
        }

        if (this.selectedOperations.length === 0) {
            alert('Nenhuma operação selecionada.');
            return;
        }

        const selIndex = this.selectedOpModalIndex !== undefined ? this.selectedOpModalIndex : 0;
        const sel = this.selectedOperations[selIndex] || this.selectedOperations[0];

        this.apontamentosManuais.unshift({
            id: Date.now() + Math.random(),
            belnrId: sel.op.BELNR_ID,
            belposId: sel.pos.BELPOS_ID,
            posId: sel.rot.POS_ID,
            posText: sel.rot.POS_TEXT || sel.rot.POS_ID,
            lote: sel.pos.DistNumber || '',
            itemCode: sel.pos.ItemCode,
            itemName: sel.pos.ItemName,
            colaborador: persInput.split('-')[0].trim(),
            operacaoNome: sel.rot.AG_ID,
            observacao: '', // Observação vazia por padrão
            tipoPeso: 'Coleta',
            tara: 0,
            pesoBruto: '',
            pesoLiquido: 0,
            totalProcesso: 0,
            tempo: 0,
            status: 'Pendente' // Pendente, Iniciado, Pausado, Finalizado
        });

        this.fecharModalColaborador();
        this.saveDrafts();
        this.renderApontamentos();
    },

    renderApontamentos: function () {
        const tbody = document.getElementById('apontamentosTbody');
        tbody.innerHTML = '';
        const hideSaved = document.getElementById('chkOcultarSalvos') && document.getElementById('chkOcultarSalvos').checked;

        let displayedCount = 0;
        this.apontamentosManuais.forEach((reg, index) => {
            if (hideSaved && reg.status === 'Finalizado') return;
            displayedCount++;

            const tr = document.createElement('tr');

            const isDone = reg.status === 'Finalizado';
            const isIniciado = reg.status === 'Iniciado';

            tr.innerHTML = `
                <td>
                    <div style="display: flex; flex-direction: column; gap: 3px; padding: 4px 0;">
                        <div style="font-weight: 700; color: var(--primary); font-size: 0.95rem; margin-bottom: 2px;">OP ${reg.belnrId} / ${reg.belposId} / ${reg.posText || reg.posId}</div>
                        ${reg.lote ? `<div style="font-size: 0.75rem; font-weight: 600; color: #3b82f6;">Lote ${reg.lote}</div>` : ''}
                        <div style="font-size: 0.75rem; font-weight: 600; color: #475569;">${reg.itemCode}</div>
                        <div style="font-size: 0.75rem; font-weight: 600; color: #475569; word-wrap: break-word;">${reg.itemName}</div>
                        <div style="font-size: 0.75rem; font-weight: 600; color: #475569;">${reg.operacaoNome}</div>
                    </div>
                </td>
                <td><span class="badge badge-gray">${reg.colaborador}</span></td>
                
                <td>
                    <select class="form-control" style="width:130px; font-size: 0.8em;" onchange="app.atualizarCampo(${index}, 'observacao', this.value)" ${isDone ? 'disabled' : ''}>
                        <option value="" ${reg.observacao === '' ? 'selected' : ''}>-- Nenhum --</option>
                        ${this.stopReasonsCache.map(r => `<option value="${r.Info}" ${reg.observacao === r.Info ? 'selected' : ''}>${r.ID} - ${r.Info}</option>`).join('')}
                    </select>
                </td>
                
                <td>
                    <select class="form-control" style="width:100px; font-size: 0.8em;" onchange="app.atualizarCampo(${index}, 'tipoPeso', this.value)" ${isDone ? 'disabled' : ''}>
                        <option value="Coleta" ${reg.tipoPeso === 'Coleta' ? 'selected' : ''}>Coleta</option>
                        <option value="Devolução" ${reg.tipoPeso === 'Devolução' ? 'selected' : ''}>Devolução</option>
                    </select>
                </td>
                
                <td style="padding: 10px;">
                    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 220px; margin: 0 auto;">
                        <div style="display: flex; gap: 8px;">
                            <div style="flex: 1;">
                                <div style="font-size: 0.65em; color: #94a3b8; font-weight: bold; margin-bottom: 2px;">TARA</div>
                                <input type="number" step="0.01" class="input-weigh" id="tara_${index}" value="${reg.tara}" oninput="app.calcLiquidoVisor(${index})" style="width: 100%; text-align: center; font-size: 0.9em; padding: 6px;" ${isDone ? 'disabled' : ''}>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 0.65em; color: #94a3b8; font-weight: bold; margin-bottom: 2px;">BRUTO</div>
                                <input type="number" step="0.01" class="input-weigh" id="bruto_${index}" value="${reg.pesoBruto}" oninput="app.calcLiquidoVisor(${index})" style="width: 100%; text-align: center; font-size: 0.9em; padding: 6px;" ${isDone ? 'disabled' : ''}>
                            </div>
                        </div>
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.7em; color: #94a3b8; font-weight: bold;">LÍQUIDO</span>
                            <span id="liq_${index}" style="font-size: 1.1em; font-weight: bold; color: var(--primary);">${reg.pesoLiquido.toFixed(2)}</span>
                            <button style="border:none; background:transparent; cursor:${isDone ? 'not-allowed' : 'pointer'}; opacity: ${isDone ? '0.5' : '1'};" onclick="app.lerBalanca(${index})" title="Registrar Pesagem" ${isDone ? 'disabled' : ''}>
                                <i class="fa-solid fa-scale-balanced" style="color:#64748b; font-size:1.1em; transition: color 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='#64748b'"></i>
                            </button>
                        </div>
                    </div>
                </td>
                
                <td style="text-align: right;">
                    <span class="badge badge-blue" style="font-size: 0.9em;">${reg.totalProcesso.toFixed(2)}</span>
                </td>
                
                <td style="text-align: right;">
                    <input type="number" step="1" class="input-weigh" id="tempo_${index}" value="${reg.tempo}" oninput="app.atualizarCampo(${index}, 'tempo', this.value); app.checkSavable(${index})" style="width:75px; text-align: center;" ${isDone ? 'disabled' : ''}>
                </td>
                
                <td style="text-align: center;">
                    ${isDone
                    ? `<span class="badge badge-gray"><i class="fa-solid fa-check"></i> Salvo</span>`
                    : `<button id="btn_save_${index}" class="btn btn-success" onclick="app.finalizarRegistro(${index})" style="padding: 6px 12px; font-size: 0.8rem;"><i class="fa-solid fa-check"></i> Salvar</button>`
                }
                </td>
                
                <td style="text-align: center; white-space: nowrap;">
                    ${!isDone ? `
                        <button style="background-color: #10b981; border: none; color: white; padding: 6px 10px; border-radius: 6px; cursor: pointer; margin: 0 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: background-color 0.2s;" onclick="app.iniciarTempo(${index})" title="Iniciar" onmouseover="this.style.backgroundColor='#059669'" onmouseout="this.style.backgroundColor='#10b981'"><i class="fa-solid fa-play" style="font-size: 1rem;"></i></button>
                        <button style="background-color: #f59e0b; border: none; color: white; padding: 6px 10px; border-radius: 6px; cursor: pointer; margin: 0 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: background-color 0.2s;" onclick="app.pararTempo(${index})" title="Parar" onmouseover="this.style.backgroundColor='#d97706'" onmouseout="this.style.backgroundColor='#f59e0b'"><i class="fa-solid fa-stop" style="font-size: 1rem;"></i></button>
                        <button style="background-color: #ef4444; border: none; color: white; padding: 6px 10px; border-radius: 6px; cursor: pointer; margin: 0 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: background-color 0.2s;" onclick="app.removerRegistro(${index})" title="Remover" onmouseover="this.style.backgroundColor='#b91c1c'" onmouseout="this.style.backgroundColor='#ef4444'"><i class="fa-solid fa-trash" style="font-size: 1rem;"></i></button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
            if (!isDone) {
                this.checkSavable(index);
            }
        });

        if (displayedCount === 0) {
            tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; padding:40px; color:#64748b;">Nenhum registro a exibir. ${hideSaved ? '(Os registros salvos estão ocultos)' : ''}</td></tr>`;
        }
    },

    checkSavable: function (index) {
        const reg = this.apontamentosManuais[index];
        if (reg.status === 'Finalizado') return;

        const btn = document.getElementById(`btn_save_${index}`);
        if (!btn) return;

        const isValidQty = (parseFloat(reg.totalProcesso) > 0 || parseFloat(reg.pesoLiquido) > 0);
        const isValidTime = parseFloat(reg.tempo) > 0;

        if (isValidQty && isValidTime) {
            btn.removeAttribute('disabled');
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.title = '';
        } else {
            btn.setAttribute('disabled', 'true');
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.title = 'Preencha Quantidade (Líquido/Total) e Tempo para salvar';
        }
    },

    atualizarCampo: function (index, campo, valor) {
        if (campo === 'tempo') valor = parseInt(valor) || 0;
        this.apontamentosManuais[index][campo] = valor;
        this.saveDrafts();
    },

    calcLiquidoVisor: function (index) {
        const reg = this.apontamentosManuais[index];
        const taraStr = document.getElementById(`tara_${index}`).value;
        const brutoStr = document.getElementById(`bruto_${index}`).value;

        const tara = parseFloat(taraStr) || 0;
        let bruto = parseFloat(brutoStr);
        let liq = 0;

        if (!isNaN(bruto) && brutoStr.trim() !== '') {
            liq = bruto - tara;
        } else {
            bruto = ''; // Para não salvar 0 se estiver vazio
        }

        // Atualiza a tela instantaneamente
        document.getElementById(`liq_${index}`).innerText = liq.toFixed(2);

        // Mantém as variáveis gravadas caso ocorra um re-render por timer
        reg.tara = tara;
        reg.pesoBruto = bruto;
        reg.pesoLiquido = liq;

        this.saveDrafts();
        this.checkSavable(index);
    },

    lerBalanca: async function (index) {
        const reg = this.apontamentosManuais[index];
        const taraStr = document.getElementById(`tara_${index}`).value;
        const brutoStr = document.getElementById(`bruto_${index}`).value;

        const tara = parseFloat(taraStr) || 0;

        if (tara < 0.01) {
            alert("O campo Tara (Kg) deve ser maior ou igual a 0,01 para realizar a pesagem.");
            return;
        }

        let bruto = parseFloat(brutoStr);
        if (isNaN(bruto) || brutoStr === '') {
            try {
                bruto = await readWeightFromAPI("BALANCA_TESTE");
            } catch (e) {
                alert("Falha de leitura. Digite manualmente.");
                return;
            }
        }

        const liq = bruto - tara;
        reg.pesoLiquido = liq;

        if (reg.tipoPeso === 'Coleta') {
            reg.totalProcesso += liq;
        } else {
            reg.totalProcesso -= liq;
        }

        // Zera os campos após o registro conforme especificação
        reg.tara = 0;
        reg.pesoBruto = '';

        this.saveDrafts();
        this.renderApontamentos();
    },

    removerRegistro: function (index) {
        if (confirm("Remover apontamento não salvo?")) {
            this.apontamentosManuais.splice(index, 1);
            this.saveDrafts();
            this.renderApontamentos();
        }
    },

    finalizarRegistro: async function (index) {
        const reg = this.apontamentosManuais[index];

        if (reg.pesoLiquido <= 0 && reg.totalProcesso <= 0) {
            alert('A quantidade deve ser maior que zero.');
            return;
        }

        if (reg.tempo < 0) {
            alert('O tempo não pode ser negativo.');
            return;
        }

        if (!confirm("Confirmar a gravação deste apontamento?")) return;

        const hoje = new Date();
        const docDate = hoje.toISOString().split('T')[0];

        const payload = {
            "DocEntry": reg.belnrId,
            "LineNumber": reg.belposId,
            "LineNumber2": parseInt(reg.posId, 10),
            "Duration": reg.tempo,
            "PersonnelId": reg.colaborador,
            "DocDate": docDate,
            "QuantityGoodRUoM": reg.totalProcesso,
            "CloseEntry": false,
            "ManualBooking": false,
            "Remarks": reg.observacao
        };

        api.serviceLayerPost('/odata4/v1/TimeReceipt', payload, (sErr, result) => {
            if (sErr) {
                console.error('Erro no apontamento Service Layer (Tempo/Produção):', sErr, result);
                let errorMsg = 'Erro ao gravar apontamento. Verifique o console.';
                if (result) {
                    try {
                        const resObj = typeof result === 'string' ? JSON.parse(result) : result;
                        if (resObj && resObj.error && resObj.error.message && resObj.error.message.value) {
                            errorMsg = resObj.error.message.value;
                        } else if (resObj && resObj.error && resObj.error.message && typeof resObj.error.message === 'string') {
                            errorMsg = resObj.error.message;
                        } else if (resObj && resObj.error && typeof resObj.error === 'string') {
                            errorMsg = resObj.error;
                        } else if (typeof resObj === 'string') {
                            errorMsg = resObj;
                        }
                    } catch (e) {
                        if (typeof result === 'string' && result.trim().length > 0) {
                            errorMsg = result;
                        }
                    }
                }
                app.showToast(errorMsg, 'error');
            } else {
                reg.status = 'Finalizado';
                app.saveDrafts();

                let successMsg = 'Apontamento salvo com sucesso!';
                if (result) {
                    try {
                        const resObj = typeof result === 'string' ? JSON.parse(result) : result;
                        if (resObj && resObj.values && resObj.values.length > 0 && resObj.values[0].TimeReceiptEntry) {
                            successMsg = `Registro de Tempo ${resObj.values[0].TimeReceiptEntry} criado com sucesso.`;
                        } else if (resObj && resObj.SystemNumber && resObj.SystemNumber.length > 0) {
                            successMsg = `Registro de Tempo ${resObj.SystemNumber[0]} criado com sucesso.`;
                        }
                    } catch (e) { }
                }

                app.showToast(successMsg, 'success');
                app.renderApontamentos();
            }
        });
    },

    saveDrafts: function () {
        if (this.selectedOperations.length === 0) return;

        // Remove current drafts for selected ops
        this.selectedOperations.forEach(sel => {
            const draftKey = `sancay_drafts_${sel.op.BELNR_ID}_${sel.pos.BELPOS_ID}_${sel.rot.POS_ID}`;
            localStorage.removeItem(draftKey);
        });

        // Save pending drafts grouped by their specific ops
        const pending = this.apontamentosManuais.filter(r => r.status !== 'Finalizado');
        pending.forEach(p => {
            const draftKey = `sancay_drafts_${p.belnrId}_${p.belposId}_${p.posId}`;
            let existing = JSON.parse(localStorage.getItem(draftKey) || '[]');
            existing.push(p);
            localStorage.setItem(draftKey, JSON.stringify(existing));
        });
    },

    finalizarOp: function () {
        if (confirm(`Deseja realmente fechar o item da OP ${this.currentOp.AUFTRAG}?`)) {
            const payload = {
                Closed: true
            };

            const endpoint = `/odata4/v1/WorkOrderPos(${this.currentOp.BELNR_ID},${this.currentPos.BELPOS_ID})`;

            api.serviceLayerPut(endpoint, payload, (err, result) => {
                if (err) {
                    console.error('Erro ao finalizar OP:', err, JSON.stringify(result, null, 2));
                    app.showToast('Falha ao finalizar o item.', 'error');
                } else {
                    app.showToast('Item da OP finalizado com sucesso!', 'success');
                    app.voltarParaLista();
                }
            });
        }
    },

    showToast: function (msg, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? '#ef4444' : '#10b981';
        toast.style.cssText = `position:fixed; bottom:20px; right:20px; background-color:${bgColor}; color:white; padding:15px 25px; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); font-weight:bold; z-index:9999; opacity:0; transition:all 0.3s ease; transform:translateY(20px);`;
        toast.innerHTML = `<i class="fa-solid fa-${type === 'error' ? 'triangle-exclamation' : 'check'}"></i> <span style="margin-left:8px;">${msg}</span>`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

window.app = app;
document.addEventListener('DOMContentLoaded', () => {
    import('./interface.js').then(module => {
        module.buildUI();
        app.init();
    });
});
