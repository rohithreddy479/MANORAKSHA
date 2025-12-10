// Function to run the main chatbot logic after the page loads
function initializeChatbot() {
    // ⚠️ CRITICAL: Ensure this is your actual, valid Gemini API Key!
    const apiKey = "enter api key "; 
    const model = "gemini-2.0-flash"; 

    // URL is correct
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Define the system instruction for the persona
    const systemInstructionText = "You are a compassionate mental health counselor. Respond empathetically and naturally. Keep answers concise for simple greetings, but detailed for complex queries.";

    // Set token limit for short queries
    const shortQueryTokenLimit = 100;  
    const detailedQueryTokenLimit = 300; 

    let conversation = []; 

    // DOM Elements - Check if they exist
    const chatDiv = document.getElementById("chat");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");

    if (!chatDiv || !userInput || !sendBtn) {
        console.error("Chatbot DOM elements not found. Check chatbot.html structure.");
        return;
    }

    /**
     * Appends a message to the chat interface.
     */
    function appendMessage(sender, text) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message");
        msgDiv.classList.add(sender);
        const prefix = sender === "user" ? "You: " : "Counselor: ";
        // CHANGE THIS LINE: Use <span> for prefix and separate the text
        msgDiv.innerHTML = `<strong>${prefix}</strong>${text}`; 
        chatDiv.appendChild(msgDiv);
        chatDiv.scrollTop = chatDiv.scrollHeight;
    
    }

    /**
     * Updates the state of the input and button while waiting for the API.
     */
    function setLoadingState(isLoading) {
        userInput.disabled = isLoading;
        sendBtn.disabled = isLoading;
        sendBtn.textContent = isLoading ? "Sending..." : "Send";
    }

    async function sendMessage() {
        const userText = userInput.value.trim();
        if (!userText) return;

        appendMessage("user", userText);
        userInput.value = "";
        setLoadingState(true); 

        // Add user message to conversation history
        conversation.push({ role: "user", parts: [{ text: userText }] });

        try {
            const isShortQuery = userText.toLowerCase().match(/hi|hello|how are you|hey/);
            const tokenLimit = isShortQuery ? shortQueryTokenLimit : detailedQueryTokenLimit;

            // 🟢 FIX APPLIED HERE: Restructuring systemInstruction to match the required Content object format.
            const requestBody = {
                contents: conversation,
                // The API requires the system instruction to be sent as a Content object structure
                systemInstruction: {
                    parts: [{
                        text: systemInstructionText
                    }]
                },
                generationConfig: { 
                    temperature: 0.8,
                    maxOutputTokens: tokenLimit,
                }
            };

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: 'No JSON response body.' } }));
                console.error("API Request Failed:", response.status, errorData);
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Check network and API key restrictions.'}`);
            }

            const data = await response.json();
            
            let aiText = "I'm having trouble generating a response right now. Please try again."; 

            const candidate = data?.candidates?.[0];
            const part = candidate?.content?.parts?.[0];
            aiText = part?.text || aiText;

            if (!aiText && data.promptFeedback) {
                console.error("Safety block or other issue:", data.promptFeedback);
                aiText = "I'm sorry, that input was flagged. Let's try discussing something else.";
            } else if (data.promptFeedback) {
                console.warn("Prompt feedback received:", data.promptFeedback);
            }

            appendMessage("assistant", aiText);
            
            // Add the AI message to history
            conversation.push({ role: "model", parts: [{ text: aiText }] });

        } catch (err) {
            console.error("Error calling Gemini API:", err);
            const fallback = err.message.includes('API Error') 
                ? err.message 
                : "A connection error occurred. Please check your internet and console.";
            appendMessage("assistant", fallback);
        } finally {
            setLoadingState(false); 
        }
    }

    // Event listeners
    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); 
            sendMessage();
        }
    });

    // INITIAL MESSAGE 
    appendMessage("assistant", "Hello! I'm here to listen. How are you feeling today?");
}

// Ensure the script runs only after the HTML is fully loaded.
document.addEventListener("DOMContentLoaded", initializeChatbot);
