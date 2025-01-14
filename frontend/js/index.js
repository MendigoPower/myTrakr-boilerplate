users = []

$(() => {
  //Start coding here!
  $.ajax({
    method: 'get',
    url: 'http://localhost:3000/accounts',
    dataType: 'json',
  }).done((data) => {
    data.forEach(accounts => {
      const newAccount = new Account (  
        accounts.username,
        accounts.id
      ) 
      $(".accountWrapper").append(`<option value = ${accounts.id}>${accounts.username}</option>`)
      users.push(newAccount)
      $("#listSummary").append(`
          <li id="${newAccount.username}">Account Name: ${newAccount.username} | Current Balance: <span>${newAccount.balance}</span></li>`);

        
    });
  });  
  
    $('#newAccount').on('submit', (e) => {
      e.preventDefault()
        const inValue = $("#accountInput").val();
        if (inValue === "") {
          alert("insert value")
          return
        }
        let exist = false
        for (let i = 0; i < users.length; i++ ) {
          if (users[i].username === inValue) {
            exist = true
          }
        }
        if (exist) {
          alert("The user already exist")
          return
        }

        const newAccount = {
              username: inValue,
              transactions:[]
            };

        $.ajax({
          method: 'post',
          data: JSON.stringify({newAccount}),
          url: 'http://localhost:3000/accounts',
          dataType: 'json',
          contentType: 'application/json'
        }).done((data) => {
          const newAccount = new Account(data.username,data.id, data.transactions)
          users.push(newAccount);
          $(".accountWrapper").append(`<option value = ${data.id}>${data.username}</option>`)

          $("#listSummary").append(`
          <li id="${newAccount.username}">Account Name: ${newAccount.username} | Current Balance: <span>${newAccount.balance}</span></li>`);
  
        });


      });
      

      $.ajax({
        method: 'get',
        url: 'http://localhost:3000/transactions',
        dataType: 'json',
      }).done((data) => {
        data.forEach(transaction => { 
          transaction.forEach(transDetails => {
            let to = ""
            let from = ""
            let username = ""
            for (let i = 0; i < users.length; i++) {
              if (users[i].id == transDetails.accountId) {
                username = users[i].username
              }
              if (users[i].id == transDetails.accountIdFrom) {
                from = users[i].username
              }
              if (users[i].id == transDetails.accountIdTo) {
                to = users[i].username
              }
            }
            $(".tableData").append(`
          <tr>
            <td class="idWrap">${transDetails.id}</td>
            <td class="usernameWrap">${username}</td>
            <td class="transWrap">${transDetails.transType}</td>
            <td class="catWrap">${transDetails.category}</td>
            <td class="descWrap">${transDetails.descripcion}</td>  
            <td class="amountWrap">${transDetails.amountVal}</td>
            <td class="fromWrap">${from}</td>
            <td class="toWrap">${to}</td>
          </tr>
          `)
          })
        })
      });  
    })

      $('#newTransaction').on('submit', (e) => {
        e.preventDefault()
        const newTransaction = {
            category: $("#chooseCategory").val(),
            transType: $("[name=radioValue]:checked").val(),
            descripcion: $("#descVal").val(),
            amountVal: $("#amountVal").val(),
            accountId: $("#accChangeId").val(),
            accountIdFrom:$("#fromId").val(), 
            accountIdTo:$("#toId").val() 
          }
          console.log(newTransaction)

          let currentBalance = ""

          if($("[name=radioValue]:checked").val() === "transfer"){
            let username = ""
            users.forEach(user => {
              if(user.id == $("#fromId").val()){
                username = user.username
              }
            })

            currentBalance = Number($(`#${username} span`).text())

            if(currentBalance < Number($("#amountVal").val()))
            alert("You don't have enough balance for transfer.")
          }
          if($("[name=radioValue]:checked").val() === "withdraw"){
            let username = ""
            users.forEach(user => {
              if(user.id == $("#accChangeId").val()){
                username = user.username
              }
            })
            currentBalance = Number($(`#${username} span`).text())

            if(currentBalance < Number($("#amountVal").val()))
            alert("You dont have enough balance")
          }

          if($('#amountVal').val() <= 0) {
            alert("The amout value should be greater than 0")
            return
          }

          if(!$("[name=radioValue]:checked").val()) {
            alert("Choose a type of transaction")
            return 
          }

          if($("[name=radioValue]:checked").val() === "transfer" ){
            if($("#fromId").val() === "" || $("#toId").val() === ""){
              alert("Choose one account before transfer")
              return
            }
            if($("#fromId").val() === $("#toId").val()){
              alert("You cannot transfer to the same account")
              return
            }
      
          }

          $.ajax({
            method: 'post',
            url: 'http://localhost:3000/transaction',
            data: JSON.stringify({newTransaction}),
            dataType: 'json',
            contentType: 'application/json'
          }).done((data) => {
            data.forEach(transaction => {
              console.log(data)
              let newTransaction;
              if(transaction.transType === 'deposit'){
                newTransaction = new Deposit(transaction.amountVal, transaction.accountId);
              }else if(transaction.transType === 'withdraw'){
                newTransaction = new Withdrawal(transaction.amountVal, transaction.accountId);
              }else {
                newTransaction = new Transfer(transaction.amountVal, transaction.accountId, transaction.accountIdFrom, transaction.accountIdTo);
              }

              let from = ""
              let to = ""
              let username = ""
              for (let i = 0; i < users.length; i++) {
                if (users[i].id == transaction.accountId) {
                  username = users[i].username
                }
                if (users[i].id == transaction.accountIdFrom) {
                  from = users[i].username
                }
                if (users[i].id == transaction.accountIdTo) {
                  to = users[i].username
                }
              }
              $(".tableData").append(`
                const currentBalance = $(${username} span).text()  <tr>
                <td class="idWrap">${transaction.id}</td>
                <td class="usernameWrap">${username}</td>
                <td class="transWrap">${transaction.transType}</td>
                <td class="catWrap">${transaction.category}</td>
                <td class="descWrap">${transaction.descripcion}</td>  
                <td class="amountWrap">${transaction.amountVal}</td>
                <td class="fromWrap">${from}</td>
                <td class="toWrap">${to}</td>
              </tr>
              `)
              for (let i = 0; i < users.length; i++) {
                if (users[i].id == transaction.accountId) {
                  users[i].transactions.push(transaction)
                } 
              }
          
              const currentBalance = $(`#${username} span`).text()
              $(`#${username} span`).text(Number(currentBalance) + Number(newTransaction.value))
       
            });
          });
        });
        
        $("#filterAcc").on("change", (e) => {
          e.preventDefault();
          filterAcc = ""
          const filteredInfo = $("#filterAcc").val();
          users.forEach(filterData  => {  
            let username = ""
            let to = ""
            let from = ""
            if (filterData.id == filteredInfo) {
              filterAcc = filterData.transactions
            }
            console.log(filterAcc);
            $(".tableData").append(`
            <tr>
              <td class="idWrap">${filterData.id}</td>
              <td class="usernameWrap">${username}</td>
              <td class="transWrap">${filterData.transType}</td>
              <td class="catWrap">${filterData.category}</td>
              <td class="descWrap">${filterData.descripcion}</td>  
              <td class="amountWrap">${filterData.amountVal}</td>
              <td class="fromWrap">${from}</td>
              <td class="toWrap">${to}</td>
            </tr>
            `)
          })
        })

      $("[name=radioValue]").click(() => {
        if($("[name=radioValue]:checked").val() === "deposit" || $("[name=radioValue]:checked").val() === "withdraw"){
          $("#fromFild").css("display", "none");
          $("#toFild").css("display", "none");
          $("#account").css("display", "block");
          $(".selected").val("").change()

        }else{
          $("#account").css("display", "none");
          $("#fromFild").css("display", "block");
          $("#toFild").css("display", "block");
        }

      });

      $("#newCategory").hide();

      $("#chooseCategory").change(() => {
        if($('#chooseCategory').val() === "addNew"){
          $("#newCategory").show();
        }else{
          $("#newCategory").hide();
        }
      });

      $("#newCatBtn").click(() =>{
        if($("#newCatInput").val() === ""){
          alert("Please insert a Name for a new Category")
      }

     const newCategory = $('#newCatInput').val()
      $.ajax({
        method: 'post',
        url: 'http://localhost:3000/categories',
        data: JSON.stringify({newCategory}),
        dataType: 'json',
        contentType: 'application/JSON',
      }).done((data) => {
        $("#chooseCategory").prepend(`<option value=${data.name}>${data.name}</option>`);
        $("#newCategory").hide();
        $(newCategory).val("")
      })

      });
const categories = []
      $.ajax({
        method: 'get',
        url: 'http://localhost:3000/categories',
        dataType: 'json',
        contentType: 'application/JSON',
      }).done((data) => {
        data.forEach(category => {
          categories.push(category);
          $("#chooseCategory").prepend(`<option value=${category.name}>${category.name}</option>`);
        })
      });

       


    

