import HEADER_SNIPPET from "./header";

export const AVG_SNIPPET = `${HEADER_SNIPPET}

var qty ;
var tests = [];

fun avg(tests) {
  if (len(tests) == 0) {
     return 0;
  }

  var total = 0;

  for (var idx = 0; idx < len(tests); idx++) {
     total += tests[idx].grade;
  }

  return total / len(tests);
}

fun weighted_avg(tests) {
  if (len(tests) == 0) {
     return 0;
  }

  var total = 0;
  var weight_sum = 0;

  for (var idx = 0; idx < len(tests); idx++) {
     weight_sum  += tests[idx].weight;
  }

  for (var idx = 0; idx < len(tests); idx++) {
     total += tests[idx].grade * tests[idx].weight; 
  }

  return total / weight_sum;
}

output("# Of tests");
qty = int(input());

for (var idx = 0; idx < qty; idx++) {
  
  output(string(idx + 1) + "° Test: ");
  output("grade:");
  var grade = int(input());
  output("weight:");
  var weight = int(input());

  push(tests, { grade: grade, weight: weight });
}

output("\nAvg: " + string(avg(tests)));
output("Weighted avg: " + string(weighted_avg(tests)));
`;
