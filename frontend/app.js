const API = "/api/producoes";

const form = document.getElementById("form");
const tbody = document.getElementById("tbody");

function mostrarMensagem(texto, tipo) {
    const msg = document.getElementById("mensagem");
    msg.innerText = texto;
    msg.className = tipo;
    msg.style.display = "block";
    setTimeout(() => {
        msg.style.display = "none";
    }, 3000);
}

async function carregar() {
    try {
        const response = await fetch(`${API}?limit=9999`);
        if (!response.ok) throw new Error("Erro ao carregar os dados.");

        const json = await response.json();
        tbody.innerHTML = "";

        json.data.forEach(p => {
            const tr = document.createElement("tr");

            const campos = [p.id, p.data_producao, p.numero_tear, p.codigo_produto,
                            p.turno, p.qualidade, p.quilos, p.pecas];

            campos.forEach(valor => {
                const td = document.createElement("td");
                td.textContent = valor;
                tr.appendChild(td);
            });

            const tdAcoes = document.createElement("td");

            const btnEditar = document.createElement("button");
            btnEditar.className = "editar";
            btnEditar.textContent = "✏️";
            btnEditar.addEventListener("click", () => editar(p.id));

            const btnExcluir = document.createElement("button");
            btnExcluir.className = "excluir";
            btnExcluir.textContent = "❌";
            btnExcluir.addEventListener("click", () => excluir(p.id));

            tdAcoes.appendChild(btnEditar);
            tdAcoes.appendChild(btnExcluir);
            tr.appendChild(tdAcoes);

            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error(erro);
        mostrarMensagem("Erro ao carregar registros.", "erro");
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("id").value;

    const producao = {
        data_producao: document.getElementById("data_producao").value,
        numero_tear: document.getElementById("numero_tear").value,
        codigo_produto: document.getElementById("codigo_produto").value,
        turno: Number(document.getElementById("turno").value),
        qualidade: Number(document.getElementById("qualidade").value),
        quilos: Number(document.getElementById("quilos").value),
        pecas: Number(document.getElementById("pecas").value)
    };

    try {
        let response;

        if (id) {
            response = await fetch(`${API}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(producao)
            });

            if (!response.ok) throw new Error("Erro ao atualizar.");
            mostrarMensagem("Registro atualizado com sucesso!", "sucesso");

        } else {
            response = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(producao)
            });

            if (!response.ok) throw new Error("Erro ao cadastrar.");
            mostrarMensagem("Registro salvo com sucesso!", "sucesso");
        }

        form.reset();
        document.getElementById("id").value = "";
        await carregar();

    } catch (erro) {
        console.error(erro);
        mostrarMensagem("Erro ao comunicar com a API.", "erro");
    }
});

async function editar(id) {
   
    document.getElementById("id").value = id;

    try {
        const response = await fetch(`${API}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar registro.");

        const json = await response.json();
        const p = json.data ?? json;

        document.getElementById("data_producao").value = p.data_producao
            ? p.data_producao.toString().slice(0, 10)
            : "";
        document.getElementById("numero_tear").value = p.numero_tear;
        document.getElementById("codigo_produto").value = p.codigo_produto;
        document.getElementById("turno").value = p.turno;
        document.getElementById("qualidade").value = p.qualidade;
        document.getElementById("quilos").value = p.quilos;
        document.getElementById("pecas").value = p.pecas;

        window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (erro) {
        console.error("ERRO:", erro);
        console.error(erro.stack);
    }
}

async function excluir(id) {
    if (!confirm("Deseja realmente excluir este registro?")) return;

    try {
        const response = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Erro ao excluir.");

        mostrarMensagem("Registro excluído com sucesso!", "sucesso");
        await carregar();

    } catch (erro) {
        console.error(erro);
        mostrarMensagem("Erro ao excluir o registro.", "erro");
    }
}

carregar();