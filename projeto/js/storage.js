(() => {

    /* ========================================
       1. CONFIGURAÇÕES GERAIS
    ======================================== */

    const KEY = 'saudeEmFilaData';


    /* ========================================
       2. DADOS INICIAIS DO SISTEMA
    ======================================== */

    const seed = {

        /* Unidades de saúde */

        units: [

            {
                id: 'u1',
                name: 'UBS Central',
                address: 'Centro'
            },

            {
                id: 'u2',
                name: 'Unidade Jardim',
                address: 'Jardim Primavera'
            }

        ],


        /* Profissionais de saúde */

        doctors: [

            {
                id: 'd1',
                name: 'Dra. Ana Souza',
                specialty: 'Clínica geral',
                unitId: 'u1'
            },

            {
                id: 'd2',
                name: 'Dr. Carlos Lima',
                specialty: 'Pediatria',
                unitId: 'u2'
            }

        ],


        /* Agendamentos e atendimentos */

        schedules: [

            {
                id: 's1',
                date: new Date().toISOString().slice(0, 10),
                unitId: 'u1',
                doctorId: 'd1',
                tickets: 30,
                start: '07:00',
                end: '11:00',
                status: 'Disponível'
            },

            {
                id: 's2',
                date: new Date().toISOString().slice(0, 10),
                unitId: 'u2',
                doctorId: 'd2',
                tickets: 0,
                start: '13:00',
                end: '17:00',
                status: 'Indisponível'
            }

        ],


        /* Eventos e avisos */

        events: [

            {
                id: 'e1',
                title: 'Campanha de vacinação',
                date: new Date(
                    Date.now() + 86400000 * 2
                ).toISOString().slice(0, 10),

                description:
                    'Procure a unidade com documento de identificação e carteira de vacinação.',

                type: 'Evento',
                unitId: ''
            }

        ],


        /* Regiões de atendimento */

        zones: []

    };


    /* ========================================
       3. CARREGAMENTO DOS DADOS
    ======================================== */

    function load() {

        try {

            const saved = JSON.parse(
                localStorage.getItem(KEY)
            );

            return saved
                ? { ...seed, ...saved }
                : structuredClone(seed);

        } catch (error) {

            return structuredClone(seed);

        }

    }


    /* ========================================
       4. ESTADO ATUAL DO SISTEMA
    ======================================== */

    let data = load();


    /* ========================================
       5. SALVAMENTO E SINCRONIZAÇÃO
    ======================================== */

    function save() {

        localStorage.setItem(
            KEY,
            JSON.stringify(data)
        );


        /* Notificação de atualização */

        window.dispatchEvent(
            new CustomEvent('healthdatachange', {
                detail: data
            })
        );

    }


    /* ========================================
       6. GERAÇÃO DE IDENTIFICADORES
    ======================================== */

    function id() {

        return (
            'x' +
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 7)
        );

    }


    /* ========================================
       7. OPERAÇÕES DE CADASTRO
    ======================================== */

    function add(collection, item) {

        item.id = id();

        data[collection].push(item);

        save();

        return item;

    }


    /* ========================================
       8. OPERAÇÕES DE EXCLUSÃO
    ======================================== */

    function remove(collection, itemId) {

        data[collection] = data[collection].filter(
            item => item.id !== itemId
        );

        save();

    }


    /* ========================================
       9. OPERAÇÕES DE ATUALIZAÇÃO
    ======================================== */

    function update(collection, itemId, patch) {

        const item = data[collection].find(
            element => element.id === itemId
        );

        if (item) {

            Object.assign(item, patch);

        }

        save();

    }


    /* ========================================
       10. ATUALIZAÇÃO DOS DADOS
    ======================================== */

    function refresh() {

        data = load();

        return data;

    }


    /* ========================================
       11. GERENCIAMENTO DE USUÁRIOS
    ======================================== */

    const user = {

        /* Recuperar usuário */

        get() {

            return JSON.parse(
                sessionStorage.getItem('healthUser') || 'null'
            );

        },


        /* Salvar usuário */

        set(userData) {

            sessionStorage.setItem(
                'healthUser',
                JSON.stringify(userData)
            );

        },


        /* Remover usuário */

        clear() {

            sessionStorage.removeItem('healthUser');

        }

    };


    /* ========================================
       12. API GLOBAL DO SISTEMA
    ======================================== */

    window.HealthStore = {

        /* Consulta */

        get: () => data,

        /* Persistência */

        save,

        /* Atualização */

        refresh,

        /* Cadastro */

        add,

        /* Exclusão */

        remove,

        /* Edição */

        update,

        /* Identificadores */

        id,

        /* Usuários */

        user

    };


})();