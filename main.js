// Initialize issues from localStorage or empty array
let issues = JSON.parse(localStorage.getItem('issues')) || [];

// Initialize theme from localStorage or default to light
const currentTheme = localStorage.getItem('theme') || 'light';
document.body.classList.add(currentTheme);

// Function to toggle dark mode
function toggleDarkMode(event) {
    if (event.target.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

// Event listener for Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.checked = currentTheme === 'dark';
darkModeToggle.addEventListener('change', toggleDarkMode);

// Function to submit a new issue
function submitIssue(event) {
    event.preventDefault(); // Prevent form from submitting

    // Gather form data
    const title = document.getElementById('issueTitle').value.trim();
    const description = document.getElementById('issueDescription').value.trim();
    const severity = document.getElementById('issueSeverity').value;
    const priority = document.getElementById('issuePriority').value;
    const steps = document.getElementById('issueSteps').value.trim();
    const environment = document.getElementById('issueEnvironment').value.trim();
    const assignedTo = document.getElementById('issueAssignedTo').value.trim();

    // Enhanced validation with user-friendly feedback
    if (!title || !description || !severity || !priority || !steps || !environment || !assignedTo) {
        alert('Please fill in all fields.');
        return;
    }

    // Create issue object
    const issue = {
        id: Date.now().toString(),
        title,
        description,
        severity,
        priority,
        steps,
        environment,
        assignedTo,
        status: 'Open',
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
    };

    // Add to issues array and save to localStorage
    issues.push(issue);
    localStorage.setItem('issues', JSON.stringify(issues));

    // Reset form
    document.getElementById('issueInputForm').reset();

    // Update UI
    fetchIssues();
    populateAssigneesFilter();
    updateSearchAutocomplete();
}

// Function to fetch and display issues
function fetchIssues(filteredIssues = null) {
    const issuesList = document.getElementById('issuesList');
    issuesList.innerHTML = '';

    const displayIssues = filteredIssues || issues;

    if (displayIssues.length === 0) {
        issuesList.innerHTML = '<p>No bugs reported yet.</p>';
        return;
    }

    displayIssues.forEach(issue => {
        const issueCard = document.createElement('div');
        issueCard.className = 'issue-card';

        // Determine label color based on status
        let statusLabelClass = '';
        switch (issue.status) {
            case 'Open':
                statusLabelClass = 'label-info';
                break;
            case 'In Progress':
                statusLabelClass = 'label-warning';
                break;
            case 'Resolved':
                statusLabelClass = 'label-success';
                break;
            case 'Closed':
                statusLabelClass = 'label-danger';
                break;
            default:
                statusLabelClass = 'label-info';
        }

        issueCard.innerHTML = `
            <h6><i class="fas fa-ticket-alt"></i> Bug ID: ${issue.id} | Created: ${issue.createdAt}</h6>
            <h3>${issue.title}</h3>
            <p><strong>Description:</strong> ${issue.description}</p>
            <p><strong>Severity:</strong> ${issue.severity}</p>
            <p><strong>Priority:</strong> ${issue.priority}</p>
            <p><strong>Steps to Reproduce:</strong> ${issue.steps}</p>
            <p><strong>Environment:</strong> ${issue.environment}</p>
            <p><strong>Assigned To:</strong> ${issue.assignedTo}</p>
            <p><strong>Status:</strong> <span class="label ${statusLabelClass}">${issue.status}</span></p>
            <div class="issue-actions">
                <button class="btn btn-edit" onclick="openEditModal('${issue.id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-warning" onclick="changeStatus('${issue.id}')"><i class="fas fa-sync-alt"></i> Change Status</button>
                <button class="btn btn-danger" onclick="deleteIssue('${issue.id}')"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>
        `;

        issuesList.appendChild(issueCard);
    });
}

// Function to delete an issue
function deleteIssue(id) {
    if (!confirm('Are you sure you want to delete this bug?')) return;

    issues = issues.filter(issue => issue.id !== id);
    localStorage.setItem('issues', JSON.stringify(issues));
    fetchIssues();
    populateAssigneesFilter();
    updateSearchAutocomplete();
}

// Function to open the edit modal
function openEditModal(id) {
    const issue = issues.find(issue => issue.id === id);
    if (!issue) return;

    // Populate the form with existing data
    document.getElementById('editIssueId').value = issue.id;
    document.getElementById('editIssueTitle').value = issue.title;
    document.getElementById('editIssueDescription').value = issue.description;
    document.getElementById('editIssueSeverity').value = issue.severity;
    document.getElementById('editIssuePriority').value = issue.priority;
    document.getElementById('editIssueSteps').value = issue.steps;
    document.getElementById('editIssueEnvironment').value = issue.environment;
    document.getElementById('editIssueAssignedTo').value = issue.assignedTo;
    document.getElementById('editIssueStatus').value = issue.status;

    // Display the modal
    const editModal = document.getElementById('editModal');
    editModal.style.display = 'flex';
}

// Function to close the modal
function closeModal() {
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.style.display = 'none';
    }

    // Optionally, reset the edit form fields
    const editForm = document.getElementById('editIssueForm');
    if (editForm) {
        editForm.reset();
    }
}

// Function to update an issue
function updateIssue(event) {
    event.preventDefault();

    const id = document.getElementById('editIssueId').value;
    const title = document.getElementById('editIssueTitle').value.trim();
    const description = document.getElementById('editIssueDescription').value.trim();
    const severity = document.getElementById('editIssueSeverity').value;
    const priority = document.getElementById('editIssuePriority').value;
    const steps = document.getElementById('editIssueSteps').value.trim();
    const environment = document.getElementById('editIssueEnvironment').value.trim();
    const assignedTo = document.getElementById('editIssueAssignedTo').value.trim();
    const status = document.getElementById('editIssueStatus').value;

    // Enhanced validation
    if (!title || !description || !severity || !priority || !steps || !environment || !assignedTo || !status) {
        alert('Please fill in all fields.');
        return;
    }

    // Find and update the issue
    const issueIndex = issues.findIndex(issue => issue.id === id);
    if (issueIndex === -1) {
        alert('Issue not found.');
        return;
    }

    issues[issueIndex] = {
        ...issues[issueIndex],
        title,
        description,
        severity,
        priority,
        steps,
        environment,
        assignedTo,
        status,
        updatedAt: new Date().toLocaleString(),
    };

    localStorage.setItem('issues', JSON.stringify(issues));
    fetchIssues();
    populateAssigneesFilter();
    updateSearchAutocomplete();

    // Close the modal after updating
    closeModal();
}

// Function to change the status of an issue
function changeStatus(id) {
    const issue = issues.find(issue => issue.id === id);
    if (!issue) return;

    // Define the order of statuses
    const statusOrder = ['Open', 'In Progress', 'Resolved', 'Closed'];
    const currentIndex = statusOrder.indexOf(issue.status);

    if (currentIndex === -1 || currentIndex === statusOrder.length - 1) {
        alert('Cannot change status further.');
        return;
    }

    // Update status to the next one in the order
    issue.status = statusOrder[currentIndex + 1];
    issue.updatedAt = new Date().toLocaleString();
    localStorage.setItem('issues', JSON.stringify(issues));
    fetchIssues();
}

// Function to search issues
function searchIssues() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filteredIssues = issues.filter(issue =>
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query)
    );
    fetchIssues(filteredIssues);
}

