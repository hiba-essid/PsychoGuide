# 🧠 PsychoGuide

PsychoGuide is a web-based mental wellness and psychological guidance platform designed to provide users with educational resources, self-help tools, and an intuitive interface for exploring mental health topics.

## 🌐 Live Demo

https://my-project-two-sage.vercel.app

---

## ✨ Features

- Responsive and modern user interface
- Mental health guidance and educational content
- Node.js backend server
- SQLite database integration
- Easy local setup and deployment
- Clean HTML, CSS, and JavaScript frontend

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- SQLite

---

## 📁 Project Structure

```
PsychoGuide/
│
├── server.js                  # Node.js server
├── package.json               # Project dependencies
├── database.sql               # Database schema
├── psychoguide.db             # SQLite database
├── styles.css                 # Application styling
├── PsychoGuide(2).html        # Main application page
├── START_SERVER.bat           # Windows startup script
├── start-server.sh            # Linux/Mac startup script
├── INSTALLATION_NODEJS.md     # Installation guide
└── README.md                  # Project documentation
```

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/hiba-essid/PsychoGuide.git
cd PsychoGuide
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
PORT=3000
```

### 4. Start the server

#### Linux / macOS

```bash
npm start
```

or

```bash
./start-server.sh
```

#### Windows

```bash
START_SERVER.bat
```

---

## 💻 Development Mode

```bash
npm run dev
```

---

## 🗄️ Database

PsychoGuide uses SQLite for local data storage.

Initialize the database if necessary:

```bash
sqlite3 psychoguide.db < database.sql
```

---

## 📸 Screenshots

Add screenshots here:

```
screenshots/
├── home.png
├── dashboard.png
└── resources.png
```

---

## 🎯 Future Improvements

- User authentication
- Personalized recommendations
- Mood tracking features
- Therapist directory
- Multilingual support
- Analytics dashboard

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push your branch

```bash
git push origin feature/my-feature
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Hiba Essid**

GitHub: https://github.com/hiba-essid

---

⭐ If you find this project useful, please consider giving it a star.