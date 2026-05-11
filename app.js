const db = new Dexie("Pwgenvault")
db.version(1).stores({
    passwords: "++id, label, password, createdAt, description"
});

await db.open()
  .then(() => {
    console.log("Dexie DB opened successfully");
  })
  .catch(err => {
    console.error("Failed to open DB:", err);
  });

async function savePassword(label, password) {
  return db.passwords.add({
    label,
    password,
    description,  
    createdAt: Date.now()
  });
}

window.savePasswordFlow = function (password) {
  const label = prompt("What is this password for?");

  if (!label) {
    assistantMessage("Save cancelled", "info");
    return;
  }

  savePassword(label, password, description)
    .then(() => {
      assistantMessage("Password saved securely ✅", "success");
    })
    .catch(() => {
      assistantMessage("Failed to save password ❌", "error");
    });
};

//fetches saved passwords in the vault
function getAllPasswords() {
  return db.passwords.toArray();
}

//display saved passwords in the assistant
function displaySavedPasswords() {
  console.log("Fetching saved passwords...");
  getAllPasswords()
    .then(passwords => {
      if (passwords.length === 0) {
        assistantMessage("You haven't saved any yet 👀", "info");
        return;
      }

      assistantMessage("Saved passwords:", "info");

      passwords.forEach(item => {
        assistantMessage(
          `${item.label}: ${item.password}`,
          "success"
        );
      });
    })
    .catch(() => {
      assistantMessage("Failed to load passwords ❌", "error");
    });
};

// ============== EXPOSE TO GLOBAL SCOPE ==============
window.savePasswordFlow = savePasswordFlow;        // already had this
window.displaySavedPasswords = displaySavedPasswords;
window.getAllPasswords = getAllPasswords;
