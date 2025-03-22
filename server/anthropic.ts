import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Image analysis for product recognition
export async function identifyProduct(base64Image: string): Promise<{
  productName: string;
  confidence: number;
}> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Identify this grocery item. Only respond with a single line in JSON format with keys 'productName' (specific name of the product) and 'confidence' (number between 0 and 1). If you're not sure what it is, return a lower confidence score. Focus on common grocery items like fruits, vegetables, dairy, bread, etc."
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }]
    });

    const resultText = response.content[0].text;
    const result = JSON.parse(resultText);
    
    return {
      productName: result.productName,
      confidence: Math.max(0, Math.min(1, result.confidence))
    };
  } catch (error) {
    console.error("Failed to analyze image:", error);
    throw new Error("Failed to identify product in image");
  }
}