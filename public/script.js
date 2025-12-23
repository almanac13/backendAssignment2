const btn = document.getElementById('get-user-btn')
const displayArea = document.getElementById('user-card-container')

btn.addEventListener('click', async () => {
	displayArea.innerHTML = '<p class="loading">Fetching data from server...</p>'

	try {
		const response = await fetch('/api/get-user')
		if (!response.ok) throw new Error('Server error')

		const data = await response.json()

		const newsHTML =
			data.news && data.news.length > 0
				? data.news
						.map(
							article => `
                <div class="news-card">
                    <img src="${article.image}" alt="News Image">
                    <div class="news-content">
                        <h4>${article.title}</h4>
                        <p>${article.description.substring(0, 100)}...</p>
                        <a href="${
													article.url
												}" target="_blank">Read Full Article</a>
                    </div>
                </div>
            `
						)
						.join('')
				: '<p>No recent news found for this country.</p>'

		const cardHTML = `
            <div class="card">
                <div class="profile-header">
                    <img src="${data.image}" alt="Profile" class="profile-img">
                    <h2>${data.firstName} ${data.lastName}</h2> 
                    <span class="gender-tag">${data.gender}</span>
                </div>

                <div class="details-section">
                    <h3>Personal Info</h3>
                    <p><strong>Age:</strong> ${data.age} years</p>
                    <p><strong>Date of Birth:</strong> ${data.dateOfBirth}</p>
                    <p><strong>City:</strong> ${data.city}</p>
                    <p><strong>Address:</strong> ${data.address} </p>
                    <p><strong>Country:</strong> ${data.country} </p>
                </div>

                <div class="country-section">
                    <h3>Country Details</h3>
                    <p><strong>Flag:</strong><img src="${data.flag}" class="flag-icon" width="20"></p>
                    <p><strong>Capital:</strong> ${data.capital}</p>
                    <p><strong>Languages:</strong> ${data.languages}</p>
                    <p><strong>Currency:</strong> ${data.currency}</p>
                </div>

                <div class="exchange-section">
                    <h3>Exchange Rates</h3>
                    <p><strong>USD:</strong> ${data.exchangeUSD}</p>
                    <p><strong>KZT:</strong> ${data.exchangeKZT}</p>
                </div>

                <div class="news-section">
                    <h3>Latest News from ${data.country}</h3>
                    <div class="news-grid">
                        ${newsHTML}
                    </div>
                </div>
            </div>
        `

		displayArea.innerHTML = cardHTML
	} catch (error) {
		console.error('Frontend Error:', error)
		displayArea.innerHTML = `<p class="error">Error: ${error.message}. Please check if the server is running.</p>`
	}
})
