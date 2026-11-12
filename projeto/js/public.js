javascript
document.addEventListener('DOMContentLoaded', () => {

    /* ========================================
       1. CARREGAMENTO INICIAL
    ======================================== */

    const data = HealthStore.get();
    const user = HealthStore.user.get();

    if (!user) {
        location.href = 'index.html';
        return;
    }


    /* ========================================
       2. ELEMENTOS DA INTERFACE
    ======================================== */

    const $ = id => document.getElementById(id);

    const publicName = $('public-name');
    const userGreeting = $('user-greeting');
    const todayLabel = $('today-label');
    const filter = $('public-unit-filter');


    /* ========================================
       3. IDENTIFICAÇÃO DO USUÁRIO
    ======================================== */

    publicName.textContent = user.name.split(' ')[0];

    userGreeting.textContent = user.name;


    /* ========================================
       4. EXIBIÇÃO DA DATA ATUAL
    ======================================== */

    const today = new Date();

    todayLabel.textContent = today.toLocaleDateString(
        'pt-BR',
        {
            weekday: 'long',
            day: '2-digit',
            month: 'long'
        }
    );


    /* ========================================
       5. CARREGAMENTO DAS UNIDADES
    ======================================== */

    data.units.forEach(unit => {

        filter.add(
            new Option(unit.name, unit.id)
        );

    });


    /* ========================================
       6. ATUALIZAÇÃO DO PAINEL PÚBLICO
    ======================================== */

    function render() {

        const data = HealthStore.get();

        const unitId = filter.value;

        const todayStr = new Date()
            .toISOString()
            .slice(0, 10);


        /* ====================================
           6.1. INDICADORES DO DIA
        ==================================== */

        const todaysSchedules = data.schedules.filter(
            schedule => schedule.date === todayStr
        );

        const available = todaysSchedules.filter(
            schedule => schedule.status === 'Disponível'
        ).length;

        const tickets = todaysSchedules.reduce(
            (total, schedule) =>
                total + Number(schedule.tickets || 0),
            0
        );


        /* ====================================
           6.2. CARDS DE ESTATÍSTICAS
        ==================================== */

        $('public-stats').innerHTML = `

            <div class="stat-card">

                <span class="stat-label">
                    Atendimentos hoje
                </span>

                <strong>${todaysSchedules.length}</strong>

                <small>
                    Programações cadastradas
                </small>

            </div>


            <div class="stat-card">

                <span class="stat-label">
                    Disponíveis
                </span>

                <strong>${available}</strong>

                <small>
                    Horários liberados
                </small>

            </div>


            <div class="stat-card">

                <span class="stat-label">
                    Fichas previstas
                </span>

                <strong>${tickets}</strong>

                <small>
                    Quantidade configurada
                </small>

            </div>

        `;


        /* ====================================
           6.3. LISTAGEM DE ATENDIMENTOS
        ==================================== */

        const schedules = data.schedules

            .filter(schedule =>
                !unitId || schedule.unitId === unitId
            )

            .sort((a, b) =>
                (a.date + a.start).localeCompare(
                    b.date + b.start
                )
            );


        $('schedule-list').innerHTML = schedules.length

            ? schedules.map(schedule => {

                const unit = data.units.find(
                    item => item.id === schedule.unitId
                );

                const doctor = data.doctors.find(
                    item => item.id === schedule.doctorId
                );

                const statusClass =
                    schedule.status === 'Disponível'
                        ? 'available'
                        : 'unavailable';


                return `

                    <article class="schedule-item">

                        <div class="time-box">

                            ${escapeHtml(schedule.start)}
                            –
                            ${escapeHtml(schedule.end)}

                            <small style="display: block; font-weight: 500">

                                ${fmtDate(schedule.date)}

                            </small>

                        </div>


                        <div class="item-main">

                            <b>
                                ${escapeHtml(
                                    doctor?.name ||
                                    'Profissional não definido'
                                )}
                            </b>

                            <small>

                                ${escapeHtml(doctor?.specialty || '')}

                                ·

                                ${escapeHtml(
                                    unit?.name ||
                                    'Unidade não definida'
                                )}

                                ·

                                ${escapeHtml(schedule.tickets)} fichas

                            </small>

                        </div>


                        <span class="status ${statusClass}">

                            ${escapeHtml(schedule.status)}

                        </span>

                    </article>

                `;

            }).join('')

            : `

                <div class="empty-state">

                    Nenhum horário cadastrado para este filtro.

                </div>

            `;


        /* ====================================
           6.4. LISTAGEM DE EVENTOS
        ==================================== */

        const events = [...data.events].sort(
            (a, b) => a.date.localeCompare(b.date)
        );


        $('public-events').innerHTML = events.length

            ? events.map(event => {

                const unit = data.units.find(
                    item => item.id === event.unitId
                );

                const date = new Date(
                    event.date + 'T12:00:00'
                );


                return `

                    <article class="event-item">


                        <div class="event-date">

                            ${date.toLocaleDateString(
                                'pt-BR',
                                {
                                    month: 'short'
                                }
                            ).replace('.', '')}

                            <strong>
                                ${date.getDate()}
                            </strong>

                        </div>


                        <div class="item-main">

                            <b>
                                ${escapeHtml(event.title)}
                            </b>


                            <small>

                                ${escapeHtml(event.type)}

                                ·

                                ${fmtDate(event.date)}

                                ${unit
                                    ? ' · ' + escapeHtml(unit.name)
                                    : ''
                                }

                            </small>


                            <small style="display: block; margin-top: 4px">

                                ${escapeHtml(event.description)}

                            </small>

                        </div>

                    </article>

                `;

            }).join('')

            : `

                <div class="empty-state">

                    Nenhum evento ou aviso publicado.

                </div>

            `;


        /* ====================================
           6.5. ATUALIZAÇÃO DO MAPA
        ==================================== */

        renderMap(data.zones);

    }


    /* ========================================
       7. CONFIGURAÇÃO DO MAPA
    ======================================== */

    let map = null;

    let zoneLayer = null;


    /* ========================================
       8. EXIBIÇÃO DAS REGIÕES NO MAPA
    ======================================== */

    function renderMap(zones) {

        if (!window.L) {

            $('public-map').innerHTML = `

                <div class="empty-state">

                    Mapa indisponível.
                    Verifique sua conexão.

                </div>

            `;

            return;
        }


        /* Inicialização do mapa */

        if (!map) {

            map = L.map('public-map').setView(
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


            /* Camada das regiões */

            zoneLayer = L.layerGroup().addTo(map);


            /* Ajuste do tamanho do mapa */

            setTimeout(() => {
                map.invalidateSize();
            }, 250);

        }


        /* Limpeza das regiões anteriores */

        zoneLayer.clearLayers();


        /* Desenho das regiões cadastradas */

        zones.forEach(zone => {

            if (zone.points?.length >= 3) {

                L.polygon(
                    zone.points,
                    {
                        color: '#c34d4d',
                        fillColor: '#e56c6c',
                        fillOpacity: .35,
                        weight: 2
                    }
                )

                .bindPopup(`

                    <b>${escapeHtml(zone.name)}</b>

                    <br>

                    ${escapeHtml(zone.reason)}

                `)

                .addTo(zoneLayer);

            }

        });


        /* Atualização visual */

        setTimeout(() => {
            map.invalidateSize();
        }, 100);

    }


    /* ========================================
       9. FORMATAÇÃO DE DATAS
    ======================================== */

    function fmtDate(date) {

        return new Date(
            date + 'T12:00:00'
        ).toLocaleDateString('pt-BR');

    }


    /* ========================================
       10. PROTEÇÃO DE TEXTOS HTML
    ======================================== */

    function escapeHtml(value = '') {

        return String(value).replace(
            /[&<>"']/g,
            char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char])
        );

    }


    /* ========================================
       11. FILTRO DE UNIDADES
    ======================================== */

    filter.addEventListener('change', render);


    /* ========================================
       12. ATUALIZAÇÃO AUTOMÁTICA
    ======================================== */

    window.addEventListener(
        'healthdatachange',
        render
    );


    /* ========================================
       13. INICIALIZAÇÃO DO PAINEL
    ======================================== */

    render();

});