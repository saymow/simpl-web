import HEADER_SNIPPET from "./header";

export const INSERTION_SORT_SNIPPET = `${HEADER_SNIPPET}

var arr_length ;
var arr = [];

fun swap(arr, i, j) {
  var tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

fun insertionSort(arr) {
  for (var i = len(arr) - 1; i >= 0; i--) {
    for (var j = i - 1; j >= 0; j--) {
      if (arr[j] > arr[i]) {
        swap(arr, i, j);
      }
    }
  }

  return arr;
}

output("array size: ");
arr_length = int(input());

for (var i = 0; i < arr_length; i++) {
  output(string((i + 1)) + "° item: ");
  push(arr, int(input()));
}

print insertionSort(arr);
`;