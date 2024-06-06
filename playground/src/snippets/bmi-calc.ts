import HEADER_SNIPPET from "./header";

export const BMI_CALC_SNIPPET = `${HEADER_SNIPPET}

fun BMI(height, weight) {
    return weight / (height * height);
}

output("Digit your height (m): ");
var height = number(input());
output("Digit your weight (kg): ");
var weight = number(input());

print string(BMI(height, weight));
`;
