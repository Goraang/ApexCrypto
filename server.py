from fastapi import FastAPI, WebSocket, Request, HTTPException, status, Depends
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import websockets
import json
import asyncio
import ssl
import jwt

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo users
USERS = {
    "goraang@apexcrypto.io": {"password": "Admin@123", "role": "admin", "name": "Goraang Nayyar"},
    "demo@apexcrypto.io": {"password": "Demo@123", "role": "viewer", "name": "Demo User"},
}

SECRET = "apex-demo-secret"

# JWT helpers
def create_token(user):
    return jwt.encode({"email": user["email"], "role": user["role"], "name": user["name"]}, SECRET, algorithm="HS256")

def decode_token(token):
    return jwt.decode(token, SECRET, algorithms=["HS256"])

security = HTTPBearer()

@app.post("/api/auth/login")
async def login(data: dict):
    email = data.get("email", "").lower()
    password = data.get("password", "")
    user = USERS.get(email)
    if not user or user["password"] != password:
        return JSONResponse({"error": "Invalid credentials"}, status_code=401)
    user_obj = {"email": email, "role": user["role"], "name": user["name"]}
    token = create_token(user_obj)
    return {"token": token, "user": user_obj}

@app.get("/api/auth/me")
async def me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = decode_token(credentials.credentials)
        return {"user": payload}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
async def root():
    return HTMLResponse("<h1>Groww Clone Backend is Running!</h1>")

@app.websocket("/ws/live/{symbol}")
async def live_data_stream(websocket: WebSocket, symbol: str):
    await websocket.accept()
    binance_url = f"wss://stream.binance.com:9443/ws/{symbol.lower()}@trade"
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    try:
        async with websockets.connect(binance_url, ssl=ssl_context) as binance_ws:
            while True:
                message = await binance_ws.recv()
                data = json.loads(message)
                clean_payload = {
                    "symbol": data['s'],
                    "price": float(data['p'])
                }
                await websocket.send_json(clean_payload)
    except Exception as e:
        print(f"Connection closed for {symbol}. Reason: {e}")