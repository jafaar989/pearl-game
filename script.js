<!DOCTYPE html><html lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>لعبة ذاكرة القراصنة</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="game-container">
    <h1>🏴‍☠️⚓️🏴‍☠️ لعبة ذاكرة القراصنة 🏴‍☠️⚓️🧠</h1>
    <div id="timer">الوقت المتبقي: <span id="time">10</span> ثواني</div>
    <div class="grid"></div>
  </div>  <!-- Firebase and Game Logic as module -->  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
    import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyABv1NyGChRCfG6osyNyX7-gr97vVhoIwU",
      authDomain: "pearlgame-b7a37.firebaseapp.com",
      projectId: "pearlgame-b7a37",
      storageBucket: "pearlgame-b7a37.appspot.com",
      messagingSenderId: "208215390214",
      appId: "1:208215390214:web:ca29373dcb2ddb94a8ab87"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    let playerId = localStorage.getItem("playerId");
    if (!playerId) {
      playerId = Math.random().toString(36).substring(2);
      localStorage.setItem("playerId", playerId);
    }

    import("./script.js").then(module => {
      module.startGame(db, playerId);
    });
  </script></body>
</html>
// هذا الملف يفترض أنه يُستدعى من index.html باستخدام import وتفعيل startGame(db, playerId)

export function startGame(db, playerId) {
  const pirateImages = [
    "images/images.jpeg",
    "images/images1.jpg",
    "images/images2.jpg",
    "images/images3.jpeg",
    "images/images4.jpeg",
    "images/images5.jpeg",
  ];

  const flipSound = new Audio("sounds/sound.mp3");
  const backgroundMusic = new Audio("sounds/back.mp3");
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.3;

  let grid = document.querySelector(".grid");
  let flippedCards = [];
  let matchedPairs = 0;
  let timeLeft = 50;
  let timer;
  let gameOver = false;

  // التحقق إذا لعب المستخدم مسبقًا
  db.collection("players").doc(playerId).get().then((doc) => {
    if (doc.exists) {
      alert("لقد لعبت من قبل! لا يمكنك اللعب مجددًا.");
      gameOver = true;
      return;
    } else {
      createCards();
      startTimer();
    }
  });

  function createCards() {
    const allImages = [...pirateImages, ...pirateImages];
    allImages.sort(() => Math.random() - 0.5);

    allImages.forEach((imgSrc) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const front = document.createElement("div");
      front.classList.add("front");
      const frontImg = document.createElement("img");
      frontImg.src = "images/card.jpg";
      frontImg.alt = "بطاقة";
      frontImg.style.width = "100%";
      frontImg.style.height = "100%";
      frontImg.style.borderRadius = "10px";
      front.appendChild(frontImg);

      const back = document.createElement("div");
      back.classList.add("back");
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = "pirate image";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.borderRadius = "10px";
      back.appendChild(img);

      card.appendChild(front);
      card.appendChild(back);
      grid.appendChild(card);

      card.addEventListener("click", () => {
        if (!gameOver) {
          flipSound.currentTime = 0;
          flipSound.play();
          flipCard(card, imgSrc);
        }
      });
    });
  }

  function flipCard(card, imgSrc) {
    if (flippedCards.length >= 2 || card.classList.contains("flipped")) return;

    card.classList.add("flipped");
    flippedCards.push({ card, imgSrc });

    if (flippedCards.length === 2) {
      checkMatch();
    }
  }

  function checkMatch() {
    const [first, second] = flippedCards;

    if (first.imgSrc === second.imgSrc) {
      matchedPairs++;
      flippedCards = [];

      if (matchedPairs === pirateImages.length) {
        endGame(true);
      }
    } else {
      setTimeout(() => {
        first.card.classList.remove("flipped");
        second.card.classList.remove("flipped");
        flippedCards = [];
      }, 800);
    }
  }

  function startTimer() {
    backgroundMusic.play();
    document.getElementById("time").textContent = timeLeft;

    timer = setInterval(() => {
      timeLeft--;
      document.getElementById("time").textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(timer);
        endGame(false);
      }
    }, 1000);
  }

  function endGame(won) {
    gameOver = true;
    document.querySelectorAll(".card").forEach((card) => card.style.pointerEvents = "none");

    saveResult(won);

    setTimeout(() => {
      alert(won ? "🏆 فزت! جميع الكنوز تم كشفها!" : "💀 انتهى الوقت! أعد تحميل الصفحة للمحاولة من جديد.");
    }, 300);
  }

  function saveResult(didWin) {
    db.collection("players").doc(playerId).set({
      result: didWin ? "win" : "lose",
      timestamp: new Date().toISOString()
    }).then(() => {
      console.log("تم حفظ النتيجة بنجاح");
    }).catch((error) => {
      console.error("خطأ في حفظ النتيجة:", error);
    });
  }
}
