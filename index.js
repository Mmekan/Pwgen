const letters = [
  "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P",
  "Q","R","S","T","U","V","W","X","Y","Z",
  "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p",
  "q","r","s","t","u","v","w","x","y","z"
];

const numbers = ["0","1","2","3","4","5","6","7","8","9"];

const symbols = [
  "~","`","!","@","#","$","%","^","&","*","(",")","_","-","+","=",
  "{","[","}","]",",","|",":",";","<",">",".","?","/"
];

const alphaNum = [...letters, ...numbers];
const characters = [...letters, ...numbers, ...symbols];

//state variables
let hasGenerated = false;
let hasCopied = false;
let changedLength = false;

let clickCount = 0;
let warningSent = false;

let num = 13; // default password length

//DOM Elements
const pbox1 = document.getElementById("ex1");
const pbox2 = document.getElementById("ex2");

const generateBtn = document.getElementById("generateBtn");
const toggleSymbol = document.getElementById("toggleSymbol");

const pwLength = document.getElementById("lengthRange");
const pwLengthText = document.getElementById("lenVal");

// Assistant UI
const bubble = document.getElementById("assistant-bubble");
const panel = document.getElementById("assistant-panel");
const closeBtn = document.getElementById("assistant-close");
const messages = document.getElementById("assistant-messages");

//Event Listeners
generateBtn.addEventListener("click", generatePassword);

toggleSymbol.addEventListener("change", () => {
  console.log(toggleSymbol.checked);
});

pwLength.addEventListener("input", () => {
  num = pwLength.value;
  changedLength = true;
  pwLengthText.textContent = " " + num;
});

pbox1.addEventListener("click", () => handleCopy(pbox1.textContent));
pbox2.addEventListener("click", () => handleCopy(pbox2.textContent));

bubble.onclick = () => {
  panel.style.display = panel.style.display === "block" ? "none" : "block";
};

closeBtn.onclick = () => {
  panel.style.display = "none";
};

//hold timer to display passwords
    let holdTimer;
bubble.addEventListener('pointerdown', ()=>{
    holdTimer = setTimeout(()=>{
      console.log("Hold detected, showing saved passwords...");

      assistantAsk("Do you want to see saved passwords?",
           ()=> displaySavedPasswords());
           //action after 3 seconds
        }, 3000);
});
bubble.addEventListener('pointerup', ()=>{
    clearTimeout(holdTimer);
});



function handleCopy(password) {
  if (!hasGenerated) {
    showToast();
    return;//run nothing after this
  }

  navigator.clipboard.writeText(password)
    .then(() => {
      showToast("Password copied to clipboard!");

      setTimeout(() => {
        assistantAsk(
          "Do you want to save this password in your vault?",
          () => savePasswordFlow(password) //app.js function
        );
      }, 1200);

      hasCopied = true;
    })
    .catch(() => {
      assistantMessage("Failed to copy password", "error");
    });
    return;

}


//Assistant functions
function assistantMessage(text, type = "info") {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  panel.style.display = "block";
}

function assistantAsk(question, onYes, onNo) {
  const wrapper = document.createElement("div");
  wrapper.className = "msg info";

  const text = document.createElement("div");
  text.textContent = question;

  const actions = document.createElement("div");
  actions.className = "assistant-actions";

  const yesBtn = document.createElement("button");
  yesBtn.textContent = "Yes";

  const noBtn = document.createElement("button");
  noBtn.textContent = "No";

  yesBtn.onclick = () => {
    wrapper.remove();
    onYes && onYes();
  };

  noBtn.onclick = () => {
    wrapper.remove();
    onNo && onNo();
  };

  actions.appendChild(yesBtn);
  actions.appendChild(noBtn);

  wrapper.appendChild(text);
  wrapper.appendChild(actions);

  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
  panel.style.display = "block";
}

//password generation logic
function generatePassword() {
  pbox1.textContent = "";
  pbox2.textContent = "";

  //if the symbol toggle checkbox is checked, use symbols, otherwise alphanum
  const source =
    toggleSymbol.checked ? characters : alphaNum;

  const length =
    changedLength ? num : 13;

  for (let i = 0; i < length; i++) {
    pbox1.textContent += source[Math.floor(Math.random() * source.length)];
    pbox2.textContent += source[Math.floor(Math.random() * source.length)];
  }

  hasGenerated = true;
}

//Toast logic with humor
function showToast(message) {
  if (!hasGenerated) {
    pbox1.textContent = "Did you just...";
    pbox2.textContent = "copy nothing?! 🫤";

    clickCount++;

    if (clickCount === 2 && !warningSent) {
      assistantMessage("I'll assume it was a mistake! 😠", "error");
      warningSent = true;
    } else if (clickCount === 4) {
      assistantMessage("Stop it! 😡", "error");
    } else if (clickCount === 6) {
      panel.style.display = "none";

    }

    return;
  }

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


// ============== PWA SERVICE WORKER + INSTALL ==============

let deferredPrompt;

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service Worker registered ✅', reg.scope);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New version available
                  showUpdateToast();
                }
              }
            });
          }
        });
      })
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

// Install App Button
const installBtn = document.createElement('button');
installBtn.textContent = "📲 Install App";
installBtn.id = "install-btn";
installBtn.style.display = "none";   // hidden by default

// You can append it wherever you want (e.g. near generate button)
document.body.appendChild(installBtn);   // or better: document.getElementById('header').appendChild(installBtn);

installBtn.addEventListener('click', () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choice => {
      if (choice.outcome === 'accepted') {
        console.log('User installed the app');
      }
      deferredPrompt = null;
      installBtn.style.display = "none";
    });
  }
});

// Listen for install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
  console.log('Install prompt ready');
});

// Show update notification
function showUpdateToast() {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #333; color: white; padding: 12px 20px; border-radius: 8px;
    z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  toast.innerHTML = `
    New version available! 
    <button onclick="this.parentElement.remove(); window.location.reload()" 
            style="margin-left:10px; background:#0a0; color:white; border:none; padding:6px 12px; border-radius:4px;">
      Update Now
    </button>
  `;
  document.body.appendChild(toast);
}
