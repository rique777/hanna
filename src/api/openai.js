export async function getOpenAIResponse(message) {
    const apiKey = ''; // Substitua com sua chave da OpenAI
    const contractsUrl = 'https://hannalabs.xyz/api/constracts.php'; //subistitua por uma api para retornar os contratos
  
    try {
        // Buscar contratos do JSON
        const contractsResponse = await fetch(contractsUrl);
        if (!contractsResponse.ok) {
            throw new Error(`Erro ao buscar contratos: ${contractsResponse.status} ${contractsResponse.statusText}`);
        }
  
        const contractsData = await contractsResponse.json();
        const contracts = contractsData.contracts;
  
        // Criar a lista de contratos em formato de texto
        const contractsText = contracts
            .map(contract => `${contract.name}: ${contract.address}`)
            .join('\n');
  
        // Montar a mensagem para a OpenAI //use open ai ou outro modelo
        const response = await fetch('https://api.netmind.ai/inference-api/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'Qwen/QwQ-32B',
                messages: [
                    {
                        role: 'system',
                        content: // o frontend capita /swap /imagem e preciso que o modelo interprete e retone para ele
                    { role: 'user', content: message },
                ],
            }),
        });
  
        // Verificar se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error(`Erro na API da OpenAI: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
  

  
        // Garantir que a resposta contenha o formato esperado
        const messageContent = data.choices[0]?.message?.content;
        if (!messageContent) {
            throw new Error('Resposta inválida da OpenAI');
        }

// Exibir a resposta no console
console.log('Resposta da Api:', messageContent);
  
        return messageContent;
    } catch (error) {
        console.error('Erro ao executar a função:', error);
        return 'No response from AI or there was an error.';
    }
}
