const dateDisplay = document.getElementById("date");
const timeDisplay = document.getElementById("time");
const monthSelect = document.getElementById("monthSelect");


function settime() {
    const now = new Date();
    dateDisplay.textContent = new Intl.DateTimeFormat("en-IN", {
        day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata"
    }).format(now);

    timeDisplay.textContent = new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata"
    }).format(now);
}
settime ();
setInterval(settime, 1000);

const now = new Date();
monthSelect.value = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
monthSelect.addEventListener("change", update);


let totalSpend = document.getElementById("total");
let numberElements = document.getElementById("numelements");
let Remaining = document.getElementById("remaining");
let Target = document.getElementById("target");
let budget = document.getElementById("Target");
let saveBudget = document.getElementById("save-target");
let warning = document.getElementById("budgetWarning");

let Form = document.querySelector(".get-data");
let exname = document.getElementById("Name");
let amount = document.getElementById("Amount");
let category = document.getElementById("Category");
let date = document.getElementById("expenseDate");
let Add = document.getElementById("add");

let searchInput = document.getElementById("search");
let categoryFilter = document.getElementById("category");
let dateSort = document.getElementById("date-sort");
let Reset = document.getElementById("reset");
let expenseList = document.getElementById("itemList");
let clear = document.querySelector(".clearall");


const expanseStorage = "WorthNestExpenses";
const budgetStorage = "WorthNestBudget";


let items = [];
let monthlyBudget = 0;

try {
    const savedItems = localStorage.getItem(expanseStorage);
    if (savedItems !== null) {
        items = JSON.parse(savedItems);
    }
} catch (error) {
    items = [];
}

monthlyBudget = Number(localStorage.getItem(budgetStorage)) || 0;
if (monthlyBudget > 0) {
    budget.value = monthlyBudget;
}

function saveItems() {
    localStorage.setItem(expanseStorage, JSON.stringify(items));
}

function addExpense() {
    let Nameexp = exname.value.trim();
    let Amountexp = Number(amount.value);
    let Categoryexp = category.value;
    let Dateexp = date.value;

    let namePattern = /^[A-Za-z0-9 .,'-]{2,80}$/;

    if (!namePattern.test(Nameexp)) {
        alert("Please enter a valid name of 2 - 80 letters or numbers");
        return;
    }
    if (isNaN(Amountexp) || Amountexp <= 0) {
        alert("Please enter an amount greater then 0.");
        return;
    }
    if (Categoryexp === "0") {
        alert("Please select a category.");
        return;
    }
    if (Dateexp === "") {
        alert("Please select a date");
        return;
    }

    let newitems = {
        id: Date.now().toString(),
        Name: Nameexp,
        Amount: Number(Amountexp),
        Category: Categoryexp,
        Date: Dateexp
    };

    items.push(newitems);
    saveItems();

    exname.value = amount.value = category.value = date.value = "";

    displayExpenses();
    update();
}

function displayExpenses() {
    let searchText = searchInput.value.trim().toLowerCase();
    let categoryselect = categoryFilter.value;

    let shown = [];
    for (let i = 0; i < items.length; i++) {
        let namematch = items[i].Name.toLowerCase().includes(searchText);
        let categorymatch = categoryselect === "0" || items[i].Category === categoryselect;
        if (namematch && categorymatch) {
            shown.push(items[i]);
        }
    }
    shown.sort(function (first, second) {
        if (dateSort.value === "oldest") {
            return first.Date.localeCompare(second.Date);
        }
        return second.Date.localeCompare(first.Date);
    });

    expenseList.innerHTML = "";
    if (shown.length === 0) {
        expenseList.innerHTML = "<tr><td colspan = '6'>No expenses to show</td></tr>";
        return;
    }

    for (let i = 0; i < shown.length; i++) {
        let expense = shown[i];
        let row = document.createElement("tr");
        row.innerHTML = "<td>" + (i + 1) + "</td>" + "<td>" + expense.Name + "</td>" + "<td>" + expense.Amount + "</td>" + "<td>" + expense.Category + "</td>" +  "<td>" + expense.Date + "</td>";
        let active = document.createElement("td");
        let delbutton = document.createElement("button");
        delbutton.textContent = "Delete";
        delbutton.onclick = function() {
            deleteExpense(expense.id);
        };

        active.appendChild(delbutton);
        row.appendChild(active);
        expenseList.appendChild(row);
    }
}
function deleteExpense(id) {
    let remaining = [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].id !== id) {
            remaining.push(items[i]);
        }
    }
    items = remaining;
    saveItems();
    displayExpenses();
    update();
}

function update() {
    let selectedMonth = monthSelect.value;
    let monthexp = items.filter(function (expense) {
        return expense.Date.slice(0, 7) === selectedMonth;
    })
    let monthtot = monthexp.reduce(function (sum, expense) {
        return sum + expense.Amount;
    }, 0);

    totalSpend.textContent = "₹" + monthtot.toLocaleString("en-IN");
    numberElements.textContent = monthexp.length;
    Remaining.textContent = "₹" + (monthlyBudget - monthtot).toLocaleString("en-IN");
    Target.textContent = "₹" + monthlyBudget.toLocaleString("en-IN");

    if (monthlyBudget > 0 && monthtot > monthlyBudget) {
        warning.style.display = "block";
        warning.textContent = "You have crossed your monthly budget!!!";
    } else {
        warning.style.display = "none";
    }
}

function savebudget() {
    let entered = Number(budget.value);
    if (isNaN(entered) || entered <= 0) {
        alert("Please enter a budget greater than 0");
        return;
    }
    monthlyBudget = entered;
    localStorage.setItem(budgetStorage, String(monthlyBudget));
    update();
}

function resetFilter() {
    searchInput.value = "";
    categoryFilter.value = "0";
    dateSort.value = "newest";
    displayExpenses();
}

function clearAll() {
    if (!confirm("Are you sure you want to clear all expenses?")) {
        return;
    }
    items = [];
    savebudget();
    displayExpenses();
    update();
}

Add.onclick = addExpense;
saveBudget.onclick = savebudget;
Reset.onclick = resetFilter;
clear.onclick = clearAll;
searchInput.oninput = displayExpenses;
categoryFilter.onchange = displayExpenses;
dateSort.onchange = displayExpenses;

displayExpenses();
update();
