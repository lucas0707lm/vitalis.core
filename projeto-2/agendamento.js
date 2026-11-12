document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.dates');
  const label = document.querySelector('.calendar-header strong');
  const title = document.querySelector('.details > h3');
  const timeButtons = [...document.querySelectorAll('.times button')];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  let shown = new Date(2026, 10, 1);
  let selected = new Date(2026, 10, 12);
  let selectedTime = '';
  const formatDate = date => new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  const renderCalendar = () => {
    label.textContent = `${monthNames[shown.getMonth()]} ${shown.getFullYear()}`;
    grid.replaceChildren();
    const startDay = new Date(shown.getFullYear(), shown.getMonth(), 1).getDay();
    const totalDays = new Date(shown.getFullYear(), shown.getMonth() + 1, 0).getDate();
    for (let i = 0; i < startDay; i += 1) {
      const blank = document.createElement('span');
      blank.className = 'muted';
      grid.append(blank);
    }
    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(shown.getFullYear(), shown.getMonth(), day);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.textContent = day;
      cell.setAttribute('aria-label', formatDate(date));
      if (date.toDateString() === selected.toDateString()) cell.classList.add('selected');
      cell.addEventListener('click', () => {
        selected = date;
        title.textContent = formatDate(selected);
        selectedTime = '';
        timeButtons.forEach(button => button.classList.remove('chosen'));
        renderCalendar();
      });
      grid.append(cell);
    }
  };
  document.querySelectorAll('.calendar-header button').forEach((button, index) => {
    button.type = 'button';
    button.textContent = index === 0 ? '‹' : '›';
    button.setAttribute('aria-label', index === 0 ? 'Mês anterior' : 'Próximo mês');
    button.addEventListener('click', () => {
      shown = new Date(shown.getFullYear(), shown.getMonth() + (index ? 1 : -1), 1);
      renderCalendar();
    });
  });
  timeButtons.forEach(button => {
    button.type = 'button';
    button.addEventListener('click', () => {
      timeButtons.forEach(item => item.classList.remove('chosen'));
      button.classList.add('chosen');
      selectedTime = button.textContent.trim();
    });
  });
  document.querySelector('.confirm')?.addEventListener('click', () => {
    if (!selectedTime) return alert('Selecione um horário antes de confirmar.');
    alert(`Agendamento confirmado para ${formatDate(selected)}, às ${selectedTime}.`);
  });

  document.querySelectorAll('nav a').forEach((link, index) => {
    link.href = ['index-1.html', 'index-3.html', 'index-2.html#cadastros', 'index-2.html#cadastros'][index] || 'index-1.html';
  });
  document.querySelectorAll('.sidebar-bottom a').forEach((link, index) => {
    link.href = index === 0 ? 'index-2.html' : 'index-1.html';
    if (index > 0) link.textContent = 'Voltar ao início';
  });
  renderCalendar();
});
