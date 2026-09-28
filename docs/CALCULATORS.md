# Calculator reference

This document describes the calculators currently exposed by the selector in
`index.html`. Results are formatted to at most 10 decimal places and trailing
zeroes are removed where the result is numeric.

## Basic Calculator

Supports numbers, decimal points, parentheses, addition (`+`), subtraction
(`−`), multiplication (`×`), division (`÷`), and remainder (`%`).

Keyboard shortcuts:

| Key | Action |
| --- | --- |
| `Enter` | Calculate |
| `Backspace` | Delete the last character |
| `Escape` | Clear |
| Number/operator keys | Enter the corresponding value |

Expressions use normal precedence: multiplication, division, and remainder
before addition and subtraction. Division by zero, incomplete expressions, and
unmatched parentheses are rejected.

## Scientific Calculator

The scientific calculator supports:

| Input | Meaning |
| --- | --- |
| `sin`, `cos`, `tan` | Trigonometric functions |
| `log` | Base-10 logarithm |
| `ln` | Natural logarithm |
| `√` | Square root |
| `x²` | Square |
| `xʸ` | Power |
| `π` | Pi |
| `e` | Euler's number |
| `!` | Factorial |

Trigonometric functions can use degrees (`DEG`, the default) or radians
(`RAD`). Factorial accepts whole numbers from 0 through 170. Function calls
require parentheses, and invalid or non-finite results are rejected.

## Percentage Calculator

Enter all six fields to calculate three results at once:

1. `Percent of number` = `number × percent / 100`
2. `Percentage change` = `(new value − old value) / old value × 100`
3. `X as percentage of Y` = `X / Y × 100`

The old value and `Y` cannot be zero.

## Fraction Calculator

Enter two fractions and select `+`, `−`, `×`, or `÷`. The result is reduced
using the greatest common divisor. Denominators cannot be zero.

The division operation is:

```text
 a/b ÷ c/d = a×d / b×c
```

## Ratio Calculator

The first two values are reduced to their simplest ratio using the greatest
common divisor.

If both optional fields are provided, the calculator also displays two
proportional missing-value estimates based on the known value. The displayed
result labels the first estimate as applying when the known value belongs to
the first ratio component.

## Average Calculator

Enter comma-separated numbers, for example:

```text
12, 18, 24, 30
```

The calculator displays the arithmetic mean, sum, and count:

```text
average = sum / count
```

Every comma-separated item must be a valid number.

## Age Calculator

Enter a date of birth. The calculator reports completed years relative to the
browser's current date and time. Future dates and invalid dates are rejected.
It does not report months, days, or time-zone-independent age details.

## Date Calculator

Enter a start date and a number of days. Positive values add days; negative
values subtract days. The result is formatted using the browser's locale.

Date arithmetic uses the browser's local calendar and JavaScript `Date`
behavior.

## Time Calculator

Enter hours, minutes, and seconds. The values are converted to total seconds
and displayed as normalized hours, minutes, and seconds:

```text
total seconds = hours × 3600 + minutes × 60 + seconds
```

Negative values and invalid values are rejected. Fractional inputs are
rounded to the nearest second in the output.

## Unit Converter

The converter accepts one value, a source unit, and a destination unit. Unit
names are case-insensitive.

| Category | Supported units |
| --- | --- |
| Length | `mm`, `cm`, `m`, `km`, `in`, `ft`, `yd`, `mi` |
| Weight | `g`, `kg`, `lb` |

Conversions use meters or kilograms as the internal base unit. Length and
weight units should not be mixed.

## BMI Calculator

Enter weight in kilograms and height in centimeters:

```text
bmi = weight / (height in meters)²
```

The display uses these standard categories:

| BMI | Category |
| --- | --- |
| Below 18.5 | Underweight |
| 18.5 to below 25 | Healthy range |
| 25 to below 30 | Overweight |
| 30 or above | Obesity |

This is a general estimate, not a medical diagnosis.

## Simple Interest

Enter principal, annual rate in percent, and time in years:

```text
rate = annual rate / 100
amount = principal × (1 + rate × time)
interest = amount − principal
```

Principal, rate, and time must be non-negative.

## Compound Interest

Enter principal, annual rate in percent, time in years, and compounding
frequency per year:

```text
rate = annual rate / 100
amount = principal × (1 + rate / frequency) ^ (frequency × time)
interest = amount − principal
```

The implementation defaults a blank or zero compounding frequency to `1`.
Use a positive frequency for a conventional compounding calculation.

## EMI / Loan

Enter loan amount, annual interest in percent, and term in years. The term is
converted to a monthly number of payments:

```text
monthly rate = annual rate / 1200
number of payments = years × 12
```

For a non-zero monthly rate, the monthly payment is:

```text
payment = P × r × (1 + r)^n / ((1 + r)^n − 1)
```

When the rate is zero, the payment is `P / n`. The result includes the
estimated monthly payment and total repayment.

## Geometry

The geometry calculator supports:

- Circle: enter a radius, then calculate `π × radius²`.
- Rectangle: enter length and width, then calculate `length × width`.

Measurements must be positive. Results are shown in square units.

## Calculation history

Successful calculations are recorded in browser storage. Each record includes
the calculator name, a readable expression, the formatted result, and a
localized timestamp. The UI keeps at most 12 records and provides a **Clear
history** action.

History is scoped to the browser origin and is not available to other users,
devices, or origins.
