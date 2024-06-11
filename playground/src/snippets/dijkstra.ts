import HEADER_SNIPPET from "./header";

export const DIJKSTRA = `${HEADER_SNIPPET}

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

fun swap(arr, a, b) {
  var tmp = arr[a];
  arr[a] = arr[b];
  arr[b] = tmp;
}

fun updatePriorityQueueIfCan(queue, item) {
  var itemIdx = -1;
  
  for (var idx = 0; idx < len(queue); idx++) {
     if (queue[idx].idx == item.idx and queue[idx].weight > item.weight) {
       itemIdx =  idx;
       queue[idx] = item;
     }
  }

  if (itemIdx == -1) return false;
  

  while (itemIdx < len(queue) - 1 and queue[itemIdx].weight < queue[itemIdx + 1].weight) {
    swap(queue, itemIdx, itemIdx + 1);
    itemIdx++;
  }

  return true;
}

fun insertPriorityQueue(queue, item) {
  var idx = len(queue) - 1; 

  while (idx >= 0) {
    if (queue[idx].weight > item.weight) {
       break;
    } else {
       idx--;
    }
  }

  insert(queue, idx + 1, item);
}

fun insertOrUpdatePriorityQueue(queue, item) {
  var contains = false;
  
  for (var idx = 0; idx < len(queue); idx++) {
     if (queue[idx].idx == item.idx) {
       contains = true;
     }
  }
  
  if (contains) {
    return updatePriorityQueueIfCan(queue, item);
  } else {
    insertPriorityQueue(queue, item);
    return true;
  }
}

fun djikstra(matrix, elements, origin, target) {
  var originIdx = indexOf(elements, origin);
  var targetIdx = indexOf(elements, target);
  var visited = fill(len(elements), 0);
  var order = fill(len(elements), -1);
  var queue = [{idx: originIdx, weight: 0 }];

  while (len(queue) > 0) {
    var item = pop(queue);
    
    if (item.idx == targetIdx) return path(order, elements, originIdx, targetIdx);

    for (var idx = 0; idx < len(elements); idx++) {
      if (matrix[item.idx][idx] == 1 and visited[idx] == 0) {
         if (insertOrUpdatePriorityQueue(queue, { idx: idx, weight: item.weight + 1 })) {
           order[idx] = item.idx; 
         }  
      }
    }
    
    visited[item.idx] = 1;
  }

  return nil;
}

output("Select 2 elements: ");

output("Origin: ");
origin = input();

output("Target: ");
target = input();

print djikstra(matrix, elements, origin, target);
`;
