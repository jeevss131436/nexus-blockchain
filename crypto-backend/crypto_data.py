import requests
import os

def get_crypto(name):
    api_key = os.getenv('COINGECKO_API_KEY', 'CG-PNy8sxdsAyLZiRceGeonJsFU')
    url = f"https://api.coingecko.com/api/v3/coins/{name}?x_cg_demo_api_key={api_key}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # RETURN data instead of printing it
        crypto_data = {
            'name': data.get('name', name),
    'symbol': data['symbol'].upper(),
    'current_price': data['market_data']['current_price']['usd'],
    'market_cap': data['market_data']['market_cap']['usd'],
    'high_24h': data['market_data']['high_24h']['usd'],
    'low_24h': data['market_data']['low_24h']['usd'],
    'price_change_percentage_24h': data['market_data']['price_change_percentage_24h'],
    'volume': data['market_data']['total_volume']['usd'],
    'ath': data['market_data']['ath']['usd'],
    'ath_date': data['market_data']['ath_date']['usd'],   # 📌 When ATH happened
    'atl': data['market_data']['atl']['usd'],             # 📌 All-time low
    'atl_date': data['market_data']['atl_date']['usd'],   # 📌 When ATL happened
    'circulating_supply': data['market_data']['circulating_supply'],  # 📌 Supply
    'max_supply': data['market_data']['max_supply'],      # 📌 Max supply
    'last_updated': data['last_updated']
        }
        
        return crypto_data  # ← RETURN, don't print!
        
    except Exception as e:
        return {'error': f'Error fetching data: {str(e)}'}

# NO input() calls here!
# NO function calls here!