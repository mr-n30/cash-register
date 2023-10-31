function p(...args) {
  console.log("[DEBUG]", ...args);
}

// CURRENCY TABLE
const TABLE = {
  "Penny": 0.01,
  "Nickel": 0.05,
  "Dime": 0.1,
  "Quarter": 0.25,
  "One": 1,
  "Five": 5,
  "Ten": 10,
  "Twenty": 20,
  "One Hundred": 100,
};

// Returns max amount for the given key from cid
function cidMapper(key, cid) {
  if (key === undefined) {
    return undefined
  }

  for (let i = 0; i < cid.length; i++) {
    if (cid[i][0] === key.toUpperCase()) {
      return cid[i][1];
    }
  }
}

// A method used to calculate the change due
// Cid is mutated removing the maxed out value
function calc(changeDue, cid) {
  // Cash to return
  const cashToReturnArr = [];
  const TABLEKEYS = Object.keys(TABLE).reverse();
  const TABLEVALUES = Object.values(TABLE).reverse();

  // Find starting value
  let startingIndex = TABLEVALUES.findIndex((elem) => {
    if (elem * 1 < changeDue) {
      return elem;
    }
  });

  let totalChangeDueLeft = changeDue;
  for (let i = startingIndex; i < TABLEKEYS.length; i++) {
    let unitAmount = 1;
    const currencyKey = TABLEKEYS[i];
    const currencyVal = TABLEVALUES[i];

    for (;;) {
      // c is how many of units we're using times currencyVal
      let c = currencyVal * unitAmount;
      // max - max amount allowed per unit in cid
      let max = cidMapper(currencyKey, cid);

      // Check if we maxed out unit amount from cid
      if (c > max) {
        let tmp = currencyVal * (unitAmount - 1);
        cashToReturnArr.push(currencyKey, tmp, totalChangeDueLeft.toFixed(2));
        delete TABLE[currencyKey];
        return cashToReturnArr;
      }

      // Check the change due
      totalChangeDueLeft = totalChangeDueLeft - currencyVal;

      // If check if we already reached total change due
      if (totalChangeDueLeft === 0) {
        cashToReturnArr.push(currencyKey, c, totalChangeDueLeft);
        delete TABLE[currencyKey];
        return cashToReturnArr;
        // We went over changeDue so go to next unit and reset
      } else if (c > changeDue) {
        unitAmount--;
        c = currencyVal * unitAmount;
        totalChangeDueLeft = totalChangeDueLeft + currencyVal;
        cashToReturnArr.push(currencyKey, c, totalChangeDueLeft.toFixed(2));
        delete TABLE[currencyKey];
        return cashToReturnArr;
      }

      unitAmount++;
    }
  }
}

// Function calls calc and returns the final change due
function returnChangeDue(change, cid) {
  const changeDue = [];

  const myCid = cid.filter((elem) => elem[1] !== 0);

  let changeLeft = calc(change, myCid);
  changeDue.push(changeLeft);

  for (;;) {
    let changeLeftVal = changeLeft[2];
    if (changeLeftVal * -1 === 0 || changeLeftVal * 1 === 0) {
      for (const [key,] of changeDue) {
        if (myCid.flat().includes(key.toUpperCase()) === false) {
          return "INSUFFICIENT_FUNDS";
        }
      }

      return changeDue;
    }

    changeLeft = calc(changeLeft[2], myCid);
    changeDue.push(changeLeft);
  }
}

// Return change due in coins and bills sorted
// from highest to lowest
function checkCashRegister(price, cash, cid) {
  const changeDue = cash - price;
  const totalcid = cid.reduce((sum, curr) => sum + curr[1], 0);
  const myArr = [...cid];
  myArr.sort((a, b) => {(b[1] < a[1]) ? -1 : 0});

  p(`[DEBUG] CHANGE DUE: ${changeDue}`);

  if (changeDue === totalcid) {
    return {status: "CLOSED", change: cid};
  } else if (changeDue > totalcid) {
    return {status: "INSUFFICIENT_FUNDS", change: []}
  } else {
    const change = returnChangeDue(changeDue, cid);

    if (change === "INSUFFICIENT_FUNDS") {
      return {status: "INSUFFICIENT_FUNDS", change: []}
    }

    const myArr = [];
    change.map((elem) => myArr.push([elem[0].toUpperCase(), elem[1]]))
    return {status: "OPEN", change: myArr};
  }
}

//const x = checkCashRegister(19.5, 20, [["PENNY", 0.01], ["NICKEL", 0], ["DIME", 0], ["QUARTER", 0], ["ONE", 1], ["FIVE", 0], ["TEN", 0], ["TWENTY", 0], ["ONE HUNDRED", 0]]);
//const x = checkCashRegister(19.5, 20, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.1], ["QUARTER", 4.25], ["ONE", 90], ["FIVE", 55], ["TEN", 20], ["TWENTY", 60], ["ONE HUNDRED", 100]]);
//const x = checkCashRegister(3.26, 100, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.1], ["QUARTER", 4.25], ["ONE", 90], ["FIVE", 55], ["TEN", 20], ["TWENTY", 60], ["ONE HUNDRED", 100]]);
// p(x)
