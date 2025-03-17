export async function generateImage(prompt) {
    const apiKey = ''; // Substitua com sua chave Netmind
    const response = await fetch('https://api.netmind.ai/inference-api/openai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'stabilityai/stable-diffusion-3.5-large',
        prompt,
        response_format: 'url',
      }),
    });
  
    const data = await response.json();
    return data.data[0]?.url || null;
  }
  
  // ele recebe o pronpit da imagem do frontrend quando o modelo o retorna um /imagem