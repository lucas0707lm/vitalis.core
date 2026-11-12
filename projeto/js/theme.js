(() => {

    /* ========================================
       1. CONFIGURAÇÕES
    ======================================== */

    const KEY = 'healthTheme';


    /* ========================================
       2. APLICAÇÃO DO TEMA
    ======================================== */

    function applyTheme(theme) {

        /* Atualiza o tema da página */

        document.documentElement.dataset.theme = theme;


        /* Salva a preferência do usuário */

        localStorage.setItem(KEY, theme);


        /* Atualiza os botões de alternância */

        document.querySelectorAll('[data-theme-toggle]')
            .forEach(button => {

                const label = button.querySelector('.theme-label');


                /* Atualiza o texto */

                if (label) {

                    label.textContent = theme === 'dark'
                        ? 'Modo claro'
                        : 'Modo escuro';

                }


                /* Atualiza a acessibilidade */

                button.setAttribute(
                    'aria-label',
                    theme === 'dark'
                        ? 'Ativar modo claro'
                        : 'Ativar modo escuro'
                );

            });

    }


    /* ========================================
       3. CARREGAMENTO DO TEMA SALVO
    ======================================== */

    const savedTheme = localStorage.getItem(KEY) || 'light';

    applyTheme(savedTheme);


    /* ========================================
       4. ALTERNÂNCIA ENTRE OS TEMAS
    ======================================== */

    document.addEventListener('click', event => {

        const button = event.target.closest('[data-theme-toggle]');

        if (!button) return;


        /* Identifica o tema atual */

        const currentTheme =
            document.documentElement.dataset.theme;


        /* Alterna entre claro e escuro */

        const newTheme = currentTheme === 'dark'
            ? 'light'
            : 'dark';


        /* Aplica o novo tema */

        applyTheme(newTheme);

    });

})();