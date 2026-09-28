const stage = document.querySelector("#calculator-stage");
const select = document.querySelector("#calculator-select");
const historyList = document.querySelector("#history-list");
const historyKey = "calquick-history";
let activeScientificAngle = "DEG";

const number = (value) => Number.parseFloat(value);
const fmt = (value) =>
  Number.isFinite(value) ? String(Number(value.toFixed(10))) : "—";
const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};
function fraction(n, d) {
  if (d === 0) throw new Error("Denominator cannot be zero.");
  const sign = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return `${(sign * n) / g}/${Math.abs(d) / g}`;
}
function get(id) {
  return number(document.querySelector(`#${id}`).value);
}
function val(id) {
  return document.querySelector(`#${id}`).value.trim();
}
function result(title, value, detail = "") {
  return `<div class="result-card"><p class="eyebrow">${title}</p><strong>${value}</strong>${detail ? `<p>${detail}</p>` : ""}</div>`;
}
function error(message) {
  return `<p class="error" role="alert">${message}</p>`;
}
function formField(id, label, type = "number", placeholder = "") {
  return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" ${placeholder ? `placeholder="${placeholder}"` : ""}></div>`;
}
function shell(title, description, body) {
  return `<article class="calc-card"><header class="calc-card-header"><div><h2>${title}</h2><p>${description}</p></div></header><div class="calc-body">${body}</div></article>`;
}
function record(calculator, expression, value) {
  const items = JSON.parse(localStorage.getItem(historyKey) || "[]");
  items.unshift({
    calculator,
    expression,
    value,
    time: new Date().toLocaleString([], {
      dateStyle: "short",
      timeStyle: "short",
    }),
  });
  localStorage.setItem(historyKey, JSON.stringify(items.slice(0, 12)));
  renderHistory();
}
function renderHistory() {
  const items = JSON.parse(localStorage.getItem(historyKey) || "[]");
  historyList.innerHTML = items.length
    ? items
        .map(
          (item) =>
            `<div class="history-item"><div><p class="history-expression">${item.calculator} · ${item.time}</p><p>${item.expression}</p></div><p class="history-value">${item.value}</p></div>`,
        )
        .join("")
    : '<p class="empty-state">Your recent calculations will appear here.</p>';
}
function bindForm(id, handler) {
  document.querySelector(`#${id}`).addEventListener("submit", (event) => {
    event.preventDefault();
    handler();
  });
}
function valid(...values) {
  return values.every((value) => Number.isFinite(value));
}

function renderBasic() {
  stage.innerHTML = shell(
    "Basic Calculator",
    "Fast arithmetic with keyboard support.",
    `<div class="calculator-display"><div id="basic-expression" class="calculator-expression"></div><div id="basic-result" class="calculator-result">0</div></div><div id="basic-keypad" class="keypad">${["AC", "DEL", "(", ")", "7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "%", "+", "="].map((key) => `<button class="key ${["÷", "×", "−", "+", "%", "="].includes(key) ? "operator" : ""} ${key === "=" ? "equals" : ""} ${key === "0" ? "zero" : ""}" data-basic="${key}" type="button">${key}</button>`).join("")}</div><p id="basic-error" class="error"></p>`,
  );
  let expression = "",
    justCalculated = false;
  const display = () => {
    document.querySelector("#basic-expression").textContent = expression
      .replaceAll("*", " × ")
      .replaceAll("/", " ÷ ")
      .replaceAll("-", " − ")
      .replaceAll("+", " + ");
    document.querySelector("#basic-result").textContent = expression || "0";
  };
  const add = (key) => {
    if (
      justCalculated &&
      !"+-*/%".includes(key) &&
      key !== "÷" &&
      key !== "×" &&
      key !== "−"
    )
      expression = "";
    justCalculated = false;
    const value = { "÷": "/", "×": "*", "−": "-" }[key] || key;
    if (key === "AC") {
      expression = "";
      return display();
    }
    if (key === "DEL") {
      expression = expression.slice(0, -1);
      return display();
    }
    if (key === "=") return calculate();
    if (key === ".") {
      const current = expression.split(/[+\-*/%()]/).pop();
      if (current.includes(".")) return;
      if (!current) expression += "0";
    }
    if ("+-*/%".includes(value) && "+-*/%".includes(expression.at(-1)))
      expression = expression.slice(0, -1);
    expression += value;
    display();
  };
  const calculate = () => {
    try {
      const value = safeEvaluate(expression);
      if (!Number.isFinite(value)) throw new Error("Invalid calculation.");
      document.querySelector("#basic-expression").textContent += " =";
      document.querySelector("#basic-result").textContent = fmt(value);
      record("Basic Calculator", expression, fmt(value));
      expression = fmt(value);
      justCalculated = true;
    } catch (e) {
      document.querySelector("#basic-error").textContent = e.message;
    }
  };
  document
    .querySelectorAll("[data-basic]")
    .forEach((button) =>
      button.addEventListener("click", () => add(button.dataset.basic)),
    );
  document.onkeydown = (event) => {
    if (!stage.querySelector("#basic-keypad")) return;
    if (
      /[\d.+\-*/%()]/.test(event.key) ||
      ["Enter", "Backspace", "Escape"].includes(event.key)
    ) {
      event.preventDefault();
      add(
        event.key === "Enter"
          ? "="
          : event.key === "Backspace"
            ? "DEL"
            : event.key === "Escape"
              ? "AC"
              : event.key,
      );
    }
  };
}

