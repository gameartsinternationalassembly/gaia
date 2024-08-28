const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;
  const calendarId = '36549a43b34ff4d4aff4789499c69c38716d3ca0885c4099b58cf23dda45b641@group.calendar.google.com';
  const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${API_KEY}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch calendar events' }),
    };
  }
};
