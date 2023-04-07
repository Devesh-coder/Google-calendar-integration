import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import { google } from 'googleapis'

const port = process.env.PORT || 8080

import express from 'express'
const app = express()

const oauth2Client = new google.auth.OAuth2(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET,
	process.env.REDIRECT_URI,
)

const scopes = [
	'https://www.googleapis.com/auth/calendar',
	'https://www.googleapis.com/auth/userinfo.email',
]

app.get('/google', (req, res) => {
	const url = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: scopes,
		include_granted_scopes: true,
	})

	res.redirect(url)
})

app.get('/google/redirect', async (req, res) => {
	const code = req.query.code
	console.log(code)
	if (code) {
		let { tokens } = await oauth2Client.getToken(code)
		console.log(tokens)
		oauth2Client.setCredentials(tokens)
	}
	// res.send('ITs working now :) 	 ')
	res.redirect('/google/event')
})

app.get('/google/event', async (req, res) => {
	const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

	var event = {
		summary: 'Test',
		description: "A chance to hear more about Google's developer products.",
		start: {
			dateTime: new Date(new Date().getTime() + 12 * 60 * 1000).toISOString(),
			timeZone: 'Asia/Kolkata',
		},
		end: {
			dateTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
			timeZone: 'Asia/Kolkata',
		},
	}

	calendar.events.insert(
		{
			calendarId: 'primary',
			resource: event,
		},
		function (err, event) {
			if (err) {
				console.log('There was an error contacting the Calendar service: ' + err)
				return
			}
			console.log('Event created: %s', event.htmlLink)
		},
	)
	res.send('Event created')
})

app.get('/google/test', (req, res) => {
	res.send(new Date().toISOString())
	console.log(new Date().toISOString(), 'this is current time')
	console.log(
		'this is after 2 mins ',
		new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
	)
})

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`)
})
