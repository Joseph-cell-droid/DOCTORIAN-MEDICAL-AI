import axios from "axios";

async function testAICall() {
  const apiKey = "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";
  const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
  const model = "meta-llama/llama-3.1-8b-instruct";
  
  console.log("Testing with max_tokens: 1024...");
  try {
    const response = await axios.post(apiUrl, {
      model: model,
      messages: [
        { role: "system", content: "You are a medical AI helper." },
        { role: "user", content: "Hi" }
      ],
      temperature: 0.7,
      max_tokens: 1024
    }, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://doctorian.med",
        "X-Title": "Doctorian"
      }
    });
    console.log("Success! Status:", response.status);
    console.log("Response text:", response.data.choices[0].message.content);
  } catch (err: any) {
    console.error("Error Status:", err.response?.status);
    console.error("Error Response Data:", err.response?.data);
  }
}

testAICall();
