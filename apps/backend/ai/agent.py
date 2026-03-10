import os
from openai import OpenAI

# Initialize the OpenAI client
client = OpenAI(api_key="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")

def send_prompt(prompt: str, model: str = "gpt-4o-mini") -> str:
    """
    Send a prompt to the OpenAI API and return the response.
    
    Args:
        prompt: The prompt to send to the API
        model: The model to use (default: gpt-4o-mini)
    
    Returns:
        The assistant's response text
    """
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content

if __name__ == "__main__":
    # Example usage
    prompt = "Tell me about music production and beat detection."
    response = send_prompt(prompt)
    print(f"Prompt: {prompt}")
    print(f"Response: {response}")
