import HEADER_SNIPPET from "./header";

export const BREADTH_FIRST_SEARCH_SNIPPET = `${HEADER_SNIPPET}

var elements = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "FINAL",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R"
];
var matrix = [
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0],
  [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
  [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
var origin;
var target;

fun fill(len, value) {
var arr = [];

for (var i = 0; i < len; i++) {
   push(arr, value);
}

return arr;
}

fun path(order, elements, originIdx, targetIdx) {
var idx = targetIdx;
var path = [];

while (order[idx] != -1) {
  unshift(path, elements[idx]);
  idx = order[idx];
}

unshift(path, elements[originIdx]);

return path;
}

fun bfs(matrix, elements, origin, target) {
var originIdx = indexOf(elements, origin);
var targetIdx = indexOf(elements, target);
var visited = fill(len(elements), 0);
var order = fill(len(elements), -1);
var queue = [originIdx];

while (len(queue) > 0) {
  var itemIdx = pop(queue);
  
  if (itemIdx == targetIdx) return path(order, elements, originIdx, targetIdx);

  for (var idx = 0; idx < len(elements); idx++) {
    if (matrix[itemIdx][idx] == 1 and visited[idx] == 0) {
      order[idx] = itemIdx; 
      unshift(queue, idx);
    }
  }
  
  visited[itemIdx] = 1;
}

return nil;
}

output("Select 2 elements: ");

output("Origin: ");
origin = input();

output("Target: ");
target = input();

print bfs(matrix, elements, origin, target);
`;