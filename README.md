Random User & Global Insights Aggregator

A Node.js application that aggregates data from multiple APIs to create a comprehensive profile of a random user. It includes personal details, country information, real-time currency exchange rates, and current local news.

Features
1. Random User Generation

Source: RandomUser.me API

Functionality: Generates a random user profile including:

Full name

Age

Gender

Profile picture

Location (city and street address)

2. Country Details & Globalization

Source: RestCountries API

Functionality: Fetches country-specific details such as:

Capital city

Official languages

Currency name
Formatting: All text data is displayed in lowercase for consistent design aesthetics.

3. Real-time Exchange Rates

Source: ExchangeRate-API

Functionality: Converts the user’s local currency to USD and KZT dynamically.
Placement: Displayed within the country section to maintain a logical grouping of related data.

4. Localized News Feed

Source: NewsAPI

Functionality: Fetches the top 5 English headlines related to the user’s country.
Details per article:

Title

Short description (fallback: “No description available”)

Image (fallback: placeholder)

Direct link to the full article

Technical Overview & Best Practices
Project Structure

Backend (server.js): Handles API requests, data sanitization, and server-side security.

Frontend (/public): Contains HTML, CSS, and client-side logic.

Configuration (.env): Stores sensitive API keys securely.

Specifications

Server Port: 3000

Dependencies: Express, Axios, Dotenv

Error Handling: Each API call is wrapped in its own try-catch to prevent a single API failure from breaking the app.

Security: All API calls are made server-side, keeping keys hidden from the client.
