document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('tbody');
  const newButton = document.querySelector('.new-button');
  if (!table || !newButton) return;
  const today = () => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
  const updateCount = () => {
    const count = document.querySelectorAll('.stat h2')[3];
    if (count) count.textContent = String(table.rows.length).padStart(2, '0');
  };
  const bindRow = row => {
    row.querySelector('.edit')?.addEventListener('click', () => {
      const category = prompt('Categoria:', row.cells[0].textContent.trim());
      if (category === null) return;
      const name = prompt('Nome ou descrição:', row.cells[1].textContent.trim());
      if (name === null) return;
      if (category.trim()) row.cells[0].textContent = category.trim();
      if (name.trim()) row.cells[1].textContent = name.trim();
      row.cells[2].textContent = today();
    });
    row.querySelector('.delete')?.addEventListener('click', () => {
      if (confirm(`Excluir o registro "${row.cells[1].textContent.trim()}"?`)) {
        row.remove();
        updateCount();
      }
    });
  };
  [...table.rows].forEach(bindRow);
  newButton.type = 'button';
  newButton.addEventListener('click', () => {
    const category = prompt('Categoria (ex.: Unidades, Profissionais):');
    if (!category?.trim()) return;
    const name = prompt('Nome ou descrição do registro:');
    if (!name?.trim()) return;
    const row = table.insertRow();
    [category.trim(), name.trim(), today()].forEach((value, index) => { row.insertCell(index).textContent = value; });
    row.insertCell().innerHTML = '<span class="status active-status">Ativo</span>';
    row.insertCell().innerHTML = '<button class="edit" type="button">Editar</button>';
    row.insertCell().innerHTML = '<button class="delete" type="button">Excluir</button>';
    bindRow(row);
    updateCount();
  });

  document.querySelectorAll('.menu a').forEach((link, index) => {
    link.href = ['index-1.html', '#cadastros', 'index-3.html', '#cadastros'][index] || '#cadastros';
  });
  const section = document.querySelector('.register-section');
  if (section && !section.id) section.id = 'cadastros';
  document.querySelectorAll('.sidebar-bottom a').forEach(link => {
    link.href = 'index-1.html';
    link.textContent = 'Voltar ao início';
  });
});
