export const api = {
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
