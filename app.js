const db = new Dexie("Pwgenvault");

// Bump version and keep the schema simple
db.version(2).stores({
    passwords: "++id, label, password, createdAt"   // removed description
});

await db.open()
  .then(() => console.log("Dexie DB opened successfully"))
  .catch(err => console.error("Failed to open DB:", err));

async function savePassword(label, password) {
  return db.passwords.add({
    label,
    password,
    createdAt: Date.now()
  });
}

window.savePasswordFlow = function (password) {
  const label = prompt("What is this password for?");
  if (!label) {
    assistantMessage("Save cancelled", "info");
    return;
  }

  savePassword(label, password)
    .then(() => {
      assistantMessage("Password saved securely ✅", "success");
    })
    .catch(err => {
      console.error(err);
      assistantMessage("Failed to save password ❌", "error");
    });
};

// Fetch all passwords
function getAllPasswords() {
  return db.passwords.toArray();
}

// Display saved passwords
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
        assistantMessage(`${item.label}: ${item.password}`, "success");
      });
    })
    .catch(err => {
      console.error(err);
      assistantMessage("Failed to load passwords ❌", "error");
    });
}

// Expose to global scope
window.savePasswordFlow = savePasswordFlow;
window.displaySavedPasswords = displaySavedPasswords;
window.getAllPasswords = getAllPasswords;
