import websocket
import json

# This function triggers EVERY TIME the server sends us new data
def on_message(ws, message):
    # The server sends data as a JSON string. We convert it to a Python dictionary.
    data = json.loads(message)
    
    # Extract the live price ('p') and the trade symbol ('s')
    symbol = data['s']
    price = float(data['p'])
    
    # Print the live price directly to your terminal
    print(f"LIVE TRADE --> {symbol}: ${price:,.2f}")

# Error handling
def on_error(ws, error):
    print(f"An error occurred: {error}")

# When the connection closes
def on_close(ws, close_status_code, close_msg):
    print("### Connection Closed ###")

# When the connection first opens
def on_open(ws):
    print("Successfully connected to the real-time market stream!")
    print("Waiting for trades...\n")

if __name__ == "__main__":
    # The WebSocket URL for Binance's raw trade stream for Bitcoin (BTC) to US Tether (USDT)
    socket_url = "wss://stream.binance.com:9443/ws/btcusdt@trade"

    # Set up the WebSocket application
    ws = websocket.WebSocketApp(socket_url,
                                on_open=on_open,
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)

    # Keep the connection open forever (until you press Ctrl+C)
    ws.run_forever()