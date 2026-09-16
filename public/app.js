const form = document.getElementById('user-form');
const userIdInput = document.getElementById('user-id');
const saveButton = document.getElementById('save-button');
const cancelButton = document.getElementById('cancel-button');
const usersBody = document.getElementById('users-body');
const statusText = document.getElementById('status');

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? '#b00020' : '#0a7a1f';
}

function formToPayload() {
  const formData = new FormData(form);
  return {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    password: formData.get('password'),
  };
}

function clearForm() {
  form.reset();
  userIdInput.value = '';
  saveButton.textContent = 'Create user';
  cancelButton.hidden = true;
}

function startEditing(user) {
  userIdInput.value = String(user.id);
  form.first_name.value = user.first_name;
  form.last_name.value = user.last_name;
  form.phone.value = user.phone;
  form.email.value = user.email;
  form.password.value = user.password;
  saveButton.textContent = 'Update user';
  cancelButton.hidden = false;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function createRow(user) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${user.id}</td>
    <td>${user.first_name}</td>
    <td>${user.last_name}</td>
    <td>${user.phone}</td>
    <td>${user.email}</td>
    <td>${'*'.repeat(user.password.length)}</td>
    <td></td>
  `;

  const actionsCell = tr.lastElementChild;
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => startEditing(user));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = 'Delete';
  deleteButton.style.background = '#c92828';
  deleteButton.addEventListener('click', async () => {
    try {
      await request(`/api/users/${user.id}`, { method: 'DELETE' });
      await loadUsers();
      setStatus('User deleted successfully.');
      if (Number(userIdInput.value) === user.id) {
        clearForm();
      }
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  actionsCell.append(editButton, deleteButton);
  return tr;
}

async function loadUsers() {
  try {
    const users = await request('/api/users');
    usersBody.innerHTML = '';
    users.forEach((user) => usersBody.appendChild(createRow(user)));
  } catch (error) {
    setStatus(error.message, true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = formToPayload();
  const userId = userIdInput.value;
  const isEdit = userId !== '';

  try {
    if (isEdit) {
      await request(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setStatus('User updated successfully.');
    } else {
      await request('/api/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStatus('User created successfully.');
    }

    clearForm();
    await loadUsers();
  } catch (error) {
    setStatus(error.message, true);
  }
});

cancelButton.addEventListener('click', () => {
  clearForm();
  setStatus('Edit canceled.');
});

loadUsers();
