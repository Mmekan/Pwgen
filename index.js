const letter = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
const numbers = [
     "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
const symbols = ["~","`","!","@","#","$","%","^","&","*","(",")","_","-","+","=","{","[","}","]",",","|",":",";","<",">",".","?",
"/"];

const alphaNum = [letter, numbers].flat();
const characters = [letter, numbers, symbols].flat();

const pbox1 = document.getElementById("ex1")
const pbox2 = document.getElementById("ex2")

//symbol toggler
const toggleSymbol = document.getElementById("toggleSymbol")

toggleSymbol.addEventListener("change", ()=>{
    console.log(toggleSymbol.checked);
})

hasGenerated = false;


//click to copy
const button = document.getElementById("generateBtn")

button.addEventListener("click", generatePassword);
pbox1.addEventListener("click", ()=>{
    navigator.clipboard.writeText(pbox1.textContent).then(()=>{
        showToast("Password copied to clipboard!");
    }).catch(err =>{
        console.error("Failed to copy password: ", err);
    })
})

pbox2.addEventListener("click", ()=>{
    navigator.clipboard.writeText(pbox2.textContent).then(()=>{
        showToast("Password copied to clipboard!");
    }).catch(err =>{
        console.error("Failed to copy password: ", err);
    })
})

//loop through through characters
//generate random numbers from 0 - 91
//display 13 of the random numbers in textcontent
//convert it to characters

function generatePassword() {

    //if symbol toggler is checked
    if(toggleSymbol.checked === true){
        
        pbox1.textContent = "";
        pbox2.textContent = "";

    
    for(i = 0; i < 13; i++){
      let index =  Math.floor( Math.random()* characters.length)
      let index2 =  Math.floor( Math.random()* characters.length)  

        pbox1.textContent +=characters[index]
        pbox2.textContent += characters[index2];
    }      
    }else{
    pbox1.textContent = "";
    pbox2.textContent = "";

    
    for(i = 0; i < 13; i++){
      let index =  Math.floor( Math.random()* alphaNum.length)
      let index2 =  Math.floor( Math.random()* alphaNum.length)  

        pbox1.textContent +=alphaNum[index]
        pbox2.textContent += alphaNum[index2];
    }      
    }
    hasGenerated = true
}

function showToast(message) {
    if (hasGenerated === false) {
        pbox1.textContent = "Did you just..."
        pbox2.textContent = "copy nothing?😕 "
    }else{
    const toast = document.createElement("div");
    toast.id = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
    }
}
