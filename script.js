// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    const tasksContainer = document.getElementById('tasks-container');
    const refreshBtn = document.getElementById('refresh-btn');
    
    // Load tasks from JSON file
    fetch('tasks.json')
        .then(response => response.json())
        .then(allTasks => {
            initializeApp(allTasks);
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
            tasksContainer.innerHTML = '<p>Error loading tasks. Please refresh the page.</p>';
        });
    
    function initializeApp(allTasks) {
        // Check if we have saved tasks in localStorage
        let currentTasks = JSON.parse(localStorage.getItem('dailyTasks')) || [];
        const lastUpdated = localStorage.getItem('lastUpdated');
        
        // If no saved tasks or it's a new day, get new random tasks
        if (currentTasks.length === 0 || !isSameDay(new Date(lastUpdated), new Date())) {
            currentTasks = getRandomTasks(allTasks, 3);
            saveTasks(currentTasks);
        }
        
        // Display tasks
        renderTasks(currentTasks);
        
        // Set up refresh button
        refreshBtn.addEventListener('click', function() {
            currentTasks = getRandomTasks(allTasks, 3);
            saveTasks(currentTasks);
            renderTasks(currentTasks);
        });
    }
    
    function getRandomTasks(allTasks, count) {
        // Create a copy of the array to avoid modifying the original
        const tasksCopy = [...allTasks];
        const randomTasks = [];
        
        // Get random tasks without duplicates
        for (let i = 0; i < count && tasksCopy.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * tasksCopy.length);
            randomTasks.push({
                text: tasksCopy[randomIndex],
                completed: false
            });
            tasksCopy.splice(randomIndex, 1);
        }
        
        return randomTasks;
    }
    
    function renderTasks(tasks) {
        tasksContainer.innerHTML = '';
        
        tasks.forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.className = `task ${task.completed ? 'completed' : ''}`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', function() {
                task.completed = this.checked;
                taskElement.className = `task ${task.completed ? 'completed' : ''}`;
                saveTasks(tasks);
            });
            
            const label = document.createElement('label');
            label.textContent = task.text;
            
            taskElement.appendChild(checkbox);
            taskElement.appendChild(label);
            tasksContainer.appendChild(taskElement);
        });
    }
    
    function saveTasks(tasks) {
        localStorage.setItem('dailyTasks', JSON.stringify(tasks));
        localStorage.setItem('lastUpdated', new Date().toISOString());
    }
    
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
});