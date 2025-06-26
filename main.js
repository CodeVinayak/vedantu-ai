const generateButton = document.getElementById('generateButton');
const questionTextInput = document.getElementById('questionText');
const responseText = document.getElementById('responseText');
const loadingIndicator = document.getElementById('loadingIndicator');
const responseContainer = document.getElementById('responseContainer');
const audioContainer = document.getElementById('audioContainer');
const playAudioButton = document.getElementById('playAudioButton');
const errorDialog = document.getElementById('errorDialog');
const errorMessage = document.getElementById('errorMessage');
const loadingMessageSpan = document.getElementById('loadingMessage');
const hamburgerButton = document.getElementById('hamburgerButton');
const dropdownMenu = document.getElementById('dropdownMenu');
const hamburgerPath = document.getElementById('hamburgerPath');
const thumbsUpButton = document.getElementById('thumbsUpButton');
const thumbsDownButton = document.getElementById('thumbsDownButton');

const hamburgerIconPath = "M4 6h16M4 12h16M4 18h16";
const closeIconPath = "M6 18L18 6M6 6l12 12";

// --- API KEY REMOVED ---
// The API Key has been securely moved to the backend (server.js and .env file).
// The frontend will now make requests to your server, not directly to Google APIs.

// Global variables
let audioContext;
let audioBuffer;
let isPlaying = false;
let currentAudioSource = null;
let KNOWLEDGE_BASE = '';
let lastAnswerId = null;

// Loading message states
let loadingMessageTimeoutId = null;
let loadingMessageIntervalId = null;
const loadingMessages = [
    { text: "Generating Response...", duration: 1000 },
    { text: "Thinking...", duration: 1000 },
    { text: "Almost there...", duration: 1000 },
    { text: "Summoning the answer...", duration: 1000 }
];
let currentMessageIndex = 0;

// Add after the loadingMessages and currentMessageIndex definitions
function generateUniqueId() {
    // Simple unique id using timestamp and random number
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function saveAnalyticsEntry(question, answer) {
    const entry = {
        id: generateUniqueId(),
        question,
        answer,
        timestamp: new Date().toISOString(),
        rating: null
    };
    lastAnswerId = entry.id;
    fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    }).catch(err => {
        console.error('Failed to save analytics:', err);
    });
    // Enable rating buttons for new answer
    setRatingButtonsEnabled(true);
    setRatingButtonsHighlight(null);
}

function setRatingButtonsEnabled(enabled) {
    thumbsUpButton.disabled = !enabled;
    thumbsDownButton.disabled = !enabled;
    if (enabled) {
        thumbsUpButton.classList.remove('opacity-50', 'cursor-not-allowed');
        thumbsDownButton.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        thumbsUpButton.classList.add('opacity-50', 'cursor-not-allowed');
        thumbsDownButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

function setRatingButtonsHighlight(rating) {
    thumbsUpButton.classList.remove('bg-green-400');
    thumbsDownButton.classList.remove('bg-red-400');
    if (rating === 'up') {
        thumbsUpButton.classList.add('bg-green-400');
    } else if (rating === 'down') {
        thumbsDownButton.classList.add('bg-red-400');
    }
}

async function rateAnswer(rating) {
    if (!lastAnswerId) return;
    setRatingButtonsEnabled(false);
    setRatingButtonsHighlight(rating);
    try {
        await fetch('/api/analytics/rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: lastAnswerId, rating })
        });
    } catch (err) {
        console.error('Failed to save rating:', err);
    }
}

// --- Load Knowledge Base on Page Load ---
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('Vedantu.txt');
        if (!response.ok) {
            throw new Error('Vedantu.txt file not found or failed to load.');
        }
        KNOWLEDGE_BASE = await response.text();
        console.log('Knowledge base loaded successfully.');
    } catch (error) {
        console.error('Error loading knowledge base:', error);
        showErrorDialog(error.message);
        generateButton.disabled = true;
        generateButton.textContent = 'Error: Could not load data';
        generateButton.classList.add('bg-red-500', 'cursor-not-allowed');
    }
});

