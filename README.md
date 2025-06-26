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
- [Python](https://python.org/) (v3.6 or higher) - For running the frontend server
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

1. **Start the backend server**
   ```bash
   node server.js
   ```
   The backend server will start on port 3000

2. **Start the frontend server**
   ```bash
   python -m http.server 8000
   ```
   This will serve the frontend files on port 8000

3. **Access the application**
   - Open your web browser
   - Go to [http://localhost:8000](http://localhost:8000)
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

- `index.html` - Main frontend interface
- `style.css` - Styling for the chat interface
- `main.js` - Frontend JavaScript logic
- `server.js` - Backend Node.js server
- `Vedantu.txt` - Knowledge base file
- `vedantu_analytics.json` - Analytics storage

## Project Demo

Watch a demo of the chatbot in action: [Vedantu Chatbot Demo](https://drive.google.com/file/d/11jz3jH3nfNtUFp1c_UXc9KRdqXi0vIUX/view?usp=drive_link)

## Troubleshooting

1. **Backend server issues**
   - Ensure port 3000 is not in use
   - Check if all dependencies are installed
   - Verify your Gemini API key is correct

2. **Frontend server issues**
   - Make sure port 8000 is available
   - Try using a different port with `python -m http.server <port>`

3. **Chat not working**
   - Check browser console for errors
   - Verify both servers are running
   - Ensure your internet connection is stable
