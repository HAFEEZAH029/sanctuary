🛡️ Sanctuary — End-to-End Encrypted Messaging App

Sanctuary is a secure messaging application built with modern frontend technologies and the Web Crypto API. It ensures that all messages are encrypted on the client side, meaning the server never has access to plaintext data.

     🚀 Features
🔐 End-to-End Encryption (E2EE)
🔑 Client-side key generation and management
💬 Secure real-time messaging
🔎 User search and conversation system
🔄 Token-based authentication with refresh flow
📦 Encrypted message storage (server stores only ciphertext)
⚡ Responsive and clean UI/UX


🧑‍💻 Tech Stack
Frontend: React + TypeScript + Vite
State Management: React Context + React Query
Styling: Tailwind CSS
Crypto: Web Crypto API
Backend API: Whisperbox API


🏗️ Architecture Overview
High-Level Flow
Client (Encryption & Decryption)
        ↓
Encrypted Payload (AES + RSA)
        ↓
Backend (Stores Ciphertext Only)
        ↓
Recipient Client (Decryption)


🏗️ Architecture Diagram

*flowchart LR

A[User Interface<br/>(React App)] --> B[Client Crypto Layer]

B -->|Generate Keys| C[Web Crypto API]

B -->|Encrypt Message (AES-GCM)| D[Ciphertext + IV]

B -->|Encrypt AES Key (RSA-OAEP)| E[Encrypted Keys]

D --> F[API Server]
E --> F

F -->|Stores Encrypted Data Only| G[(Database)]

G --> F

F -->|Fetch Encrypted Messages| B

B -->|Decrypt AES Key (Private Key)| H[Recovered AES Key]

H -->|Decrypt Ciphertext| I[Plaintext Message]

I --> A


 🔐 Encryption Flow
Sending a Message
Generate a random AES-GCM key
Encrypt message using AES key
Fetch recipient's public key
Encrypt AES key with:
Recipient’s public key → encryptedKey
Sender’s public key → encryptedKeyForSelf
Send payload:
{
  "ciphertext": "...",
  "iv": "...",
  "encryptedKey": "...",
  "encryptedKeyForSelf": "..."
}
Receiving a Message
Decrypt AES key using private key
Use decrypted AES key to decrypt ciphertext
Display plaintext message


🔑 Key Management
RSA key pair is generated on the client
Public key is sent to backend during registration
Private key:
Never leaves the client
Is encrypted (wrapped) using a password-derived key (PBKDF2)
Is unwrapped and stored in memory (React Context) after login


🔐 Authentication Flow
User registers → keys generated client-side
User logs in → private key is decrypted into memory
Access token stored for API requests
Refresh token used to maintain session
Logout clears all sensitive data


📡 API Integration

The app integrates with the Whisperbox API:

POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET /users/search
GET /users/{id}/public-key
GET /conversations
GET /conversations/{id}/messages
POST /messages


🧠 Design Decisions
-Why AES-GCM?
Efficient for message encryption
Provides confidentiality + integrity
-Why RSA-OAEP?
Secure key exchange mechanism
Ensures only intended recipient can decrypt AES key
-Why Encrypt AES Key Twice?
One for recipient → they can read
One for sender → sender can read their own messages


⚠️ Security Considerations
No plaintext is sent to backend
Private keys are never exposed
Sensitive data is not stored in localStorage
Decryption failures are handled gracefully


⚖️ Security Trade-offs
Private key is stored in memory after login (lost on refresh)
No forward secrecy implemented
No replay attack protection implemented


🧪 Known Limitations
Messages are not end-to-end encrypted over WebSocket (if not implemented)
No message status tracking (delivered/read)
No offline message queue handling
No forward secrecy (future improvement)


✨ Improvements Beyond Requirements
Clean modular architecture
Scalable state management using React Query
Improved UI/UX consistency
Graceful error handling for crypto operations


📦 Setup Instructions
1. Clone the repository
git clone https://github.com/HAFEEZAH029/sanctuary.git
cd sanctuary
2. Install dependencies
npm install
3. Run development server
npm run dev
4. Environment

Make sure the API base URL is set correctly:

https://whisperbox.koyeb.app