function safeEvaluate(input) {
  const tokens = input.match(/\d*\.?\d+|[()+\-*/%]/g);
  if (!tokens || tokens.join("") !== input || !input || /[+\-*/%]$/.test(input))
    throw new Error("Enter a complete expression.");
  let index = 0;
  const peek = () => tokens[index];
  const consume = () => tokens[index++];
  const primary = () => {
    if (peek() === "(") {
      consume();
      const value = addSub();
      if (consume() !== ")") throw new Error("Check your parentheses.");
      return value;
    }
    if (peek() === "-") {
      consume();
      return -primary();
    }
    const value = number(consume());
    if (!Number.isFinite(value)) throw new Error("Enter valid numbers.");
    return value;
  };
  const mulDiv = () => {
    let value = primary();
    while (["*", "/", "%"].includes(peek())) {
      const operator = consume(),
        right = primary();
      if (operator === "/" && right === 0)
        throw new Error("Cannot divide by zero.");
      value =
        operator === "*"
          ? value * right
          : operator === "/"
            ? value / right
            : value % right;
    }
    return value;
  };
  const addSub = () => {
    let value = mulDiv();
    while (["+", "-"].includes(peek())) {
      const operator = consume(),
        right = mulDiv();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  };
  const value = addSub();
  if (index !== tokens.length) throw new Error("Check your expression.");
  return value;
}

function renderScientific() {
  stage.innerHTML = shell(
    "Scientific Calculator",
    "Functions for more advanced calculations.",
    `<div class="calculator-display"><div id="sci-expression" class="calculator-expression"></div><div id="sci-result" class="calculator-result">0</div></div><div class="toggle" aria-label="Angle unit"><button type="button" data-angle="DEG" class="active">DEG</button><button type="button" data-angle="RAD">RAD</button></div><div class="keypad" style="margin-top:15px">${["sin", "cos", "tan", "log", "ln", "√", "x²", "xʸ", "π", "e", "!", "(", ")", "7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "AC", "DEL", "="].map((key) => `<button type="button" class="key ${["÷", "×", "−", "="].includes(key) ? "operator" : ""}" data-sci="${key}">${key}</button>`).join("")}</div><p id="sci-error" class="error"></p>`,
  );
  let expression = "",
    justCalculated = false;
  const display = () => {
    document.querySelector("#sci-expression").textContent = expression;
    document.querySelector("#sci-result").textContent = expression || "0";
  };
  const calculate = () => {
    try {
      const value = scientificEvaluate(expression);
      document.querySelector("#sci-expression").textContent = expression + " =";
      document.querySelector("#sci-result").textContent = fmt(value);
      record("Scientific Calculator", expression, fmt(value));
      expression = fmt(value);
      justCalculated = true;
    } catch (e) {
      document.querySelector("#sci-error").textContent = e.message;
    }
  };
  document.querySelectorAll("[data-angle]").forEach((button) =>
    button.addEventListener("click", () => {
      activeScientificAngle = button.dataset.angle;
      document
        .querySelectorAll("[data-angle]")
        .forEach((item) => item.classList.toggle("active", item === button));
    }),
  );
  document.querySelectorAll("[data-sci]").forEach((button) =>
    button.addEventListener("click", () => {
      const key = button.dataset.sci;
      if (key === "AC") expression = "";
      else if (key === "DEL") expression = expression.slice(0, -1);
      else if (key === "=") return calculate();
      else {
        if (justCalculated && !isNaN(key)) expression = "";
        justCalculated = false;
        expression +=
          { π: "pi", "√": "sqrt(", "x²": "^2", xʸ: "^", "!": "!" }[key] || key;
      }
      display();
    }),
  );
}
function scientificEvaluate(expression) {
  let text = expression.replaceAll("π", "pi").replaceAll("√", "sqrt");
  if (!text) throw new Error("Enter a calculation.");
  const factorial = (n) => {
    if (!Number.isInteger(n) || n < 0 || n > 170)
      throw new Error("Factorial uses whole numbers up to 170.");
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };
  text = text
    .replace(/(\d+(?:\.\d+)?)!/g, "factorial($1)")
    .replace(/(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g, "pow($1,$2)")
    .replace(/sqrt\(([^()]+)\)/g, "sqrt($1)");
  const scope = {
    pi: Math.PI,
    e: Math.E,
    sin: (n) =>
      Math.sin(activeScientificAngle === "DEG" ? (n * Math.PI) / 180 : n),
    cos: (n) =>
      Math.cos(activeScientificAngle === "DEG" ? (n * Math.PI) / 180 : n),
    tan: (n) =>
      Math.tan(activeScientificAngle === "DEG" ? (n * Math.PI) / 180 : n),
    log: Math.log10,
    ln: Math.log,
    sqrt: Math.sqrt,
    factorial,
    pow: Math.pow,
  };
  const tokens = text.match(
    /(?:sin|cos|tan|log|ln|sqrt|factorial|pow|pi|e)|\d*\.?\d+|[()+\-*/%,]/g,
  );
  if (!tokens || tokens.join("") !== text)
    throw new Error("Use the calculator buttons for a valid expression.");
  let index = 0;
  const primary = () => {
    if (tokens[index] === "(") {
      index++;
      const v = addSub();
      if (tokens[index++] !== ")") throw new Error("Check parentheses.");
      return v;
    }
    const token = tokens[index++];
    if (scope[token]) {
      if (token === "pi" || token === "e") return scope[token];
      if (tokens[index++] !== "(")
        throw new Error("Function needs parentheses.");
      const v = addSub();
      if (tokens[index++] !== ")") throw new Error("Check parentheses.");
      return scope[token](v);
    }
    const v = number(token);
    if (!Number.isFinite(v)) throw new Error("Invalid number.");
    return v;
  };
  const mul = () => {
    let v = primary();
    while (["*", "/", "%"].includes(tokens[index])) {
      const op = tokens[index++],
        r = primary();
      if (op === "/" && r === 0) throw new Error("Cannot divide by zero.");
      v = op === "*" ? v * r : op === "/" ? v / r : v % r;
    }
    return v;
  };
  const addSub = () => {
    let v = mul();
    while (["+", "-"].includes(tokens[index])) {
      const op = tokens[index++],
        r = mul();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  };
  const value = addSub();
  if (index !== tokens.length || !Number.isFinite(value))
    throw new Error("Invalid calculation.");
  return value;
}

function renderPercentage() {
  stage.innerHTML = shell(
    "Percentage Calculator",
    "Find percentages, changes, and proportions.",
    `<form id="percentage-form" class="form-grid">${formField("pct-number", "What is", "number", "Number")} ${formField("pct-rate", "Percent of it", "number", "%")} ${formField("pct-old", "Old value", "number")} ${formField("pct-new", "New value", "number")} ${formField("pct-x", "X", "number")} ${formField("pct-y", "Y", "number")}<div class="actions"><button class="button" type="submit">Calculate all</button></div></form><div id="percentage-result"></div>`,
  );
  bindForm("percentage-form", () => {
    const a = get("pct-number"),
      p = get("pct-rate"),
      old = get("pct-old"),
      newer = get("pct-new"),
      x = get("pct-x"),
      y = get("pct-y");
    if (!valid(a, p, old, newer, x, y) || y === 0 || old === 0)
      return (document.querySelector("#percentage-result").innerHTML = error(
        "Fill all fields. Old value and Y cannot be zero.",
      ));
    const value = `${fmt((a * p) / 100)} · ${fmt(((newer - old) / old) * 100)}% · ${fmt((x / y) * 100)}%`;
    document.querySelector("#percentage-result").innerHTML = result(
      "Results",
      value,
      "Percentage of number · percentage change · X as percentage of Y",
    );
    record(
      "Percentage Calculator",
      `${p}% of ${a}; change ${old} → ${newer}; ${x} of ${y}`,
      value,
    );
  });
}
function renderFraction() {
  stage.innerHTML = shell(
    "Fraction Calculator",
    "Operate on fractions and simplify the result.",
    `<form id="fraction-form" class="inline-fields">${formField("f-a", "Numerator", "number")} ${formField("f-b", "Denominator", "number")} <select id="f-op" aria-label="Fraction operation"><option value="+">+</option><option value="-">−</option><option value="*">×</option><option value="/">÷</option></select> ${formField("f-c", "Numerator", "number")} ${formField("f-d", "Denominator", "number")}<button class="button" type="submit">Calculate</button></form><div id="fraction-result"></div>`,
  );
  bindForm("fraction-form", () => {
    const a = get("f-a"),
      b = get("f-b"),
      c = get("f-c"),
      d = get("f-d"),
      op = val("f-op");
    if (!valid(a, b, c, d) || !b || !d)
      return (document.querySelector("#fraction-result").innerHTML = error(
        "Enter non-zero denominators.",
      ));
    const n =
        op === "+"
          ? a * d + c * b
          : op === "-"
            ? a * d - c * b
            : op === "*"
              ? a * c
              : a * d,
      den = op === "+" || op === "-" ? b * d : op === "*" ? b * d : b * c;
    const value = fraction(n, den);
    document.querySelector("#fraction-result").innerHTML = result(
      "Simplified result",
      value,
    );
    record("Fraction Calculator", `${a}/${b} ${op} ${c}/${d}`, value);
  });
}
function renderRatio() {
  stage.innerHTML = shell(
    "Ratio Calculator",
    "Simplify a ratio or solve its missing value.",
    `<form id="ratio-form" class="form-grid">${formField("r-a", "First value")} ${formField("r-b", "Second value")} ${formField("r-known", "Known value", "number", "Optional")} ${formField("r-total", "Total", "number", "Optional")}<div class="actions"><button class="button" type="submit">Calculate</button></div></form><div id="ratio-result"></div>`,
  );
  bindForm("ratio-form", () => {
    const a = get("r-a"),
      b = get("r-b"),
      known = get("r-known"),
      total = get("r-total");
    if (!valid(a, b) || !a || !b)
      return (document.querySelector("#ratio-result").innerHTML = error(
        "Enter both ratio values.",
      ));
    let text = `Simplified ratio: ${a / gcd(a, b)} : ${b / gcd(a, b)}`;
    if (Number.isFinite(known) && Number.isFinite(total))
      text += ` · Missing value: ${fmt((known * b) / a)} (for known first) or ${fmt((known * a) / b)}`;
    document.querySelector("#ratio-result").innerHTML = result(
      "Ratio result",
      text,
    );
    record("Ratio Calculator", `${a}:${b}`, text);
  });
}
function renderAverage() {
  stage.innerHTML = shell(
    "Average Calculator",
    "Enter numbers separated by commas.",
    `<form id="average-form"><div class="field"><label for="average-values">Numbers</label><input id="average-values" placeholder="12, 18, 24, 30"></div><div class="actions"><button class="button" type="submit">Calculate</button></div></form><div id="average-result"></div>`,
  );
  bindForm("average-form", () => {
    const values = val("average-values").split(",").map(number);
    if (!values.length || !valid(...values))
      return (document.querySelector("#average-result").innerHTML = error(
        "Use comma-separated numbers.",
      ));
    const sum = values.reduce((a, b) => a + b, 0);
    document.querySelector("#average-result").innerHTML = result(
      "Average",
      fmt(sum / values.length),
      `Sum ${fmt(sum)} · Count ${values.length}`,
    );
    record(
      "Average Calculator",
      val("average-values"),
      `Average ${fmt(sum / values.length)}`,
    );
  });
}

function renderSimpleForm(key, title, description, fields, calculate, labels) {
  stage.innerHTML = shell(
    title,
    description,
    `<form id="${key}-form" class="form-grid">${fields.map((field) => formField(`${key}-${field[0]}`, field[1], field[2] || "number", field[3] || "")).join("")}<div class="actions"><button class="button" type="submit">Calculate</button></div></form><div id="${key}-result"></div>`,
  );
  bindForm(`${key}-form`, () => {
    try {
      const output = calculate();
      document.querySelector(`#${key}-result`).innerHTML = result(
        "Result",
        output,
        labels || "",
      );
      record(
        title,
        fields
          .map((field) => `${field[1]}: ${val(`${key}-${field[0]}`)}`)
          .join(" · "),
        output,
      );
    } catch (e) {
      document.querySelector(`#${key}-result`).innerHTML = error(e.message);
    }
  });
}
function renderAge() {
  renderSimpleForm(
    "age",
    "Age Calculator",
    "Calculate an exact age from a birth date.",
    [["birth", "Date of birth", "date"]],
    () => {
      const birth = new Date(val("age-birth") + "T00:00:00"),
        now = new Date();
      if (!val("age-birth") || birth > now)
        throw new Error("Enter a valid past date.");
      let years = now.getFullYear() - birth.getFullYear();
      const before =
        now.getMonth() < birth.getMonth() ||
        (now.getMonth() === birth.getMonth() &&
          now.getDate() < birth.getDate());
      if (before) years--;
      return `${years} years old`;
    },
  );
}
function renderDate() {
  renderSimpleForm(
    "date",
    "Date Calculator",
    "Add or subtract days from a date.",
    [
      ["start", "Start date", "date"],
      ["days", "Days (negative subtracts)"],
    ],
    () => {
      const date = new Date(val("date-start") + "T00:00:00"),
        days = get("date-days");
      if (!val("date-start") || !Number.isFinite(days))
        throw new Error("Complete both fields.");
      date.setDate(date.getDate() + days);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  );
}
function renderTime() {
  renderSimpleForm(
    "time",
    "Time Calculator",
    "Convert a duration into hours, minutes, and seconds.",
    [
      ["hours", "Hours"],
      ["minutes", "Minutes"],
      ["seconds", "Seconds"],
    ],
    () => {
      const h = get("time-hours") || 0,
        m = get("time-minutes") || 0,
        s = get("time-seconds") || 0;
      if (!valid(h, m, s) || h < 0 || m < 0 || s < 0)
        throw new Error("Enter positive durations.");
      const total = Math.round(h * 3600 + m * 60 + s);
      return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m ${total % 60}s`;
    },
  );
}
function renderUnit() {
  renderSimpleForm(
    "unit",
    "Unit Converter",
    "Convert common length and weight units.",
    [
      ["value", "Value"],
      ["from", "From", "text", "cm"],
      ["to", "To", "text", "in"],
    ],
    () => {
      const value = get("unit-value"),
        from = val("unit-from").toLowerCase(),
        to = val("unit-to").toLowerCase();
      const units = {
        mm: 0.001,
        cm: 0.01,
        m: 1,
        km: 1000,
        in: 0.0254,
        ft: 0.3048,
        yd: 0.9144,
        mi: 1609.344,
        g: 0.001,
        kg: 1,
        lb: 0.453592,
      };
      if (!Number.isFinite(value) || !units[from] || !units[to])
        throw new Error("Use units: mm, cm, m, km, in, ft, yd, mi, g, kg, lb.");
      return `${fmt((value * units[from]) / units[to])} ${to}`;
    },
  );
}
function renderBmi() {
  renderSimpleForm(
    "bmi",
    "BMI Calculator",
    "Estimate body mass index from height and weight.",
    [
      ["weight", "Weight (kg)"],
      ["height", "Height (cm)"],
    ],
    () => {
      const w = get("bmi-weight"),
        h = get("bmi-height");
      if (!valid(w, h) || w <= 0 || h <= 0)
        throw new Error("Enter positive values.");
      const bmi = w / (h / 100) ** 2;
      return `${fmt(bmi)} — ${bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy range" : bmi < 30 ? "Overweight" : "Obesity"}`;
    },
  );
}
function renderInterest(kind) {
  const compound = kind === "compound";
  renderSimpleForm(
    kind,
    compound ? "Compound Interest" : "Simple Interest",
    compound
      ? "Estimate growth with compounding."
      : "Estimate interest on a principal amount.",
    [
      ["principal", "Principal"],
      ["rate", "Annual rate (%)"],
      ["years", "Time (years)"],
      ...(compound ? [["frequency", "Compounds per year"]] : []),
    ],
    () => {
      const p = get(`${kind}-principal`),
        r = get(`${kind}-rate`) / 100,
        t = get(`${kind}-years`);
      if (!valid(p, r, t) || p < 0 || r < 0 || t < 0)
        throw new Error("Complete the fields with valid values.");
      const amount = compound
        ? p *
          (1 + r / (get(`${kind}-frequency`) || 1)) **
            ((get(`${kind}-frequency`) || 1) * t)
        : p * (1 + r * t);
      return `${fmt(amount)} total · ${fmt(amount - p)} interest`;
    },
  );
}
function renderEmi() {
  renderSimpleForm(
    "emi",
    "EMI / Loan",
    "Estimate a monthly loan repayment.",
    [
      ["principal", "Loan amount"],
      ["rate", "Annual interest (%)"],
      ["years", "Loan term (years)"],
    ],
    () => {
      const p = get("emi-principal"),
        r = get("emi-rate") / 1200,
        n = get("emi-years") * 12;
      if (!valid(p, r, n) || p <= 0 || n <= 0)
        throw new Error("Enter valid loan details.");
      const payment = r ? (p * r * (1 + r) ** n) / ((1 + r) ** n - 1) : p / n;
      return `${fmt(payment)} per month · ${fmt(payment * n)} total`;
    },
  );
}
function renderGeometry() {
  renderSimpleForm(
    "geometry",
    "Geometry",
    "Calculate the area of a rectangle or circle.",
    [
      ["shape", "Shape", "text", "rectangle or circle"],
      ["a", "Length or radius"],
      ["b", "Width (rectangle only)", "number", "Optional"],
    ],
    () => {
      const shape = val("geometry-shape").toLowerCase(),
        a = get("geometry-a"),
        b = get("geometry-b");
      if (!valid(a) || a <= 0) throw new Error("Enter a positive measurement.");
      if (shape === "circle") return `${fmt(Math.PI * a * a)} square units`;
      if (shape === "rectangle" && valid(b) && b > 0)
        return `${fmt(a * b)} square units`;
      throw new Error(
        "Use circle with radius, or rectangle with length and width.",
      );
    },
  );
}

const calculators = {
  basic: renderBasic,
  scientific: renderScientific,
  percentage: renderPercentage,
  fraction: renderFraction,
  ratio: renderRatio,
  average: renderAverage,
  age: renderAge,
  date: renderDate,
  time: renderTime,
  unit: renderUnit,
  bmi: renderBmi,
  "simple-interest": () => renderInterest("simple"),
  "compound-interest": () => renderInterest("compound"),
  emi: renderEmi,
  geometry: renderGeometry,
};
select.addEventListener("change", () => calculators[select.value]?.());
document.querySelector("#clear-history").addEventListener("click", () => {
  localStorage.removeItem(historyKey);
  renderHistory();
});
renderHistory();
