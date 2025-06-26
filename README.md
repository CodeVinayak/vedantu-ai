# Vedantu Chatbot

An interactive chatbot powered by Google's Gemini AI model that uses a knowledge base to answer questions about Vedantu. Features include text-to-speech, user feedback system, and analytics tracking.

## Features

- 💬 Interactive chat interface
- 🤖 AI-powered responses using Gemini
- 📚 Custom knowledge base integration
- 🔊 Text-to-speech functionality
- 👍 User feedback system
- 📊 Analytics tracking

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- A modern web browser

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Vedantu-Chatbot
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Set up your Gemini API key**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add your API key in the `server.js` file where indicated

## Running the Application

1. **Start the server**
   ```bash
   node server.js
   ```
   The server will start and serve both the frontend and backend on `http://localhost:3001`.

2. **Access the application**
   - Open your web browser
   - Go to [http://localhost:3001](http://localhost:3001)
   - The chatbot interface should now be visible and ready to use

## Usage

1. Type your question in the chat input box
2. Press Enter or click the send button
3. The chatbot will respond with relevant information
4. You can:
   - Listen to the response using text-to-speech
   - Give feedback using thumbs up/down buttons
   - View chat history in the conversation window

## Project Structure

- `public/`
  - `index.html` - Main frontend interface
  - `style.css` - Styling for the chat interface
  - `main.js` - Frontend JavaScript logic
  - `Vedantu.txt` - Knowledge base file
  - Other static assets (images, documentation, etc.)
- `api/`
  - Serverless functions for API endpoints (e.g., `generate-content.js`, `text-to-speech.js`, `analytics.js`, `analytics/rate.js`)
- `server.js` - Local Node.js server (for development)
- `vedantu_analytics.json` - Local analytics storage (for development)

## Project Demo

Watch a demo of the chatbot in action: [Vedantu Chatbot Demo](https://drive.google.com/file/d/11jz3jH3nfNtUFp1c_UXc9KRdqXi0vIUX/view?usp=drive_link)

## Troubleshooting

1. **Server issues**
   - Ensure port 3001 is not in use
   - Check if all dependencies are installed
   - Verify your Gemini API key is correct (in `.env` file for Vercel, or `server.js` locally if not using `.env`)

2. **Chat not working**
   - Check browser console for errors
   - Verify the server is running
   - Ensure your internet connection is stable
