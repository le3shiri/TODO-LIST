// Initialize tasks array from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let taskToDelete = null;

// File validation
function validateFile(file) {
    const maxSize = 250 * 1024 * 1024; // 250MB
    if (file.size > maxSize) {
        alert('File is too large. Please select a file under 250MB.');
        return false;
    }

    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validTypes = [...validVideoTypes, ...validImageTypes];

    if (!validTypes.includes(file.type)) {
        alert('Please select a valid file (MP4, WebM, Ogg, JPG, PNG, GIF, WebP).');
        return false;
    }

    return true;
}

// Check if file is video
function isVideo(fileType) {
    return fileType.startsWith('video/');
}

// File input change handler
document.getElementById('mediaFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('uploadPreview');
    
    if (file && validateFile(file)) {
        const fileURL = URL.createObjectURL(file);
        if (isVideo(file.type)) {
            preview.innerHTML = `
                <video controls>
                    <source src="${fileURL}" type="${file.type}">
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            preview.innerHTML = `
                <img src="${fileURL}" alt="Preview" style="max-width: 300px;">
            `;
        }
    } else {
        preview.innerHTML = '';
    }
});

// Add new task
function addTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const assignee = document.getElementById('taskAssignee').value;
    const status = document.getElementById('taskStatus').value;
    const mediaFile = document.getElementById('mediaFile').files[0];

    if (!title || !description || !assignee) {
        alert('Please fill in all required fields');
        return;
    }

    if (mediaFile && !validateFile(mediaFile)) {
        return;
    }

    if (mediaFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const task = {
                id: Date.now(),
                title,
                description,
                assignee,
                status,
                media: e.target.result,
                fileName: mediaFile.name,
                fileType: mediaFile.type
            };
            
            tasks.push(task);
            saveTasks();
            renderTasks();
            clearForm();
        };
        reader.readAsDataURL(mediaFile);
    } else {
        const task = {
            id: Date.now(),
            title,
            description,
            assignee,
            status,
            media: null,
            fileName: null,
            fileType: null
        };
        
        tasks.push(task);
        saveTasks();
        renderTasks();
        clearForm();
    }
}

// Update task status
function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        saveTasks();
        renderTasks();
    }
}

// Delete task functions
function deleteTask(taskId) {
    taskToDelete = taskId;
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'flex';
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'none';
    taskToDelete = null;
}

function confirmDelete() {
    if (taskToDelete === null) return;

    const taskElement = document.querySelector(`.task-item[data-id="${taskToDelete}"]`);
    if (taskElement) {
        taskElement.classList.add('deleting');
        
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== taskToDelete);
            saveTasks();
            renderTasks();
            closeDeleteModal();
        }, 300);
    }
}

// Render tasks
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.setAttribute('data-id', task.id);
        
        let mediaElement = '';
        if (task.media) {
            if (task.fileType.startsWith('video/')) {
                mediaElement = `
                    <div class="media-container">
                        <video controls>
                            <source src="${task.media}" type="${task.fileType}">
                            Your browser does not support the video tag.
                        </video>
                        <p class="file-name">File: ${task.fileName}</p>
                    </div>
                `;
            } else {
                mediaElement = `
                    <div class="media-container">
                        <img src="${task.media}" alt="Task media" class="media-preview">
                        <p class="file-name">File: ${task.fileName}</p>
                    </div>
                `;
            }
        }
        
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p class="task-assignee">Assigned to: ${task.assignee}</p>
            <div class="task-status status-${task.status}">${task.status.toUpperCase()}</div>
            ${mediaElement}
            <select onchange="updateTaskStatus(${task.id}, this.value)">
                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;

        taskList.appendChild(taskElement);
    });
}

// Clear form
function clearForm() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskAssignee').value = '';
    document.getElementById('taskStatus').value = 'pending';
    document.getElementById('mediaFile').value = '';
    document.getElementById('uploadPreview').innerHTML = '';
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Modal click outside handler
window.onclick = function(event) {
    const modal = document.getElementById('deleteModal');
    if (event.target === modal) {
        closeDeleteModal();
    }
}

// Keyboard support for modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeDeleteModal();
    }
});

// Initial render
renderTasks(); 