// --- DIALOG FUNCTIONS ---
function showErrorDialog(message) {
    errorMessage.textContent = message;
    errorDialog.classList.remove('hidden');
    setTimeout(hideErrorDialog, 5000);
}

function hideErrorDialog() {
    errorDialog.classList.add('hidden');
}

// --- LOADING MESSAGE FUNCTIONS ---
function startLoadingMessages() {
    currentMessageIndex = 0;
    loadingMessageSpan.textContent = loadingMessages[currentMessageIndex].text;
    scheduleNextLoadingMessage();
}

function scheduleNextLoadingMessage() {
    clearTimeout(loadingMessageTimeoutId);
    clearInterval(loadingMessageIntervalId);

    if (currentMessageIndex < loadingMessages.length - 1) {
        loadingMessageTimeoutId = setTimeout(() => {
            currentMessageIndex++;
            loadingMessageSpan.textContent = loadingMessages[currentMessageIndex].text;
            scheduleNextLoadingMessage();
        }, loadingMessages[currentMessageIndex].duration);
    } else {
        loadingMessageIntervalId = setInterval(() => {
            loadingMessageSpan.textContent = loadingMessages[currentMessageIndex].text;
        }, loadingMessages[currentMessageIndex].duration);
    }
}

function stopLoadingMessages() {
    clearTimeout(loadingMessageTimeoutId);
    clearInterval(loadingMessageIntervalId);
    loadingMessageTimeoutId = null;
    loadingMessageIntervalId = null;
}

// --- AUDIO FUNCTIONS ---
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function stopCurrentAudio() {
    if (currentAudioSource) {
        currentAudioSource.stop(0);
        currentAudioSource = null;
        isPlaying = false;
        playAudioButton.disabled = false;
        playAudioButton.querySelector('span').textContent = 'Play Answer';
        playAudioButton.classList.remove('opacity-50');
        // Change button to play mode
        playAudioButton.removeEventListener('click', stopCurrentAudio);
        playAudioButton.addEventListener('click', playAudio, { once: true });
    }
}

function playAudio() {
    stopCurrentAudio();
    if (!audioContext || !audioBuffer) return;

    isPlaying = true;
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    currentAudioSource = source;
    source.start(0);

    playAudioButton.disabled = false;
    playAudioButton.querySelector('span').textContent = 'Stop';
    playAudioButton.classList.remove('opacity-50');
    // Change button to stop mode
    playAudioButton.removeEventListener('click', playAudio);
    playAudioButton.addEventListener('click', stopCurrentAudio, { once: true });

    source.onended = () => {
        if (currentAudioSource === source) {
            isPlaying = false;
            currentAudioSource = null;
            playAudioButton.disabled = false;
            playAudioButton.querySelector('span').textContent = 'Play Answer';
            playAudioButton.classList.remove('opacity-50');
            // Change button to play mode
            playAudioButton.removeEventListener('click', stopCurrentAudio);
            playAudioButton.addEventListener('click', playAudio, { once: true });
        }
    };
}

async function textToSpeech(text) {
    audioContainer.classList.remove('hidden');
    playAudioButton.disabled = true;
    playAudioButton.querySelector('span').textContent = 'Generating Audio...';
    playAudioButton.classList.add('opacity-50');

    // *** MODIFIED: URL now points to your secure backend proxy ***
    const TTS_URL = '/api/synthesize-speech';
    const payload = {
        text: text // The server only needs the text to synthesize
    };

    try {
        const response = await fetch(TTS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorData = await response.json();
            const message = errorData.error || `TTS proxy error: ${response.status}`;
            throw new Error(message);
        }
        const data = await response.json();
        if (!data.audioContent) {
            throw new Error('Invalid response format from TTS API proxy');
        }
        const audioData = atob(data.audioContent);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
            uint8Array[i] = audioData.charCodeAt(i);
        }
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        console.log('Audio successfully generated. Playing automatically.');
        playAudio(); // Play the audio as soon as it's decoded
    } catch (error) {
        console.error('TTS Error:', error);
        showErrorDialog(`Failed to generate speech: ${error.message}`);
        audioContainer.classList.add('hidden');
        playAudioButton.disabled = false;
        playAudioButton.classList.remove('opacity-50');
        playAudioButton.querySelector('span').textContent = 'Play Answer';
    }
}

