import asyncio
import os
import openai
from dotenv import load_dotenv

load_dotenv(override=True)

async def test():
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o")
    print(f"API Key: {api_key[:15]}...{api_key[-15:] if api_key else 'None'}")
    print(f"Model: {model}")
    
    client = openai.AsyncOpenAI(api_key=api_key)
    try:
        resp = await client.chat.completions.create(
            model=model,
            temperature=0.3,
            max_tokens=100,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say Hello World in 3 words."},
            ],
        )
        content = resp.choices[0].message.content
        print(f"Success! Response content: '{content}'")
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")

asyncio.run(test())
