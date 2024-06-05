export const INITIAL_PROGRAM = `//        _______ __                         __ 
//        |          __|__|.----------.-----.|    |
//        |__          |    ||              |  _   ||    |
//        |_______|__||__|__|__|     _||__|
//                                           |__|                                                     
//                                                                                           
//                                        
//        ____           _            __      _         _   
//       |_    _|___ _|   |___    |    |     |_|___|   |_
//          |  |  |   .  |  .   |   .  |   |    |__ |  |_   -|    _|
//          |_|  |___|___|___|   |_____|_|___|__|  
//
//                        
//  https://github.com/saymow/simpl

var running = true;
var items = [];

fun addItem(name) {
    push(items, { name: name });
}

fun removeItem(name) {
   var newItems = [];
   
   for (var idx = 0; idx < len(items); idx++) {
        if (items[idx].name != name) {
            unshift(newItems, items[idx]);
        }
   }

   items = newItems;
}

fun listItems() {
   output("Items: ");
 
   for (var idx = 0; idx < len(items); idx++) {
        output(" " + string(idx + 1) + ") " + items[idx].name);
   }
}

while (running) {
    clear();
    output("Select one option: ");
    output("  1)  Add item");
    output("  2)  Remove item");
    output("  3)  List items");
    output("  4)  Exit");
    
    var option = int(input());
    clear();

    if (option == 1) {
        output("Item name: ");
        addItem(input());
    } else if (option == 2) {
        output("Item name: "); 
        removeItem(input());
    } else if (option == 3) {
        listItems();
        sleep(2000); 
    } else if (option == 4) {
        running = false;   
    } else {
        output("Invalid option.");
    }
}

output("END...");
`;

