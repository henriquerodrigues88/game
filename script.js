const showAlert = (message, callback) => {
    document.getElementById("alertModalBody").innerHTML = message;
    $('#alertModal').modal('show');
    $('#alertModal').on('hidden.bs.modal', () => {
        if (callback) callback();
        $('#alertModal').off('hidden.bs.modal');
    });
};

const showPrompt = (message, callback) => {
    document.getElementById("promptModalBody").innerHTML = message;
    document.getElementById("promptModalInput").value = "";
    $('#promptModal').modal('show');
    document.getElementById("promptModalOk").onclick = () => {
        const value = sanitizeInput(document.getElementById("promptModalInput").value);
        $('#promptModal').modal('hide');
        callback(value);
    };
};

const sanitizeInput = (input) => {
    const tempDiv = document.createElement("div");
    tempDiv.textContent = input;
    return tempDiv.innerHTML;
}

const showConfirm = (message, callback) => {
    document.getElementById("confirmModalBody").textContent = message;
    $('#confirmModal').modal('show');
    document.getElementById("confirmModalOk").onclick = () => {
        $('#confirmModal').modal('hide');
        callback(true);
    };
    document.querySelector('#confirmModal .btn-secondary').onclick = () => {
        $('#confirmModal').modal('hide');
        callback(false);
    };
};

const showBonusPrompt = (callback) => {
    document.getElementById("bonusModalInput").value = "";
    $('#bonusModal').modal('show');
    document.getElementById("bonusModalOk").onclick = () => {
        const value = sanitizeInput(document.getElementById("bonusModalInput").value);
        $('#bonusModal').modal('hide');
        callback(value);
    };
};

