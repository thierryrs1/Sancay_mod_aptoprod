import { api } from './api.js';
import { readWeightFromAPI } from './scale.js';

export const app = {
    opsCache: [],
    listaPlana: [],
    stopReasonsCache: [],
    persResourcesCache: [],
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
        this.loadPersResources();
        this.buildListaPlana();
        this.renderLista();
    },

    loadPersResources: async function () {
        try {
            const data = await api.getPersResources();
            this.persResourcesCache = Array.isArray(data) ? data : [];
        } catch (e) {
            console.error("Falha ao carregar recursos dos colaboradores.", e);
        }
    },

    loadColaboradores: async function () {
        try {
            const persData = await api.getColaboradores();
            this.colaboradoresLista = Array.isArray(persData) ? persData : [];
            this.renderPersList();
        } catch (e) {
            console.error("Falha ao carregar lista de colaboradores.", e);
        }
    },

    renderPersList: function () {
        const datalist = document.getElementById('persList');
        if (datalist && this.colaboradoresLista && this.colaboradoresLista.length > 0) {
            datalist.innerHTML = '';
            this.colaboradoresLista.forEach(p => {
                if (!p) return;
                const id = String(p.Code || p.PERS_ID || p.PersID || p.id || p.ID || '').trim();
                const name = String(p.NAME || p.Name || p.Nome || p.Description || '').trim();
                
                const opt = document.createElement('option');
                opt.value = name ? `${id} - ${name}` : id;
                opt.textContent = name ? `${name} (${id})` : id;
                datalist.appendChild(opt);
            });
        }
    },

    getColaboradorNome: function (id) {
        if (!id || !this.colaboradoresLista) return '';
        const cleanId = String(id).trim().toLowerCase();
        const numId = parseInt(cleanId, 10);
        try {
            const found = this.colaboradoresLista.find(p => {
                if (!p) return false;
                const pId = String(p.Code || p.PERS_ID || p.PersID || p.id || p.ID || '').trim().toLowerCase();
                const pNum = parseInt(pId, 10);
                if (pId === cleanId) return true;
                if (!isNaN(numId) && !isNaN(pNum) && numId === pNum) return true;
                const name = String(p.NAME || p.Name || p.Nome || p.Description || '').trim().toLowerCase();
                if (name === cleanId) return true;
                return false;
            });
            if (!found) return '';
            if (typeof found === 'string' || typeof found === 'number') return '';
            return found.NAME || found.Name || found.Nome || found.Description || '';
        } catch (e) {
            return '';
        }
    },

    getRecursoNome: function (id) {
        if (!id || !this.persResourcesCache) return '';
        const cleanId = String(id).trim().toLowerCase();
        try {
            const found = this.persResourcesCache.find(r => {
                if (!r) return false;
                const rId = String(r.APLATZ_ID || '').trim().toLowerCase();
                return rId === cleanId;
            });
            if (!found) return '';
            return found.BEZ || '';
        } catch (e) {
            return '';
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

    renderLista: function (filtroOp = '', filtroPos = '', filtroText = '') {
        const tbody = document.getElementById('listaTbody');
        tbody.innerHTML = '';

        const fOp = filtroOp.trim();
        const fPos = filtroPos.trim();
        const fText = filtroText.toLowerCase().trim();

        const termosOp = fOp ? fOp.split(/[\s,]+/).filter(t => t.length > 0) : [];
        const termosPos = fPos ? fPos.split(/[\s,]+/).filter(t => t.length > 0) : [];

        const fragment = document.createDocumentFragment();

        this.opsCache.forEach(op => {
            if (op.WorkOrderPos) {
                op.WorkOrderPos.forEach(pos => {

                    // 1. Filtro estrito por OP (OR lógico: se digitar "50, 12", mostra a OP 50 e a OP 12)
                    if (termosOp.length > 0) {
                        const strBelnr = String(op.BELNR_ID);
                        if (!termosOp.includes(strBelnr)) return;
                    }

                    // 2. Filtro estrito por Posição (BELPOS_ID) (OR lógico: se digitar "10, 20", mostra posições 10 e 20)
                    if (termosPos.length > 0) {
                        const strBelpos = String(pos.BELPOS_ID);
                        if (!termosPos.includes(strBelpos)) return;
                    }

                    // Ignorar posições que não possuem roteiro (WorkorderRouting)
                    if (!pos.WorkorderRouting || pos.WorkorderRouting.length === 0) return;

                    // Calcula Qtd Atual (Produzida)
                    let myProducedQty = pos.CurrentQuantity || 0;
                    if (myProducedQty === 0 && pos.Receipt && pos.Receipt.length > 0) {
                        myProducedQty = pos.Receipt.reduce((acc, r) => acc + r.Quantity, 0);
                    }

                    pos.WorkorderRouting.forEach(rot => {
                        // 3. Filtro de Texto (Item, Descrição, Ordem, Lote, Operação/Posto de Trabalho)
                        if (fText) {
                            const loteAux = `${op.DistNumber || ''} ${pos.DistNumber || ''}`;
                            const rotAux = `${rot.AG_ID || ''} ${rot.BEZ || ''} ${rot.APLATZ_ID || ''} ${rot.POS_TEXT || ''}`;
                            const searchableText = `${op.AUFTRAG || ''} ${pos.ItemCode || ''} ${pos.ItemName || ''} ${loteAux} ${rotAux}`.toLowerCase();
                            if (!searchableText.includes(fText)) return;
                        }

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
                            <td>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <span class="text-bold" style="color: #475569;">${rot.AG_ID}</span>
                                    ${rot.LastOperation === 'Y' ? `<i class="fa-solid fa-circle" style="color: #2563eb; font-size: 0.55rem;" title="Última Operação"></i>` : ''}
                                </div>
                            </td>
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
                            <td>
                                <div style="display: flex; gap: 4px; align-items: center;">
                                    <span class="badge badge-gray" style="background-color: #64748b; color: white;"><i class="fa-solid fa-users" style="margin-right: 4px;"></i> ${rot.DistinctUsers || 0}</span>
                                    ${(rot.TimeReceiptRunning && rot.TimeReceiptRunning.length > 0) ? `<span class="badge" style="background-color: #10b981; color: white; padding: 4px 8px; font-size: 0.75rem; border-radius: 6px;" title="${rot.TimeReceiptRunning.length} colaborador(es) em andamento"><i class="fa-solid fa-play" style="font-size: 0.65rem; margin-right: 2px;"></i> ${rot.TimeReceiptRunning.length}</span>` : ''}
                                </div>
                            </td>
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
        const valPos = document.getElementById('filterPos') ? document.getElementById('filterPos').value : '';
        const valText = document.getElementById('filterText') ? document.getElementById('filterText').value : '';
        this.renderLista(valOp, valPos, valText);
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

            // 1. Apontamentos em Andamento (TimeReceiptRunning) vindos da API
            if (operacao.TimeReceiptRunning && operacao.TimeReceiptRunning.length > 0) {
                operacao.TimeReceiptRunning.forEach(trr => {
                    const recId = trr.ResourceId || trr.APLATZ_ID || '';
                    this.apontamentosManuais.push({
                        id: 'running_' + trr.BUCHNR_ID + '_' + Math.random(),
                        systemNumber: trr.BUCHNR_ID,
                        belnrId: op.BELNR_ID,
                        belposId: pos.BELPOS_ID,
                        posId: operacao.POS_ID,
                        posText: operacao.POS_TEXT || operacao.POS_ID,
                        lastOperation: operacao.LastOperation || 'N',
                        lote: pos.DistNumber || '',
                        itemCode: pos.ItemCode,
                        itemName: pos.ItemName,
                        colaborador: trr.PERS_ID || '',
                        colaboradorNome: trr.DisplayName || this.getColaboradorNome(trr.PERS_ID) || '',
                        recurso: recId,
                        recursoNome: this.getRecursoNome(recId) || '',
                        operacaoNome: operacao.AG_ID,
                        observacao: '',
                        tipoPeso: 'Coleta',
                        tara: 0,
                        pesoBruto: '',
                        pesoLiquido: 0,
                        totalProcesso: 0,
                        tempo: 0,
                        startDateTime: trr.StartDateTime || '',
                        status: 'Iniciado'
                    });
                });
            }

            // 2. Drafts locais em cache (apenas registros que não estejam duplicados)
            const draftKey = `sancay_drafts_${op.BELNR_ID}_${pos.BELPOS_ID}_${operacao.POS_ID}`;
            const savedDrafts = localStorage.getItem(draftKey);
            if (savedDrafts) {
                try {
                    const drafts = JSON.parse(savedDrafts);
                    drafts.forEach(d => {
                        if (d.lastOperation === undefined) {
                            d.lastOperation = operacao.LastOperation || 'N';
                        }
                        const alreadyAdded = this.apontamentosManuais.some(m => 
                            (m.systemNumber && d.systemNumber && m.systemNumber == d.systemNumber) ||
                            (m.status === 'Iniciado' && d.status === 'Iniciado' && m.colaborador == d.colaborador && m.posId == d.posId)
                        );
                        if (!alreadyAdded) {
                            this.apontamentosManuais.push(d);
                        }
                    });
                } catch (e) { console.error('Erro ler drafts', e); }
            }

            // 3. Apontamentos finalizados existentes (TimeReceipt)
            if (operacao.TimeReceipt && operacao.TimeReceipt.length > 0) {
                const sortedReceipts = [...operacao.TimeReceipt].sort((a, b) => {
                    return new Date(b.UpdateDate || 0) - new Date(a.UpdateDate || 0);
                });
                sortedReceipts.forEach(tr => {
                    const recId = tr.ResourceId || tr.APLATZ_ID || '';
                    this.apontamentosManuais.push({
                        id: tr.LineNum || tr.DocEntry || Math.random(),
                        belnrId: op.BELNR_ID,
                        belposId: pos.BELPOS_ID,
                        posId: operacao.POS_ID,
                        posText: operacao.POS_TEXT || operacao.POS_ID,
                        lastOperation: operacao.LastOperation || 'N',
                        lote: pos.DistNumber || '',
                        itemCode: pos.ItemCode,
                        itemName: pos.ItemName,
                        colaborador: tr.PersonnelId || tr.PERS_ID || '',
                        colaboradorNome: this.getColaboradorNome(tr.PersonnelId || tr.PERS_ID) || '',
                        recurso: recId,
                        recursoNome: this.getRecursoNome(recId) || '',
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

    abrirListaOpsSelecionadas: function () {
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

    persDropdownIndex: -1,

    showPersDropdown: function () {
        const input = document.getElementById('inputPersId');
        const query = input ? input.value.trim().toLowerCase() : '';
        this.renderPersDropdown(query);
    },

    hidePersDropdown: function () {
        const dropdown = document.getElementById('persDropdown');
        if (dropdown) dropdown.classList.remove('active');
        this.persDropdownIndex = -1;
    },

    onPersInput: function (e) {
        const query = e.target.value.trim().toLowerCase();
        this.renderPersDropdown(query);
        this.onColaboradorChanged();
    },

    renderPersDropdown: function (query) {
        const dropdown = document.getElementById('persDropdown');
        if (!dropdown || !this.colaboradoresLista) return;

        let filtered = this.colaboradoresLista;
        if (query) {
            filtered = this.colaboradoresLista.filter(p => {
                if (!p) return false;
                const id = String(p.Code || p.PERS_ID || p.PersID || p.id || p.ID || '').toLowerCase();
                const name = String(p.NAME || p.Name || p.Nome || p.Description || '').toLowerCase();
                return id.includes(query) || name.includes(query);
            });
        }

        dropdown.innerHTML = '';
        this.persDropdownIndex = -1;

        if (filtered.length === 0) {
            const noRes = document.createElement('div');
            noRes.className = 'autocomplete-item';
            noRes.style.color = '#94a3b8';
            noRes.style.cursor = 'default';
            noRes.textContent = 'Nenhum colaborador encontrado';
            dropdown.appendChild(noRes);
            dropdown.classList.add('active');
            return;
        }

        filtered.forEach((p, index) => {
            const id = String(p.Code || p.PERS_ID || p.PersID || p.id || p.ID || '').trim();
            const name = String(p.NAME || p.Name || p.Nome || p.Description || '').trim();
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.setAttribute('data-id', id);
            item.setAttribute('data-name', name);
            item.setAttribute('data-index', index);
            item.innerHTML = `<span class="badge-pers-id">${id}</span> <span>${name}</span>`;

            item.onmousedown = (ev) => {
                ev.preventDefault();
                this.selectPersItem(id, name);
            };

            dropdown.appendChild(item);
        });

        dropdown.classList.add('active');
    },

    selectPersItem: function (id, name) {
        const input = document.getElementById('inputPersId');
        if (input) {
            input.value = name ? `${id} - ${name}` : id;
        }
        this.hidePersDropdown();
        this.onColaboradorChanged();
    },

    onPersKeydown: function (e) {
        const dropdown = document.getElementById('persDropdown');
        if (!dropdown || !dropdown.classList.contains('active')) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                this.showPersDropdown();
            }
            return;
        }

        const items = dropdown.querySelectorAll('.autocomplete-item:not([style*="cursor: default"])');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.persDropdownIndex = (this.persDropdownIndex + 1) % items.length;
            this.highlightPersDropdownItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.persDropdownIndex = (this.persDropdownIndex - 1 + items.length) % items.length;
            this.highlightPersDropdownItem(items);
        } else if (e.key === 'Enter') {
            if (this.persDropdownIndex >= 0 && this.persDropdownIndex < items.length) {
                e.preventDefault();
                const sel = items[this.persDropdownIndex];
                const id = sel.getAttribute('data-id');
                const name = sel.getAttribute('data-name');
                this.selectPersItem(id, name);
            }
        } else if (e.key === 'Escape') {
            this.hidePersDropdown();
        }
    },

    highlightPersDropdownItem: function (items) {
        items.forEach((it, i) => {
            if (i === this.persDropdownIndex) {
                it.classList.add('selected');
                it.scrollIntoView({ block: 'nearest' });
            } else {
                it.classList.remove('selected');
            }
        });
    },

    recursoDropdownIndex: -1,

    getRecursosDisponiveis: function () {
        if (!this.persResourcesCache || this.persResourcesCache.length === 0) return [];
        const inputEl = document.getElementById('inputPersId');
        const persInput = inputEl ? inputEl.value.trim() : '';

        let colabId = persInput;
        if (persInput.includes('-')) {
            colabId = persInput.split('-')[0].trim();
        } else if (this.colaboradoresLista && this.colaboradoresLista.length > 0) {
            const cleanSearch = persInput.toLowerCase();
            const found = this.colaboradoresLista.find(p => {
                if (!p) return false;
                const name = String(p.NAME || p.Name || p.Nome || p.Description || '').trim().toLowerCase();
                const id = String(p.Code || p.PERS_ID || p.PersID || p.id || p.ID || '').trim().toLowerCase();
                return id === cleanSearch || name === cleanSearch || name.startsWith(cleanSearch) || name.includes(cleanSearch);
            });
            if (found) {
                colabId = String(found.Code || found.PERS_ID || found.PersID || found.id || found.ID).trim();
            }
        }

        const cleanColabId = String(colabId).trim();
        const numColabId = parseInt(cleanColabId, 10);

        // 1. Filtrar pelo colaborador
        let recursosColab = [];
        if (cleanColabId) {
            recursosColab = this.persResourcesCache.filter(r => {
                const rPers = String(r.PERS_ID || '').trim();
                const rNum = parseInt(rPers, 10);
                return rPers === cleanColabId || (!isNaN(numColabId) && !isNaN(rNum) && numColabId === rNum);
            });
        } else {
            recursosColab = this.persResourcesCache;
        }

        // 2. Operacao selecionada no modal (para cruzar com GRUPPE ou APLATZ_ID)
        const selIndex = this.selectedOpModalIndex !== undefined ? this.selectedOpModalIndex : 0;
        const sel = (this.selectedOperations && this.selectedOperations[selIndex]) ? this.selectedOperations[selIndex] : (this.selectedOperations ? this.selectedOperations[0] : null);
        const opAplatz = sel && sel.rot ? String(sel.rot.APLATZ_ID || '').trim().toLowerCase() : '';

        // 3. Filtrar recursos que pertencem ao grupo da rota (GRUPPE === opAplatz) ou sao o proprio recurso (APLATZ_ID === opAplatz)
        let recursosFiltrados = recursosColab;
        if (opAplatz) {
            const matchOp = recursosColab.filter(r => {
                const rAplatz = String(r.APLATZ_ID || '').trim().toLowerCase();
                const rGruppe = String(r.GRUPPE || r.Gruppe || r.APLATZGRUPPE || r.RECURSO_GRUPO || '').trim().toLowerCase();
                return rAplatz === opAplatz || (rGruppe && rGruppe === opAplatz);
            });
            if (matchOp.length > 0) {
                recursosFiltrados = matchOp;
            }
        }

        const distinct = [];
        const seen = new Set();
        recursosFiltrados.forEach(r => {
            const id = String(r.APLATZ_ID || '').trim();
            const desc = String(r.BEZ || '').trim();
            if (id && !seen.has(id)) {
                seen.add(id);
                distinct.push({ id, desc });
            }
        });
        return distinct;
    },

    showRecursoDropdown: function () {
        const input = document.getElementById('inputRecursoId');
        const query = input ? input.value.trim().toLowerCase() : '';
        this.renderRecursoDropdown(query);
    },

    hideRecursoDropdown: function () {
        const dropdown = document.getElementById('recursoDropdown');
        if (dropdown) dropdown.classList.remove('active');
        this.recursoDropdownIndex = -1;
    },

    onRecursoInput: function (e) {
        const query = e.target.value.trim().toLowerCase();
        this.renderRecursoDropdown(query);
    },

    renderRecursoDropdown: function (query) {
        const dropdown = document.getElementById('recursoDropdown');
        if (!dropdown) return;

        const available = this.getRecursosDisponiveis();

        let filtered = available;
        if (query) {
            filtered = available.filter(r => {
                const id = r.id.toLowerCase();
                const desc = r.desc.toLowerCase();
                return id.includes(query) || desc.includes(query);
            });
        }

        dropdown.innerHTML = '';
        this.recursoDropdownIndex = -1;

        if (filtered.length === 0) {
            const noRes = document.createElement('div');
            noRes.className = 'autocomplete-item';
            noRes.style.color = '#94a3b8';
            noRes.style.cursor = 'default';
            noRes.textContent = available.length === 0 ? 'Nenhum recurso vinculado a esta operação' : 'Nenhum recurso encontrado';
            dropdown.appendChild(noRes);
            dropdown.classList.add('active');
            return;
        }

        filtered.forEach((r, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.setAttribute('data-id', r.id);
            item.setAttribute('data-name', r.desc);
            item.setAttribute('data-index', index);
            item.innerHTML = `<span class="badge-resource-id">${r.id}</span> <span>${r.desc}</span>`;

            item.onmousedown = (ev) => {
                ev.preventDefault();
                this.selectRecursoItem(r.id, r.desc);
            };

            dropdown.appendChild(item);
        });

        dropdown.classList.add('active');
    },

    selectRecursoItem: function (id, desc) {
        const input = document.getElementById('inputRecursoId');
        if (input) {
            input.value = desc ? `${id} - ${desc}` : id;
        }
        this.hideRecursoDropdown();
    },

    onRecursoKeydown: function (e) {
        const dropdown = document.getElementById('recursoDropdown');
        if (!dropdown || !dropdown.classList.contains('active')) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                this.showRecursoDropdown();
            }
            return;
        }

        const items = dropdown.querySelectorAll('.autocomplete-item:not([style*="cursor: default"])');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.recursoDropdownIndex = (this.recursoDropdownIndex + 1) % items.length;
            this.highlightRecursoDropdownItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.recursoDropdownIndex = (this.recursoDropdownIndex - 1 + items.length) % items.length;
            this.highlightRecursoDropdownItem(items);
        } else if (e.key === 'Enter') {
            if (this.recursoDropdownIndex >= 0 && this.recursoDropdownIndex < items.length) {
                e.preventDefault();
                const sel = items[this.recursoDropdownIndex];
                const id = sel.getAttribute('data-id');
                const desc = sel.getAttribute('data-name');
                this.selectRecursoItem(id, desc);
            }
        } else if (e.key === 'Escape') {
            this.hideRecursoDropdown();
        }
    },

    highlightRecursoDropdownItem: function (items) {
        items.forEach((it, i) => {
            if (i === this.recursoDropdownIndex) {
                it.classList.add('selected');
                it.scrollIntoView({ block: 'nearest' });
            } else {
                it.classList.remove('selected');
            }
        });
    },

    onColaboradorChanged: function () {
        const inputRecurso = document.getElementById('inputRecursoId');
        if (!inputRecurso) return;

        const available = this.getRecursosDisponiveis();

        if (available.length === 1) {
            const r = available[0];
            inputRecurso.value = r.desc ? `${r.id} - ${r.desc}` : r.id;
        } else if (available.length === 0) {
            inputRecurso.value = '';
            inputRecurso.placeholder = 'Nenhum recurso vinculado';
        } else {
            inputRecurso.value = '';
            inputRecurso.placeholder = 'Digite o código ou nome do recurso...';
        }
        this.hideRecursoDropdown();
    },

    abrirModalColaborador: function () {
        document.getElementById('inputPersId').value = '';
        this.hidePersDropdown();

        const inputRecurso = document.getElementById('inputRecursoId');
        if (inputRecurso) {
            inputRecurso.value = '';
            inputRecurso.placeholder = 'Digite o código ou nome do recurso...';
        }
        this.hideRecursoDropdown();

        if (!this.persResourcesCache || this.persResourcesCache.length === 0) {
            this.loadPersResources();
        }

        if (!this.colaboradoresLista || this.colaboradoresLista.length === 0) {
            this.loadColaboradores();
        }

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
                        <span class="op-label">${sel.op.BELNR_ID}/${sel.pos.BELPOS_ID}/${sel.rot.POS_TEXT || sel.rot.POS_ID}</span>
                    </div>
                    <div class="op-card-bot" title="${opName}" style="margin-top: 6px;">${opName}</div>
                `;

                card.onclick = () => {
                    this.selectedOpModalIndex = index;
                    Array.from(container.children).forEach((c, i) => {
                        if (i === index) c.classList.add('selected');
                        else c.classList.remove('selected');
                    });
                    this.onColaboradorChanged();
                };

                container.appendChild(card);
            });
        }

        document.getElementById('modalColaborador').classList.add('active');
        setTimeout(() => {
            const input = document.getElementById('inputPersId');
            if (input) input.focus();
        }, 100);
    },

    fecharModalColaborador: function () {
        this.hidePersDropdown();
        this.hideRecursoDropdown();
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

        let colabId = persInput;
        let colabNome = '';
        if (persInput.includes('-')) {
            const parts = persInput.split('-');
            colabId = parts[0].trim();
            colabNome = parts.slice(1).join('-').trim();
        } else {
            const cleanSearch = persInput.toLowerCase();
            const found = (this.colaboradoresLista || []).find(p => {
                if (!p) return false;
                const name = String(p.NAME || p.Name || p.Nome || p.Description || '').trim().toLowerCase();
                const id = String(p.Code || p.PERS_ID || p.PersID || p.id || p.ID || '').trim().toLowerCase();
                return id === cleanSearch || name === cleanSearch || name.startsWith(cleanSearch) || name.includes(cleanSearch);
            });
            if (found) {
                colabId = String(found.Code || found.PERS_ID || found.PersID || found.id || found.ID).trim();
                colabNome = String(found.NAME || found.Name || found.Nome || found.Description || '').trim();
            } else {
                colabNome = this.getColaboradorNome(colabId);
            }
        }

        const inputRecurso = document.getElementById('inputRecursoId');
        const recursoInput = inputRecurso ? inputRecurso.value.trim() : '';
        let recursoSelecionado = recursoInput;
        let recursoTexto = '';
        if (recursoInput.includes('-')) {
            const parts = recursoInput.split('-');
            recursoSelecionado = parts[0].trim();
            recursoTexto = parts.slice(1).join('-').trim();
        } else if (recursoInput) {
            recursoTexto = this.getRecursoNome(recursoSelecionado);
        }

        this.apontamentosManuais.unshift({
            id: Date.now() + Math.random(),
            belnrId: sel.op.BELNR_ID,
            belposId: sel.pos.BELPOS_ID,
            posId: sel.rot.POS_ID,
            posText: sel.rot.POS_TEXT || sel.rot.POS_ID,
            lastOperation: sel.rot.LastOperation || 'N',
            lote: sel.pos.DistNumber || '',
            itemCode: sel.pos.ItemCode,
            itemName: sel.pos.ItemName,
            colaborador: colabId,
            colaboradorNome: colabNome,
            recurso: recursoSelecionado,
            recursoNome: recursoTexto,
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
            const colabNome = reg.colaboradorNome || this.getColaboradorNome(reg.colaborador);

            tr.innerHTML = `
                <td style="vertical-align: top;">
                    <div style="display: flex; flex-direction: column; gap: 3px; padding: 4px 0;">
                        <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: var(--primary); font-size: 0.95rem; margin-bottom: 2px;">
                            <span>OP ${reg.belnrId} / ${reg.belposId} / ${reg.posText || reg.posId}</span>
                            ${reg.lastOperation === 'Y' ? `<i class="fa-solid fa-circle" style="color: #2563eb; font-size: 0.55rem;" title="Última Operação"></i>` : ''}
                        </div>
                        ${reg.lote ? `<div style="font-size: 0.75rem; font-weight: 600; color: #3b82f6;"> ${reg.lote}</div>` : ''}
                        <div style="font-size: 0.75rem; font-weight: 600; color: #475569;">${reg.itemCode}</div>
                        <div style="font-size: 0.75rem; font-weight: 600; color: #475569; word-wrap: break-word;">${reg.itemName}</div>
                        <div style="font-size: 0.75rem; font-weight: 600; color: #475569;">${reg.operacaoNome}</div>
                    </div>
                </td>
                <td style="text-align: center; vertical-align: top;">
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 4px; padding-top: 4px;">
                        <span class="badge badge-gray" style="font-weight: 700;">${reg.colaborador}</span>
                        ${colabNome ? `<div style="font-size: 0.75rem; color: #475569; font-weight: 600; text-align: center; max-width: 120px; line-height: 1.2; word-wrap: break-word;">${colabNome}</div>` : ''}
                        ${isIniciado && reg.startDateTime ? `<span style="font-size: 0.7rem; color: #0284c7; font-weight: 600; margin-top: 2px;"><i class="fa-regular fa-clock"></i> ${reg.startDateTime.includes(' ') ? reg.startDateTime.split(' ')[1] : reg.startDateTime}</span>` : ''}
                    </div>
                </td>
                <td style="text-align: center; vertical-align: top;">
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 4px; padding-top: 4px;">
                        ${reg.recurso ? `
                            <span class="badge" style="background-color: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe; font-weight: 700; font-size: 0.8rem; padding: 3px 8px; border-radius: 6px;">${reg.recurso}</span>
                            ${(reg.recursoNome && reg.recursoNome !== reg.recurso) ? `<div style="font-size: 0.72rem; color: #475569; font-weight: 600; text-align: center; max-width: 125px; line-height: 1.2; word-wrap: break-word;">${reg.recursoNome.includes(' - ') ? reg.recursoNome.split(' - ').slice(1).join(' - ') : reg.recursoNome}</div>` : ''}
                        ` : `<span style="color: #94a3b8; font-size: 0.8rem;">--</span>`}
                    </div>
                </td>
                
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
                
                <td style="text-align: right; vertical-align: top;">
                    <input type="number" step="1" class="input-weigh" id="tempo_${index}" value="${reg.tempo}" oninput="app.atualizarCampo(${index}, 'tempo', this.value); app.checkSavable(${index})" style="width:75px; text-align: center;" ${(isDone || isIniciado) ? 'disabled' : ''}>
                </td>
                
                <td style="text-align: center; vertical-align: top;">
                    ${isDone
                    ? `<span class="badge badge-gray"><i class="fa-solid fa-check"></i> Salvo</span>`
                    : isIniciado
                    ? `<span class="badge" style="background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; padding: 5px 10px; font-size: 0.75rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-spinner fa-spin"></i> Em andamento</span>`
                    : `<button id="btn_save_${index}" class="btn btn-success" onclick="app.finalizarRegistro(${index})" style="padding: 6px 12px; font-size: 0.8rem;"><i class="fa-solid fa-check"></i> Salvar</button>`
                }
                </td>
                
                <td style="text-align: center; white-space: nowrap; vertical-align: top;">
                    <input type="hidden" id="systemNumber_${index}" value="${reg.systemNumber || ''}">
                    ${!isDone ? `
                        <button class="btn-action-icon btn-action-play" onclick="app.iniciarTempo(${index})" title="${isIniciado ? 'Em andamento' : 'Iniciar'}" ${isIniciado ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}><i class="fa-solid fa-play"></i></button>
                        <button class="btn-action-icon btn-action-stop" onclick="app.pararTempo(${index})" title="${!isIniciado ? 'Iniciar primeiro' : (parseFloat(reg.totalProcesso) <= 0 ? 'Preencha o TOTAL PROC. antes de Parar' : 'Parar')}" ${(!isIniciado || parseFloat(reg.totalProcesso) <= 0) ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}><i class="fa-solid fa-stop"></i></button>
                        <button class="btn-action-icon btn-action-delete" onclick="app.removerRegistro(${index})" title="Remover" ${isIniciado ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}><i class="fa-solid fa-trash"></i></button>
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

    montarTimeReceiptPayload: async function (reg, isRunning = false, index = null) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const endDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const endTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

        let startDate = endDate;
        let startTime = endTime;
        let duration = parseInt(reg.tempo, 10) || 0;

        if (reg.startDateTime) {
            const parts = reg.startDateTime.split(' ');
            if (parts[0]) startDate = parts[0];
            if (parts[1]) startTime = parts[1].substring(0, 5);

            if (duration <= 0) {
                const startDateObj = new Date(reg.startDateTime.replace(/-/g, '/'));
                if (!isNaN(startDateObj.getTime())) {
                    duration = Math.max(1, Math.round((now.getTime() - startDateObj.getTime()) / (60 * 1000)));
                }
            }
        } else if (duration > 0) {
            const startMs = now.getTime() - (duration * 60 * 1000);
            const startObj = new Date(startMs);
            startDate = `${startObj.getFullYear()}-${pad(startObj.getMonth() + 1)}-${pad(startObj.getDate())}`;
            startTime = `${pad(startObj.getHours())}:${pad(startObj.getMinutes())}`;
        }

        if (duration <= 0) duration = 1;

        const totalProc = parseFloat(reg.totalProcesso) || 0;
        const personnelId = (window.appInfo && window.appInfo.uid) ? String(window.appInfo.uid) : String(reg.colaborador || '');

        const payload = {
            "DocEntry": parseInt(reg.belnrId, 10),
            "LineNumber": parseInt(reg.belposId, 10),
            "LineNumber2": parseInt(reg.posId, 10),
            "PersonnelId": personnelId,
            "QuantityGoodRUoM": totalProc,
            "StartDate": startDate,
            "StartTime": startTime,
            "EndDate": endDate,
            "EndTime": endTime,
            "Duration": duration,
            "CloseEntry": false,
            "ManualBooking": false,
            "Remarks": reg.observacao || (isRunning ? "Apontamento Start/Stop" : "")
        };

        if (reg.recurso) {
            payload["ResourceId"] = String(reg.recurso);
        }

        if (isRunning) {
            const sysNum = reg.systemNumber || (index !== null && document.getElementById(`systemNumber_${index}`) ? document.getElementById(`systemNumber_${index}`).value : null);
            if (sysNum) {
                payload["FromTimeReceiptRunning"] = parseInt(sysNum, 10);
                payload["TimeReceiptRunningId"] = parseInt(sysNum, 10);
            }
        }

        // Issue e Receipt são gerados exclusivamente quando for a última operação (LastOperation === 'Y')
        let isLastOp = reg.lastOperation === 'Y';
        if (reg.lastOperation === undefined) {
            const op = this.opsCache.find(o => o.BELNR_ID == reg.belnrId);
            const pos = op ? op.WorkOrderPos.find(p => p.BELPOS_ID == reg.belposId) : null;
            const rot = pos ? pos.WorkorderRouting.find(r => r.POS_ID == reg.posId) : null;
            if (rot && rot.LastOperation === 'Y') {
                isLastOp = true;
                reg.lastOperation = 'Y';
            }
        }

        if (isLastOp) {
            try {
                const issueData = await api.getTimeReceiptIssue(reg.belnrId, reg.belposId, totalProc);
                if (Array.isArray(issueData) && issueData.length > 0) {
                    const issueLines = issueData.map(item => {
                        const line = {
                            "ItemCode": item.ART1_ID || item.ItemCode,
                            "BaseLineNumber2": parseInt(item.POS_ID, 10) || parseInt(reg.posId, 10),
                            "WhsCode": item.WhsCode || "01.PPR",
                            "Quantity": parseFloat(item.Quantity) || totalProc
                        };
                        // Não cria BatchNumbers quando ManBtchNum === 'N' ou DistNumber for nulo/vazio
                        if (item.ManBtchNum !== 'N' && item.DistNumber && String(item.DistNumber).trim() !== '') {
                            line.BatchNumbers = [
                                {
                                    "DistNumber": String(item.DistNumber),
                                    "Quantity": parseFloat(item.Quantity) || totalProc
                                }
                            ];
                        }
                        return line;
                    });

                    const firstItem = issueData[0];
                    const receiptLine = {
                        "ItemCode": firstItem.ItemCode || reg.itemCode,
                        "WhsCode": firstItem.WhsCode || "01.PPR",
                        "Quantity": totalProc
                    };
                    const receiptLote = reg.lote || (firstItem.ManBtchNum !== 'N' ? firstItem.DistNumber : null);
                    if (receiptLote && String(receiptLote).trim() !== '') {
                        receiptLine.BatchNumbers = [
                            {
                                "DistNumber": String(receiptLote),
                                "Quantity": totalProc
                            }
                        ];
                    }

                    payload["Issue"] = { "Lines": issueLines };
                    payload["Receipt"] = { "Lines": [receiptLine] };
                } else {
                    // Fallback para Receipt caso a API não devolva itens de Issue
                    const receiptLine = {
                        "ItemCode": reg.itemCode,
                        "WhsCode": "01.PPR",
                        "Quantity": totalProc
                    };
                    if (reg.lote && String(reg.lote).trim() !== '') {
                        receiptLine.BatchNumbers = [
                            {
                                "DistNumber": String(reg.lote),
                                "Quantity": totalProc
                            }
                        ];
                    }
                    payload["Receipt"] = { "Lines": [receiptLine] };
                }
            } catch (err) {
                console.warn('Erro ao montar Issue/Receipt:', err);
            }
        }

        console.log('Payload TimeReceipt montado:', payload);
        return payload;
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

        const payload = await this.montarTimeReceiptPayload(reg, false, index);

        api.serviceLayerPost('/odata4/v1/TimeReceipt', payload, (sErr, result) => {
            if (sErr) {
                console.error('Erro no apontamento Service Layer (Tempo/Produção):', sErr, result);
                const errorMsg = app.extractErrorMessage(sErr, result, 'Erro ao gravar apontamento. Verifique o console.');
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

    iniciarTempo: async function (index) {
        const reg = this.apontamentosManuais[index];
        if (!reg) return;

        if (reg.status === 'Iniciado') {
            this.showToast('Este registro já está em andamento.', 'warning');
            return;
        }

        const personnelId = (window.appInfo && window.appInfo.uid) ? String(window.appInfo.uid) : String(reg.colaborador);

        const payload = {
            "PersonnelId": personnelId,
            "DocEntry": parseInt(reg.belnrId, 10),
            "LineNumber": parseInt(reg.belposId, 10),
            "LineNumber2": parseInt(reg.posId, 10)
        };

        if (reg.recurso) {
            payload["ResourceId"] = String(reg.recurso);
        }

        return new Promise((resolve) => {
            api.serviceLayerPost('/odata4/v1/TimeReceiptRunning', payload, (sErr, result) => {
                if (sErr) {
                    console.error('Erro ao iniciar TimeReceiptRunning:', sErr, result);
                    const errorMsg = app.extractErrorMessage(sErr, result, 'Erro ao iniciar apontamento na Service Layer.');
                    app.showToast(errorMsg, 'error');
                    resolve(false);
                } else {
                    let systemNumber = null;
                    try {
                        const resObj = typeof result === 'string' ? JSON.parse(result) : result;
                        if (resObj && resObj.SystemNumber !== undefined) {
                            systemNumber = resObj.SystemNumber;
                        } else if (resObj && resObj.value && typeof resObj.value === 'object' && resObj.value.SystemNumber !== undefined) {
                            systemNumber = resObj.value.SystemNumber;
                        }
                    } catch (e) {}

                    reg.status = 'Iniciado';
                    if (systemNumber !== null) {
                        reg.systemNumber = systemNumber;
                    }
                    app.saveDrafts();
                    app.renderApontamentos();
                    app.showToast(`Registro iniciado com sucesso! ${systemNumber ? '(SystemNumber: ' + systemNumber + ')' : ''}`, 'success');
                    resolve(true);
                }
            });
        });
    },

    pararTempo: async function (index) {
        const reg = this.apontamentosManuais[index];
        if (!reg) return;

        if (reg.status !== 'Iniciado') {
            this.showToast('Este registro não está em andamento.', 'warning');
            return;
        }

        const totalProc = parseFloat(reg.totalProcesso) || 0;
        if (totalProc <= 0) {
            this.showToast('Não é possível parar: o campo TOTAL PROC. deve ser maior que zero.', 'warning');
            return;
        }

        const payload = await this.montarTimeReceiptPayload(reg, true, index);

        return new Promise((resolve) => {
            api.serviceLayerPost('/odata4/v1/TimeReceipt', payload, (sErr, result) => {
                if (sErr) {
                    console.error('Erro ao parar TimeReceipt:', sErr, result);
                    const errorMsg = app.extractErrorMessage(sErr, result, 'Erro ao parar apontamento na Service Layer.');
                    app.showToast(errorMsg, 'error');
                    resolve(false);
                } else {
                    reg.status = 'Finalizado';
                    app.saveDrafts();
                    app.renderApontamentos();
                    app.showToast('Apontamento parado e finalizado com sucesso!', 'success');
                    resolve(true);
                }
            });
        });
    },

    iniciarTodos: async function () {
        const pendentesIndices = [];
        this.apontamentosManuais.forEach((r, idx) => {
            if (r.status === 'Pendente') pendentesIndices.push(idx);
        });

        if (pendentesIndices.length === 0) {
            this.showToast('Nenhum registro pendente para iniciar.', 'warning');
            return;
        }

        for (const idx of pendentesIndices) {
            await this.iniciarTempo(idx);
        }
    },

    pararTodos: async function () {
        const iniciados = this.apontamentosManuais.filter(r => r.status === 'Iniciado');
        if (iniciados.length === 0) {
            this.showToast('Nenhum registro em andamento para parar.', 'warning');
            return;
        }

        const aptos = [];
        const semTotal = [];
        this.apontamentosManuais.forEach((r, idx) => {
            if (r.status === 'Iniciado') {
                if (parseFloat(r.totalProcesso) > 0) {
                    aptos.push(idx);
                } else {
                    semTotal.push(idx);
                }
            }
        });

        if (aptos.length === 0) {
            this.showToast('Não é possível parar: todos os registros em andamento estão com TOTAL PROC. zerado.', 'warning');
            return;
        }

        if (semTotal.length > 0) {
            this.showToast(`${semTotal.length} registro(s) com TOTAL PROC. zerado não serão parados.`, 'warning');
        }

        for (const idx of aptos) {
            await this.pararTempo(idx);
        }
    },

    extractErrorMessage: function (sErr, result, defaultMsg = 'Erro na Service Layer.') {
        if (result) {
            try {
                const resObj = typeof result === 'string' ? JSON.parse(result) : result;
                if (resObj) {
                    if (resObj.error) {
                        if (resObj.error.message) {
                            if (typeof resObj.error.message.value === 'string') return resObj.error.message.value;
                            if (typeof resObj.error.message === 'string') return resObj.error.message;
                        }
                        if (typeof resObj.error === 'string') return resObj.error;
                    }
                    if (resObj.message && typeof resObj.message === 'string') return resObj.message;
                    if (resObj.details && typeof resObj.details === 'string') return resObj.details;
                }
            } catch (e) {
                if (typeof result === 'string' && result.trim().length > 0) {
                    return result;
                }
            }
        }
        if (sErr) {
            if (sErr.message) return sErr.message;
            if (typeof sErr === 'string') return sErr;
        }
        return defaultMsg;
    },

    showToast: function (msg, type = 'info') {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }

        toast.className = `toast toast-${type}`;
        toast.textContent = msg;
        toast.style.display = 'block';

        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            if (toast) {
                toast.style.display = 'none';
                toast.className = 'toast';
            }
        }, 4000);
    }
};

window.app = app;

document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) {
        if (window.app) {
            if (typeof window.app.hidePersDropdown === 'function') window.app.hidePersDropdown();
            if (typeof window.app.hideRecursoDropdown === 'function') window.app.hideRecursoDropdown();
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    import('./interface.js').then(module => {
        module.buildUI();
        app.init();
    });
});
