require('dotenv').config()
const express = require('express')
const path = require('path')

const app = express()
const PORT = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'index.html'))
})

app.get('/api/get-user', async (req, res) => {
	try {
		const userRes = await fetch('https://randomuser.me/api/')
		if (!userRes.ok) throw new Error('Random User API failed')
		const userJson = await userRes.json()
		const userData = userJson.results[0]
		const userCountry = userData.location.country

		let countryDetails = {
			capital: 'N/A',
			languages: 'N/A',
			currency: 'N/A',
			flag: '',
		}
		let currencyCode = 'USD'
		let articles = []
		let usdRate = 0
		let kztRate = 0

		try {
			const countryRes = await fetch(
				`https://restcountries.com/v3.1/name/${encodeURIComponent(
					userCountry
				)}?fullText=true`
			)
			if (countryRes.ok) {
				const countryJson = await countryRes.json()
				if (countryJson.length > 0) {
					const c = countryJson[0]
					currencyCode = Object.keys(c.currencies || { USD: {} })[0]

					countryDetails = {
						capital: c.capital ? c.capital[0] : 'N/A',
						languages: c.languages
							? Object.values(c.languages).join(', ')
							: 'N/A',
						currency: c.currencies ? c.currencies[currencyCode].name : 'N/A',
						flag: c.flags ? c.flags.png : '',
					}
				}
			}
		} catch (e) {
			console.error('Country API Error:', e.message)
		}

		try {
			const exchangeRes = await fetch(
				`https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_KEY}/latest/${currencyCode}`
			)
			if (exchangeRes.ok) {
				const exchangeJson = await exchangeRes.json()
				const rates = exchangeJson.conversion_rates || {}
				usdRate = rates['USD'] || 0
				kztRate = rates['KZT'] || 0
			}
		} catch (e) {
			console.error('Exchange API Error:', e.message)
		}

		try {
			const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
				userCountry
			)}&language=en&pageSize=5&sortBy=relevancy&apiKey=${process.env.NEWS_KEY}`

			const newsRes = await fetch(newsUrl, {
				headers: { 'User-Agent': 'NodeJS-App' },
			})
			if (newsRes.ok) {
				const newsJson = await newsRes.json()
				articles = (newsJson.articles || []).slice(0, 5).map(art => ({
					title: art.title,
					description: art.description || 'No description available',
					url: art.url,
					image:
						art.urlToImage ||
						'https://via.placeholder.com/300x150?text=No+Image',
				}))
			}
		} catch (e) {
			console.error('News API Error:', e.message)
		}

		const combinedData = {
			firstName: userData.name.first,
			lastName: userData.name.last,
			gender: userData.gender,
			image: userData.picture.large,
			age: userData.dob.age,
			dateOfBirth: new Date(userData.dob.date).toLocaleDateString(),
			city: userData.location.city,
			country: userCountry,
			address: `${userData.location.street.number} ${userData.location.street.name}`,
			...countryDetails,
			exchangeUSD: `1 ${currencyCode} = ${usdRate.toFixed(2)} USD`,
			exchangeKZT: `1 ${currencyCode} = ${kztRate.toFixed(2)} KZT`,
			news: articles,
		}

		res.json(combinedData)
	} catch (error) {
		console.error('Global Server Error:', error.message)
		res.status(500).json({ error: 'Failed to fetch' })
	}
})

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`)
})
