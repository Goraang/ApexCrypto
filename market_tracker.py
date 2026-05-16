import yfinance as yf
import pandas as pd
import plotly.graph_objects as go

def analyze_market_asset(ticker_symbol, asset_name):
    print(f"Fetching data for {asset_name} ({ticker_symbol})...")
    
    # 1. Fetch the last 6 months of daily data
    ticker_data = yf.Ticker(ticker_symbol)
    df = ticker_data.history(period="6mo")
    
    # 2. Data Cleaning: Ensure we only keep days where the market was open
    df = df.dropna()
    
    # 3. Calculate Moving Averages (Technical Analysis)
    # 20-day moving average (short term trend)
    df['MA20'] = df['Close'].rolling(window=20).mean()
    # 50-day moving average (medium term trend)
    df['MA50'] = df['Close'].rolling(window=50).mean()

    # 4. Create an Interactive Candlestick Chart
    fig = go.Figure()

    # Add the Candlesticks (Open, High, Low, Close)
    fig.add_trace(go.Candlestick(
        x=df.index,
        open=df['Open'],
        high=df['High'],
        low=df['Low'],
        close=df['Close'],
        name='Market Price'
    ))

    # Add the 20-Day Moving Average Line
    fig.add_trace(go.Scatter(
        x=df.index, 
        y=df['MA20'], 
        opacity=0.7, 
        line=dict(color='blue', width=2), 
        name='20-Day MA'
    ))

    # Add the 50-Day Moving Average Line
    fig.add_trace(go.Scatter(
        x=df.index, 
        y=df['MA50'], 
        opacity=0.7, 
        line=dict(color='orange', width=2), 
        name='50-Day MA'
    ))

    # 5. Format the layout to make it look professional
    fig.update_layout(
        title=f'{asset_name} Real-Time Market Analysis',
        yaxis_title='Price',
        xaxis_title='Date',
        template='plotly_white'
    )

    # Open the chart in your default web browser
    fig.show()

# --- Run the Script ---
if __name__ == "__main__":
    # You can change these tickers to anything! 
    # 'SI=F' is Silver Futures, 'HG=F' is Copper Futures, 'AAPL' is Apple.
    
    print("Market Analysis Initialized.\n")
    
    # Let's analyze Copper for this run
    analyze_market_asset(ticker_symbol="HG=F", asset_name="Copper")