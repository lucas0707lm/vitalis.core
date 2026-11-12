document.addEventListener('DOMContentLoaded', () => {

    /* ========================================
       1. SELEÇÃO DO TIPO DE ACESSO
    ======================================== */

    document.querySelectorAll('[data-role]').forEach(button => {

        button.addEventListener('click', () => {

            const role = button.dataset.role;

            sessionStorage.setItem('healthRole', role);

            location.href = 'identificacao.html';

        });

    });


    /* ========================================
       2. FORMULÁRIO DE IDENTIFICAÇÃO
    ======================================== */

    const form = document.getElementById('identity-form');

    if (!form) return;


    /* ========================================
       3. VERIFICAÇÃO DO TIPO DE USUÁRIO
    ======================================== */

    const role = sessionStorage.getItem('healthRole');

    if (!role) {

        location.href = 'index.html';

        return;

    }


    /* ========================================
       4. CARREGAMENTO DAS UNIDADES
    ======================================== */

    const unit = document.getElementById('identity-unit');

    const data = HealthStore.get();

    data.units.forEach(item => {

        unit.add(
            new Option(item.name, item.id)
        );

    });


    /* ========================================
       5. ENVIO DO FORMULÁRIO
    ======================================== */

    form.addEventListener('submit', event => {

        event.preventDefault();

        const formData = new FormData(form);


        /* Dados do usuário */

        const user = {

            name: formData.get('nome').trim(),

            document: formData.get('documento').trim(),

            unitId: formData.get('unidade')

        };


        /* Salvamento dos dados */

        HealthStore.user.set(user);


        /* Redirecionamento conforme o perfil */

        location.href = role === 'admin'
            ? 'admin.html'
            : 'publico.html';

    });

});
