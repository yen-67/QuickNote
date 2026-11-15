
const addButton = document.querySelector('.add-btn');
const notesArea = document.querySelector('.notes-area');
const searchInput = document.querySelector('#search-input');
const categoryButtons = document.querySelectorAll('.category-list button');
const themeToggle = document.querySelector('#theme-toggle');

// Load existing notes
let notes = JSON.parse(localStorage.getItem('quickNotes')) || [];
let currentCategory = 'All Notes';

// Save notes
function saveNotes() {
    localStorage.setItem('quickNotes', JSON.stringify(notes));
}

// Display notes
function displayNotes(searchText = '', selectedCategory = 'All Notes') {
    notesArea.innerHTML = '';

    const filteredNotes = notes
        .map((note, index) => ({
            ...note,
            originalIndex: index
        }))
        .filter(note => {
            const matchesSearch =
                note.title.toLowerCase().includes(searchText.toLowerCase()) ||
                note.content.toLowerCase().includes(searchText.toLowerCase());

            const matchesCategory =
                selectedCategory === 'All Notes' ||
                (note.category || 'Personal') === selectedCategory;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) =>
            Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
        );

    if (filteredNotes.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';

        const heading = document.createElement('h2');
        heading.textContent = notes.length === 0
            ? 'No Notes Yet'
            : 'No Matching Notes';

        const paragraph = document.createElement('p');
        paragraph.textContent = 'Create or search for another note.';

        emptyState.append(heading, paragraph);
        notesArea.appendChild(emptyState);
        return;
    }

    filteredNotes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';

        const title = document.createElement('h3');
        title.textContent = note.title;

        const content = document.createElement('p');
        content.textContent = note.content;

        const category = document.createElement('small');
        category.textContent = 'Category: ' + (note.category || 'Personal');

        const date = document.createElement('small');
        date.textContent = note.createdAt
            ? 'Created: ' + new Date(note.createdAt).toLocaleString()
            : 'Previously created';

        const pinButton = document.createElement('button');
        pinButton.textContent = note.pinned ? 'Unpin' : 'Pin';

        pinButton.addEventListener('click', () => {
            notes[note.originalIndex].pinned =
                !notes[note.originalIndex].pinned;

            saveNotes();
            displayNotes(searchInput.value, currentCategory);
        });

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';

        editButton.addEventListener('click', () => {
            createEditor(note.originalIndex);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';

        deleteButton.addEventListener('click', () => {
            notes.splice(note.originalIndex, 1);
            saveNotes();
            displayNotes(searchInput.value, currentCategory);
        });

        card.append(
            title,
            content,
            category,
            document.createElement('br'),
            date,
            document.createElement('br'),
            pinButton,
            editButton,
            deleteButton
        );

        notesArea.appendChild(card);
    });
}

// Create or edit note
function createEditor(editIndex = null) {
    if (document.querySelector('.note-editor')) return;

    const isEditing = editIndex !== null;
    const currentNote = isEditing ? notes[editIndex] : null;

    const editor = document.createElement('div');
    editor.className = 'note-editor';

    editor.innerHTML = `
        <h2>${isEditing ? 'Edit Note' : 'Create New Note'}</h2>

        <input type="text" id="note-title"
            placeholder="Enter note title">

        <textarea id="note-content"
            placeholder="Write your note..."></textarea>

        <select id="note-category">
            <option value="Study">Study</option>
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
        </select>

        <button id="save-note">Save Note</button>
        <button id="cancel-note">Cancel</button>
    `;

    notesArea.prepend(editor);

    const titleInput = editor.querySelector('#note-title');
    const contentInput = editor.querySelector('#note-content');
    const categoryInput = editor.querySelector('#note-category');

    if (isEditing) {
        titleInput.value = currentNote.title;
        contentInput.value = currentNote.content;
        categoryInput.value = currentNote.category || 'Personal';
    } else {
        categoryInput.value = 'Personal';
    }

    editor.querySelector('#save-note').addEventListener('click', () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            alert('Please enter both title and note content.');
            return;
        }

        if (isEditing) {
            notes[editIndex] = {
                ...currentNote,
                title,
                content,
                category: categoryInput.value,
                createdAt: currentNote.createdAt || Date.now(),
                pinned: Boolean(currentNote.pinned)
            };
        } else {
            notes.push({
                title,
                content,
                category: categoryInput.value,
                createdAt: Date.now(),
                pinned: false
            });
        }

        saveNotes();
        searchInput.value = '';
        displayNotes('', currentCategory);
    });

    editor.querySelector('#cancel-note').addEventListener('click', () => {
        editor.remove();
    });
}

// New Note button
addButton.addEventListener('click', () => {
    createEditor();
});

// Search notes
searchInput.addEventListener('input', () => {
    displayNotes(searchInput.value, currentCategory);
});

// Category filter
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));

        button.classList.add('active');
        currentCategory = button.dataset.category;

        displayNotes(searchInput.value, currentCategory);
    });
});

// Dark Mode
if (localStorage.getItem('quickNoteTheme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = 'Light Mode';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    const isDark = document.body.classList.contains('dark-mode');

    themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';

    localStorage.setItem(
        'quickNoteTheme',
        isDark ? 'dark' : 'light'
    );
});

// Initial display
displayNotes();
