let apiData = null;
let withdrawalLogo = `  <span class="text-center align-baseline inline-flex md:px-2 py-1 mr-auto items-center font-semibold text-base/none text-success bg-success-light rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                            </svg> 
                        </span>`

let depositLogo = ` <span class="text-center align-baseline inline-flex md:px-2 py-1 mr-auto items-center font-semibold text-base/none text-success bg-success-light rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                    </span>`

document.querySelector('#sortByNameBtn').addEventListener('click',(e) => {sort(e.target.id);});
document.querySelector('#sortByAmountBtn').addEventListener('click',(e) => {sort(e.target.id);});

function sort(id){
    let allUserRows = document.querySelectorAll('.userRow');
    let allUsers = [];
    if(id === "sortByNameBtn"){
        allUsers = document.querySelectorAll('.userName');
    }
    else if(id === "sortByAmountBtn"){
        allUsers = document.querySelectorAll('.transaction_amount');
    }

    let listOFusersAndData = [];
    for(let i = 0 ; i < allUsers.length ; i++){
        let userInfo = allUsers[i].innerHTML.toLowerCase();
        let userData = allUserRows[i];
        listOFusersAndData[i] = {[userInfo]:userData};
    }

    listOFusersAndData.sort((a,b)=>{
        let key1 = Object.keys(a);
        let key2 = Object.keys(b);
        if(!isNaN(+key1)) key1 = +key1;
        if(!isNaN(+key2)) key2 = +key2;
        if(key1 < key2)
            return -1;
        else if(key1 > key2)
            return 1;
        else
            return 0;
    });

    let tbody = document.querySelector('tbody');
    tbody.innerHTML = "";
    for(const user of listOFusersAndData){
        for(const key in user)
            tbody.appendChild(user[key]);
    }
}

async function fetchData(){
    try{
        let response = await fetch('../data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    }catch(error){
        console.log(error);
    }
}

function displayData(transaction_data){
    let box = ``;
    let transactions = transaction_data.transactions;
    let customers = transaction_data.customers;
    for(let i = 0 ; i < transactions.length ; i++){
        box += `
            <tr class="userRow border-b-2 last:border-b-0">
                <td  class="p-3 pl-0">
                    <div class="flex items-center">
                        <div class="relative shrink-0 rounded-2xl me-3">
                            <img id="userPhotoName" src="${customers[transactions[i].customer_id-1].img}" class="w-[30px] rounded-2xl" alt="customer image">
                        </div>
                        <div class="flex flex-col justify-start">
                            <h3 class="userName mb-1 font-semibold text-sm md:text-lg">${customers[transactions[i].customer_id-1].name}</h3>
                        </div>
                    </div>
                </td>
                <td class="text-end font-semibold">
                    <span class="w-auto ${transactions[i].amount > 0 ? 'bg-green-500' : 'bg-red-500'} rounded-lg px-4 py-2">
                        <span class="transaction_amount text-md/normal">${Math.abs(transactions[i].amount)}</span>$
                        ${transactions[i].amount > 0 ? depositLogo : withdrawalLogo}
                    </span>
                </td>
                <td class="pr-0 text-end">
                    <span class="transaction_date font-semibold text-md/normal">${transactions[i].date}</span>
                </td>
                <td class="text-end"><button class="showChartBtn hover:bg-orange-600 transition-all duration-500 rounded-lg border-2 hover:text-white px-5 py-2">Show Chart</button></td>
            </tr>
        `
    }
    document.querySelector('tbody').innerHTML = box;
}


function showChart(trans_idx){
        let transactions = apiData.transactions;
        let customer_idx = apiData.transactions[trans_idx].customer_id-1; // customers array read form the api is from [0-4] while ids are from [1-5]
        let user_transactions = [];
        for(let u of transactions){ // loop through all transactions and get the date and amount data of this user 
            if(+u.customer_id-1 === customer_idx) // 
                user_transactions.push(u);
        }
        // console.log(user_transactions);

        let data = [];
        for(let i = 0 ; i < user_transactions.length ; i++){
            data.push({date:user_transactions[i].date, amount:user_transactions[i].amount});
        }
        // console.log(data);


        let userName = apiData.customers[customer_idx].name;
        if(chartInstance){
            chartInstance.destroy();
        }
        chartInstance = new Chart(
            document.getElementById('myChart'),
            {
                type: 'line',
                data: {
                    labels: data.map(row => row.date),
                    datasets: [
                        {
                            label: `${userName} Transaction Analysis`,
                            data: data.map(row => row.amount)
                        }
                    ]
                }
            }
        );

        document.querySelector('.chartContainer')?.scrollIntoView({behavior: 'smooth'});
}


let chartInstance = null;

(async function() {
    apiData = await fetchData();
    displayData(apiData);
    let allButtons = document.querySelectorAll('.showChartBtn');
    for(let i = 0 ; i < allButtons.length ; i++){
        allButtons[i].addEventListener('click',(e) => {showChart(i);})
    }
    // default chart:
    let data = [];
    chartInstance = new Chart(
        document.getElementById('myChart'),
        {
            type: 'line',
            data: {
                labels: data.map(row => row.date),
                datasets: [
                    {
                        label: `Select a customer to show Transaction Analysis`,
                        data: data.map(row => row.amount)
                    }
                ]
            }
        }
    );
})();



