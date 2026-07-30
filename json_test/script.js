// script.js

// ==========================================
// INJEÇÃO DE CSS PREMIUM (DARK MODE GLASS)
// ==========================================
const styles = `
:root {
    --tree-bg: #1e1e2e;
    --tree-text: #cdd6f4;
    --tree-key: #89b4fa;
    --tree-string: #a6e3a1;
    --tree-number: #fab387;
    --tree-boolean: #f38ba8;
    --tree-null: #f9e2af;
    --tree-hover: #313244;
    --tree-border: #45475a;
    --tree-bracket: #9399b2;
}

body {
    background-color: var(--tree-bg);
    color: var(--tree-text);
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 30px;
    margin: 0;
}

.header-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 20px;
    color: #b4befe;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.tree-container {
    background: #181825;
    border-radius: 12px;
    padding: 20px 30px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
    overflow-x: auto;
    font-size: 15px;
    line-height: 1.6;
    border: 1px solid var(--tree-border);
    max-width: 1200px;
    margin: 0 auto;
}

.tree-node {
    margin-left: 24px;
    border-left: 1px dashed var(--tree-border);
    padding-left: 8px;
    position: relative;
}

.tree-line {
    display: flex;
    align-items: flex-start;
    padding: 2px 6px;
    border-radius: 6px;
    transition: background 0.2s ease;
    white-space: nowrap;
}

.tree-line:hover {
    background: var(--tree-hover);
}

.tree-key {
    color: var(--tree-key);
    font-weight: 600;
    margin-right: 6px;
}

.tree-value.string { color: var(--tree-string); }
.tree-value.number { color: var(--tree-number); }
.tree-value.boolean { color: var(--tree-boolean); font-weight: bold; }
.tree-value.null { color: var(--tree-null); font-style: italic; }

.tree-toggle {
    cursor: pointer;
    user-select: none;
    display: inline-block;
    width: 20px;
    text-align: center;
    font-size: 11px;
    color: #a6adc8;
    margin-right: 4px;
    position: relative;
    top: 3px;
    transition: transform 0.2s ease, color 0.2s;
}

.tree-toggle:hover {
    color: #f5e0dc;
}

.tree-toggle.collapsed {
    transform: rotate(-90deg);
}

.tree-children {
    display: block;
    overflow: hidden;
}

.tree-children.collapsed {
    display: none;
}

.tree-bracket {
    color: var(--tree-bracket);
    font-weight: bold;
}

.item-count {
    font-size: 12px;
    color: #6c7086;
    margin-left: 12px;
    font-style: italic;
    background: #313244;
    padding: 2px 8px;
    border-radius: 12px;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// ==========================================
// LÓGICA DE RENDERIZAÇÃO RECURSIVA
// ==========================================
function createNode(key, value, isLast) {
    const lineWrapper = document.createElement('div');
    
    const line = document.createElement('div');
    line.className = 'tree-line';
    
    // Toggle Spacer (para alinhar itens sem filhos)
    const spacer = document.createElement('span');
    spacer.style.width = '24px';
    spacer.style.display = 'inline-block';
    
    // Renderiza a Chave (se houver)
    if (key !== null) {
        const keySpan = document.createElement('span');
        keySpan.className = 'tree-key';
        keySpan.textContent = `"${key}":`;
        line.appendChild(keySpan);
    }
    
    // Renderiza o Valor (Objeto/Array vs Primitivos)
    if (typeof value === 'object' && value !== null) {
        const isArray = Array.isArray(value);
        const children = isArray ? value : Object.keys(value);
        const bracketOpen = isArray ? '[' : '{';
        const bracketClose = isArray ? ']' : '}';
        
        // Ícone de expandir/colapsar
        const toggle = document.createElement('span');
        toggle.className = 'tree-toggle';
        toggle.textContent = '▼';
        
        const bracketOpenSpan = document.createElement('span');
        bracketOpenSpan.className = 'tree-bracket';
        bracketOpenSpan.textContent = bracketOpen;
        
        const countSpan = document.createElement('span');
        countSpan.className = 'item-count';
        countSpan.textContent = isArray ? `${children.length} itens` : `${children.length} props`;
        
        line.prepend(toggle);
        line.appendChild(bracketOpenSpan);
        if (children.length > 0) line.appendChild(countSpan);
        
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'tree-children';
        
        const childrenNode = document.createElement('div');
        childrenNode.className = 'tree-node';
        
        if (isArray) {
            value.forEach((item, index) => {
                childrenNode.appendChild(createNode(null, item, index === value.length - 1));
            });
        } else {
            const keys = Object.keys(value);
            keys.forEach((k, index) => {
                childrenNode.appendChild(createNode(k, value[k], index === keys.length - 1));
            });
        }
        
        childrenContainer.appendChild(childrenNode);
        
        const closeLine = document.createElement('div');
        closeLine.className = 'tree-line tree-bracket';
        
        // Espaçador para alinhar o bracket de fechamento com a chave que o abriu
        const closeSpacer = document.createElement('span');
        closeSpacer.style.width = '24px';
        closeSpacer.style.display = 'inline-block';
        closeLine.appendChild(closeSpacer);
        
        const closeText = document.createElement('span');
        closeText.textContent = bracketClose + (isLast ? '' : ',');
        closeLine.appendChild(closeText);
        
        childrenContainer.appendChild(closeLine);
        
        // Lógica de Collapse
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('collapsed');
            childrenContainer.classList.toggle('collapsed');
            
            if (childrenContainer.classList.contains('collapsed')) {
                bracketOpenSpan.textContent = bracketOpen + ' ... ' + bracketClose + (isLast ? '' : ',');
                closeLine.style.display = 'none';
                countSpan.style.display = 'inline-block';
            } else {
                bracketOpenSpan.textContent = bracketOpen;
                closeLine.style.display = 'flex';
                if(children.length === 0) countSpan.style.display = 'none';
            }
        });
        
        // Se for vazio, colapsa visualmente
        if (children.length === 0) {
            toggle.style.visibility = 'hidden';
            countSpan.style.display = 'none';
            childrenContainer.style.display = 'none';
            bracketOpenSpan.textContent = bracketOpen + bracketClose + (isLast ? '' : ',');
        }
        
        lineWrapper.appendChild(line);
        lineWrapper.appendChild(childrenContainer);
        
    } else {
        // Primitivos
        const valSpan = document.createElement('span');
        valSpan.className = 'tree-value';
        
        if (typeof value === 'string') {
            valSpan.classList.add('string');
            valSpan.textContent = `"${value}"`;
        } else if (typeof value === 'number') {
            valSpan.classList.add('number');
            valSpan.textContent = value;
        } else if (typeof value === 'boolean') {
            valSpan.classList.add('boolean');
            valSpan.textContent = value;
        } else if (value === null) {
            valSpan.classList.add('null');
            valSpan.textContent = 'null';
        }
        
        if (!isLast) valSpan.textContent += ',';
        
        if (key === null) line.prepend(spacer); // Alinha elementos de array sem toggle
        else line.prepend(spacer.cloneNode()); // Alinha primitivos de objeto sem toggle
        
        line.appendChild(valSpan);
        lineWrapper.appendChild(line);
    }
    
    return lineWrapper;
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
async function loadJSON() {
    try {
        const title = document.createElement('div');
        title.className = 'header-title';
        title.textContent = 'JSON Tree Viewer';
        document.body.appendChild(title);

        const response = await fetch('document.json');
        if (!response.ok) throw new Error('Falha ao carregar o arquivo document.json');
        
        const data = await response.json();
        
        const container = document.createElement('div');
        container.className = 'tree-container';
        
        const rootNode = createNode(null, data, true);
        container.appendChild(rootNode);
        
        document.body.appendChild(container);
    } catch (error) {
        document.body.innerHTML = `<h2 style="color: #f38ba8; text-align:center; padding: 50px;">Erro: ${error.message}</h2>`;
    }
}

// Garante que roda assim que o DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadJSON);
} else {
    loadJSON();
}
