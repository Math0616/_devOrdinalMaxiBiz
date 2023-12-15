import os
import requests
from tqdm import tqdm
import json
import re

def format_price(price):
    # Convert to a float and create a string with a large number of decimal places
    price_str = "{:.8f}".format(price / 100000000)
    # Use regex to remove unnecessary trailing zeros, but leave at least two decimal places
    price_str = re.sub(r'(\.\d*?)0+\b', r'\1', price_str)
    # Ensure there are at least two decimal places
    if '.' in price_str and len(price_str.split('.')[1]) < 2:
        price_str += '0'
    return price_str

def fetch_tokens(api_key, limit=40, max_tokens=2091):
    base_url = "https://api-mainnet.magiceden.dev/v2/ord/btc/tokens"
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    all_tokens = []
    offset = 0

    with tqdm(total=max_tokens, desc="Fetching Tokens") as pbar:
        while True:
            url = f"{base_url}?collectionSymbol=omb&showAll=false&sortBy=priceAsc&offset={offset}&limit={limit}"

            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                print(f"Failed to fetch data: {response.status_code}")
                break

            data = response.json()
            tokens = data.get("tokens", [])
            if not tokens:
                break

            for token in tokens:
                token_data = {
                    "id": token.get("id"),
                    "listedPrice": format_price(int(token.get("listedPrice", 0)))
                }
                all_tokens.append(token_data)
                pbar.update(1)

                if len(all_tokens) >= max_tokens:
                    break

            if len(all_tokens) >= max_tokens or len(tokens) < limit:
                break

            offset += limit

    return all_tokens

# Your private ME API KEY
api_key = os.environ.get('MAGICEDEN_API_KEY')

tokens = fetch_tokens(api_key)

# Writing the list of tokens to a JSON file
with open('tokens.json', 'w') as file:
    json.dump(tokens, file, indent=4)

print("Tokens saved to tokens.json")