document.addEventListener("DOMContentLoaded", () => {
    const demandasContainer = document.getElementById("demandasContainer");
    const equipeContainer = document.getElementById("equipeContainer");
    const novoDiaBtn = document.getElementById("novoDia");
    const contratarBtn = document.getElementById("contratar");
    const gerarDemandaBtn = document.getElementById("gerarDemanda");
    const premirMembroBtn = document.getElementById("premiarMembro");
    const reputacaoDisplay = document.getElementById("reputacao");
    const orcamentoDisplay = document.getElementById("orcamento");
    const diaAtualDisplay = document.getElementById("diaAtual");

    let reputacao = 100;
    let orcamento = 10000;
    let diaAtual = 1;
    let demandasAtuais = [];
    let demandasResolvidas = [];
    let demandasPendentes = [];
    let equipe = [];
    let gastosEquipe = 0;
    let tarefasConcluidasPorMembro = {};
    let demandasNoDia = 0;

    const salvarProgresso = () => {
        const estado = {
            reputacao,
            orcamento,
            diaAtual,
            demandasAtuais,
            demandasResolvidas,
            demandasPendentes,
            equipe,
            gastosEquipe,
            demandasNoDia,
        };
        localStorage.setItem("progressoJogo", JSON.stringify(estado));
    };

    const carregarProgresso = () => {
        const estadoSalvo = localStorage.getItem("progressoJogo");
        if (estadoSalvo) {
            const estado = JSON.parse(estadoSalvo);
            reputacao = estado.reputacao || 100;
            orcamento = estado.orcamento || 10000;
            diaAtual = estado.diaAtual || 1;
            demandasAtuais = estado.demandasAtuais || [];
            demandasResolvidas = estado.demandasResolvidas || [];
            demandasPendentes = estado.demandasPendentes || [];
            equipe = estado.equipe || [];
            gastosEquipe = estado.gastosEquipe || 0;
            demandasNoDia = estado.demandasNoDia || 0;
        } else {
            equipe = [
                { nome: "Carlos", funcao: "Edição de Vídeo", habilidade: 85, salario: 2500, atribuida: false, concentracao: 4 },
                { nome: "Beatriz", funcao: "Direção de Arte", habilidade: 85, salario: 2500, atribuida: false, concentracao: 4 },
                { nome: "Rafael", funcao: "Dev Web", habilidade: 88, salario: 2500, atribuida: false, concentracao: 4 },
                { nome: "Marcos", funcao: "Redação", habilidade: 84, salario: 2500, atribuida: false, concentracao: 4 },
            ];
            for (let i = 0; i < 4; i++) {
                demandasAtuais.push(gerarDemandaAleatoria());
            }
        }
    };

    const atualizarStatus = () => {
        reputacaoDisplay.textContent = `Reputação: ${reputacao}%`;
        orcamentoDisplay.textContent = `Orçamento: R$${orcamento.toLocaleString("pt-BR")}`;
        diaAtualDisplay.textContent = `Dia: ${diaAtual}`;
    };

    const gerarNumeroAleatorio = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    };


const tipos = {
    "Edição de Vídeo": ["Edição de Vídeo Promocional", "Animação para Redes Sociais", "Pós-produção para Comercial", "Corte e Colorização de Entrevista", "Criação de Motion Graphics", "Legendagem e Transcrição de Vídeos", "Edição de Vídeo para YouTube", "Criação de Vinheta e Abertura", "Animação de Logotipo", "Otimização de Vídeo para Redes Sociais"],
    "Direção de Arte": ["Design de Post para Instagram", "Criação de Identidade Visual", "Diagramação de E-book", "Elaboração de Banner Publicitário", "Conceito Visual para Campanha",  "Criação de Layout para Apresentação", "Design de Embalagem para Produto", "Desenvolvimento de Mockups", "Ilustração para Materiais Promocionais", "Design de Interface para Aplicativos"],
    "Dev Web": ["Desenvolvimento de Site Responsivo", "Correção de Bug em E-commerce", "Otimização de SEO On-Page", "Integração com API de Pagamento", "Implementação de Form Interativo", "Automação de Processos com Scripts", "Criação de Dashboard para Analytics", "Desenvolvimento de Landing Page", "Segurança e Proteção de Dados", "Otimização de Performance de Sites"],
    "Redação": ["Criação de Texto para Blog", "Roteiro para Vídeo Promocional", "Texto para Post de Instagram", "Copy para Página de Vendas", "Slogan para Nova Campanha", "Revisão e Edição de Conteúdo", "Criação de Descrição para Produtos", "Texto para Anúncios Publicitários", "Storytelling para Marcas", "Redação de E-mail Marketing"],
    "Gerente de Projetos": ["Planejamento de Campanha", "Gestão de Produção Audiovisual", "Coordenação de Equipe de Design", "Supervisão de Desenvolvimento Web", "Revisão e Aprovação de Conteúdo", "Gerenciamento de Prazos e Entregas", "Elaboração de Briefing", "Controle de Orçamentos e Recursos", "Análise de Resultados e Relatórios", "Mediação entre Clientes e Equipe"]
};

const gerarDemandaAleatoria = () => {
    const cargos = Object.keys(tipos);
    const cargoAleatorio = cargos[gerarNumeroAleatorio(0, cargos.length)];
    const tarefaAleatoria = tipos[cargoAleatorio][gerarNumeroAleatorio(0, tipos[cargoAleatorio].length)];
    return {
        descricao: tarefaAleatoria,
        dificuldade: gerarNumeroAleatorio(70, 100),
        atribuida: false,
        recompensa: gerarNumeroAleatorio(500, 800),
        cargo: cargoAleatorio
    };
};

    const calcularGastosEquipe = () => {
        return equipe.reduce((total, membro) => total + membro.salario, 0);
    };

    const exibirEquipe = () => {
        equipeContainer.innerHTML = "";
        equipe.forEach((membro, index) => {
            const div = document.createElement("div");
            div.className = "membro-equipe";
            div.innerHTML = `
                <span>${membro.nome} - ${membro.funcao} (Habilidade: ${membro.habilidade}%, Salário: R$${membro.salario}, Concentração: ${membro.concentracao}/10)</span>
                <button onclick="demitir(${index})">Demitir</button>
            `;
            equipeContainer.appendChild(div);
        });
    };

const exibirDemandas = () => {
    demandasContainer.innerHTML = "";
    demandasAtuais.forEach((demanda, index) => {
        const atribuicaoStatus = demanda.atribuida ? "Atribuída" : "Não atribuída";
        const div = document.createElement("div");
        div.className = "tarefa";
        div.innerHTML = `
            <span>${demanda.descricao} (Cargo: ${demanda.cargo}, Dificuldade: ${demanda.dificuldade}%, Recompensa: R$${demanda.recompensa}, Status: ${atribuicaoStatus})</span>
                <button onclick="atribuirTarefa(${index})" ${demanda.atribuida ? "disabled" : ""}>Atribuir</button>
                <button onclick="resolverTarefa(${index})">Resolver</button>
            `;
            demandasContainer.appendChild(div);
        });
    };

    const verificarGameOver = () => {
        if (orcamento <= 0 || reputacao <= 0) {
            showAlert("Game Over", resetarProgresso);
        }
    };

    const resetarProgresso = () => {
        localStorage.removeItem("progressoJogo");
        location.reload();
    };

window.atribuirTarefa = (indiceDemanda) => {
    const demanda = demandasAtuais[indiceDemanda];
    const membroEquipe = equipe.find((membro) => 
        !membro.atribuida && 
        membro.habilidade >= demanda.dificuldade && 
        membro.funcao === demanda.cargo
    );

    if (membroEquipe) {
        demanda.atribuida = true;
        demanda.membroAtribuido = membroEquipe.nome;
        membroEquipe.atribuida = true;
        showAlert(`${membroEquipe.nome} foi atribuído(a) para resolver a tarefa "${demanda.descricao}".`);
    } else {
        showAlert("Nenhum membro disponível com habilidade suficiente para atribuir esta tarefa!");
    }

    salvarProgresso();
    exibirDemandas();
};

window.resolverTarefa = (indiceDemanda) => {
    const demanda = demandasAtuais[indiceDemanda];
    const membroEquipe = equipe.find((membro) => membro.nome === demanda.membroAtribuido);

    if (membroEquipe) {
        const diferenca = membroEquipe.habilidade - demanda.dificuldade;
        const baseQualidade = Math.max(50, 80 + diferenca * 0.5); 
        const qualidadeConclusao = Math.min(100, baseQualidade + Math.random() * 20 - 10);

        if (qualidadeConclusao >= 80) {
            membroEquipe.tarefasConcluidas = (membroEquipe.tarefasConcluidas || 0) + 1;
            tarefasConcluidasPorMembro[membroEquipe.nome] = (tarefasConcluidasPorMembro[membroEquipe.nome] || 0) + 1;
            showAlert(`${membroEquipe.nome} resolveu a tarefa "${demanda.descricao}" com qualidade ${qualidadeConclusao.toFixed(1)}%! Parabéns!`);
            membroEquipe.concentracao = Math.min(10, Math.max(0, membroEquipe.concentracao + 1));
            membroEquipe.habilidade = Math.min(100, membroEquipe.habilidade + Math.ceil((qualidadeConclusao - 80) / 10));
            membroEquipe.salario = Math.min(membroEquipe.salario + 2, membroEquipe.salario + 2);
        } else {
            showAlert(`${membroEquipe.nome} concluiu a tarefa "${demanda.descricao}" com qualidade (${qualidadeConclusao.toFixed(1)}%). Habilidade, salário e concentração reduzidos.`);
            membroEquipe.habilidade = Math.max(0, membroEquipe.habilidade - Math.ceil((80 - qualidadeConclusao) / 10));
            membroEquipe.concentracao = Math.max(0, membroEquipe.concentracao - 1);
            membroEquipe.salario = Math.max(0, membroEquipe.salario - 5);
        }            

        demandasAtuais.splice(indiceDemanda, 1);
        demandasResolvidas.push(demanda);
        membroEquipe.atribuida = false;
        orcamento += demanda.recompensa;
        reputacao += 10;
        demandasNoDia++;
        exibirEquipe();
    } else {
        showAlert("Nenhum membro foi atribuído(a). Penalidade aplicada!");
        demandasPendentes.push(demanda);
        demandasAtuais.splice(indiceDemanda, 1);
        reputacao -= 10;
        orcamento -= Math.min(orcamento, 500);
    }

    salvarProgresso();
    exibirDemandas();
    atualizarStatus();
    verificarGameOver();
};

window.demitir = (indiceEquipe) => {
    const membro = equipe[indiceEquipe];
    if (membro.atribuida) {
        showAlert("Este membro está atribuído a uma tarefa. Resolva antes de demitir.");
        return;
    }

    showConfirm(`Tem certeza que deseja demitir ${membro.nome}? R$750 serão descontados do orçamento para pagamento de encargos.`, (confirmed) => {
        if (confirmed) {
            equipe.splice(indiceEquipe, 1);
            orcamento -= 750;
            salvarProgresso();
            exibirEquipe();
            atualizarStatus();
            showAlert(`${membro.nome} não faz mais parte da equipe! Encargos pagos com sucesso.`);
        }
    });
};

    const gerarRelatorioMensal = (callback) => {
        gastosEquipe = calcularGastosEquipe();
        orcamento -= gastosEquipe;
        if (orcamento < 0) orcamento = 0;

        const tarefasResolvidas = demandasResolvidas.length;
        const tarefasPendentes = demandasPendentes.length;
        const relatorioMembros = equipe.map(membro => `<li>${membro.nome}: ${tarefasConcluidasPorMembro[membro.nome] || 0} tarefas concluídas</li>`).join("");
        const mensagem = `
            <ul>
                <li><strong>Relatório do Mês:</strong></li>
                <li>Tarefas resolvidas: ${tarefasResolvidas}</li>
                <li>Tarefas não resolvidas: ${tarefasPendentes}</li>
                <li>Reputação atual: ${reputacao}%</li>
                <li>Orçamento atual: R$${orcamento.toLocaleString("pt-BR")}</li>
                <li>Gastos com equipe: R$${gastosEquipe.toLocaleString("pt-BR")}</li>
                <li>Membros e Tarefas Concluídas:</li>
                ${relatorioMembros}
            </ul>`;
            showAlert(mensagem, () => {
            salvarProgresso();
            verificarGameOver();
            if (callback) callback();
        });
    };

    const premirMembro = () => {
        if (demandasNoDia === 0) {
            showAlert("Nenhuma tarefa foi executada hoje. Ainda não é possível premiar membros.");
            return;
        }

        showPrompt("Digite o nome do membro que você deseja premiar:", (membroNome) => {
            const membro = equipe.find(m => m.nome.toLowerCase() === membroNome.toLowerCase());

            if (!membro) {
                showAlert("Membro não encontrado!");
                return;
            }

            showPrompt(`Escolha um número:<ul>
                <li>1. Fone de ouvido - R$25 (aumenta concentração até 5 pontos.)</li>
                <li>2. Café forte - R$5 (aumenta concentração até 4 pontos.)</li>
                <li>3. Café fraco - R$2 (aumenta concentração 1 ponto.)</li>
                <li>4. Dinheiro (conceder bônus ao membro)</li></ul>`, (premio) => {
                switch (premio) {
                    case "1":
                        if (membro.concentracao >= 10) {
                            showAlert(`${membro.nome} possui pontuação máxima de concentração.`);
                            return;
                        }
                        if (orcamento < 25) {
                            showAlert("Orçamento insuficiente para conceder este prêmio!");
                            return;
                        }
                        orcamento -= 25;
                        membro.concentracao = Math.min(10, membro.concentracao + 5);
                        showAlert(`${membro.nome} recebeu um fone de ouvido! Concentração aumentada.`);
                        break;
                    case "2":
                        if (membro.concentracao >= 10) {
                            showAlert(`${membro.nome} possui pontuação máxima de concentração.`);
                            return;
                        }
                        if (orcamento < 5) {
                            showAlert("Orçamento insuficiente para conceder este prêmio!");
                            return;
                        }
                        orcamento -= 5;
                        membro.concentracao = Math.min(10, membro.concentracao + 4);
                        showAlert(`${membro.nome} recebeu um café forte! Concentração aumentada.`);
                        break;
                    case "3":
                        if (membro.concentracao >= 10) {
                            showAlert(`${membro.nome} possui pontuação máxima de concentração.`);
                            return;
                        }
                        if (orcamento < 2) {
                            showAlert("Orçamento insuficiente para conceder este prêmio!");
                            return;
                        }
                        orcamento -= 2;
                        membro.concentracao = Math.min(10, membro.concentracao + 1);
                        showAlert(`${membro.nome} recebeu um café fraco! Concentração aumentada.`);
                        break;
                    case "4":
                        showBonusPrompt((valorBonus) => {
                            valorBonus = parseInt(valorBonus, 10);
                            if (isNaN(valorBonus) || valorBonus <= 0) {
                                showAlert("Valor inválido!");
                                return;
                            }
                            if (orcamento < valorBonus) {
                                showAlert("Orçamento insuficiente para conceder esse bônus!");
                                return;
                            }
                            orcamento = Math.max(0, orcamento - valorBonus);
                            membro.salario += valorBonus;
                            showAlert(`${membro.nome} recebeu um bônus de R$${valorBonus.toLocaleString("pt-BR")}! Salário atualizado para R$${membro.salario.toLocaleString("pt-BR")}!`);
                            atualizarStatus();
                            salvarProgresso();
                            exibirEquipe();
                        });
                        break;
                    default:
                        showAlert("Prêmio inválido!");
                        return;
                }
                salvarProgresso();
                exibirEquipe();
                atualizarStatus();
            });
        });
    };

    premirMembroBtn.addEventListener("click", premirMembro);

    novoDiaBtn.addEventListener("click", () => {
        if (demandasAtuais.length > 0) {
            showAlert("Você passou para o próximo dia sem resolver todas as demandas! Penalidade aplicada.", () => {
                demandasAtuais.forEach((demanda) => {
                    demandasPendentes.push(demanda);
                    reputacao -= 10;
                    orcamento -= Math.min(orcamento, 500);
                });
                demandasAtuais = [];
                iniciarNovoDia();
            });
        } else {
            iniciarNovoDia();
        }
    });

    const iniciarNovoDia = () => {
        diaAtual++;
        if (diaAtual > 30) {
            gerarRelatorioMensal(() => {
                diaAtual = 1;
                demandasResolvidas = [];
                demandasPendentes = [];
                demandasAtuais = [];
                gastosEquipe = 0;
                demandasNoDia = 0;
                for (let i = 0; i < 4; i++) {
                    demandasAtuais.push(gerarDemandaAleatoria());
                }
                atualizarStatus();
                exibirDemandas();
                exibirEquipe();
                showAlert("Novo mês começou. Dia 1.");
            });
        } else {
            demandasNoDia = 0;
            for (let i = 0; i < 4; i++) {
                demandasAtuais.push(gerarDemandaAleatoria());
            }
            salvarProgresso();
            atualizarStatus();
            exibirDemandas();
            showAlert("Novo dia começou.");
        }
    };

    contratarBtn.addEventListener("click", () => {
        const custoContratacao = 1000;
        if (orcamento < custoContratacao) {
            showAlert("Orçamento insuficiente para contratar um novo membro!");
            return;
        }

        orcamento -= custoContratacao;

        const solicitarNomeMembro = () => {
            showPrompt("Digite o nome do novo membro:", (nomeMembro) => {
                if (nomeMembro === null) {
                    return;
                }
                if (!nomeMembro || equipe.some(membro => membro.nome.toLowerCase() === nomeMembro.toLowerCase())) {
                    $('#promptModal').modal('hide');
                    if (!nomeMembro) {
                        showAlert("Nome não pode estar vazio!", solicitarNomeMembro);
                    } else {
                        showAlert("Já existe um membro com esse nome! Escolha outro.", solicitarNomeMembro);
                    }
                    return;
                }

                showPrompt(`Escolha um número:<ul>
                    <li>1. Edição de Vídeo</li>
                    <li>2. Direção de Arte</li>
                    <li>3. Dev Web</li>
                    <li>4. Redação</li>
                    <li>5. Gerente de Projetos</li></ul>`, (cargoEscolhido) => {
                    const cargos = ["Edição de Vídeo", "Direção de Arte", "Dev Web", "Redação", "Gerente de Projetos"];
                    const funcaoAleatoria = cargos[parseInt(cargoEscolhido) - 1];

                    if (!funcaoAleatoria) {
                        showAlert("Cargo inválido! Tente novamente.", () => solicitarNomeMembro());
                        return;
                    }

                    const novoMembro = {
                        nome: nomeMembro,
                        funcao: funcaoAleatoria,
                        habilidade: Math.round(80 + Math.random() * 20 - 10),
                        salario: 2500,
                        atribuida: false,
                        concentracao: Math.floor(Math.random() * 10) + 1,
                    };
                    equipe.push(novoMembro);

                    salvarProgresso();
                    exibirEquipe();
                    atualizarStatus();

                    showAlert(`Novo membro contratado! Custo inicial: R$${custoContratacao.toLocaleString("pt-BR")}`);
                });
            });
        };

        solicitarNomeMembro();
    });

    gerarDemandaBtn.addEventListener("click", () => {
        const novaDemanda = gerarDemandaAleatoria();
        demandasAtuais.push(novaDemanda);
        salvarProgresso();
        exibirDemandas();
    });

    carregarProgresso();
    atualizarStatus();
    exibirEquipe();
    exibirDemandas();
});

document.addEventListener("DOMContentLoaded", () => {
    const resetarBtn = document.getElementById("resetar");
    const resetarProgresso = () => {
        showConfirm("Tem certeza que deseja resetar todo o progresso do jogo?", (confirmed) => {
            if (confirmed) {
                localStorage.removeItem("progressoJogo");
                location.reload();
            }
        });
    };
    resetarBtn.addEventListener("click", resetarProgresso);
});