// Function to filter issues
function filterIssues() {
    const status = document.getElementById('filterStatus').value;
    const severity = document.getElementById('filterSeverity').value;
    const priority = document.getElementById('filterPriority').value;
    const assignedTo = document.getElementById('filterAssignedTo').value;

    let filteredIssues = [...issues];

    if (status) {
        filteredIssues = filteredIssues.filter(issue => issue.status === status);
    }
    if (severity) {
        filteredIssues = filteredIssues.filter(issue => issue.severity === severity);
    }
    if (priority) {
        filteredIssues = filteredIssues.filter(issue => issue.priority === priority);
    }
    if (assignedTo) {
        filteredIssues = filteredIssues.filter(issue => issue.assignedTo === assignedTo);
    }

    fetchIssues(filteredIssues);
}

// Function to populate the assignees filter based on existing issues
function populateAssigneesFilter() {
    const filterAssignedTo = document.getElementById('filterAssignedTo');
    const assignees = [...new Set(issues.map(issue => issue.assignedTo))];

    // Clear existing options except the first
    filterAssignedTo.innerHTML = '<option value="">All Assignees</option>';

    assignees.forEach(assignee => {
        const option = document.createElement('option');
        option.value = assignee;
        option.textContent = assignee;
        filterAssignedTo.appendChild(option);
    });
}

// Function to update search autocomplete suggestions
function updateSearchAutocomplete() {
    const searchInput = document.getElementById('searchInput');
    const datalist = document.getElementById('search-suggestions');

    if (datalist) {
        datalist.innerHTML = ''; // Clear previous suggestions
    } else {
        // Create datalist if it doesn't exist
        const newDatalist = document.createElement('datalist');
        newDatalist.id = 'search-suggestions';
        document.body.appendChild(newDatalist);
    }

    const suggestionsList = document.getElementById('search-suggestions');
    const titles = [...new Set(issues.map(issue => issue.title))];
    const descriptions = [...new Set(issues.map(issue => issue.description))];
    const suggestions = [...titles, ...descriptions];

    suggestions.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        suggestionsList.appendChild(option);
    });

    searchInput.setAttribute('list', 'search-suggestions');
}

// Event listener for DOMContentLoaded to initialize functions
document.addEventListener('DOMContentLoaded', () => {
    fetchIssues();
    populateAssigneesFilter();
    updateSearchAutocomplete();
});

// Event listener to close the modal when clicking outside of it
window.onclick = function(event) {
    const editModal = document.getElementById('editModal');
    if (editModal && event.target === editModal) {
        closeModal();
    }
}

// Event listeners for input fields
document.getElementById('issueInputForm').addEventListener('submit', submitIssue);
document.getElementById('searchInput').addEventListener('input', searchIssues);
document.getElementById('filterStatus').addEventListener('change', filterIssues);
document.getElementById('filterSeverity').addEventListener('change', filterIssues);
document.getElementById('filterPriority').addEventListener('change', filterIssues);
document.getElementById('filterAssignedTo').addEventListener('change', filterIssues);
document.getElementById('editIssueForm').addEventListener('submit', updateIssue);

// Function to ensure modal closes properly after update
function closeModal() {
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.style.display = 'none';
    }

    // Optionally, reset the edit form fields
    const editForm = document.getElementById('editIssueForm');
    if (editForm) {
        editForm.reset();
    }
}
