// Creating Modal object that opens the new transaction tab 
const Modal = {
// Creating method that opens Modal 
open(){
    document // Object that holds the entire HTML structure 
        .querySelector('.modal-overlay') // Search the HTML document for 'modal.overlay' 
        .classList
        .add('active') // Add 'active' to the list of classes in 'modal.overlay'

},
// Creating method that closes the modal 
close() {
    document
        .querySelector('.modal-overlay')
        .classList
        .remove('active')
}
}

// Creating object that stores transactions in the browser 
const Storage = {
// Capture table information 
get() {
    return JSON.parse(localStorage.getItem("piggybank:transactions")) || [] // Parse command transform string to array 
},
// Stores table information 
set(transactions) {
    localStorage.setItem("piggybank:transactions", JSON.stringify(transactions))
}
}

// Creating object that saves and performs mathematical calculations of the values indicated in the form 
const Transaction = {
all: Storage.get(), // Displays values stored in the browser's database 

// Add transactions to table 
add(transaction){
    Transaction.all.push(transaction)
    // Reread and update the application 
    App.reload()
},

// Remove table transactions from its index (captured by JS) 
remove(index) {
    Transaction.all.splice(index, 1)
    // Reread and update the application 
    App.reload()
},

// Functionality that receives and sums the winnings 
incomes() {
    // Declaring variable income 
    let income = 0;
    // If input value entered is greater than zero... 
    Transaction.all.forEach(transaction => { // Using arrow function 
        if( transaction.amount > 0 ) {
            // ... this value is added to the variable 
            income += transaction.amount;
        }
    })
    return income;
},

// Functionality that receives and sums the expenses
expenses() {
    // Declaring expense variable and its initial value 
    let expense = 0;
    // If for each transaction the value is less than zero (indicating expense)... 
    Transaction.all.forEach(transaction => {
        if( transaction.amount < 0 ) {
            // ... this value is added to the variable   
            expense += transaction.amount;
        }
    })
    return expense;
},

// Functionality that receives and sums the total amount 
total() {
    return Transaction.incomes() + Transaction.expenses();
}
}

// Creating element that handles HTML information inside JavaScript  
const DOM = {
// Search in HTML or Tbody 
transactionsContainer: document.querySelector('#data-table tbody'), // search for id='#data-table tbody' 

addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    // Element that places HTML data inside a table row
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index
    // Add HTML element to container 
    DOM.transactionsContainer.appendChild(tr)
},

// Creating functionality that replaces HTML values with JavaScript values 
innerHTMLTransaction(transaction, index) {
    // Setting 'value' text color depending on whether it is a income (+) or expense (-) 
    const CSSclass = transaction.amount > 0 ? "income" : "expense"

    const amount = Utils.formatCurrency(transaction.amount)
    
    // Constant that receives a template literals and captures the description, value and date of the financial transaction 
    const html = `
    <td class="description">${transaction.description}</td>
    <td class="${CSSclass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
    </td>
    `

    return html
},

// Functionality that updates cards based on user-entered values 
updateBalance() {
    document
        .getElementById('incomeDisplay') // Capture element by id 
        .innerHTML = Utils.formatCurrency(Transaction.incomes()) // Replaces the value in HTML with the value defined in JavaScript 
    document
        .getElementById('expenseDisplay') // Capture element by id 
        .innerHTML = Utils.formatCurrency(Transaction.expenses()) // Replaces the value in HTML with the value defined in JavaScript 
    document
        .getElementById('totalDisplay') // Capture element by id 
        .innerHTML = Utils.formatCurrency(Transaction.total()) // Replaces the value in HTML with the value defined in JavaScript 
},

// Clean up pre-existing transactions once they are removed 
clearTransactions() {
    DOM.transactionsContainer.innerHTML = ""
}
}

// Object that modifies the layout of fields 
const Utils = {
// Modify layout of the entered value      
formatAmount(value){
    value = Number(value.replace(/\,\./g, "")) * 100
    
    return value
},
// Modify layout of the date
formatDate(date) {
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
},

// Modify layout of the currency
formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "" // Convert string to number 
    // Convert number to String 
    value = String(value).replace(/\D/g, "") // Using reg.ex to search only numbers 

    value = Number(value) / 100 // Put the number in decimal format 

    // Defining currency style 
    value = value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL" // Brazilian currency 
    })
    // Concatenating currency sign with value 
   return signal + value
}
}

// Configuring Form Settings 
const Form = {
description: document.querySelector('input#description'), // Creating link between HTML and JS, where it takes and stores form values 
amount: document.querySelector('input#amount'),
date: document.querySelector('input#date'),

getValues() {
    return {
        description: Form.description.value, // Returns objects with the values captured in the page form 
        amount: Form.amount.value,
        date: Form.date.value
    }
},

// Checks that all form fields have been filled in 
validateFields() {
    const { description, amount, date } = Form.getValues()
    // Checks if the fields are empty 
    if( description.trim() === "" || 
        amount.trim() === "" || 
        date.trim() === "" ) {
            // Empty case, displays the following error message  
            throw new Error("Please, fill in all fields ")
    }
},

// Capturing form values and formatting in specified template 
formatValues() {
    let { description, amount, date } = Form.getValues()
    
    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)
    // Returns format values 
    return {
        description,
        amount,
        date
    }
},
// Clears form fields each time it is opened 
clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
},

// Breaking default behavior and creating error message for Form 
submit(event) {
    event.preventDefault()
    // try
    try {
        Form.validateFields() // Checks if the fields are filled with valid data 
        const transaction = Form.formatValues() // Format the values 
        Transaction.add(transaction) // Add transaction to table 
        Form.clearFields() // Clear form fields 
        Modal.close() // Close Modal
    } catch (error) { // If an error is caught... 
        alert(error.message) // ... Displays error message 
    }
}
}

// Transforming the application into an intelligent application, where values will be inserted in the form, using JS 
const App = {
init() {
    // Add transaction 
    Transaction.all.forEach(DOM.addTransaction)
    // Update cards 
    DOM.updateBalance()
    // Stores values in local storage in the browser 
    Storage.set(Transaction.all)
},

// Functionality that rereads objects after some modification 
reload() {
    // Clear field when requested by user 
    DOM.clearTransactions()
    // Start the application 
    App.init()
},
}
// Start the application 
App.init()

