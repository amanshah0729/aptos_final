import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  getVaultBalance, 
  getDepositCount, 
  getAllDepositors, 
  getReturnPercentage 
} from '@/utils/aptosUtils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for a blockchain betting platform. 
          
          If the user asks about who has deposited into the existing pool, respond ONLY with: "get depositors"
          
          If the user asks about how many people have deposited into the pool, respond ONLY with: "get depositor count"
          
          If the user asks about the percent return on the pool so far, respond ONLY with: "get percent return"
          
          If the user asks about the total amount in the current pool, respond ONLY with: "get vault total"
          
          For any other questions, provide a helpful, concise response about blockchain betting, Aptos, or general platform usage.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const aiResponse = response.choices[0].message.content;
    
    // Check if the response is one of our special commands
    if (aiResponse) {
      const command = aiResponse.trim().toLowerCase();
      
      // Handle each command by calling the appropriate contract function
      if (command === "get depositors") {
        try {
          const depositors = await getAllDepositors();
          // Count unique depositors
          const uniqueDepositors = new Set(depositors);
          const uniqueCount = uniqueDepositors.size;
          
          // Format a simple response
          return NextResponse.json({ 
            response: `There are ${uniqueCount} unique depositors in the pool.` 
          });
        } catch (error) {
          console.error("Error getting depositors:", error);
          return NextResponse.json({ 
            response: "I couldn't retrieve the depositor information at the moment." 
          });
        }
      } 
      else if (command === "get depositor count") {
        try {
          const count = await getDepositCount();
          
          // Format a simple response
          return NextResponse.json({ 
            response: `The pool has received ${count} deposits so far.` 
          });
        } catch (error) {
          console.error("Error getting depositor count:", error);
          return NextResponse.json({ 
            response: "I couldn't retrieve the depositor count at the moment." 
          });
        }
      } 
      else if (command === "get percent return") {
        try {
          const percentage = await getReturnPercentage();
          
          // Format a simple response
          return NextResponse.json({ 
            response: `The current return percentage is ${percentage}%.` 
          });
        } catch (error) {
          console.error("Error getting return percentage:", error);
          return NextResponse.json({ 
            response: "I couldn't retrieve the return percentage at the moment." 
          });
        }
      } 
      else if (command === "get vault total") {
        try {
          const balance = await getVaultBalance();
          
          // Format a simple response
          return NextResponse.json({ 
            response: `The vault currently contains ${balance.toFixed(2)} APT.` 
          });
        } catch (error) {
          console.error("Error getting vault balance:", error);
          return NextResponse.json({ 
            response: "I couldn't retrieve the vault balance at the moment." 
          });
        }
      }
    }

    // For non-command responses, just return the AI response directly
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    );
  }
}

// Function to get a natural language response based on the data
async function getNaturalLanguageResponse(
  originalQuestion: string, 
  dataType: string, 
  dataValue: string
): Promise<NextResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for a blockchain betting platform. 
          The user asked: "${originalQuestion}"
          
          You need to respond in a natural, conversational way about the following data:
          Data type: ${dataType}
          Value: ${dataValue}
          
          For depositors, explain who has deposited into the pool.
          For depositor_count, explain how many people have deposited.
          For return_percentage, explain what the percent return is.
          For vault_balance, explain the total amount in the pool.
          
          Keep your response concise, friendly, and informative.`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const naturalResponse = response.choices[0].message.content;
    return NextResponse.json({ response: naturalResponse });
  } catch (error) {
    console.error('Error generating natural language response:', error);
    return NextResponse.json({ 
      response: `Here's the information you requested: ${dataValue}` 
    });
  }
} 