require('dotenv').config()
const express = require('express')
const axios = require('axios')
const path = require('path')

const app = express()
const PORT = 3000

app.use(express.static('public'))
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'views', 'index.html'))
})

app.get('/api/get-user', async (req, res) => {
	try {
		const userRes = await axios.get('https://randomuser.me/api/')
		const userData = userRes.data.results[0]
		const userCountry = userData.location.country

		let countryDetails = {
			capital: 'N/A',
			languages: 'N/A',
			currency: 'N/A',
			flag: '',
		}
		let currencyCode = 'USD'
		let countryCodeISO = 'us'
		let articles = []
		let usdRate = 0
		let kztRate = 0

		try {
			const countryRes = await axios.get(
				`https://restcountries.com/v3.1/name/${encodeURIComponent(
					userCountry
				)}?fullText=true`
			)
			if (countryRes.data && countryRes.data.length > 0) {
				const c = countryRes.data[0]

				countryCodeISO = 'us'
				currencyCode = Object.keys(c.currencies)[0]

				countryDetails = {
					capital: c.capital ? c.capital[0] : 'N/A',
					languages: c.languages
						? Object.values(c.languages).join(', ')
						: 'N/A',
					currency: c.currencies ? c.currencies[currencyCode].name : 'N/A',
					flag: c.flags ? c.flags.png : '',
				}
			}
		} catch (e) {
			console.error('Country API Error:', e.message)
		}

		try {
			const exchangeRes = await axios.get(
				`https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_KEY}/latest/${currencyCode}`
			)
			const rates = exchangeRes.data.conversion_rates
			usdRate = rates['USD'] || 0
			kztRate = rates['KZT'] || 0
		} catch (e) {
			console.error('Exchange API Error:', e.message)
		}

		try {
			const newsKey = process.env.NEWS_KEY
			const newsRes = await axios.get(
				`https://newsapi.org/v2/everything?q=${encodeURIComponent(
					userCountry
				)}&language=en&pageSize=5&sortBy=relevancy&apiKey=${newsKey}`,
				{
					headers: { 'User-Agent': 'NodeJS-App' },
				}
			)

			if (newsRes.data.articles) {
				articles = newsRes.data.articles.slice(0, 5).map(art => ({
					title: art.title,
					description: art.description || 'No description available',
					url: art.url,
					image:
						art.urlToImage ||
						'https://via.placeholder.com/300x150?text=No+Image',
				}))
			}
		} catch (e) {
			console.error(
				'News API Error Details:',
				e.response ? e.response.data : e.message
			)
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
