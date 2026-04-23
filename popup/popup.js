// REPLACE WITH YOUR ACTUAL Z.AI API ENDPOINT
const GLM_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const GLM_API_KEY = "YOUR_API_KEY_HERE";  // <--- PUT YOUR KEY

document.getElementById('sendBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('imageInput');
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select an IC photo first');
    return;
  }

  const statusDiv = document.getElementById('status');
  statusDiv.innerText = 'Processing with GLM...';

  // Convert image to base64
  const base64 = await fileToBase64(file);
  
  // Call GLM to extract information
  const extractedData = await callGLMExtract(base64);
  
  // Store extracted data
  chrome.storage.local.set({ userData: extractedData }, () => {
    statusDiv.innerText = '✅ Data extracted & saved!';
    addChatMessage('bot', `I extracted:\n• Name: ${extractedData.name}\n• IC: ${extractedData.ic_number}\n• Address: ${extractedData.address}\n\nNow open any government form and I'll auto-fill it!`);
  });
});

async function callGLMExtract(imageBase64) {
  const prompt = `Extract the following information from this Malaysian IC (MyKad) photo. Return ONLY valid JSON with these fields: name, ic_number, address, dob (date of birth). If any field is missing, put null. Example: {"name":"Ahmad bin Abdullah","ic_number":"001122334455","address":"No 12, Jalan SS2/3, Petaling Jaya","dob":"2000-01-15"}`;
  
  const response = await fetch(GLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GLM_API_KEY}`
    },
    body: JSON.stringify({
      model: "glm-4",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageBase64 } }
          ]
        }
      ]
    })
  });
  
  const data = await response.json();
  const extractedText = data.choices[0].message.content;
  
  // Parse JSON from response (GLM might add extra text)
  const jsonMatch = extractedText.match(/\{.*\}/s);
  return JSON.parse(jsonMatch[0]);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function addChatMessage(sender, text) {
  const chatDiv = document.getElementById('chat');
  const msgDiv = document.createElement('div');
  msgDiv.className = sender;
  msgDiv.innerText = text;
  chatDiv.appendChild(msgDiv);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}