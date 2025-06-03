console.log('Loading new version of script.js - v3');

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('archiveForm');
    const urlInput = document.getElementById('urlInput');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    const history = document.getElementById('history');
    const timestamps = document.getElementById('timestamps');
    const noHistory = document.getElementById('noHistory');

    // Define the API base URL
    const API_BASE_URL = 'http://localhost:3001/api/archives';

    // Function to handle archive button click
    async function handleArchiveClick(url) {
        try {
            loading.classList.remove('hidden');
            noHistory.classList.add('hidden');
            
            // Archive the website
            const archiveResponse = await fetch(`${API_BASE_URL}/archive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!archiveResponse.ok) {
                const errorText = await archiveResponse.text();
                throw new Error(`Failed to archive website: ${archiveResponse.status} ${errorText}`);
            }

            // Refresh the page to show the new archive
            window.location.reload();
        } catch (err) {
            loading.classList.add('hidden');
            error.classList.remove('hidden');
            errorMessage.textContent = err.message;
            console.error('Archive error:', err);
        }
    }

    // Function to handle view archive button click
    function handleViewArchive(url) {
        window.open(url, '_blank');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = urlInput.value.trim();
        
        // Show loading state
        loading.classList.remove('hidden');
        error.classList.add('hidden');
        history.classList.add('hidden');
        noHistory.classList.add('hidden');

        try {
            // Get the domain from the URL
            let domain;
            try {
                domain = new URL(url).hostname;
                console.log('Domain extracted:', domain);
            } catch (urlError) {
                throw new Error('Invalid URL format. Please enter a valid URL (e.g., https://example.com)');
            }
            
            // First check if we have any history
            const historyUrl = `${API_BASE_URL}/${domain}`;
            console.log('Fetching history from:', historyUrl);
            
            const historyResponse = await fetch(historyUrl);
            console.log('History response status:', historyResponse.status);
            
            if (!historyResponse.ok) {
                const errorText = await historyResponse.text();
                console.error('History response error:', errorText);
                throw new Error(`Failed to fetch archive history: ${historyResponse.status} ${errorText}`);
            }

            const archives = await historyResponse.json();
            console.log('Archives received:', archives);
            
            // Hide loading state
            loading.classList.add('hidden');

            if (archives.length === 0) {
                // Show the "no history" view with archive button
                noHistory.innerHTML = `
                    <i class="fas fa-history"></i>
                    <p>No archive history found for this website.</p>
                    <button id="archiveButton" class="archive-button">
                        <i class="fas fa-archive"></i> Archive Current State
                    </button>
                `;
                noHistory.classList.remove('hidden');

                // Add event listener to the archive button
                document.getElementById('archiveButton').addEventListener('click', () => handleArchiveClick(url));
            } else {
                // Display timestamps
                timestamps.innerHTML = archives.map(archive => {
                    const viewUrl = `http://localhost:3001/snapshots/${archive.path}/index/index.html`;
                    
                    return `
                        <div class="timestamp-card">
                            <div class="timestamp">${new Date(archive.timestamp).toLocaleString()}</div>
                            <div class="timestamp-actions">
                                <button class="view-button" data-url="${viewUrl}">
                                    <i class="fas fa-eye"></i> View Archive
                                </button>
                                <div class="file-path">
                                    <i class="fas fa-folder"></i> ${archive.path}/index/index.html
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                history.classList.remove('hidden');

                // Add event listeners to all view buttons
                document.querySelectorAll('.view-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const url = button.getAttribute('data-url');
                        handleViewArchive(url);
                    });
                });
            }
        } catch (err) {
            loading.classList.add('hidden');
            error.classList.remove('hidden');
            errorMessage.textContent = err.message;
            console.error('Error:', err);
        }
    });
});