function stripMarkdown(text) {
    return text
        .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
        .replace(/\*([^*]+)\*/g, '$1')     // italics
        .replace(/`([^`]+)`/g, '$1')       // inline code
        .replace(/\*/g, '');               // remove any remaining asterisks
}

async function generateContent() {
    initAudioContext();
    stopCurrentAudio();

    const questionText = questionTextInput.value.trim();
    if (!questionText) {
        showErrorDialog('Please enter a question.');
        return;
    }
    if (!KNOWLEDGE_BASE) {
        showErrorDialog('Knowledge base is not loaded. Please try again in a moment.');
        return;
    }

    loadingIndicator.classList.remove('hidden');
    responseContainer.classList.add('hidden');
    audioContainer.classList.add('hidden');
    generateButton.disabled = true;
    generateButton.classList.add('opacity-50', 'cursor-not-allowed');
    
    startLoadingMessages();

    const prompt = `
        ### PERSONA & CONTEXT ###
        You are 'Veda', an advanced AI-powered student and parent assistant for Vedantu. Your personality is patient, positive, and supportive.You will answer in simple language without using any special keywords.
        ### KNOWLEDGE BASE (RESUME TEXT) ###
        ${KNOWLEDGE_BASE}
        ### END KNOWLEDGE BASE ###
        ### FORMULATE USER-FACING REPLY ###
        Based on the user's query and our persona, formulate a helpful and clear response. Follow these core rules:
        1.  **Simple Natural Language:** Be conversational and easy to understand. Avoid jargon.
        2.  **Pro-Vedantu Stance:** Frame answers positively. Acknowledge concerns and pivot to solutions.
        3.  **Intelligent Escalation:** If the query matches an escalation trigger (complaints, personal data, direct request), use the protocol to connect them to a human.
        4.  **Handle Out-of-Scope Questions:** Gently guide unrelated questions back to Vedantu.
        ### USER'S QUESTION ###
        ${questionText}
    `;

    // *** MODIFIED: URL now points to your secure backend proxy ***
    const API_URL = '/api/generate-content';
    const payload = {
        prompt: prompt // Send the full prompt to the server
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const message = errorData.error || `API proxy error: ${response.status}`;
            throw new Error(message);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const aiResponse = data.candidates[0].content.parts[0].text.trim();
            const plainResponse = stripMarkdown(aiResponse);
            
            // Set the text content
            responseText.textContent = plainResponse;

            // Save analytics entry
            saveAnalyticsEntry(questionText, plainResponse);

            // Wait for the text-to-speech function to complete before proceeding.
            await textToSpeech(plainResponse);

        } else {
            const finishReason = data.candidates?.[0]?.finishReason;
            if (finishReason === 'SAFETY') {
                throw new Error("The response was blocked due to safety settings.");
            } else {
                throw new Error("Received an invalid or empty response from the API proxy.");
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showErrorDialog(`Error: ${error.message}`);
    } finally {
        stopLoadingMessages();
        loadingIndicator.classList.add('hidden');
        responseContainer.classList.remove('hidden');
        generateButton.disabled = false;
        generateButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// --- Event Listeners ---
generateButton.addEventListener('click', generateContent);
playAudioButton.addEventListener('click', playAudio, { once: true });

questionTextInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        generateButton.click();
    }
});

hamburgerButton.addEventListener('click', () => {
    const isHidden = dropdownMenu.classList.toggle('hidden');
    dropdownMenu.classList.toggle('active', !isHidden);
    hamburgerPath.setAttribute('d', isHidden ? hamburgerIconPath : closeIconPath);
});

document.addEventListener('click', (event) => {
    if (!hamburgerButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.add('hidden');
        dropdownMenu.classList.remove('active');
        hamburgerPath.setAttribute('d', hamburgerIconPath);
    }
});

if (thumbsUpButton && thumbsDownButton) {
    thumbsUpButton.addEventListener('click', () => rateAnswer('up'));
    thumbsDownButton.addEventListener('click', () => rateAnswer('down'));
    setRatingButtonsEnabled(false); // Disabled until an answer is generated
}