export const api = {
    usersCache: null,

    getUserCodesList: async (persId) => {
        try {
            const uid = persId || ((typeof appInfo !== 'undefined' && appInfo?.uid) ? appInfo.uid : (typeof window !== 'undefined' && window.appInfo?.uid ? window.appInfo.uid : '9999'));

            const response = await fetch('http://192.168.30.14:9908/api/v1/getUserCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "PERS_ID": String(uid) })
            });

            if (!response.ok) return null;
            const data = await response.json();

            if (Array.isArray(data)) {
                api.usersCache = data;
                return data;
            }
            return null;
        } catch (error) {
            console.error('Falha de Comunicação ao verificar getUserCode:', error);
            return null;
        }
    },

    createWMSCode: async (type = 'PLP', quantity = 1) => {
        try {
            const response = await fetch('http://192.168.30.14:9908/api/v1/createWMSCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, quantity })
            });
            if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
            const data = await response.json();
            if (data && data.codes && Array.isArray(data.codes) && data.codes.length > 0) {
                return data.codes[0];
            }
            if (data && data.code) {
                return data.code;
            }
            return null;
        } catch (error) {
            console.error('Erro ao gerar código WMS:', error);
            throw error;
        }
    },

    createPallet: async (payload) => {
        try {
            const response = await fetch('http://192.168.30.14:9908/api/v1/createPallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Erro HTTP ${response.status}: ${text}`);
            }
            const data = await response.json();
            if (data && data.error) {
                throw new Error(data.error_message || 'Erro ao criar Pallet');
            }
            return data;
        } catch (error) {
            console.error('Erro ao chamar createPallet:', error);
            throw error;
        }
    },

    readWeightByID: async (scaleId) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        try {
            const response = await fetch('http://192.168.30.14:9908/api/v1/readWeightByID', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scaleId: scaleId || 'BALANCA_TESTE' }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Erro HTTP ${response.status}: ${text}`);
            }

            const data = await response.json();

            if (data && data.success === false) {
                throw new Error(data.message || `Falha na leitura da balança ${scaleId}`);
            }

            let peso = null;
            if (data && typeof data.weightKilogram !== 'undefined') peso = parseFloat(data.weightKilogram);
            else if (data && typeof data.peso !== 'undefined') peso = parseFloat(data.peso);
            else if (data && typeof data.weight !== 'undefined') peso = parseFloat(data.weight);
            else if (typeof data === 'number') peso = data;

            if (peso === null || isNaN(peso)) {
                throw new Error(data.message || 'Não foi possível identificar o peso retornado pela balança.');
            }

            return peso;
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Erro em readWeightByID:', error);
            throw error;
        }
    },

    getUserCode: async (persId) => {
        try {
            const uid = persId || ((typeof appInfo !== 'undefined' && appInfo?.uid) ? appInfo.uid : (typeof window !== 'undefined' && window.appInfo?.uid ? window.appInfo.uid : null));
            if (!uid) return null;

            let list = api.usersCache;
            if (!list) {
                list = await api.getUserCodesList(uid);
            }

            if (Array.isArray(list)) {
                const cleanUid = String(uid).trim();
                const numUid = parseInt(cleanUid, 10);
                const item = list.find(u => {
                    if (!u || u.PERS_ID === undefined || u.PERS_ID === null) return false;
                    const p = String(u.PERS_ID).trim();
                    return p === cleanUid || (!isNaN(numUid) && parseInt(p, 10) === numUid);
                });

                if (item && item.USER_CODE && typeof item.USER_CODE === 'string' && item.USER_CODE.trim() !== '') {
                    return item.USER_CODE.trim();
                }
                return null;
            }
            return null;
        } catch (error) {
            console.error('Falha de Comunicação ao verificar getUserCode:', error);
            return null;
        }
    },

    getOps: async () => {
        try {
            const currentUid = (typeof appInfo !== 'undefined' && appInfo?.uid) ? appInfo.uid : (typeof window !== 'undefined' && window.appInfo?.uid ? window.appInfo.uid : null);

            const payload = {
                "ABGKZ": "N",
                "Order": "DESC",
                "Limit": 200,
                "WEBAPP": "mod_aptoprod"
            };

            if (currentUid) {
                payload["PERS_ID"] = currentUid;
            }

            // Chamada real para o seu back-end DIS no HANA
            const response = await fetch('http://192.168.30.14:9908/api/v1/Workorders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Erro ao buscar Ordens de Produção da API');

            const rawOps = await response.json();

            // Retorna o formato puro que a API devolve
            return rawOps;

        } catch (error) {
            console.error('Falha de Comunicação:', error);
            return []; // Retorna vazio em caso de falha de conexão
        }
    },

    getColaboradores: async () => {
        try {
            const response = await fetch('http://192.168.30.14:9908/api/v1/beasPers');
            if (!response.ok) throw new Error('Erro ao buscar colaboradores');
            return await response.json();
        } catch (error) {
            console.error('Falha de Comunicação ao buscar beasPers:', error);
            return [];
        }
    },

    getPersResources: async () => {
        try {
            const response = await fetch('http://192.168.30.14:9908/api/v1/getPersResources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            if (!response.ok) throw new Error('Erro ao buscar recursos dos colaboradores');
            return await response.json();
        } catch (error) {
            console.error('Falha de Comunicação ao buscar getPersResources:', error);
            return [];
        }
    },

    sendApontamento: async (payload) => {
        console.log('Enviando Payload Final para o BEAS:', payload);
        return true;
    },

    getStopReasons: async () => {
        try {
            const response = await fetch('http://192.168.30.14:9908/api/v1/getStopReasons');
            if (!response.ok) throw new Error('Erro ao buscar motivos de parada');
            const data = await response.json();
            return Array.isArray(data) ? data : (data.value || []);
        } catch (error) {
            console.error('Falha de Comunicação ao buscar getStopReasons:', error);
            return [];
        }
    },

    getTimeReceiptIssue: async (belnrId, belposId, quantity) => {
        try {
            const response = await fetch('http://192.168.30.14:9908/api/v1/getTimeReceiptIssue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "BELNR_ID": parseInt(belnrId, 10),
                    "BELPOS_ID": parseInt(belposId, 10),
                    "Quantity": parseFloat(quantity)
                })
            });

            if (!response.ok) throw new Error('Erro ao buscar dados de Issue da API');
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Falha de Comunicação ao buscar getTimeReceiptIssue:', error);
            return [];
        }
    },

    serviceLayerPost(endpoint, payload, callback) {
        if (window.ui && typeof window.ui.mbox === 'function') {
            window.ui._origMbox = window.ui._origMbox || window.ui.mbox;
            window.ui.mbox = function () {};
        }

        if (window.ux && typeof window.ux.saveAll === 'function') {
            window.ux.saveAll(endpoint, payload, function (err, result) {
                const mbox = document.getElementById('ui_mbox');
                if (mbox) mbox.classList.remove('is-active');

                if (window.ux && window.ux.aError && window.ux.aError(result)) {
                    if (callback) callback(new Error('Erro na Service Layer'), result);
                } else {
                    if (callback) callback(err, result);
                }
            }, {
                method: 'POST',
                contentType: 'json',
                timeout: 180000
            });
        } else {
            console.warn('ux.saveAll not found');
            if (callback) callback(new Error('ux.saveAll not found'), null);
        }
    },

    serviceLayerPut(endpoint, payload, callback) {
        if (window.ui && typeof window.ui.mbox === 'function') {
            window.ui._origMbox = window.ui._origMbox || window.ui.mbox;
            window.ui.mbox = function () {};
        }

        if (window.ux && typeof window.ux.saveAll === 'function') {
            window.ux.saveAll(endpoint, payload, function (err, result) {
                const mbox = document.getElementById('ui_mbox');
                if (mbox) mbox.classList.remove('is-active');

                if (window.ux && window.ux.aError && window.ux.aError(result)) {
                    if (callback) callback(new Error('Erro na Service Layer'), result);
                } else {
                    if (callback) callback(err, result);
                }
            }, {
                method: 'PUT',
                contentType: 'json',
                timeout: 180000
            });
        } else {
            console.warn('ux.saveAll not found');
            if (callback) callback(new Error('ux.saveAll not found'), null);
        }
    }

};
