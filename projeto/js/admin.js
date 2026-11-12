document.addEventListener('DOMContentLoaded', () => {

    /* ========================================
       1. AUTENTICAÇÃO E PERMISSÕES
    ======================================== */

    const user = HealthStore.user.get();

    if (
        !user ||
        sessionStorage.getItem('healthRole') !== 'admin'
    ) {
        location.href = 'index.html';
        return;
    }

    document.getElementById('admin-greeting').textContent = user.name;


    /* ========================================
       2. UTILITÁRIOS
    ======================================== */

    const $ = id => document.getElementById(id);

    const esc = value =>
        String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));

    const fmt = date =>
        new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');

    const today = () =>
        new Date().toISOString().slice(0, 10);


    /* ========================================
       3. NAVEGAÇÃO ENTRE ABAS
    ======================================== */

    document.querySelectorAll('[data-tab]').forEach(button => {
        button.addEventListener('click', () => {
            showTab(button.dataset.tab);
        });
    });

    document.querySelectorAll('[data-goto]').forEach(button => {
        button.addEventListener('click', () => {
            showTab(button.dataset.goto);
        });
    });

    function showTab(name) {

        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle(
                'active',
                tab.dataset.tab === name
            );
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle(
                'active',
                content.id === 'tab-' + name
            );
        });

        if (name === 'mapa') {
            setTimeout(() => map?.invalidateSize(), 150);
        }
    }


    /* ========================================
       4. PREENCHIMENTO DE SELECTS
    ======================================== */

    function fillSelect(id, items, placeholder) {

        const select = $(id);

        if (!select) return;

        const oldValue = select.value;

        select.innerHTML = placeholder
            ? `<option value="">${esc(placeholder)}</option>`
            : '';

        items.forEach(item => {
            select.add(new Option(item.name, item.id));
        });

        if (
            [...select.options].some(option => option.value === oldValue)
        ) {
            select.value = oldValue;
        }
    }


    /* ========================================
       5. ATUALIZAÇÃO DOS DADOS
    ======================================== */

    function refresh() {

        const data = HealthStore.get();

        /* Preenchimento dos campos */

        [
            'config-unit',
            'doctor-unit',
            'event-unit'
        ].forEach(id => {

            fillSelect(
                id,
                data.units,
                id === 'event-unit'
                    ? 'Todas as unidades'
                    : 'Selecione a unidade'
            );

        });

        fillSelect(
            'config-doctor',
            data.doctors,
            'Selecione o médico'
        );


        /* Atendimentos do dia */

        const currentDate = today();

        const todaySchedules = data.schedules.filter(
            schedule => schedule.date === currentDate
        );


        /* Indicadores administrativos */

        $('admin-stats').innerHTML = `

            <div class="stat-card">
                <span class="stat-label">
                    Unidades cadastradas
                </span>

                <strong>${data.units.length}</strong>

                <small>Locais de atendimento</small>
            </div>

            <div class="stat-card">
                <span class="stat-label">
                    Médicos cadastrados
                </span>

                <strong>${data.doctors.length}</strong>

                <small>Profissionais na equipe</small>
            </div>

            <div class="stat-card">
                <span class="stat-label">
                    Fichas configuradas hoje
                </span>

                <strong>
                    ${todaySchedules.reduce(
                        (total, schedule) =>
                            total + Number(schedule.tickets || 0),
                        0
                    )}
                </strong>

                <small>Somatório das unidades</small>
            </div>

        `;


        /* Resumo dos atendimentos */

        $('admin-summary').innerHTML = todaySchedules.length

            ? todaySchedules.map(schedule => {

                const unit = data.units.find(
                    item => item.id === schedule.unitId
                );

                const doctor = data.doctors.find(
                    item => item.id === schedule.doctorId
                );

                return `

                    <div class="admin-item">

                        <div class="item-main">

                            <b>
                                ${esc(unit?.name)} · ${esc(doctor?.name)}
                            </b>

                            <small>
                                ${esc(schedule.start)}–${esc(schedule.end)}
                                · ${esc(schedule.tickets)} fichas
                                · ${esc(schedule.status)}
                            </small>

                        </div>

                    </div>

                `;

            }).join('')

            : `
                <div class="empty-state">
                    Ainda não há atendimentos configurados para hoje.
                </div>
            `;


        /* Listagem de atendimentos */

        $('admin-schedules').innerHTML = list(
            data.schedules,
            'schedules',
            schedule => {

                const unit = data.units.find(
                    item => item.id === schedule.unitId
                );

                const doctor = data.doctors.find(
                    item => item.id === schedule.doctorId
                );

                return `

                    <b>
                        ${fmt(schedule.date)} · ${esc(unit?.name)}
                    </b>

                    <small>
                        ${esc(doctor?.name)}
                        · ${esc(schedule.start)}–${esc(schedule.end)}
                        · ${esc(schedule.tickets)} fichas
                        · ${esc(schedule.status)}
                    </small>

                `;
            }
        );


        /* Listagem de médicos */

        $('doctor-list').innerHTML = list(
            data.doctors,
            'doctors',
            doctor => `

                <b>${esc(doctor.name)}</b>

                <small>
                    ${esc(doctor.specialty)}
                    · ${esc(
                        data.units.find(
                            unit => unit.id === doctor.unitId
                        )?.name || ''
                    )}
                </small>

            `
        );


        /* Listagem de unidades */

        $('unit-list').innerHTML = list(
            data.units,
            'units',
            unit => `

                <b>${esc(unit.name)}</b>

                <small>${esc(unit.address)}</small>

            `
        );


        /* Listagem de eventos */

        $('event-list').innerHTML = list(
            data.events,
            'events',
            event => `

                <b>
                    ${esc(event.title)} · ${fmt(event.date)}
                </b>

                <small>
                    ${esc(event.type)}
                    · ${esc(event.description)}
                </small>

            `
        );


        /* Listagem de regiões */

        $('zone-list').innerHTML = list(
            data.zones,
            'zones',
            zone => `

                <b>${esc(zone.name)}</b>

                <small>${esc(zone.reason)}</small>

            `
        );

    }


    /* ========================================
       6. FUNÇÃO DE LISTAGEM
    ======================================== */

    function list(items, collection, renderHTML) {

        if (!items.length) {
            return `
                <div class="empty-state">
                    Nenhum registro cadastrado.
                </div>
            `;
        }

        return items.map(item => `

            <div class="admin-item">

                <div class="item-main">
                    ${renderHTML(item)}
                </div>

                <button
                    class="delete-btn"
                    data-delete="${collection}"
                    data-id="${esc(item.id)}"
                >
                    Excluir
                </button>

            </div>

        `).join('');
    }


    /* ========================================
       7. EXCLUSÃO DE REGISTROS
    ======================================== */

    document.addEventListener('click', event => {

        const button = event.target.closest('[data-delete]');

        if (!button) return;

        if (!confirm('Deseja realmente excluir este registro?')) {
            return;
        }

        HealthStore.remove(
            button.dataset.delete,
            button.dataset.id
        );

        refresh();

        if (button.dataset.delete === 'zones') {
            drawSavedZones();
        }

    });


    /* ========================================
       8. CADASTRO DE ATENDIMENTOS
    ======================================== */

    $('config-form').elements.date.value = today();

    $('config-form').addEventListener('submit', event => {

        event.preventDefault();

        const form = new FormData(event.target);

        HealthStore.add(
            'schedules',
            Object.fromEntries(form)
        );

        event.target.reset();

        event.target.elements.date.value = today();

        refresh();

        alert('Atendimento salvo com sucesso!');

    });


    /* ========================================
       9. CADASTRO DE MÉDICOS
    ======================================== */

    $('doctor-form').addEventListener('submit', event => {

        event.preventDefault();

        const form = new FormData(event.target);

        HealthStore.add(
            'doctors',
            Object.fromEntries(form)
        );

        event.target.reset();

        refresh();

        alert('Médico cadastrado!');

    });


    /* ========================================
       10. CADASTRO DE UNIDADES
    ======================================== */

    $('unit-form').addEventListener('submit', event => {

        event.preventDefault();

        const form = new FormData(event.target);

        HealthStore.add(
            'units',
            Object.fromEntries(form)
        );

        event.target.reset();

        refresh();

        alert('Unidade cadastrada!');

    });


    /* ========================================
       11. CADASTRO DE EVENTOS
    ======================================== */

    $('event-form').addEventListener('submit', event => {

        event.preventDefault();

        const form = new FormData(event.target);

        HealthStore.add(
            'events',
            Object.fromEntries(form)
        );

        event.target.reset();

        refresh();

        alert('Evento publicado!');

    });


    /* ========================================
       12. CONFIGURAÇÃO DO MAPA
    ======================================== */

    let map = null;

    let drawn = [];

    let draftLayer = null;

    let savedLayer = null;


    /* Inicialização do Leaflet */

    function initMap() {

        if (!window.L) {

            $('admin-map').innerHTML =
                'Mapa indisponível. Verifique sua conexão.';

            return;
        }

        if (map) return;


        /* Criação do mapa */

        map = L.map('admin-map').setView(
            [-23.0, -53.0],
            12
        );


        /* Camada OpenStreetMap */

        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution: '&copy; OpenStreetMap'
            }
        ).addTo(map);


        /* Camadas de regiões */

        draftLayer = L.layerGroup().addTo(map);

        savedLayer = L.layerGroup().addTo(map);


        /* Marcação de pontos */

        map.on('click', event => {

            const latitude = event.latlng.lat;

            const longitude = event.latlng.lng;

            drawn.push([
                latitude,
                longitude
            ]);


            /* Marcador */

            L.circleMarker(
                event.latlng,
                {
                    radius: 5,
                    color: '#16845a',
                    fillOpacity: 1
                }
            ).addTo(draftLayer);


            /* Formação do polígono */

            if (drawn.length >= 3) {

                L.polygon(
                    drawn,
                    {
                        color: '#16845a',
                        fillOpacity: .15
                    }
                ).addTo(draftLayer);

            }


            $('zone-points').textContent =
                `${drawn.length} ponto(s) marcado(s).`;

        });


        /* Exibição das regiões salvas */

        drawSavedZones();


        setTimeout(() => {
            map.invalidateSize();
        }, 200);

    }


    /* ========================================
       13. EXIBIÇÃO DAS REGIÕES SALVAS
    ======================================== */

    function drawSavedZones() {

        if (!map) return;

        savedLayer.clearLayers();

        HealthStore.get().zones.forEach(zone => {

            if (zone.points?.length >= 3) {

                L.polygon(
                    zone.points,
                    {
                        color: '#c34d4d',
                        fillOpacity: .25
                    }
                )
                .bindPopup(esc(zone.name))
                .addTo(savedLayer);

            }

        });

    }


    /* ========================================
       14. LIMPAR MARCAÇÕES DO MAPA
    ======================================== */

    $('clear-zone').addEventListener('click', () => {

        drawn = [];

        draftLayer.clearLayers();

        $('zone-points').textContent =
            'Nenhum ponto marcado.';

    });


    /* ========================================
       15. CADASTRO DE REGIÕES
    ======================================== */

    $('zone-form').addEventListener('submit', event => {

        event.preventDefault();


        /* Validação dos pontos */

        if (drawn.length < 3) {

            alert(
                'Marque pelo menos 3 pontos no mapa para formar uma região.'
            );

            return;
        }


        /* Dados do formulário */

        const form = new FormData(event.target);


        /* Salvamento da região */

        HealthStore.add(
            'zones',
            {
                name: form.get('name'),
                reason: form.get('reason'),
                points: drawn
            }
        );


        /* Limpeza do mapa */

        drawn = [];

        draftLayer.clearLayers();

        event.target.reset();

        $('zone-points').textContent =
            'Nenhum ponto marcado.';


        /* Atualização das informações */

        refresh();

        drawSavedZones();

        alert(
            'Região cadastrada e visível na área pública!'
        );

    });


    /* ========================================
       16. EVENTOS DO MAPA
    ======================================== */

    document
        .querySelector('[data-tab="mapa"]')
        .addEventListener('click', initMap);


    /* ========================================
       17. ATUALIZAÇÃO AUTOMÁTICA
    ======================================== */

    window.addEventListener(
        'healthdatachange',
        refresh
    );


    /* ========================================
       18. INICIALIZAÇÃO
    ======================================== */

    refresh();

});