export async function readWeightFromAPI(scaleId) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos

    try {
        const response = await fetch("http://192.168.30.14:9908/api/v1/readWeightByID", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scaleId: scaleId || "BALANCA_TESTE" }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Erro HTTP " + response.status);

        const data = await response.json();

        let pesoBruto = 0;
        if (data && typeof data.weightKilogram !== 'undefined') pesoBruto = parseFloat(data.weightKilogram);
        else if (data && typeof data.peso !== 'undefined') pesoBruto = parseFloat(data.peso);
        else pesoBruto = parseFloat(data);

        if (isNaN(pesoBruto)) {
            throw new Error("Não foi possível identificar o peso numérico.");
        }
        
        return pesoBruto;

    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}
