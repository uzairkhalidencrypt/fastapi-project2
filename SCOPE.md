# Full-Stack E-Commerce Practice App

This is a full-stack e-commerce project built to practice designing relational databases, building APIs from scratch, and connecting them to a dynamic frontend web interface. 

It uses a decoupled setup with a FastAPI backend server running on top of SQLite, talking directly to a state-driven React client frontend over local network streams.

## 🛠️ Tech Stack
* **Frontend:** React (JavaScript) using hooks (`useState`, `useEffect`) and async network fetch operations (`async/await` and Promises).
* **Backend:** FastAPI (Python) running locally via a Uvicorn ASGI server with hot-reloading enabled.
* **Database:** SQLite (`test.db`) managed through SQLAlchemy Object Relational Mappings (ORM).
* **Security:** Password encryption using `passlib[bcrypt]` and user session management via JSON Web Tokens (`PyJWT`).

## 🚀 Features Built So Far

### 1. User Sign Up and Login Gateway
* **Registration:** Validates user details (name, email, password, location), securely hashes passwords in the background, and saves them to the database.
* **Login Form:** Checks credentials against stored records, generates a secure JWT string pass (`access_token`), and saves it locally in the browser's `localStorage` to keep user sessions alive.

### 2. Live Storefront Inventory Control
* **Public Catalog:** Fetches active store inventory items straight from the database and maps them cleanly onto visible UI display cards.
* **Merchant Dashboard Controls:** A custom management panel that allows creating new items or running explicit removal actions (`DELETE /products/{id}`) to drop items from the store directory.

### 3. Personal Notepad Workspace
* **JWT-Isolated Notes:** A secure personal testing area where logged-in users can write and read sticky notes that are isolated strictly by their parsed token parameters.

### 4. Relational Database Shopping Architecture (Step 1 Complete)
* Relational database tables structured within a unified models file, cleanly mapping a master invoice summary table (`orders`) down to individual standalone shopping line-item rows (`order_items`).

---

## 📁 Folder Structure

```text
Fastapi-project2/              # BACKEND CONTAINER
├── app/
│   ├── config/                # Database configuration scripts
│   ├── models/                # Master SQLAlchemy database tables (user.py)
│   ├── routers/               # API endpoint route files (auth.py, product.py)
│   ├── schemas/               # Pydantic validation files
│   ├── database.py            # Local session initialization
│   ├── security.py            # Hashing and token tools
│   └── main.py                # Server setup and CORS connection rules
├── .vscode/
│   └── launch.json            # VS Code debugger automated settings
├── .gitignore                 # Files excluded from Git tracking (.venv/, test.db, cache)
└── README.md                  # Project documentation

auth-frontend-app/             # FRONTEND REPOSITORY
├── src/
│   ├── components/            # Reusable sub-view dashboard containers
│   ├── App.js                 # Central wrapper, state hooks, and fetch networks
│   └── index.js               # Main React entry point
```

---

## 🏃 Running the Project Locally

### 1. Spin Up the Backend Server inside the Debugger
Make sure you are in your project root folder, open your **Run and Debug** side tab in VS Code, choose the **`Python: FastAPI`** profile from the dropdown, and press **F5**.
```bash
# The terminal will load your environment and display:
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

### 2. Start the React Frontend Storefront App
Open a completely separate terminal window, navigate down into your frontend repository folder, and boot up the node web server:
```bash
cd auth-frontend-app
npm start
```

## 🛡️ Live API Testing
You can interact with, test, and view all your database columns and routes directly without using the frontend layout by opening up the interactive Swagger suite in your browser:
* **Interactive OpenAPI Docs:** [http://127.0.0](http://127.0.0)
