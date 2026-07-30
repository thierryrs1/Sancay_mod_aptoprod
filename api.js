// Gerenciamento centralizado de chamadas de API

export const api = {
    getOps: async () => {
        try {
            // Chamada real para o seu back-end DIS no HANA
            const response = await fetch('http://192.168.30.14:9908/api/v1/Workorders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "ABGKZ": "N",
                    "Order": "DESC",
                    "Limit": 200,
                    "WEBAPP": "mod_aptoprod"
                })
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
        // Exemplo:
        // await fetch('http://192.168.30.14:9908/api/v1/Apontamento', { method: 'POST', body: JSON.stringify(payload) })
        return true;
    },

    getStopReasons: async () => {
        try {
            const response = await fetch('http://192.168.30.14:9908/api/v1/getStopReasons');
            if (!response.ok) throw new Error('Erro ao buscar motivos de parada');
            const data = await response.json();
            // A API pode retornar um array direto ou um objeto { value: [...] }
            return Array.isArray(data) ? data : (data.value || []);
        } catch (error) {
            console.error('Falha de Comunicação ao buscar getStopReasons:', error);
            return [];
        }
    },

    serviceLayerPost(endpoint, payload, callback) {
        if (window.ux && typeof window.ux.saveAll === 'function') {
            window.ux.saveAll(endpoint, payload, function (err, result) {
                let isError = !!err;
                if (!isError && result) {
                    try {
                        const resObj = typeof result === 'string' ? JSON.parse(result) : result;
                        if (resObj && resObj.error) isError = true;
                    } catch(e) {}
                }
                
                if (isError) {
                    if (callback) callback(err || new Error('Erro na Service Layer'), result);
                } else {
                    if (callback) callback(null, result);
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
        if (window.ux && typeof window.ux.saveAll === 'function') {
            window.ux.saveAll(endpoint, payload, function (err, result) {
                let isError = !!err;
                if (!isError && result) {
                    try {
                        const resObj = typeof result === 'string' ? JSON.parse(result) : result;
                        if (resObj && resObj.error) isError = true;
                    } catch(e) {}
                }
                
                if (isError) {
                    if (callback) callback(err || new Error('Erro na Service Layer'), result);
                } else {
                    if (callback) callback(null, result);
                }
            }, {
                type: 'PUT',
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
